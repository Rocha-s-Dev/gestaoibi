import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExercicioFinanceiro {
  id: string;
  municipio_id: string;
  ano: number;
  data_inicio: string;
  data_fim: string;
  status: "aberto" | "bloqueado" | "encerrado";
  loa_aprovada: boolean;
  valor_orcamento: number | null;
  observacoes: string | null;
  encerrado_por: string | null;
  encerrado_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface PeriodoFiscal {
  id: string;
  exercicio_id: string;
  tipo: "bimestre" | "trimestre" | "quadrimestre" | "semestre";
  numero: number;
  data_inicio: string;
  data_fim: string;
  status: "aberto" | "bloqueado" | "encerrado";
  bloqueado_por: string | null;
  bloqueado_em: string | null;
  created_at: string;
}

type ExercicioInsert = {
  municipio_id: string;
  ano: number;
  data_inicio: string;
  data_fim: string;
  loa_aprovada?: boolean;
  valor_orcamento?: number;
  observacoes?: string;
};

type ExercicioUpdate = Partial<ExercicioInsert> & { id: string };

export function useExerciciosFinanceiros(municipioId?: string) {
  const queryClient = useQueryClient();

  const { data: exercicios = [], isLoading, error } = useQuery({
    queryKey: ["exercicios-financeiros", municipioId],
    queryFn: async () => {
      let query = supabase
        .from("exercicios_financeiros")
        .select("*")
        .order("ano", { ascending: false });

      if (municipioId) {
        query = query.eq("municipio_id", municipioId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExercicioFinanceiro[];
    },
  });

  const { data: exercicioAtual } = useQuery({
    queryKey: ["exercicio-atual", municipioId],
    queryFn: async () => {
      const anoAtual = new Date().getFullYear();
      
      let query = supabase
        .from("exercicios_financeiros")
        .select("*")
        .eq("ano", anoAtual)
        .eq("status", "aberto")
        .limit(1)
        .single();

      if (municipioId) {
        query = supabase
          .from("exercicios_financeiros")
          .select("*")
          .eq("municipio_id", municipioId)
          .eq("ano", anoAtual)
          .eq("status", "aberto")
          .limit(1)
          .single();
      }

      const { data, error } = await query;
      if (error && error.code !== "PGRST116") throw error;
      return data as ExercicioFinanceiro | null;
    },
  });

  const createExercicio = useMutation({
    mutationFn: async (data: ExercicioInsert) => {
      const { data: result, error } = await supabase
        .from("exercicios_financeiros")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercicios-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["exercicio-atual"] });
      toast.success("Exercício financeiro criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar exercício:", error);
      toast.error("Erro ao criar exercício financeiro");
    },
  });

  const updateExercicio = useMutation({
    mutationFn: async ({ id, ...data }: ExercicioUpdate) => {
      const { data: result, error } = await supabase
        .from("exercicios_financeiros")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercicios-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["exercicio-atual"] });
      toast.success("Exercício financeiro atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar exercício:", error);
      toast.error("Erro ao atualizar exercício financeiro");
    },
  });

  const encerrarExercicio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exercicios_financeiros")
        .update({
          status: "encerrado" as const,
          encerrado_em: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercicios-financeiros"] });
      queryClient.invalidateQueries({ queryKey: ["exercicio-atual"] });
      toast.success("Exercício financeiro encerrado!");
    },
    onError: (error) => {
      console.error("Erro ao encerrar exercício:", error);
      toast.error("Erro ao encerrar exercício financeiro");
    },
  });

  return {
    exercicios,
    exercicioAtual,
    isLoading,
    error,
    createExercicio,
    updateExercicio,
    encerrarExercicio,
  };
}

export function usePeriodosFiscais(exercicioId?: string) {
  const queryClient = useQueryClient();

  const { data: periodos = [], isLoading } = useQuery({
    queryKey: ["periodos-fiscais", exercicioId],
    queryFn: async () => {
      if (!exercicioId) return [];
      
      const { data, error } = await supabase
        .from("periodos_fiscais")
        .select("*")
        .eq("exercicio_id", exercicioId)
        .order("numero", { ascending: true });

      if (error) throw error;
      return data as PeriodoFiscal[];
    },
    enabled: !!exercicioId,
  });

  const bloquearPeriodo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("periodos_fiscais")
        .update({
          status: "bloqueado" as const,
          bloqueado_em: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["periodos-fiscais"] });
      toast.success("Período bloqueado!");
    },
  });

  return {
    periodos,
    isLoading,
    bloquearPeriodo,
  };
}
