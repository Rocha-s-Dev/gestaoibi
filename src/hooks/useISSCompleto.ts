import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ==========================================
// LISTA DE SERVIÇOS ISS
// ==========================================
export function useListaServicosISS() {
  const queryClient = useQueryClient();

  const { data: servicos = [], isLoading } = useQuery({
    queryKey: ["lista-servicos-iss"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lista_servicos_iss")
        .select("*")
        .order("codigo_municipal");
      if (error) throw error;
      return data;
    },
  });

  const createServico = useMutation({
    mutationFn: async (servico: {
      codigo_municipal: string;
      codigo_lc116?: string;
      descricao: string;
      aliquota_padrao: number;
      aliquota_minima?: number;
      aliquota_maxima?: number;
      base_calculo_descricao?: string;
      deducoes_permitidas?: any[];
      exige_retencao?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("lista_servicos_iss")
        .insert(servico)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lista-servicos-iss"] });
      toast.success("Serviço cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar serviço: ${error.message}`);
    },
  });

  const updateServico = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<any>) => {
      const { data, error } = await supabase
        .from("lista_servicos_iss")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lista-servicos-iss"] });
      toast.success("Serviço atualizado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar serviço: ${error.message}`);
    },
  });

  return { servicos, isLoading, createServico, updateServico };
}

// ==========================================
// ATIVIDADES DO CONTRIBUINTE
// ==========================================
export function useContribuinteAtividades(contribuinteId?: string) {
  const queryClient = useQueryClient();

  const { data: atividades = [], isLoading } = useQuery({
    queryKey: ["contribuinte-atividades", contribuinteId],
    queryFn: async () => {
      if (!contribuinteId) return [];
      const { data, error } = await supabase
        .from("contribuinte_atividades")
        .select(`
          *,
          servico:lista_servicos_iss(*)
        `)
        .eq("contribuinte_id", contribuinteId);
      if (error) throw error;
      return data;
    },
    enabled: !!contribuinteId,
  });

  const addAtividade = useMutation({
    mutationFn: async (atividade: {
      contribuinte_id: string;
      servico_id: string;
      cnae_codigo?: string;
      aliquota_especifica?: number;
      principal?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("contribuinte_atividades")
        .insert(atividade)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contribuinte-atividades"] });
      toast.success("Atividade vinculada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao vincular atividade: ${error.message}`);
    },
  });

  const removeAtividade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contribuinte_atividades")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contribuinte-atividades"] });
      toast.success("Atividade removida!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover atividade: ${error.message}`);
    },
  });

  return { atividades, isLoading, addAtividade, removeAtividade };
}

// ==========================================
// DECLARAÇÕES MENSAIS ISS
// ==========================================
export function useDeclaracoesISS(contribuinteId?: string) {
  const queryClient = useQueryClient();

  const { data: declaracoes = [], isLoading } = useQuery({
    queryKey: ["declaracoes-iss", contribuinteId],
    queryFn: async () => {
      let query = supabase
        .from("declaracoes_iss")
        .select(`
          *,
          contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj, inscricao_municipal)
        `)
        .order("competencia", { ascending: false });

      if (contribuinteId) {
        query = query.eq("contribuinte_id", contribuinteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createDeclaracao = useMutation({
    mutationFn: async (declaracao: {
      contribuinte_id: string;
      competencia: string;
    }) => {
      // Gerar número da declaração
      const { data: numeroData } = await supabase.rpc("gerar_numero_declaracao_iss", {
        p_contribuinte_id: declaracao.contribuinte_id,
        p_competencia: declaracao.competencia,
      });

      const { data, error } = await supabase
        .from("declaracoes_iss")
        .insert({
          ...declaracao,
          numero_declaracao: numeroData || `DEC-${Date.now()}`,
          status: "rascunho",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["declaracoes-iss"] });
      toast.success("Declaração criada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar declaração: ${error.message}`);
    },
  });

  const transmitirDeclaracao = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("declaracoes_iss")
        .update({
          status: "transmitida",
          data_transmissao: new Date().toISOString(),
          data_vencimento: new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            15
          ).toISOString().split("T")[0],
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["declaracoes-iss"] });
      toast.success("Declaração transmitida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao transmitir declaração: ${error.message}`);
    },
  });

  const retificarDeclaracao = useMutation({
    mutationFn: async ({
      declaracaoOriginalId,
      motivo,
    }: {
      declaracaoOriginalId: string;
      motivo: string;
    }) => {
      // Buscar declaração original
      const { data: original, error: fetchError } = await supabase
        .from("declaracoes_iss")
        .select("*")
        .eq("id", declaracaoOriginalId)
        .single();
      if (fetchError) throw fetchError;

      // Atualizar status da original
      await supabase
        .from("declaracoes_iss")
        .update({ status: "retificada" })
        .eq("id", declaracaoOriginalId);

      // Gerar novo número
      const { data: numeroData } = await supabase.rpc("gerar_numero_declaracao_iss", {
        p_contribuinte_id: original.contribuinte_id,
        p_competencia: original.competencia,
      });

      // Criar nova declaração retificadora
      const { data, error } = await supabase
        .from("declaracoes_iss")
        .insert({
          contribuinte_id: original.contribuinte_id,
          competencia: original.competencia,
          numero_declaracao: numeroData || `DEC-RET-${Date.now()}`,
          status: "rascunho",
          declaracao_retificadora_de: declaracaoOriginalId,
          motivo_retificacao: motivo,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["declaracoes-iss"] });
      toast.success("Declaração retificadora criada!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao retificar: ${error.message}`);
    },
  });

  return {
    declaracoes,
    isLoading,
    createDeclaracao,
    transmitirDeclaracao,
    retificarDeclaracao,
  };
}

// ==========================================
// ITENS DA DECLARAÇÃO
// ==========================================
export function useItensDeclaracaoISS(declaracaoId?: string) {
  const queryClient = useQueryClient();

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["itens-declaracao-iss", declaracaoId],
    queryFn: async () => {
      if (!declaracaoId) return [];
      const { data, error } = await supabase
        .from("itens_declaracao_iss")
        .select(`
          *,
          servico:lista_servicos_iss(*)
        `)
        .eq("declaracao_id", declaracaoId);
      if (error) throw error;
      return data;
    },
    enabled: !!declaracaoId,
  });

  const addItem = useMutation({
    mutationFn: async (item: {
      declaracao_id: string;
      servico_id: string;
      tomador_cpf_cnpj?: string;
      tomador_nome?: string;
      descricao_servico?: string;
      valor_servico: number;
      valor_deducao?: number;
      base_calculo: number;
      aliquota: number;
      valor_iss: number;
      iss_retido?: boolean;
      data_servico?: string;
    }) => {
      const { data, error } = await supabase
        .from("itens_declaracao_iss")
        .insert(item)
        .select()
        .single();
      if (error) throw error;

      // Atualizar totais da declaração
      await recalcularDeclaracao(item.declaracao_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-declaracao-iss"] });
      queryClient.invalidateQueries({ queryKey: ["declaracoes-iss"] });
      toast.success("Item adicionado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar item: ${error.message}`);
    },
  });

  const removeItem = useMutation({
    mutationFn: async ({ id, declaracaoId }: { id: string; declaracaoId: string }) => {
      const { error } = await supabase
        .from("itens_declaracao_iss")
        .delete()
        .eq("id", id);
      if (error) throw error;

      // Recalcular totais
      await recalcularDeclaracao(declaracaoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itens-declaracao-iss"] });
      queryClient.invalidateQueries({ queryKey: ["declaracoes-iss"] });
      toast.success("Item removido!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover item: ${error.message}`);
    },
  });

  return { itens, isLoading, addItem, removeItem };
}

async function recalcularDeclaracao(declaracaoId: string) {
  const { data: itens } = await supabase
    .from("itens_declaracao_iss")
    .select("*")
    .eq("declaracao_id", declaracaoId);

  if (!itens) return;

  const totais = itens.reduce(
    (acc, item) => ({
      valor_servicos_prestados: acc.valor_servicos_prestados + Number(item.valor_servico || 0),
      valor_deducoes: acc.valor_deducoes + Number(item.valor_deducao || 0),
      base_calculo: acc.base_calculo + Number(item.base_calculo || 0),
      valor_iss_devido: acc.valor_iss_devido + Number(item.valor_iss || 0),
      valor_iss_retido: acc.valor_iss_retido + (item.iss_retido ? Number(item.valor_iss || 0) : 0),
    }),
    {
      valor_servicos_prestados: 0,
      valor_deducoes: 0,
      base_calculo: 0,
      valor_iss_devido: 0,
      valor_iss_retido: 0,
    }
  );

  await supabase
    .from("declaracoes_iss")
    .update({
      ...totais,
      valor_iss_pagar: totais.valor_iss_devido - totais.valor_iss_retido,
    })
    .eq("id", declaracaoId);
}

// ==========================================
// GUIAS DE PAGAMENTO ISS
// ==========================================
export function useGuiasISS(contribuinteId?: string) {
  const queryClient = useQueryClient();

  const { data: guias = [], isLoading } = useQuery({
    queryKey: ["guias-iss", contribuinteId],
    queryFn: async () => {
      let query = supabase
        .from("guias_iss")
        .select(`
          *,
          contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj),
          declaracao:declaracoes_iss(id, numero_declaracao, competencia)
        `)
        .order("data_vencimento", { ascending: false });

      if (contribuinteId) {
        query = query.eq("contribuinte_id", contribuinteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const gerarGuia = useMutation({
    mutationFn: async (declaracaoId: string) => {
      // Buscar declaração
      const { data: declaracao, error: fetchError } = await supabase
        .from("declaracoes_iss")
        .select("*")
        .eq("id", declaracaoId)
        .single();
      if (fetchError) throw fetchError;

      if (declaracao.valor_iss_pagar <= 0) {
        throw new Error("Não há ISS a pagar nesta declaração");
      }

      // Gerar número da guia
      const { data: numeroGuia } = await supabase.rpc("gerar_numero_guia_iss", {
        p_declaracao_id: declaracaoId,
      });

      const { data, error } = await supabase
        .from("guias_iss")
        .insert({
          declaracao_id: declaracaoId,
          contribuinte_id: declaracao.contribuinte_id,
          numero_guia: numeroGuia || `GUIA-${Date.now()}`,
          competencia: declaracao.competencia,
          valor_principal: declaracao.valor_iss_pagar,
          valor_total: declaracao.valor_iss_pagar,
          data_vencimento: declaracao.data_vencimento,
          status: "pendente",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guias-iss"] });
      toast.success("Guia gerada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao gerar guia: ${error.message}`);
    },
  });

  const registrarPagamento = useMutation({
    mutationFn: async ({
      id,
      valor_pago,
      data_pagamento,
    }: {
      id: string;
      valor_pago: number;
      data_pagamento: string;
    }) => {
      const { data, error } = await supabase
        .from("guias_iss")
        .update({
          valor_pago,
          data_pagamento,
          status: "pago",
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["guias-iss"] });
      toast.success("Pagamento registrado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao registrar pagamento: ${error.message}`);
    },
  });

  return { guias, isLoading, gerarGuia, registrarPagamento };
}

// ==========================================
// NFS-e
// ==========================================
export function useNFSe(prestadorId?: string) {
  const queryClient = useQueryClient();

  const { data: notas = [], isLoading } = useQuery({
    queryKey: ["nfse", prestadorId],
    queryFn: async () => {
      let query = supabase
        .from("nfse")
        .select(`
          *,
          servico:lista_servicos_iss(id, codigo_municipal, descricao)
        `)
        .order("data_emissao", { ascending: false });

      if (prestadorId) {
        query = query.eq("iss_contribuinte_id", prestadorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const emitirNFSe = useMutation({
    mutationFn: async (nota: {
      iss_contribuinte_id: string;
      prestador_cpf_cnpj: string;
      prestador_razao_social: string;
      tomador_cpf_cnpj?: string;
      tomador_razao_social?: string;
      tomador_email?: string;
      servico_id?: string;
      codigo_servico: string;
      descricao_servico: string;
      valor_servicos: number;
      valor_deducoes?: number;
      aliquota: number;
    }) => {
      const baseCalculo = nota.valor_servicos - (nota.valor_deducoes || 0);
      const valorIss = baseCalculo * (nota.aliquota / 100);
      const valorLiquido = nota.valor_servicos - valorIss;

      // Gerar número sequencial
      const { data: notasExistentes } = await supabase
        .from("nfse")
        .select("numero_nfse")
        .eq("iss_contribuinte_id", nota.iss_contribuinte_id)
        .order("numero_nfse", { ascending: false })
        .limit(1);

      const proximoNumero = notasExistentes && notasExistentes.length > 0
        ? (notasExistentes[0].numero_nfse || 0) + 1
        : 1;

      // Gerar código de verificação
      const codigoVerificacao = Math.random().toString(36).substring(2, 10).toUpperCase();

      const competencia = new Date().toISOString().substring(0, 10);

      const { data, error } = await supabase
        .from("nfse")
        .insert({
          iss_contribuinte_id: nota.iss_contribuinte_id,
          prestador_cpf_cnpj: nota.prestador_cpf_cnpj,
          prestador_razao_social: nota.prestador_razao_social,
          tomador_cpf_cnpj: nota.tomador_cpf_cnpj,
          tomador_razao_social: nota.tomador_razao_social,
          tomador_email: nota.tomador_email,
          servico_id: nota.servico_id,
          codigo_servico: nota.codigo_servico,
          descricao_servico: nota.descricao_servico,
          valor_servicos: nota.valor_servicos,
          valor_deducoes: nota.valor_deducoes || 0,
          numero_nfse: proximoNumero,
          codigo_verificacao: codigoVerificacao,
          competencia,
          base_calculo: baseCalculo,
          aliquota: nota.aliquota,
          valor_iss: valorIss,
          valor_liquido: valorLiquido,
          status: "emitida",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfse"] });
      toast.success("NFS-e emitida com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao emitir NFS-e: ${error.message}`);
    },
  });

  const cancelarNFSe = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { data, error } = await supabase
        .from("nfse")
        .update({
          status: "cancelada",
          motivo_cancelamento: motivo,
          data_cancelamento: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nfse"] });
      toast.success("NFS-e cancelada!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao cancelar NFS-e: ${error.message}`);
    },
  });

  return { notas, isLoading, emitirNFSe, cancelarNFSe };
}

// ==========================================
// FISCALIZAÇÃO ISS
// ==========================================
export function useFiscalizacaoISS() {
  const queryClient = useQueryClient();

  const { data: fiscalizacoes = [], isLoading } = useQuery({
    queryKey: ["fiscalizacao-iss"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscalizacao_iss")
        .select(`
          *,
          contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj),
          fiscal:profiles(id, name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const criarFiscalizacao = useMutation({
    mutationFn: async (fiscalizacao: {
      contribuinte_id: string;
      periodo_fiscalizado_inicio: string;
      periodo_fiscalizado_fim: string;
      tipo_fiscalizacao?: string;
      motivo?: string;
    }) => {
      const { data: numeroOS } = await supabase.rpc("gerar_numero_ordem_servico_fiscalizacao");

      const { data, error } = await supabase
        .from("fiscalizacao_iss")
        .insert({
          ...fiscalizacao,
          numero_ordem_servico: numeroOS || `OS-${Date.now()}`,
          status: "em_andamento",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscalizacao-iss"] });
      toast.success("Fiscalização iniciada!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar fiscalização: ${error.message}`);
    },
  });

  const concluirFiscalizacao = useMutation({
    mutationFn: async ({
      id,
      conclusao,
      total_servicos_apurados,
      total_iss_apurado,
      total_iss_declarado,
    }: {
      id: string;
      conclusao: string;
      total_servicos_apurados: number;
      total_iss_apurado: number;
      total_iss_declarado: number;
    }) => {
      const { data, error } = await supabase
        .from("fiscalizacao_iss")
        .update({
          status: "concluida",
          data_fim: new Date().toISOString().split("T")[0],
          conclusao,
          total_servicos_apurados,
          total_iss_apurado,
          total_iss_declarado,
          diferenca_apurada: total_iss_apurado - total_iss_declarado,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscalizacao-iss"] });
      toast.success("Fiscalização concluída!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao concluir fiscalização: ${error.message}`);
    },
  });

  return { fiscalizacoes, isLoading, criarFiscalizacao, concluirFiscalizacao };
}

// ==========================================
// AUTOS DE INFRAÇÃO
// ==========================================
export function useAutosInfracaoISS() {
  const queryClient = useQueryClient();

  const { data: autos = [], isLoading } = useQuery({
    queryKey: ["autos-infracao-iss"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("autos_infracao_iss")
        .select(`
          *,
          contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj),
          fiscalizacao:fiscalizacao_iss(id, numero_ordem_servico)
        `)
        .order("data_lavratura", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const lavrarAuto = useMutation({
    mutationFn: async (auto: {
      contribuinte_id: string;
      fiscalizacao_id?: string;
      tipo: string;
      descricao_infracao: string;
      fundamentacao_legal?: string;
      periodo_infracao_inicio?: string;
      periodo_infracao_fim?: string;
      valor_principal: number;
      valor_multa: number;
    }) => {
      const { data: numeroAuto } = await supabase.rpc("gerar_numero_auto_infracao");

      const valorTotal = auto.valor_principal + auto.valor_multa;
      const dataLimiteDefesa = new Date();
      dataLimiteDefesa.setDate(dataLimiteDefesa.getDate() + 30);

      const { data, error } = await supabase
        .from("autos_infracao_iss")
        .insert({
          ...auto,
          numero_auto: numeroAuto || `AI-${Date.now()}`,
          valor_total: valorTotal,
          data_limite_defesa: dataLimiteDefesa.toISOString().split("T")[0],
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["autos-infracao-iss"] });
      toast.success("Auto de infração lavrado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao lavrar auto: ${error.message}`);
    },
  });

  return { autos, isLoading, lavrarAuto };
}

// ==========================================
// PROCESSOS ADMINISTRATIVOS FISCAIS
// ==========================================
export function useProcessosFiscais() {
  const queryClient = useQueryClient();

  const { data: processos = [], isLoading } = useQuery({
    queryKey: ["processos-fiscais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos_administrativos_fiscais")
        .select(`
          *,
          contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj),
          auto_infracao:autos_infracao_iss(id, numero_auto, valor_total)
        `)
        .order("data_abertura", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const criarProcesso = useMutation({
    mutationFn: async (processo: {
      auto_infracao_id: string;
      contribuinte_id: string;
    }) => {
      const { data: numeroProcesso } = await supabase.rpc("gerar_numero_processo_fiscal");

      const { data, error } = await supabase
        .from("processos_administrativos_fiscais")
        .insert({
          ...processo,
          numero_processo: numeroProcesso || `PAF-${Date.now()}`,
          status: "aberto",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos-fiscais"] });
      toast.success("Processo criado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar processo: ${error.message}`);
    },
  });

  const julgarProcesso = useMutation({
    mutationFn: async ({
      id,
      decisao,
      fundamentacao_decisao,
      procedente,
    }: {
      id: string;
      decisao: string;
      fundamentacao_decisao: string;
      procedente: boolean;
    }) => {
      const { data, error } = await supabase
        .from("processos_administrativos_fiscais")
        .update({
          status: procedente ? "julgado_procedente" : "julgado_improcedente",
          data_julgamento: new Date().toISOString().split("T")[0],
          decisao,
          fundamentacao_decisao,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos-fiscais"] });
      toast.success("Processo julgado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao julgar processo: ${error.message}`);
    },
  });

  const inscreverDividaAtiva = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("processos_administrativos_fiscais")
        .update({
          status: "encaminhado_divida_ativa",
          inscrito_divida_ativa: true,
          data_inscricao_divida_ativa: new Date().toISOString().split("T")[0],
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos-fiscais"] });
      toast.success("Inscrito em dívida ativa!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao inscrever em dívida ativa: ${error.message}`);
    },
  });

  return { processos, isLoading, criarProcesso, julgarProcesso, inscreverDividaAtiva };
}

// ==========================================
// ALERTAS DE FISCALIZAÇÃO
// ==========================================
export function useAlertasFiscalizacaoISS() {
  const queryClient = useQueryClient();

  const { data: alertas = [], isLoading } = useQuery({
    queryKey: ["alertas-fiscalizacao-iss"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas_fiscalizacao_iss")
        .select(`
          *,
          contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj)
        `)
        .eq("analisado", false)
        .order("data_geracao", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const analisarAlerta = useMutation({
    mutationFn: async ({
      id,
      resultado_analise,
      gera_fiscalizacao,
    }: {
      id: string;
      resultado_analise: string;
      gera_fiscalizacao: boolean;
    }) => {
      const { data, error } = await supabase
        .from("alertas_fiscalizacao_iss")
        .update({
          analisado: true,
          data_analise: new Date().toISOString(),
          resultado_analise,
          gera_fiscalizacao,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas-fiscalizacao-iss"] });
      toast.success("Alerta analisado!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao analisar alerta: ${error.message}`);
    },
  });

  return { alertas, isLoading, analisarAlerta };
}

// ==========================================
// RELATÓRIOS ISS
// ==========================================
export function useRelatoriosISS() {
  const getArrecadacaoPorAtividade = async (competenciaInicio: string, competenciaFim: string) => {
    const { data, error } = await supabase
      .from("guias_iss")
      .select(`
        *,
        declaracao:declaracoes_iss!inner(
          contribuinte_id,
          itens:itens_declaracao_iss(
            servico:lista_servicos_iss(codigo_municipal, descricao)
          )
        )
      `)
      .eq("status", "pago")
      .gte("competencia", competenciaInicio)
      .lte("competencia", competenciaFim);

    if (error) throw error;
    return data;
  };

  const getRankingContribuintes = async (competenciaInicio: string, competenciaFim: string) => {
    const { data, error } = await supabase
      .from("guias_iss")
      .select(`
        valor_pago,
        contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj, inscricao_municipal)
      `)
      .eq("status", "pago")
      .gte("competencia", competenciaInicio)
      .lte("competencia", competenciaFim);

    if (error) throw error;

    // Agrupar por contribuinte
    const ranking = data.reduce((acc: any, guia: any) => {
      const id = guia.contribuinte?.id;
      if (!id) return acc;
      if (!acc[id]) {
        acc[id] = {
          contribuinte: guia.contribuinte,
          total_arrecadado: 0,
        };
      }
      acc[id].total_arrecadado += Number(guia.valor_pago || 0);
      return acc;
    }, {});

    return Object.values(ranking).sort((a: any, b: any) => b.total_arrecadado - a.total_arrecadado);
  };

  const getInadimplencia = async () => {
    const hoje = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("guias_iss")
      .select(`
        *,
        contribuinte:contribuintes(id, nome_razao_social, cpf_cnpj)
      `)
      .eq("status", "pendente")
      .lt("data_vencimento", hoje);

    if (error) throw error;
    return data;
  };

  const getEstatisticas = async () => {
    const anoAtual = new Date().getFullYear();
    const mesAtual = new Date().getMonth() + 1;
    const competenciaAtual = `${anoAtual}-${String(mesAtual).padStart(2, "0")}`;

    const { data: guiasPagasAno } = await supabase
      .from("guias_iss")
      .select("valor_pago")
      .eq("status", "pago")
      .gte("competencia", `${anoAtual}-01`)
      .lte("competencia", `${anoAtual}-12`);

    const { data: guiasPagasMes } = await supabase
      .from("guias_iss")
      .select("valor_pago")
      .eq("status", "pago")
      .eq("competencia", competenciaAtual);

    const { data: guiasPendentes } = await supabase
      .from("guias_iss")
      .select("valor_total")
      .eq("status", "pendente");

    const { data: totalNfse } = await supabase
      .from("nfse")
      .select("id")
      .eq("status", "emitida")
      .gte("competencia", `${anoAtual}-01`);

    return {
      totalArrecadadoAno: guiasPagasAno?.reduce((acc, g) => acc + Number(g.valor_pago || 0), 0) || 0,
      totalArrecadadoMes: guiasPagasMes?.reduce((acc, g) => acc + Number(g.valor_pago || 0), 0) || 0,
      totalPendente: guiasPendentes?.reduce((acc, g) => acc + Number(g.valor_total || 0), 0) || 0,
      totalNfseEmitidas: totalNfse?.length || 0,
    };
  };

  return {
    getArrecadacaoPorAtividade,
    getRankingContribuintes,
    getInadimplencia,
    getEstatisticas,
  };
}
