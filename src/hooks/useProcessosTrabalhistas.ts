import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProcessoTrabalhista {
  id: string;
  servidor_id: string | null;
  nome_reclamante: string;
  cpf_reclamante: string | null;
  numero_processo: string;
  vara: string | null;
  comarca: string | null;
  tribunal: string | null;
  valor_causa: number | null;
  valor_condenacao: number | null;
  valor_acordo: number | null;
  valor_provisionado: number;
  status: string;
  fase: string;
  data_distribuicao: string | null;
  data_citacao: string | null;
  data_sentenca: string | null;
  data_transito_julgado: string | null;
  advogado_responsavel: string | null;
  oab_advogado: string | null;
  secretaria_id: string | null;
  observacoes: string | null;
  servidor?: {
    name: string;
  };
}

export interface Audiencia {
  id: string;
  processo_id: string;
  data_hora: string;
  tipo: string;
  local: string | null;
  realizada: boolean;
  resultado: string | null;
  houve_acordo: boolean;
  valor_acordo: number | null;
  proxima_audiencia: string | null;
  prazo: string | null;
  observacoes: string | null;
}

export interface Movimentacao {
  id: string;
  processo_id: string;
  data: string;
  descricao: string;
  documento_url: string | null;
  tem_prazo: boolean;
  data_prazo: string | null;
  prazo_cumprido: boolean | null;
}

export interface Provisionamento {
  id: string;
  processo_id: string;
  data: string;
  valor: number;
  tipo: string;
  motivo: string;
  exercicio_id: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  arquivado: "Arquivado",
  transitado_julgado: "Transitado em Julgado",
  acordo: "Acordo",
  extinto: "Extinto",
};

const FASE_LABELS: Record<string, string> = {
  inicial: "Inicial",
  instrucao: "Instrução",
  julgamento: "Julgamento",
  recursos: "Recursos",
  execucao: "Execução",
  encerrado: "Encerrado",
};

export function useProcessosTrabalhistas() {
  const queryClient = useQueryClient();

  const { data: processos, isLoading } = useQuery({
    queryKey: ["processos_trabalhistas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos_trabalhistas")
        .select(`*, servidor:profiles(name)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ProcessoTrabalhista[];
    },
  });

  const criarProcesso = useMutation({
    mutationFn: async (processo: {
      nome_reclamante: string;
      numero_processo: string;
      servidor_id?: string;
      cpf_reclamante?: string;
      vara?: string;
      comarca?: string;
      tribunal?: string;
      valor_causa?: number;
      advogado_responsavel?: string;
      oab_advogado?: string;
      secretaria_id?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from("processos_trabalhistas")
        .insert(processo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos_trabalhistas"] });
      toast.success("Processo cadastrado!");
    },
  });

  const atualizarProcesso = useMutation({
    mutationFn: async ({ id, status, fase, ...data }: { 
      id: string;
      status?: "ativo" | "suspenso" | "arquivado" | "transitado_julgado" | "acordo" | "extinto";
      fase?: "inicial" | "instrucao" | "julgamento" | "recursos" | "execucao" | "encerrado";
      valor_condenacao?: number;
      valor_acordo?: number;
      data_sentenca?: string;
      data_transito_julgado?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from("processos_trabalhistas")
        .update({ status, fase, ...data })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos_trabalhistas"] });
      toast.success("Processo atualizado!");
    },
  });

  return { 
    processos, 
    isLoading, 
    criarProcesso, 
    atualizarProcesso,
    STATUS_LABELS,
    FASE_LABELS,
  };
}

export function useAudiencias(processoId: string | null) {
  const queryClient = useQueryClient();

  const { data: audiencias, isLoading } = useQuery({
    queryKey: ["processos_audiencias", processoId],
    queryFn: async () => {
      if (!processoId) return [];
      const { data, error } = await supabase
        .from("processos_audiencias")
        .select("*")
        .eq("processo_id", processoId)
        .order("data_hora", { ascending: false });
      if (error) throw error;
      return data as Audiencia[];
    },
    enabled: !!processoId,
  });

  const criarAudiencia = useMutation({
    mutationFn: async (audiencia: {
      processo_id: string;
      data_hora: string;
      tipo: string;
      local?: string;
      observacoes?: string;
    }) => {
      const { error } = await supabase
        .from("processos_audiencias")
        .insert(audiencia);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos_audiencias"] });
      toast.success("Audiência registrada!");
    },
  });

  return { audiencias, isLoading, criarAudiencia };
}

export function useMovimentacoes(processoId: string | null) {
  const queryClient = useQueryClient();

  const { data: movimentacoes, isLoading } = useQuery({
    queryKey: ["processos_movimentacoes", processoId],
    queryFn: async () => {
      if (!processoId) return [];
      const { data, error } = await supabase
        .from("processos_movimentacoes")
        .select("*")
        .eq("processo_id", processoId)
        .order("data", { ascending: false });
      if (error) throw error;
      return data as Movimentacao[];
    },
    enabled: !!processoId,
  });

  const criarMovimentacao = useMutation({
    mutationFn: async (movimentacao: {
      processo_id: string;
      data: string;
      descricao: string;
      documento_url?: string;
      tem_prazo?: boolean;
      data_prazo?: string;
    }) => {
      const { error } = await supabase
        .from("processos_movimentacoes")
        .insert(movimentacao);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos_movimentacoes"] });
      toast.success("Movimentação registrada!");
    },
  });

  return { movimentacoes, isLoading, criarMovimentacao };
}

export function useProvisionamentos(processoId: string | null) {
  const queryClient = useQueryClient();

  const { data: provisionamentos, isLoading } = useQuery({
    queryKey: ["processos_provisionamentos", processoId],
    queryFn: async () => {
      if (!processoId) return [];
      const { data, error } = await supabase
        .from("processos_provisionamentos")
        .select("*")
        .eq("processo_id", processoId)
        .order("data", { ascending: false });
      if (error) throw error;
      return data as Provisionamento[];
    },
    enabled: !!processoId,
  });

  const criarProvisionamento = useMutation({
    mutationFn: async (provisionamento: {
      processo_id: string;
      data: string;
      valor: number;
      tipo: string;
      motivo: string;
      exercicio_id?: string;
    }) => {
      const { error } = await supabase
        .from("processos_provisionamentos")
        .insert(provisionamento);
      if (error) throw error;

      // Atualizar valor provisionado no processo
      const { data: total } = await supabase
        .from("processos_provisionamentos")
        .select("valor, tipo")
        .eq("processo_id", provisionamento.processo_id);

      const valorTotal = total?.reduce((acc, p) => {
        if (p.tipo === "baixa" || p.tipo === "reducao") {
          return acc - p.valor;
        }
        return acc + p.valor;
      }, 0) || 0;

      await supabase
        .from("processos_trabalhistas")
        .update({ valor_provisionado: valorTotal })
        .eq("id", provisionamento.processo_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos_provisionamentos"] });
      queryClient.invalidateQueries({ queryKey: ["processos_trabalhistas"] });
      toast.success("Provisionamento registrado!");
    },
  });

  return { provisionamentos, isLoading, criarProvisionamento };
}
