import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function useControladoria() {
  const queryClient = useQueryClient();
  const { secretariaAtiva, municipio } = useSecretariaContext();

  // Processos Administrativos
  const { data: processos = [], isLoading: loadingProcessos } = useQuery({
    queryKey: ["processos_administrativos", municipio?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("processos_administrativos" as any)
        .select("*, secretarias:secretaria_origem_id(nome)")
        .order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return data || [];
    },
  });

  const createProcesso = useMutation({
    mutationFn: async (data: any) => {
      const { data: count } = await (supabase
        .from("processos_administrativos" as any)
        .select("id", { count: "exact" }) as any);
      
      const sequencial = (count?.length || 0) + 1;
      const numero = `PAD-${new Date().getFullYear()}-${String(sequencial).padStart(5, "0")}`;
      
      const { data: result, error } = await (supabase
        .from("processos_administrativos" as any)
        .insert({
          ...data,
          numero_processo: numero,
          municipio_id: municipio?.id,
        })
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos_administrativos"] });
      toast.success("Processo cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar processo:", error);
      toast.error("Erro ao cadastrar processo");
    },
  });

  // Movimentações do Processo
  const createMovimentacao = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await (supabase
        .from("movimentacoes_processo" as any)
        .insert(data)
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos_administrativos"] });
      toast.success("Movimentação registrada!");
    },
  });

  // Análises Jurídicas de Contratos
  const { data: analisesContratos = [], isLoading: loadingAnalises } = useQuery({
    queryKey: ["analises_juridicas_contratos", municipio?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("analises_juridicas_contratos" as any)
        .select("*, secretarias:secretaria_solicitante_id(nome), contracts(numero_contrato)")
        .order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return data || [];
    },
  });

  const createAnaliseContrato = useMutation({
    mutationFn: async (data: any) => {
      const { data: count } = await (supabase
        .from("analises_juridicas_contratos" as any)
        .select("id", { count: "exact" }) as any);
      
      const sequencial = (count?.length || 0) + 1;
      const numero = `PAR-${new Date().getFullYear()}-${String(sequencial).padStart(5, "0")}`;
      
      const { data: result, error } = await (supabase
        .from("analises_juridicas_contratos" as any)
        .insert({
          ...data,
          numero_parecer: numero,
          municipio_id: municipio?.id,
        })
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analises_juridicas_contratos"] });
      toast.success("Análise jurídica registrada!");
    },
    onError: (error) => {
      console.error("Erro ao registrar análise:", error);
      toast.error("Erro ao registrar análise jurídica");
    },
  });

  // Alertas de Vigência
  const { data: alertasVigencia = [] } = useQuery({
    queryKey: ["alertas_vigencia_contratos"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("alertas_vigencia_contratos" as any)
        .select("*, contracts(numero_contrato, objeto)")
        .eq("status", "pendente")
        .order("data_referencia") as any);
      if (error) throw error;
      return data || [];
    },
  });

  // Consultas Jurídicas
  const { data: consultas = [], isLoading: loadingConsultas } = useQuery({
    queryKey: ["consultas_juridicas", municipio?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("consultas_juridicas" as any)
        .select("*, secretarias:secretaria_solicitante_id(nome)")
        .order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return data || [];
    },
  });

  const createConsulta = useMutation({
    mutationFn: async (data: any) => {
      const { data: count } = await (supabase
        .from("consultas_juridicas" as any)
        .select("id", { count: "exact" }) as any);
      
      const sequencial = (count?.length || 0) + 1;
      const numero = `CJ-${new Date().getFullYear()}-${String(sequencial).padStart(5, "0")}`;
      
      const { data: result, error } = await (supabase
        .from("consultas_juridicas" as any)
        .insert({
          ...data,
          numero_consulta: numero,
          municipio_id: municipio?.id,
          secretaria_solicitante_id: secretariaAtiva?.id,
        })
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultas_juridicas"] });
      toast.success("Consulta registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar consulta:", error);
      toast.error("Erro ao registrar consulta");
    },
  });

  // Pareceres Jurídicos
  const { data: pareceres = [], isLoading: loadingPareceres } = useQuery({
    queryKey: ["pareceres_juridicos", municipio?.id],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("pareceres_juridicos" as any)
        .select("*, consultas_juridicas(numero_consulta, assunto)")
        .order("created_at", { ascending: false }) as any);
      if (error) throw error;
      return data || [];
    },
  });

  const createParecer = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await (supabase
        .from("pareceres_juridicos" as any)
        .insert({
          ...data,
          municipio_id: municipio?.id,
        })
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pareceres_juridicos"] });
      queryClient.invalidateQueries({ queryKey: ["consultas_juridicas"] });
      toast.success("Parecer emitido com sucesso!");
    },
  });

  // Modelos de Parecer
  const { data: modelosParecer = [] } = useQuery({
    queryKey: ["modelos_parecer"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("modelos_parecer" as any)
        .select("*")
        .eq("ativo", true)
        .order("titulo") as any);
      if (error) throw error;
      return data || [];
    },
  });

  return {
    processos,
    loadingProcessos,
    createProcesso,
    createMovimentacao,
    analisesContratos,
    loadingAnalises,
    createAnaliseContrato,
    alertasVigencia,
    consultas,
    loadingConsultas,
    createConsulta,
    pareceres,
    loadingPareceres,
    createParecer,
    modelosParecer,
  };
}
