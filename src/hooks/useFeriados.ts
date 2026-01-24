import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Feriado {
  id: string;
  municipio_id: string | null;
  nome: string;
  data: string;
  tipo: "nacional" | "estadual" | "municipal" | "ponto_facultativo";
  recorrente: boolean;
  uf: string | null;
  observacoes: string | null;
  ativo: boolean;
  created_at: string;
}

type FeriadoInsert = {
  municipio_id?: string;
  nome: string;
  data: string;
  tipo: "nacional" | "estadual" | "municipal" | "ponto_facultativo";
  recorrente?: boolean;
  uf?: string;
  observacoes?: string;
};

type FeriadoUpdate = Partial<FeriadoInsert> & { id: string };

export function useFeriados(municipioId?: string, ano?: number) {
  const queryClient = useQueryClient();

  const { data: feriados = [], isLoading, error } = useQuery({
    queryKey: ["feriados", municipioId, ano],
    queryFn: async () => {
      let query = supabase
        .from("feriados")
        .select("*")
        .eq("ativo", true)
        .order("data", { ascending: true });

      // Filter by municipio or national
      if (municipioId) {
        query = query.or(`municipio_id.eq.${municipioId},municipio_id.is.null`);
      }

      // Filter by year if provided
      if (ano) {
        const startDate = `${ano}-01-01`;
        const endDate = `${ano}-12-31`;
        query = query.gte("data", startDate).lte("data", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Feriado[];
    },
  });

  const createFeriado = useMutation({
    mutationFn: async (data: FeriadoInsert) => {
      const { data: result, error } = await supabase
        .from("feriados")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast.success("Feriado cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar feriado:", error);
      toast.error("Erro ao cadastrar feriado");
    },
  });

  const updateFeriado = useMutation({
    mutationFn: async ({ id, ...data }: FeriadoUpdate) => {
      const { data: result, error } = await supabase
        .from("feriados")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast.success("Feriado atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar feriado:", error);
      toast.error("Erro ao atualizar feriado");
    },
  });

  const deleteFeriado = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("feriados")
        .update({ ativo: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feriados"] });
      toast.success("Feriado removido!");
    },
    onError: (error) => {
      console.error("Erro ao remover feriado:", error);
      toast.error("Erro ao remover feriado");
    },
  });

  // Helper to check if a date is a holiday
  const isFeriado = (date: Date): Feriado | undefined => {
    const dateStr = date.toISOString().split("T")[0];
    return feriados.find((f) => {
      if (f.recorrente) {
        // For recurrent holidays, compare month and day
        const feriadoDate = new Date(f.data);
        return (
          feriadoDate.getMonth() === date.getMonth() &&
          feriadoDate.getDate() === date.getDate()
        );
      }
      return f.data === dateStr;
    });
  };

  return {
    feriados,
    isLoading,
    error,
    createFeriado,
    updateFeriado,
    deleteFeriado,
    isFeriado,
  };
}
