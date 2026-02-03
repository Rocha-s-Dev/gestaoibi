import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RelatorioLegal {
  id: string;
  tipo: string;
  competencia: string;
  dados: Record<string, unknown> | null;
  arquivo_url: string | null;
  hash_arquivo: string | null;
  transmitido: boolean;
  data_transmissao: string | null;
  protocolo: string | null;
  gerado_por: string | null;
  secretaria_id: string | null;
  observacoes: string | null;
  created_at: string;
}

const TIPO_RELATORIO_LABELS: Record<string, string> = {
  RAIS: "RAIS - Relação Anual de Informações Sociais",
  CAGED: "CAGED - Cadastro Geral de Empregados e Desempregados",
  GFIP: "GFIP - Guia de Recolhimento do FGTS",
  DIRF: "DIRF - Declaração do Imposto de Renda Retido na Fonte",
  TCE: "Relatório TCE - Tribunal de Contas",
};

export function useRelatoriosLegais() {
  const queryClient = useQueryClient();

  const { data: relatorios, isLoading } = useQuery({
    queryKey: ["relatorios_legais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios_legais")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RelatorioLegal[];
    },
  });

  const gerarRelatorio = useMutation({
    mutationFn: async (params: { tipo: string; competencia: string; secretaria_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Gerar dados do relatório baseado no tipo
      const dados = await gerarDadosRelatorio(params.tipo, params.competencia);
      
      const insertData = {
        tipo: params.tipo,
        competencia: params.competencia,
        secretaria_id: params.secretaria_id || null,
        dados: dados as unknown,
        gerado_por: user?.id || null,
      };
      
      const { error } = await (supabase
        .from("relatorios_legais") as unknown as { insert: (data: typeof insertData) => Promise<{ error: Error | null }> })
        .insert(insertData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relatorios_legais"] });
      toast.success("Relatório gerado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    },
  });

  const marcarTransmitido = useMutation({
    mutationFn: async ({ id, protocolo }: { id: string; protocolo: string }) => {
      const { error } = await supabase
        .from("relatorios_legais")
        .update({
          transmitido: true,
          data_transmissao: new Date().toISOString(),
          protocolo,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relatorios_legais"] });
      toast.success("Relatório marcado como transmitido!");
    },
  });

  return { 
    relatorios, 
    isLoading, 
    gerarRelatorio, 
    marcarTransmitido,
    TIPO_RELATORIO_LABELS,
  };
}

async function gerarDadosRelatorio(tipo: string, competencia: string): Promise<Record<string, unknown>> {
  // Buscar dados base
  const servidoresQuery = supabase.from("profiles" as any).select("*");
  const { data: servidores } = await servidoresQuery;

  const { data: folha } = await (supabase
    .from("folha_servidor" as any)
    .select("*")
    .gte("created_at", `${competencia}-01`)
    .lt("created_at", `${competencia}-31`) as any);

  switch (tipo) {
    case "RAIS":
      return {
        ano_base: new Date(competencia).getFullYear(),
        total_servidores: (servidores as any[])?.length || 0,
        servidores: (servidores as any[])?.map((s: any) => ({
          cpf: s.cpf,
          nome: s.name,
          data_admissao: s.vinculos?.[0]?.data_admissao,
          salario: s.vinculos?.[0]?.cargo?.vencimento_base,
        })),
      };

    case "CAGED":
      return {
        competencia,
        admissoes: [],
        demissoes: [],
        transferencias: [],
      };

    case "GFIP":
      return {
        competencia,
        total_remuneracao: folha?.reduce((acc, f) => acc + (f.total_proventos || 0), 0) || 0,
        total_fgts: folha?.reduce((acc, f) => acc + (f.valor_fgts || 0), 0) || 0,
        servidores: folha?.length || 0,
      };

    case "DIRF":
      return {
        ano_calendario: new Date(competencia).getFullYear(),
        total_rendimentos: folha?.reduce((acc, f) => acc + (f.total_proventos || 0), 0) || 0,
        total_irrf: folha?.reduce((acc, f) => acc + (f.valor_irrf || 0), 0) || 0,
        beneficiarios: servidores?.length || 0,
      };

    case "TCE":
      return {
        periodo: competencia,
        resumo_folha: {
          total_bruto: folha?.reduce((acc, f) => acc + (f.total_proventos || 0), 0) || 0,
          total_descontos: folha?.reduce((acc, f) => acc + (f.total_descontos || 0), 0) || 0,
          total_liquido: folha?.reduce((acc, f) => acc + (f.salario_liquido || 0), 0) || 0,
        },
        servidores_ativos: servidores?.length || 0,
      };

    default:
      return {};
  }
}
