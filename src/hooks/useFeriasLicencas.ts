import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PeriodoAquisitivo {
  id: string;
  servidor_id: string;
  inicio: string;
  fim: string;
  dias_direito: number;
  dias_usufruidos: number;
  dias_vendidos: number;
  dias_saldo: number;
  vencido: boolean;
  data_vencimento: string | null;
  servidor?: {
    name: string;
  };
}

export interface SolicitacaoFerias {
  id: string;
  servidor_id: string;
  periodo_aquisitivo_id: string | null;
  data_inicio: string;
  data_fim: string;
  dias_solicitados: number;
  abono_pecuniario: boolean;
  dias_abono: number;
  antecipacao_13: boolean;
  valor_ferias: number | null;
  valor_terco_constitucional: number | null;
  valor_total: number | null;
  status: string;
  aprovado_chefia_por: string | null;
  data_aprovacao_chefia: string | null;
  aprovado_rh_por: string | null;
  data_aprovacao_rh: string | null;
  motivo_rejeicao: string | null;
  observacoes: string | null;
  servidor?: {
    name: string;
  };
  periodo_aquisitivo?: PeriodoAquisitivo;
}

export interface Licenca {
  id: string;
  servidor_id: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  dias_totais: number;
  cid: string | null;
  documento_url: string | null;
  atestado_pericia: boolean;
  remunerada: boolean;
  percentual_remuneracao: number;
  status: string;
  aprovado_por: string | null;
  data_aprovacao: string | null;
  motivo_rejeicao: string | null;
  observacoes: string | null;
  servidor?: {
    name: string;
  };
}

const TIPO_LICENCA_LABELS: Record<string, string> = {
  saude: "Saúde",
  maternidade: "Maternidade",
  paternidade: "Paternidade",
  casamento: "Casamento (Gala)",
  luto: "Luto (Nojo)",
  capacitacao: "Capacitação",
  interesse_particular: "Interesse Particular",
  premio: "Prêmio",
  outros: "Outros",
};

export function usePeriodosAquisitivos(servidorId?: string) {
  const queryClient = useQueryClient();

  const { data: periodos, isLoading } = useQuery({
    queryKey: ["ferias_periodos_aquisitivos", servidorId],
    queryFn: async () => {
      let query = supabase
        .from("ferias_periodos_aquisitivos")
        .select(`*, servidor:profiles(name)`)
        .order("inicio", { ascending: false });
      
      if (servidorId) {
        query = query.eq("servidor_id", servidorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PeriodoAquisitivo[];
    },
  });

  const criarPeriodo = useMutation({
    mutationFn: async (periodo: Omit<PeriodoAquisitivo, "id" | "dias_saldo" | "servidor">) => {
      const { error } = await supabase
        .from("ferias_periodos_aquisitivos")
        .insert(periodo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferias_periodos_aquisitivos"] });
      toast.success("Período aquisitivo criado!");
    },
  });

  return { periodos, isLoading, criarPeriodo };
}

export function useSolicitacoesFerias(servidorId?: string) {
  const queryClient = useQueryClient();

  const { data: solicitacoes, isLoading } = useQuery({
    queryKey: ["ferias_solicitacoes", servidorId],
    queryFn: async () => {
      let query = supabase
        .from("ferias_solicitacoes")
        .select(`
          *,
          servidor:profiles(name),
          periodo_aquisitivo:ferias_periodos_aquisitivos(*)
        `)
        .order("created_at", { ascending: false });
      
      if (servidorId) {
        query = query.eq("servidor_id", servidorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SolicitacaoFerias[];
    },
  });

  const criarSolicitacao = useMutation({
    mutationFn: async (solicitacao: {
      servidor_id: string;
      data_inicio: string;
      data_fim: string;
      dias_solicitados: number;
      periodo_aquisitivo_id?: string;
      abono_pecuniario?: boolean;
      dias_abono?: number;
      antecipacao_13?: boolean;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from("ferias_solicitacoes")
        .insert(solicitacao);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferias_solicitacoes"] });
      toast.success("Solicitação de férias enviada!");
    },
  });

  const aprovarFerias = useMutation({
    mutationFn: async ({ id, etapa, aprovado, motivo }: { 
      id: string; 
      etapa: "chefia" | "rh"; 
      aprovado: boolean; 
      motivo?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const update: Record<string, unknown> = {};
      
      if (etapa === "chefia") {
        update.status = aprovado ? "aprovada_chefia" : "rejeitada";
        update.aprovado_chefia_por = user?.id;
        update.data_aprovacao_chefia = new Date().toISOString();
      } else {
        update.status = aprovado ? "aprovada_rh" : "rejeitada";
        update.aprovado_rh_por = user?.id;
        update.data_aprovacao_rh = new Date().toISOString();
      }
      
      if (!aprovado && motivo) {
        update.motivo_rejeicao = motivo;
      }

      const { error } = await supabase
        .from("ferias_solicitacoes")
        .update(update)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferias_solicitacoes"] });
      toast.success("Solicitação processada!");
    },
  });

  return { solicitacoes, isLoading, criarSolicitacao, aprovarFerias };
}

export function useLicencas(servidorId?: string) {
  const queryClient = useQueryClient();

  const { data: licencas, isLoading } = useQuery({
    queryKey: ["licencas", servidorId],
    queryFn: async () => {
      let query = supabase
        .from("licencas")
        .select(`*, servidor:profiles(name)`)
        .order("created_at", { ascending: false });
      
      if (servidorId) {
        query = query.eq("servidor_id", servidorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Licenca[];
    },
  });

  const criarLicenca = useMutation({
    mutationFn: async (licenca: {
      servidor_id: string;
      tipo: "saude" | "maternidade" | "paternidade" | "casamento" | "luto" | "capacitacao" | "interesse_particular" | "premio" | "outros";
      data_inicio: string;
      data_fim: string;
      dias_totais: number;
      cid?: string;
      documento_url?: string;
      remunerada?: boolean;
      percentual_remuneracao?: number;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from("licencas")
        .insert(licenca);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licencas"] });
      toast.success("Licença registrada!");
    },
  });

  const aprovarLicenca = useMutation({
    mutationFn: async ({ id, aprovado, motivo }: { 
      id: string; 
      aprovado: boolean; 
      motivo?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("licencas")
        .update({
          status: aprovado ? "aprovada_rh" : "rejeitada",
          aprovado_por: user?.id,
          data_aprovacao: new Date().toISOString(),
          motivo_rejeicao: !aprovado ? motivo : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licencas"] });
      toast.success("Licença processada!");
    },
  });

  return { licencas, isLoading, criarLicenca, aprovarLicenca, TIPO_LICENCA_LABELS };
}
