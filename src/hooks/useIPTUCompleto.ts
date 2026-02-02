import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

// =============================================
// PLANTA GENÉRICA DE VALORES (PGV)
// =============================================
export function usePlantaGenericaValores() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: pgv = [], isLoading } = useQuery({
    queryKey: ["planta_generica_valores", secretariaAtiva?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planta_generica_valores")
        .select("*")
        .order("logradouro");
      if (error) throw error;
      return data || [];
    },
  });

  const createPGV = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("planta_generica_valores").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planta_generica_valores"] });
      toast({ title: "Valor cadastrado na PGV" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const updatePGV = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("planta_generica_valores").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planta_generica_valores"] });
      toast({ title: "PGV atualizada" });
    },
  });

  return { pgv, isLoading, createPGV, updatePGV };
}

// =============================================
// HISTÓRICO DE VALORES VENAIS
// =============================================
export function useHistoricoValoresVenais(imovelId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: historico = [], isLoading } = useQuery({
    queryKey: ["historico_valores_venais", imovelId],
    queryFn: async () => {
      let query = supabase
        .from("historico_valores_venais")
        .select("*")
        .order("exercicio", { ascending: false });
      
      if (imovelId) {
        query = query.eq("imovel_id", imovelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!imovelId,
  });

  const createHistorico = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("historico_valores_venais").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["historico_valores_venais"] });
      toast({ title: "Histórico de valor venal registrado" });
    },
  });

  return { historico, isLoading, createHistorico };
}

// =============================================
// HISTÓRICO DE PROPRIETÁRIOS/TRANSFERÊNCIAS
// =============================================
export function useHistoricoProprietarios(imovelId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: historico = [], isLoading } = useQuery({
    queryKey: ["historico_proprietarios", imovelId],
    queryFn: async () => {
      let query = supabase
        .from("historico_proprietarios")
        .select("*, contribuintes(nome_razao_social, cpf_cnpj)")
        .order("data_transferencia", { ascending: false });
      
      if (imovelId) {
        query = query.eq("imovel_id", imovelId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!imovelId,
  });

  const registrarTransferencia = useMutation({
    mutationFn: async (data: any) => {
      // Registrar transferência
      const { error: histError } = await supabase.from("historico_proprietarios").insert(data);
      if (histError) throw histError;

      // Atualizar proprietário atual do imóvel
      const { error: imovelError } = await supabase
        .from("imoveis")
        .update({ contribuinte_id: data.contribuinte_id })
        .eq("id", data.imovel_id);
      if (imovelError) throw imovelError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["historico_proprietarios"] });
      queryClient.invalidateQueries({ queryKey: ["imoveis"] });
      toast({ title: "Transferência registrada com sucesso" });
    },
    onError: (error: any) => {
      toast({ title: "Erro ao registrar transferência", description: error.message, variant: "destructive" });
    },
  });

  return { historico, isLoading, registrarTransferencia };
}

// =============================================
// REVISÕES DE IPTU
// =============================================
export function useRevisoesIPTU() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: revisoes = [], isLoading } = useQuery({
    queryKey: ["revisoes_iptu", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("revisoes_iptu")
        .select("*, imoveis(inscricao_imobiliaria, logradouro, numero), contribuintes(nome_razao_social)")
        .order("data_solicitacao", { ascending: false });
      
      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!secretariaAtiva?.id,
  });

  const solicitarRevisao = useMutation({
    mutationFn: async (data: any) => {
      const protocolo = `REV-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
      const { error } = await supabase.from("revisoes_iptu").insert({
        ...data,
        protocolo,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
      return protocolo;
    },
    onSuccess: (protocolo) => {
      queryClient.invalidateQueries({ queryKey: ["revisoes_iptu"] });
      toast({ title: "Revisão solicitada", description: `Protocolo: ${protocolo}` });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const analisarRevisao = useMutation({
    mutationFn: async ({ id, status, parecer, decisao }: any) => {
      const { error } = await supabase
        .from("revisoes_iptu")
        .update({
          status,
          parecer,
          decisao,
          data_decisao: new Date().toISOString().split("T")[0],
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["revisoes_iptu"] });
      toast({ title: "Revisão analisada" });
    },
  });

  return { revisoes, isLoading, solicitarRevisao, analisarRevisao };
}

// =============================================
// CONFIGURAÇÃO DE LANÇAMENTO ANUAL
// =============================================
export function useConfigLancamentoIPTU() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["config_lancamento_iptu", secretariaAtiva?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_lancamento_iptu")
        .select("*")
        .order("exercicio", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createConfig = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("config_lancamento_iptu").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config_lancamento_iptu"] });
      toast({ title: "Configuração de lançamento criada" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  const updateConfig = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("config_lancamento_iptu").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config_lancamento_iptu"] });
      toast({ title: "Configuração atualizada" });
    },
  });

  return { configs, isLoading, createConfig, updateConfig };
}

// =============================================
// LANÇAMENTO EM LOTE
// =============================================
export function useLancamentoLoteIPTU() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: lotes = [], isLoading } = useQuery({
    queryKey: ["lotes_lancamento_iptu", secretariaAtiva?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes_lancamento_iptu")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const gerarLancamentoEmLote = useMutation({
    mutationFn: async ({ exercicio, configId }: { exercicio: number; configId: string }) => {
      // Buscar configuração
      const { data: config } = await supabase
        .from("config_lancamento_iptu")
        .select("*")
        .eq("id", configId)
        .single();
      
      if (!config) throw new Error("Configuração não encontrada");

      // Buscar imóveis ativos
      const { data: imoveis } = await supabase
        .from("imoveis")
        .select("*")
        .eq("status", "ativo")
        .eq("isento", false)
        .eq("imune", false);

      if (!imoveis || imoveis.length === 0) {
        throw new Error("Nenhum imóvel encontrado para lançamento");
      }

      // Criar lote
      const { data: lote, error: loteError } = await supabase
        .from("lotes_lancamento_iptu")
        .insert({
          exercicio,
          numero_lote: Date.now(),
          total_imoveis: imoveis.length,
          secretaria_id: secretariaAtiva?.id,
        })
        .select()
        .single();
      
      if (loteError) throw loteError;

      let totalLancado = 0;
      const erros: any[] = [];

      // Processar cada imóvel
      for (const imovel of imoveis) {
        try {
          // Determinar alíquota
          let aliquota = config.aliquota_residencial;
          if (imovel.tipo_uso === "comercial") aliquota = config.aliquota_comercial;
          if (imovel.tipo_uso === "industrial") aliquota = config.aliquota_industrial;
          if (imovel.tipo_uso === "territorial") aliquota = config.aliquota_territorial;

          const valorVenal = imovel.valor_venal_total || 0;
          const valorIPTU = valorVenal * (aliquota || 0.01);
          const valorTotal = valorIPTU + (config.taxa_expediente || 0) + 
                            (config.taxa_limpeza_publica || 0) + (config.taxa_iluminacao || 0);

          // Criar lançamento
          const { data: lancamento, error: lancError } = await supabase
            .from("iptu_lancamentos")
            .insert({
              imovel_id: imovel.id,
              contribuinte_id: imovel.contribuinte_id,
              exercicio,
              valor_venal: valorVenal,
              aliquota,
              valor_iptu: valorIPTU,
              valor_total: valorTotal,
              numero_parcelas: config.numero_parcelas,
              valor_cota_unica: valorTotal * (1 - (config.desconto_cota_unica || 10) / 100),
              lote_lancamento_id: lote.id,
              taxa_expediente: config.taxa_expediente || 0,
              taxa_limpeza: config.taxa_limpeza_publica || 0,
              taxa_iluminacao: config.taxa_iluminacao || 0,
            })
            .select()
            .single();

          if (lancError) {
            erros.push({ imovel_id: imovel.id, erro: lancError.message });
            continue;
          }

          // Criar parcelas
          const parcelas = [];
          const valorParcela = valorTotal / config.numero_parcelas;
          
          for (let i = 1; i <= config.numero_parcelas; i++) {
            const vencimento = new Date(
              exercicio,
              (config.primeira_parcela_mes || 2) + i - 2,
              config.dia_vencimento_parcelas || 10
            );
            parcelas.push({
              lancamento_id: lancamento.id,
              numero_parcela: i,
              valor: valorParcela,
              data_vencimento: vencimento.toISOString().split("T")[0],
            });
          }

          await supabase.from("iptu_parcelas").insert(parcelas);

          // Registrar histórico de valor venal
          await supabase.from("historico_valores_venais").upsert({
            imovel_id: imovel.id,
            exercicio,
            valor_venal_terreno: imovel.valor_venal_terreno,
            valor_venal_construcao: imovel.valor_venal_construcao,
            valor_venal_total: valorVenal,
            area_terreno: imovel.area_terreno,
            area_construida: imovel.area_construida,
            aliquota,
            fonte_calculo: "automatico",
          });

          totalLancado += valorTotal;
        } catch (err: any) {
          erros.push({ imovel_id: imovel.id, erro: err.message });
        }
      }

      // Atualizar lote com totais
      await supabase
        .from("lotes_lancamento_iptu")
        .update({
          total_lancado: totalLancado,
          status: erros.length === 0 ? "finalizado" : "finalizado_com_erros",
          erros: erros.length > 0 ? erros : null,
        })
        .eq("id", lote.id);

      return { lote, totalLancado, erros };
    },
    onSuccess: ({ totalLancado, erros }) => {
      queryClient.invalidateQueries({ queryKey: ["lotes_lancamento_iptu"] });
      queryClient.invalidateQueries({ queryKey: ["iptu_lancamentos"] });
      toast({ 
        title: "Lançamento em lote concluído", 
        description: `Total lançado: R$ ${totalLancado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. ${erros.length} erros.`
      });
    },
    onError: (error: any) => {
      toast({ title: "Erro no lançamento em lote", description: error.message, variant: "destructive" });
    },
  });

  return { lotes, isLoading, gerarLancamentoEmLote };
}

// =============================================
// CARNÊS DE IPTU
// =============================================
export function useCarnesIPTU() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: carnes = [], isLoading } = useQuery({
    queryKey: ["carnes_iptu"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carnes_iptu")
        .select("*, iptu_lancamentos(exercicio, imoveis(inscricao_imobiliaria))")
        .order("data_geracao", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const gerarCarne = useMutation({
    mutationFn: async (lancamentoId: string) => {
      const numeroCarne = `CARNE-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;
      
      // Gerar código de barras e PIX simulados
      const codigoBarras = `23793.${Math.random().toString().slice(2, 7)} ${Math.random().toString().slice(2, 7)}.${Math.random().toString().slice(2, 7)} ${Math.random().toString().slice(2, 7)}.${Math.random().toString().slice(2, 7)} ${Math.random().toString().slice(2, 2)}`;
      const qrcodePix = `00020126580014br.gov.bcb.pix0136${lancamentoId}5204000053039865802BR5913PREFEITURA6008CIDADE`;
      
      const { error } = await supabase.from("carnes_iptu").insert({
        lancamento_id: lancamentoId,
        numero_carne: numeroCarne,
        codigo_barras: codigoBarras,
        linha_digitavel: codigoBarras.replace(/\./g, "").replace(/ /g, ""),
        qrcode_pix: qrcodePix,
      });
      if (error) throw error;
      
      return numeroCarne;
    },
    onSuccess: (numeroCarne) => {
      queryClient.invalidateQueries({ queryKey: ["carnes_iptu"] });
      toast({ title: "Carnê gerado", description: `Número: ${numeroCarne}` });
    },
  });

  return { carnes, isLoading, gerarCarne };
}

// =============================================
// BAIXAS MANUAIS
// =============================================
export function useBaixasManuaisIPTU() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: baixas = [], isLoading } = useQuery({
    queryKey: ["baixas_manuais_iptu"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("baixas_manuais_iptu")
        .select("*, iptu_parcelas(numero_parcela), iptu_lancamentos(exercicio)")
        .order("data_baixa", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const registrarBaixaManual = useMutation({
    mutationFn: async (data: any) => {
      // Registrar baixa
      const { error: baixaError } = await supabase.from("baixas_manuais_iptu").insert(data);
      if (baixaError) throw baixaError;

      // Atualizar parcela como pago (baixa manual)
      const { error: parcelaError } = await supabase
        .from("iptu_parcelas")
        .update({
          status: "pago",
          valor_pago: data.valor_baixado,
          data_pagamento: data.data_baixa,
        })
        .eq("id", data.parcela_id);
      if (parcelaError) throw parcelaError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["baixas_manuais_iptu"] });
      queryClient.invalidateQueries({ queryKey: ["iptu_lancamentos"] });
      toast({ title: "Baixa manual registrada" });
    },
    onError: (error: any) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    },
  });

  return { baixas, isLoading, registrarBaixaManual };
}

// =============================================
// PORTAL DO CIDADÃO - CONSULTAS
// =============================================
export function usePortalCidadaoIPTU() {
  const { toast } = useToast();

  const consultarDebitos = async (cpfCnpj: string, inscricao?: string) => {
    try {
      // Buscar contribuinte
      const { data: contribuinte } = await supabase
        .from("contribuintes")
        .select("id, nome_razao_social")
        .eq("cpf_cnpj", cpfCnpj.replace(/\D/g, ""))
        .single();

      if (!contribuinte) {
        throw new Error("Contribuinte não encontrado");
      }

      // Buscar lançamentos
      let query = supabase
        .from("iptu_lancamentos")
        .select("*, imoveis(inscricao_imobiliaria, logradouro, numero, bairro), iptu_parcelas(*)")
        .eq("contribuinte_id", contribuinte.id);
      
      if (inscricao) {
        query = query.eq("imoveis.inscricao_imobiliaria", inscricao);
      }

      const { data: lancamentos, error } = await query;
      if (error) throw error;

      // Registrar consulta
      await supabase.from("consultas_cidadao").insert({
        tipo: "debitos",
        cpf_cnpj: cpfCnpj,
        inscricao_imobiliaria: inscricao,
        resultado: { total_lancamentos: lancamentos?.length || 0 },
      });

      return { contribuinte, lancamentos };
    } catch (error: any) {
      toast({ title: "Erro na consulta", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const gerarSegundaVia = async (parcelaId: string) => {
    const { data: parcela, error } = await supabase
      .from("iptu_parcelas")
      .select("*, iptu_lancamentos(*, imoveis(*), contribuintes(*))")
      .eq("id", parcelaId)
      .single();

    if (error) throw error;

    // Registrar consulta
    await supabase.from("consultas_cidadao").insert({
      tipo: "segunda_via",
      cpf_cnpj: parcela.iptu_lancamentos?.contribuintes?.cpf_cnpj || "",
      inscricao_imobiliaria: parcela.iptu_lancamentos?.imoveis?.inscricao_imobiliaria,
    });

    return parcela;
  };

  return { consultarDebitos, gerarSegundaVia };
}

// =============================================
// RELATÓRIOS IPTU
// =============================================
export function useRelatoriosIPTU() {
  const { secretariaAtiva } = useSecretariaContext();

  const getArrecadacaoPorBairro = async (exercicio: number) => {
    // Buscar lançamentos agrupados por bairro
    const { data: lancamentos } = await supabase
      .from("iptu_lancamentos")
      .select("valor_total, imoveis(bairro)")
      .eq("exercicio", exercicio);

    const porBairro: Record<string, number> = {};
    lancamentos?.forEach((l: any) => {
      const bairro = l.imoveis?.bairro || "Não informado";
      porBairro[bairro] = (porBairro[bairro] || 0) + (l.valor_total || 0);
    });

    return Object.entries(porBairro).map(([bairro, valor]) => ({ bairro, valor }));
  };

  const getInadimplenciaPorPeriodo = async (dataInicio: string, dataFim: string) => {
    const { data, error } = await supabase
      .from("iptu_parcelas")
      .select("*, iptu_lancamentos(exercicio, imoveis(inscricao_imobiliaria, bairro), contribuintes(nome_razao_social))")
      .eq("status", "vencido")
      .gte("data_vencimento", dataInicio)
      .lte("data_vencimento", dataFim);
    
    if (error) throw error;
    return data;
  };

  const getEvolucaoHistorica = async () => {
    const { data, error } = await supabase
      .from("iptu_lancamentos")
      .select("exercicio, valor_total, status")
      .order("exercicio");
    
    if (error) throw error;

    // Agrupar por exercício
    const porExercicio: Record<number, { lancado: number; arrecadado: number }> = {};
    data?.forEach((l: any) => {
      if (!porExercicio[l.exercicio]) {
        porExercicio[l.exercicio] = { lancado: 0, arrecadado: 0 };
      }
      porExercicio[l.exercicio].lancado += l.valor_total || 0;
      if (l.status === "pago") {
        porExercicio[l.exercicio].arrecadado += l.valor_total || 0;
      }
    });

    return Object.entries(porExercicio).map(([exercicio, valores]) => ({
      exercicio: parseInt(exercicio),
      ...valores,
    }));
  };

  const getRelatorioTCE = async (exercicio: number) => {
    // Dados consolidados para TCE
    const { data: lancamentos } = await supabase
      .from("iptu_lancamentos")
      .select("*, imoveis(*), contribuintes(*)")
      .eq("exercicio", exercicio);

    const { data: parcelas } = await supabase
      .from("iptu_parcelas")
      .select("*, iptu_lancamentos!inner(exercicio)")
      .eq("iptu_lancamentos.exercicio", exercicio);

    const totalLancado = lancamentos?.reduce((sum, l) => sum + (l.valor_total || 0), 0) || 0;
    const totalArrecadado = parcelas?.filter(p => p.status === "pago").reduce((sum, p) => sum + (p.valor_pago || 0), 0) || 0;
    const totalEmAberto = parcelas?.filter(p => ["em_aberto", "vencido"].includes(p.status)).reduce((sum, p) => sum + (p.valor || 0), 0) || 0;

    return {
      exercicio,
      totalImoveis: lancamentos?.length || 0,
      totalLancado,
      totalArrecadado,
      totalEmAberto,
      percentualArrecadacao: totalLancado > 0 ? (totalArrecadado / totalLancado * 100).toFixed(2) : 0,
    };
  };

  return { getArrecadacaoPorBairro, getInadimplenciaPorPeriodo, getEvolucaoHistorica, getRelatorioTCE };
}

// =============================================
// CONFIGURAÇÃO DE INADIMPLÊNCIA
// =============================================
export function useConfigInadimplencia() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery({
    queryKey: ["config_inadimplencia", secretariaAtiva?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("config_inadimplencia")
        .select("*")
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const saveConfig = useMutation({
    mutationFn: async (data: any) => {
      if (config?.id) {
        const { error } = await supabase
          .from("config_inadimplencia")
          .update(data)
          .eq("id", config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("config_inadimplencia").insert({
          ...data,
          secretaria_id: secretariaAtiva?.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config_inadimplencia"] });
      toast({ title: "Configuração salva" });
    },
  });

  return { config, isLoading, saveConfig };
}

// =============================================
// PADRÕES CONSTRUTIVOS
// =============================================
export function usePadroesConstrutivos() {
  const { secretariaAtiva } = useSecretariaContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: padroes = [], isLoading } = useQuery({
    queryKey: ["padroes_construtivos", secretariaAtiva?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("padroes_construtivos")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data || [];
    },
  });

  const createPadrao = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("padroes_construtivos").insert({
        ...data,
        secretaria_id: secretariaAtiva?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["padroes_construtivos"] });
      toast({ title: "Padrão construtivo cadastrado" });
    },
  });

  return { padroes, isLoading, createPadrao };
}
