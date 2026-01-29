import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FolhaPagamento {
  id: string;
  competencia: string;
  secretaria_id: string | null;
  status: string;
  data_abertura: string;
  data_calculo: string | null;
  data_conferencia: string | null;
  data_fechamento: string | null;
  total_bruto: number;
  total_descontos: number;
  total_liquido: number;
  quantidade_servidores: number;
  observacoes: string | null;
}

export interface FolhaServidor {
  id: string;
  folha_id: string;
  servidor_id: string;
  cargo_nome: string | null;
  funcao_nome: string | null;
  salario_base: number;
  total_proventos: number;
  total_descontos: number;
  salario_liquido: number;
  valor_inss: number;
  valor_irrf: number;
  processado: boolean;
  servidor?: {
    name: string;
    cpf: string;
  };
}

export interface EventoFolha {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  natureza: string;
  incide_inss: boolean;
  incide_irrf: boolean;
  ativo: boolean;
}

export function useFolhaPagamento() {
  const queryClient = useQueryClient();

  const { data: folhas, isLoading: loadingFolhas } = useQuery({
    queryKey: ["folha_pagamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("folha_pagamento")
        .select("*")
        .order("competencia", { ascending: false });
      if (error) throw error;
      return data as FolhaPagamento[];
    },
  });

  const { data: eventos, isLoading: loadingEventos } = useQuery({
    queryKey: ["eventos_folha"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eventos_folha")
        .select("*")
        .eq("ativo", true)
        .order("codigo");
      if (error) throw error;
      return data as EventoFolha[];
    },
  });

  const criarFolha = useMutation({
    mutationFn: async (data: { competencia: string; secretaria_id?: string }) => {
      const { data: result, error } = await supabase
        .from("folha_pagamento")
        .insert({
          competencia: data.competencia,
          secretaria_id: data.secretaria_id || null,
          status: "aberta",
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folha_pagamento"] });
      toast.success("Folha de pagamento criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar folha: ${error.message}`);
    },
  });

  const calcularFolha = useMutation({
    mutationFn: async (folhaId: string) => {
      // Buscar todos os servidores ativos
      const { data: servidores, error: errServ } = await supabase
        .from("profiles")
        .select("id, name, cpf");
      
      if (errServ) throw errServ;

      // Para cada servidor, criar um registro na folha_servidor
      for (const servidor of servidores || []) {
        // Buscar vínculo funcional e salário base
        const { data: vinculo } = await supabase
          .from("vinculos_funcionais")
          .select("*, cargo:cargos_publicos(*)")
          .eq("user_id", servidor.id)
          .eq("situacao", "ativo")
          .maybeSingle();

        const salarioBase = vinculo?.cargo?.vencimento_base || 0;

        // Calcular INSS e IRRF
        const { valorINSS, valorIRRF } = await calcularImpostos(salarioBase, 0);

        const totalProventos = salarioBase;
        const totalDescontos = valorINSS + valorIRRF;
        const salarioLiquido = totalProventos - totalDescontos;

        await supabase.from("folha_servidor").upsert({
          folha_id: folhaId,
          servidor_id: servidor.id,
          cargo_nome: vinculo?.cargo?.nome || null,
          salario_base: salarioBase,
          total_proventos: totalProventos,
          total_descontos: totalDescontos,
          salario_liquido: salarioLiquido,
          base_inss: salarioBase,
          base_irrf: salarioBase - valorINSS,
          valor_inss: valorINSS,
          valor_irrf: valorIRRF,
          processado: true,
        }, { onConflict: "folha_id,servidor_id" });
      }

      // Atualizar totais da folha
      const { data: totais } = await supabase
        .from("folha_servidor")
        .select("total_proventos, total_descontos, salario_liquido")
        .eq("folha_id", folhaId);

      const totalBruto = totais?.reduce((acc, s) => acc + (s.total_proventos || 0), 0) || 0;
      const totalDescontos = totais?.reduce((acc, s) => acc + (s.total_descontos || 0), 0) || 0;
      const totalLiquido = totais?.reduce((acc, s) => acc + (s.salario_liquido || 0), 0) || 0;

      await supabase
        .from("folha_pagamento")
        .update({
          status: "calculada",
          data_calculo: new Date().toISOString(),
          total_bruto: totalBruto,
          total_descontos: totalDescontos,
          total_liquido: totalLiquido,
          quantidade_servidores: totais?.length || 0,
        })
        .eq("id", folhaId);

      return { totalBruto, totalDescontos, totalLiquido };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folha_pagamento"] });
      toast.success("Folha calculada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao calcular folha: ${error.message}`);
    },
  });

  const fecharFolha = useMutation({
    mutationFn: async (folhaId: string) => {
      const { error } = await supabase
        .from("folha_pagamento")
        .update({
          status: "fechada",
          data_fechamento: new Date().toISOString(),
        })
        .eq("id", folhaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folha_pagamento"] });
      toast.success("Folha fechada com sucesso!");
    },
  });

  return {
    folhas,
    eventos,
    loadingFolhas,
    loadingEventos,
    criarFolha,
    calcularFolha,
    fecharFolha,
  };
}

async function calcularImpostos(salarioBase: number, dependentes: number) {
  // Buscar tabela INSS vigente
  const { data: tabelaINSS } = await supabase
    .from("tabela_inss")
    .select("*")
    .eq("ativo", true)
    .order("faixa");

  let valorINSS = 0;
  let salarioRestante = salarioBase;

  for (const faixa of tabelaINSS || []) {
    if (salarioRestante <= 0) break;
    
    const valorFaixa = faixa.valor_final 
      ? Math.min(salarioRestante, faixa.valor_final - faixa.valor_inicial)
      : salarioRestante;
    
    valorINSS += valorFaixa * (faixa.aliquota / 100);
    salarioRestante -= valorFaixa;
  }

  // Calcular IRRF
  const baseIRRF = salarioBase - valorINSS;
  
  const { data: tabelaIRRF } = await supabase
    .from("tabela_irrf")
    .select("*")
    .eq("ativo", true)
    .order("faixa");

  let valorIRRF = 0;
  const deducaoDependentes = (tabelaIRRF?.[0]?.deducao_dependente || 0) * dependentes;
  const baseCalculoIRRF = baseIRRF - deducaoDependentes;

  for (const faixa of tabelaIRRF || []) {
    if (baseCalculoIRRF >= faixa.valor_inicial) {
      if (!faixa.valor_final || baseCalculoIRRF <= faixa.valor_final) {
        valorIRRF = (baseCalculoIRRF * (faixa.aliquota / 100)) - faixa.parcela_deduzir;
        break;
      }
    }
  }

  return { valorINSS: Math.max(0, valorINSS), valorIRRF: Math.max(0, valorIRRF) };
}

export function useFolhaServidores(folhaId: string | null) {
  return useQuery({
    queryKey: ["folha_servidor", folhaId],
    queryFn: async () => {
      if (!folhaId) return [];
      const { data, error } = await supabase
        .from("folha_servidor")
        .select(`
          *,
          servidor:profiles(name, cpf)
        `)
        .eq("folha_id", folhaId)
        .order("servidor_id");
      if (error) throw error;
      return data as FolhaServidor[];
    },
    enabled: !!folhaId,
  });
}
