import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

// =============================================
// CONTRIBUINTES
// =============================================
export function useContribuintes() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contribuintes = [], isLoading } = useQuery({
    queryKey: ["contribuintes", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase.from("contribuintes").select("*").order("nome_razao_social");
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const createContribuinte = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("contribuintes").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contribuintes"] });
      toast({ title: "Contribuinte cadastrado com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao cadastrar contribuinte", description: error.message, variant: "destructive" });
    },
  });

  const updateContribuinte = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("contribuintes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contribuintes"] });
      toast({ title: "Contribuinte atualizado com sucesso" });
    },
  });

  return { contribuintes, isLoading, createContribuinte, updateContribuinte };
}

// =============================================
// IPTU - IMÓVEIS
// =============================================
export function useImoveis() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: imoveis = [], isLoading } = useQuery({
    queryKey: ["imoveis", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("imoveis")
        .select("*, contribuintes(nome_razao_social, cpf_cnpj)")
        .order("inscricao_imobiliaria");
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const createImovel = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("imoveis").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      toast({ title: "Imóvel cadastrado com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao cadastrar imóvel", description: error.message, variant: "destructive" });
    },
  });

  const updateImovel = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("imoveis").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      toast({ title: "Imóvel atualizado com sucesso" });
    },
  });

  return { imoveis, isLoading, createImovel, updateImovel };
}

// =============================================
// IPTU - LANÇAMENTOS E PARCELAS
// =============================================
export function useIPTU() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lancamentos = [], isLoading } = useQuery({
    queryKey: ["iptu_lancamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("iptu_lancamentos")
        .select("*, imoveis(inscricao_imobiliaria, logradouro, numero, bairro), contribuintes(nome_razao_social, cpf_cnpj)")
        .order("exercicio", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createLancamento = useMutation({
    mutationFn: async (data: any) => {
      // Criar lançamento
      const { data: lancamento, error: lancError } = await supabase
        .from("iptu_lancamentos")
        .insert(data)
        .select()
        .single();
      if (lancError) throw lancError;

      // Criar parcelas automaticamente
      const parcelas = [];
      const valorParcela = data.valor_total / data.numero_parcelas;
      const hoje = new Date();
      
      for (let i = 1; i <= data.numero_parcelas; i++) {
        const vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + i, 10);
        parcelas.push({
          lancamento_id: lancamento.id,
          numero_parcela: i,
          valor: valorParcela,
          data_vencimento: vencimento.toISOString().split("T")[0],
        });
      }

      const { error: parcelasError } = await supabase.from("iptu_parcelas").insert(parcelas);
      if (parcelasError) throw parcelasError;

      return lancamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iptu_lancamentos"] });
      toast({ title: "IPTU lançado com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao lançar IPTU", description: error.message, variant: "destructive" });
    },
  });

  const getParcelas = async (lancamentoId: string) => {
    const { data, error } = await supabase
      .from("iptu_parcelas")
      .select("*")
      .eq("lancamento_id", lancamentoId)
      .order("numero_parcela");
    if (error) throw error;
    return data;
  };

  const registrarPagamento = useMutation({
    mutationFn: async ({ parcelaId, formaPagamento, valorPago }: any) => {
      const { error } = await supabase
        .from("iptu_parcelas")
        .update({
          status: "pago",
          data_pagamento: new Date().toISOString().split("T")[0],
          forma_pagamento: formaPagamento,
          valor_pago: valorPago,
          valor_total_pago: valorPago,
        })
        .eq("id", parcelaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iptu_lancamentos"] });
      toast({ title: "Pagamento registrado com sucesso" });
    },
  });

  return { lancamentos, isLoading, createLancamento, getParcelas, registrarPagamento };
}

// =============================================
// ISS - CONTRIBUINTES E NFS-e
// =============================================
export function useISS() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: issContribuintes = [], isLoading: loadingContribuintes } = useQuery({
    queryKey: ["iss_contribuintes", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("iss_contribuintes")
        .select("*, contribuintes(nome_razao_social, cpf_cnpj)")
        .order("created_at", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const { data: nfseList = [], isLoading: loadingNfse } = useQuery({
    queryKey: ["nfse", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("nfse")
        .select("*, iss_contribuintes(contribuintes(nome_razao_social))")
        .order("numero_nfse", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const { data: guias = [], isLoading: loadingGuias } = useQuery({
    queryKey: ["iss_guias", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("iss_guias")
        .select("*, iss_contribuintes(contribuintes(nome_razao_social, cpf_cnpj))")
        .order("competencia", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const createIssContribuinte = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("iss_contribuintes").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iss_contribuintes"] });
      toast({ title: "Contribuinte ISS cadastrado com sucesso" });
    },
  });

  const emitirNfse = useMutation({
    mutationFn: async (data: any) => {
      const codigoVerificacao = Math.random().toString(36).substring(2, 10).toUpperCase();
      const { error } = await supabase.from("nfse").insert({
        ...data,
        codigo_verificacao: codigoVerificacao,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfse"] });
      toast({ title: "NFS-e emitida com sucesso" });
    },
  });

  const cancelarNfse = useMutation({
    mutationFn: async ({ id, motivo }: any) => {
      const { error } = await supabase
        .from("nfse")
        .update({
          status: "cancelada",
          data_cancelamento: new Date().toISOString(),
          motivo_cancelamento: motivo,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfse"] });
      toast({ title: "NFS-e cancelada com sucesso" });
    },
  });

  const gerarGuia = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("iss_guias").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["iss_guias"] });
      toast({ title: "Guia ISS gerada com sucesso" });
    },
  });

  return {
    issContribuintes,
    nfseList,
    guias,
    isLoading: loadingContribuintes || loadingNfse || loadingGuias,
    createIssContribuinte,
    emitirNfse,
    cancelarNfse,
    gerarGuia,
  };
}

// =============================================
// DÍVIDA ATIVA
// =============================================
export function useDividaAtiva() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: dividas = [], isLoading } = useQuery({
    queryKey: ["divida_ativa", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("divida_ativa")
        .select("*, contribuintes(nome_razao_social, cpf_cnpj)")
        .order("data_inscricao", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const inscreverDivida = useMutation({
    mutationFn: async (data: any) => {
      const numeroInscricao = `DA-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("divida_ativa").insert({
        ...data,
        numero_inscricao: numeroInscricao,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divida_ativa"] });
      toast({ title: "Débito inscrito em Dívida Ativa" });
    },
  });

  const ajuizarDivida = useMutation({
    mutationFn: async ({ id, numeroProcesso, varaJuizo }: any) => {
      const { error } = await supabase
        .from("divida_ativa")
        .update({
          status: "em_execucao",
          numero_processo_judicial: numeroProcesso,
          vara_juizo: varaJuizo,
          data_ajuizamento: new Date().toISOString().split("T")[0],
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divida_ativa"] });
      toast({ title: "Execução fiscal ajuizada" });
    },
  });

  return { dividas, isLoading, inscreverDivida, ajuizarDivida };
}

// =============================================
// PARCELAMENTOS E REFIS
// =============================================
export function useParcelamentos() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: programasRefis = [], isLoading: loadingRefis } = useQuery({
    queryKey: ["programas_refis", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase.from("programas_refis").select("*").order("data_inicio", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const { data: parcelamentos = [], isLoading: loadingParcelamentos } = useQuery({
    queryKey: ["parcelamentos", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("parcelamentos")
        .select("*, contribuintes(nome_razao_social, cpf_cnpj), programas_refis(nome)")
        .order("data_adesao", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const createRefis = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("programas_refis").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programas_refis"] });
      toast({ title: "Programa REFIS criado com sucesso" });
    },
  });

  const createParcelamento = useMutation({
    mutationFn: async (data: any) => {
      const numeroTermo = `PARC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      
      // Criar parcelamento
      const { data: parcelamento, error: parcError } = await supabase
        .from("parcelamentos")
        .insert({
          ...data,
          numero_termo: numeroTermo,
          secretaria_id: secretariaAtiva?.id,
        })
        .select()
        .single();
      if (parcError) throw parcError;

      // Criar parcelas
      const parcelas = [];
      const hoje = new Date();
      
      for (let i = 1; i <= data.numero_parcelas; i++) {
        const vencimento = new Date(hoje.getFullYear(), hoje.getMonth() + i, data.dia_vencimento || 10);
        parcelas.push({
          parcelamento_id: parcelamento.id,
          numero_parcela: i,
          valor: data.valor_parcela,
          data_vencimento: vencimento.toISOString().split("T")[0],
        });
      }

      const { error: parcelasError } = await supabase.from("parcelamento_parcelas").insert(parcelas);
      if (parcelasError) throw parcelasError;

      return parcelamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parcelamentos"] });
      toast({ title: "Parcelamento criado com sucesso" });
    },
  });

  const getParcelasByParcelamento = async (parcelamentoId: string) => {
    const { data, error } = await supabase
      .from("parcelamento_parcelas")
      .select("*")
      .eq("parcelamento_id", parcelamentoId)
      .order("numero_parcela");
    if (error) throw error;
    return data;
  };

  return {
    programasRefis,
    parcelamentos,
    isLoading: loadingRefis || loadingParcelamentos,
    createRefis,
    createParcelamento,
    getParcelasByParcelamento,
  };
}

// =============================================
// FISCALIZAÇÃO
// =============================================
export function useFiscalizacao() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: fiscalizacoes = [], isLoading } = useQuery({
    queryKey: ["fiscalizacoes", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("fiscalizacoes")
        .select("*, contribuintes(nome_razao_social, cpf_cnpj), imoveis(inscricao_imobiliaria, logradouro)")
        .order("data_agendada", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const createFiscalizacao = useMutation({
    mutationFn: async (data: any) => {
      const numeroOS = `OS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      const { error } = await supabase.from("fiscalizacoes").insert({
        ...data,
        numero_ordem_servico: numeroOS,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscalizacoes"] });
      toast({ title: "Fiscalização agendada com sucesso" });
    },
  });

  const iniciarFiscalizacao = useMutation({
    mutationFn: async ({ id, latitude, longitude }: any) => {
      const { error } = await supabase
        .from("fiscalizacoes")
        .update({
          status: "em_andamento",
          data_inicio: new Date().toISOString(),
          latitude_inicio: latitude,
          longitude_inicio: longitude,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscalizacoes"] });
      toast({ title: "Fiscalização iniciada" });
    },
  });

  const concluirFiscalizacao = useMutation({
    mutationFn: async ({ id, resultado, latitude, longitude }: any) => {
      const { error } = await supabase
        .from("fiscalizacoes")
        .update({
          status: "concluida",
          data_fim: new Date().toISOString(),
          situacao_encontrada: resultado.situacao,
          irregularidades_detectadas: resultado.irregularidades,
          auto_infracao: resultado.autoInfracao,
          numero_auto_infracao: resultado.numeroAuto,
          valor_multa: resultado.valorMulta,
          latitude_fim: latitude,
          longitude_fim: longitude,
          observacoes: resultado.observacoes,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscalizacoes"] });
      toast({ title: "Fiscalização concluída" });
    },
  });

  return { fiscalizacoes, isLoading, createFiscalizacao, iniciarFiscalizacao, concluirFiscalizacao };
}

// =============================================
// PAGAMENTOS TRIBUTÁRIOS
// =============================================
export function usePagamentosTributarios() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pagamentos = [], isLoading } = useQuery({
    queryKey: ["pagamentos_tributarios", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("pagamentos_tributarios")
        .select("*, contribuintes(nome_razao_social, cpf_cnpj)")
        .order("data_pagamento", { ascending: false });
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const registrarPagamento = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("pagamentos_tributarios").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagamentos_tributarios"] });
      toast({ title: "Pagamento registrado com sucesso" });
    },
  });

  // Estatísticas de arrecadação
  const { data: estatisticas } = useQuery({
    queryKey: ["estatisticas_arrecadacao", secretariaAtiva?.id],
    queryFn: async () => {
      const anoAtual = new Date().getFullYear();
      const mesAtual = new Date().getMonth() + 1;

      // Total arrecadado no ano
      const { data: totalAno } = await supabase
        .from("pagamentos_tributarios")
        .select("valor_total")
        .gte("data_pagamento", `${anoAtual}-01-01`);

      // Total arrecadado no mês
      const { data: totalMes } = await supabase
        .from("pagamentos_tributarios")
        .select("valor_total")
        .gte("data_pagamento", `${anoAtual}-${mesAtual.toString().padStart(2, "0")}-01`);

      // Total em dívida ativa
      const { data: dividaAtiva } = await supabase
        .from("divida_ativa")
        .select("valor_total")
        .in("status", ["inscrita", "parcelada", "em_execucao"]);

      // IPTU em aberto
      const { data: iptuAberto } = await supabase
        .from("iptu_parcelas")
        .select("valor")
        .in("status", ["em_aberto", "vencido"]);

      return {
        totalArrecadadoAno: totalAno?.reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0,
        totalArrecadadoMes: totalMes?.reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0,
        totalDividaAtiva: dividaAtiva?.reduce((sum, d) => sum + (d.valor_total || 0), 0) || 0,
        totalIptuAberto: iptuAberto?.reduce((sum, p) => sum + (p.valor || 0), 0) || 0,
      };
    },
    enabled: !!secretariaAtiva?.id,
  });

  return { pagamentos, estatisticas, isLoading, registrarPagamento };
}
