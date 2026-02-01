import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// =============================================
// TIPOS
// =============================================

export interface PPA {
  id: string;
  municipio_id: string;
  ano_inicio: number;
  ano_fim: number;
  lei_numero: string | null;
  lei_data: string | null;
  descricao: string | null;
  status: "elaboracao" | "aprovado" | "vigente" | "encerrado";
  created_at: string;
}

export interface Programa {
  id: string;
  ppa_id: string;
  codigo: string;
  nome: string;
  objetivo: string | null;
  secretaria_id: string | null;
  meta_financeira_total: number | null;
  status: string;
}

export interface LOA {
  id: string;
  municipio_id: string;
  exercicio_id: string;
  lei_numero: string | null;
  valor_total: number;
  status: string;
}

export interface DotacaoOrcamentaria {
  id: string;
  loa_id: string | null;
  secretaria_id: string | null;
  codigo_reduzido: string | null;
  valor_inicial: number;
  valor_disponivel: number;
  valor_empenhado: number;
  valor_liquidado: number;
  valor_pago: number;
}

export interface Empenho {
  id: string;
  numero: string;
  exercicio_id: string | null;
  dotacao_id: string | null;
  credor_id: string | null;
  tipo: "ordinario" | "estimativo" | "global";
  data_empenho: string;
  valor_empenhado: number;
  valor_anulado: number;
  valor_liquidado: number;
  valor_pago: number;
  saldo_empenho: number;
  descricao: string;
  processo_licitatorio: string | null;
  contrato_id: string | null;
  status: string;
  credor?: { razao_social: string; cpf_cnpj: string };
}

export interface Liquidacao {
  id: string;
  empenho_id: string;
  numero: string;
  data_liquidacao: string;
  valor_liquidado: number;
  documento_fiscal: string | null;
  status: string;
  empenho?: { numero: string; descricao: string };
}

export interface OrdemPagamento {
  id: string;
  numero: string;
  liquidacao_id: string;
  data_ordem: string;
  valor_bruto: number;
  valor_retencoes: number;
  valor_liquido: number;
  status: string;
  data_pagamento: string | null;
}

export interface Convenio {
  id: string;
  numero: string;
  ano: number;
  tipo: "recebido" | "concedido";
  concedente: string;
  convenente: string;
  objeto: string;
  valor_total: number;
  valor_repasse: number;
  valor_contrapartida: number;
  data_inicio: string;
  data_fim: string;
  secretaria_id: string | null;
  status: string;
}

export interface ContaBancaria {
  id: string;
  banco_nome: string;
  agencia: string;
  conta: string;
  tipo: string | null;
  finalidade: string | null;
  saldo_atual: number;
  ativa: boolean;
}

export interface Fornecedor {
  id: string;
  tipo_pessoa: "PF" | "PJ";
  cpf_cnpj: string;
  razao_social: string;
  nome_fantasia: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

// =============================================
// FORNECEDORES
// =============================================

export function useFornecedores() {
  const queryClient = useQueryClient();

  const { data: fornecedores = [], isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .order("razao_social");
      if (error) throw error;
      return data as Fornecedor[];
    },
  });

  const createFornecedor = useMutation({
    mutationFn: async (data: Omit<Fornecedor, "id">) => {
      const { data: result, error } = await supabase
        .from("fornecedores")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar fornecedor:", error);
      toast.error("Erro ao cadastrar fornecedor");
    },
  });

  return { fornecedores, isLoading, createFornecedor };
}

// =============================================
// EMPENHOS
// =============================================

export function useEmpenhos(exercicioId?: string) {
  const queryClient = useQueryClient();

  const { data: empenhos = [], isLoading } = useQuery({
    queryKey: ["empenhos", exercicioId],
    queryFn: async () => {
      let query = supabase
        .from("empenhos")
        .select(`
          *,
          credor:fornecedores(razao_social, cpf_cnpj)
        `)
        .order("data_empenho", { ascending: false });

      if (exercicioId) {
        query = query.eq("exercicio_id", exercicioId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Empenho[];
    },
  });

  const createEmpenho = useMutation({
    mutationFn: async (data: {
      numero: string;
      credor_id?: string;
      tipo?: "ordinario" | "estimativo" | "global";
      data_empenho: string;
      valor_empenhado: number;
      descricao: string;
      processo_licitatorio?: string;
      contrato_id?: string;
      exercicio_id?: string;
      dotacao_id?: string;
    }) => {
      const user = await supabase.auth.getUser();
      const { data: result, error } = await supabase
        .from("empenhos")
        .insert({
          numero: data.numero,
          credor_id: data.credor_id,
          tipo: data.tipo || "ordinario",
          data_empenho: data.data_empenho,
          valor_empenhado: data.valor_empenhado,
          descricao: data.descricao,
          processo_licitatorio: data.processo_licitatorio,
          contrato_id: data.contrato_id,
          exercicio_id: data.exercicio_id,
          dotacao_id: data.dotacao_id,
          created_by: user.data.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empenhos"] });
      toast.success("Empenho emitido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao emitir empenho:", error);
      toast.error("Erro ao emitir empenho");
    },
  });

  const anularEmpenho = useMutation({
    mutationFn: async ({ id, valor, motivo }: { id: string; valor: number; motivo: string }) => {
      // Registrar anulação
      const { error: anulError } = await supabase
        .from("empenhos_anulacoes")
        .insert({
          empenho_id: id,
          data_anulacao: new Date().toISOString().split("T")[0],
          valor_anulado: valor,
          motivo,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });
      if (anulError) throw anulError;

      // Atualizar empenho
      const { error } = await supabase
        .from("empenhos")
        .update({
          valor_anulado: valor,
          status: "anulado",
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empenhos"] });
      toast.success("Empenho anulado!");
    },
  });

  return { empenhos, isLoading, createEmpenho, anularEmpenho };
}

// =============================================
// LIQUIDAÇÕES
// =============================================

export function useLiquidacoes() {
  const queryClient = useQueryClient();

  const { data: liquidacoes = [], isLoading } = useQuery({
    queryKey: ["liquidacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("liquidacoes")
        .select(`
          *,
          empenho:empenhos(numero, descricao)
        `)
        .order("data_liquidacao", { ascending: false });
      if (error) throw error;
      return data as Liquidacao[];
    },
  });

  const createLiquidacao = useMutation({
    mutationFn: async (data: {
      numero: string;
      empenho_id: string;
      data_liquidacao: string;
      valor_liquidado: number;
      documento_fiscal?: string;
      tipo_documento?: string;
    }) => {
      const user = await supabase.auth.getUser();
      const { data: result, error } = await supabase
        .from("liquidacoes")
        .insert({
          numero: data.numero,
          empenho_id: data.empenho_id,
          data_liquidacao: data.data_liquidacao,
          valor_liquidado: data.valor_liquidado,
          documento_fiscal: data.documento_fiscal,
          tipo_documento: data.tipo_documento,
          created_by: user.data.user?.id,
        })
        .select()
        .single();
      if (error) throw error;

      // Atualizar empenho
      await supabase
        .from("empenhos")
        .update({ valor_liquidado: data.valor_liquidado })
        .eq("id", data.empenho_id);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liquidacoes"] });
      queryClient.invalidateQueries({ queryKey: ["empenhos"] });
      toast.success("Liquidação registrada!");
    },
  });

  return { liquidacoes, isLoading, createLiquidacao };
}

// =============================================
// ORDENS DE PAGAMENTO
// =============================================

export function useOrdensPagamento() {
  const queryClient = useQueryClient();

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ["ordens-pagamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordens_pagamento")
        .select("*")
        .order("data_ordem", { ascending: false });
      if (error) throw error;
      return data as OrdemPagamento[];
    },
  });

  const createOrdemPagamento = useMutation({
    mutationFn: async (data: {
      numero: string;
      liquidacao_id: string;
      data_ordem: string;
      valor_bruto: number;
      valor_retencoes?: number;
      valor_liquido: number;
    }) => {
      const user = await supabase.auth.getUser();
      const { data: result, error } = await supabase
        .from("ordens_pagamento")
        .insert({
          numero: data.numero,
          liquidacao_id: data.liquidacao_id,
          data_ordem: data.data_ordem,
          valor_bruto: data.valor_bruto,
          valor_retencoes: data.valor_retencoes || 0,
          valor_liquido: data.valor_liquido,
          created_by: user.data.user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens-pagamento"] });
      toast.success("Ordem de pagamento criada!");
    },
  });

  const efetuarPagamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ordens_pagamento")
        .update({
          status: "pago",
          data_pagamento: new Date().toISOString().split("T")[0],
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordens-pagamento"] });
      toast.success("Pagamento efetuado!");
    },
  });

  return { ordens, isLoading, createOrdemPagamento, efetuarPagamento };
}

// =============================================
// CONVÊNIOS
// =============================================

export function useConvenios() {
  const queryClient = useQueryClient();

  const { data: convenios = [], isLoading } = useQuery({
    queryKey: ["convenios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("convenios")
        .select("*")
        .order("data_inicio", { ascending: false });
      if (error) throw error;
      return data as Convenio[];
    },
  });

  const createConvenio = useMutation({
    mutationFn: async (data: {
      numero: string;
      ano: number;
      tipo: "recebido" | "concedido";
      concedente: string;
      convenente: string;
      objeto: string;
      valor_total: number;
      valor_repasse: number;
      valor_contrapartida?: number;
      data_assinatura: string;
      data_inicio: string;
      data_fim: string;
      secretaria_id?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("convenios")
        .insert({
          numero: data.numero,
          ano: data.ano,
          tipo: data.tipo,
          concedente: data.concedente,
          convenente: data.convenente,
          objeto: data.objeto,
          valor_total: data.valor_total,
          valor_repasse: data.valor_repasse,
          valor_contrapartida: data.valor_contrapartida || 0,
          data_assinatura: data.data_assinatura,
          data_inicio: data.data_inicio,
          data_fim: data.data_fim,
          secretaria_id: data.secretaria_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convenios"] });
      toast.success("Convênio cadastrado!");
    },
  });

  return { convenios, isLoading, createConvenio };
}

// =============================================
// CONTAS BANCÁRIAS
// =============================================

export function useContasBancarias() {
  const queryClient = useQueryClient();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas-bancarias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .select("*")
        .eq("ativa", true)
        .order("banco_nome");
      if (error) throw error;
      return data as ContaBancaria[];
    },
  });

  const createConta = useMutation({
    mutationFn: async (data: {
      banco_codigo: string;
      banco_nome: string;
      agencia: string;
      conta: string;
      tipo?: string;
      finalidade?: string;
      secretaria_id?: string;
      municipio_id?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("contas_bancarias")
        .insert({
          banco_codigo: data.banco_codigo,
          banco_nome: data.banco_nome,
          agencia: data.agencia,
          conta: data.conta,
          tipo: data.tipo,
          finalidade: data.finalidade,
          secretaria_id: data.secretaria_id,
          municipio_id: data.municipio_id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta bancária cadastrada!");
    },
  });

  return { contas, isLoading, createConta };
}

// =============================================
// CONCILIAÇÃO BANCÁRIA
// =============================================

export function useConciliacaoBancaria(contaId?: string) {
  const queryClient = useQueryClient();

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["movimentacoes-bancarias", contaId],
    queryFn: async () => {
      if (!contaId) return [];
      const { data, error } = await supabase
        .from("movimentacoes_bancarias")
        .select("*")
        .eq("conta_id", contaId)
        .order("data_movimento", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!contaId,
  });

  const { data: conciliacoes = [] } = useQuery({
    queryKey: ["conciliacoes", contaId],
    queryFn: async () => {
      if (!contaId) return [];
      const { data, error } = await supabase
        .from("conciliacoes_bancarias")
        .select("*")
        .eq("conta_id", contaId)
        .order("competencia", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!contaId,
  });

  const realizarConciliacao = useMutation({
    mutationFn: async (data: { conta_id: string; competencia: string; saldo_extrato: number; saldo_sistema: number }) => {
      const { data: result, error } = await supabase
        .from("conciliacoes_bancarias")
        .insert({
          ...data,
          status: data.saldo_extrato === data.saldo_sistema ? "conciliado" : "divergente",
          conciliado_por: (await supabase.auth.getUser()).data.user?.id,
          data_conciliacao: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conciliacoes"] });
      toast.success("Conciliação realizada!");
    },
  });

  return { movimentacoes, conciliacoes, isLoading, realizarConciliacao };
}

// =============================================
// RESTOS A PAGAR
// =============================================

export function useRestosAPagar() {
  const { data: restosAPagar = [], isLoading } = useQuery({
    queryKey: ["restos-a-pagar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restos_a_pagar")
        .select(`
          *,
          empenho:empenhos(numero, descricao)
        `)
        .order("data_inscricao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return { restosAPagar, isLoading };
}

// =============================================
// PPA / LDO / LOA
// =============================================

export function usePlanejamentoOrcamentario() {
  const { data: ppaList = [], isLoading: isLoadingPPA } = useQuery({
    queryKey: ["ppa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ppa")
        .select("*")
        .order("ano_inicio", { ascending: false });
      if (error) throw error;
      return data as PPA[];
    },
  });

  const { data: ldoList = [] } = useQuery({
    queryKey: ["ldo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ldo")
        .select("*")
        .order("exercicio", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: loaList = [] } = useQuery({
    queryKey: ["loa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loa")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LOA[];
    },
  });

  const { data: dotacoes = [] } = useQuery({
    queryKey: ["dotacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dotacoes_orcamentarias")
        .select("*")
        .order("codigo_reduzido");
      if (error) throw error;
      return data as DotacaoOrcamentaria[];
    },
  });

  return { ppaList, ldoList, loaList, dotacoes, isLoading: isLoadingPPA };
}

// =============================================
// CLASSIFICAÇÕES ORÇAMENTÁRIAS
// =============================================

export function useClassificacoesOrcamentarias() {
  const { data: naturezasDespesa = [] } = useQuery({
    queryKey: ["naturezas-despesa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("natureza_despesa")
        .select("*")
        .eq("ativo", true)
        .order("codigo");
      if (error) throw error;
      return data;
    },
  });

  const { data: naturezasReceita = [] } = useQuery({
    queryKey: ["naturezas-receita"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("natureza_receita")
        .select("*")
        .eq("ativo", true)
        .order("codigo");
      if (error) throw error;
      return data;
    },
  });

  const { data: fontesRecursos = [] } = useQuery({
    queryKey: ["fontes-recursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fonte_recursos")
        .select("*")
        .eq("ativo", true)
        .order("codigo");
      if (error) throw error;
      return data;
    },
  });

  const { data: funcoesSubfuncoes = [] } = useQuery({
    queryKey: ["funcoes-subfuncoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("funcao_subfuncao")
        .select("*")
        .eq("ativo", true)
        .order("codigo_funcao");
      if (error) throw error;
      return data;
    },
  });

  return { naturezasDespesa, naturezasReceita, fontesRecursos, funcoesSubfuncoes };
}
