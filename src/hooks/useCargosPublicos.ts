import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CargoPublico = Database["public"]["Tables"]["cargos_publicos"]["Row"];
type CargoPublicoInsert = Database["public"]["Tables"]["cargos_publicos"]["Insert"];
type CargoPublicoUpdate = Database["public"]["Tables"]["cargos_publicos"]["Update"];

export function useCargosPublicos(municipioId?: string) {
  const queryClient = useQueryClient();

  const { data: cargos, isLoading, error } = useQuery({
    queryKey: ["cargos_publicos", municipioId],
    queryFn: async () => {
      let query = supabase
        .from("cargos_publicos")
        .select("*")
        .order("nome");

      if (municipioId) {
        query = query.eq("municipio_id", municipioId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CargoPublico[];
    },
  });

  const createCargo = useMutation({
    mutationFn: async (cargo: CargoPublicoInsert) => {
      const { data, error } = await supabase
        .from("cargos_publicos")
        .insert(cargo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos_publicos"] });
      toast.success("Cargo criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar cargo:", error);
      toast.error("Erro ao criar cargo");
    },
  });

  const updateCargo = useMutation({
    mutationFn: async ({ id, ...cargo }: CargoPublicoUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("cargos_publicos")
        .update(cargo)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos_publicos"] });
      toast.success("Cargo atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar cargo:", error);
      toast.error("Erro ao atualizar cargo");
    },
  });

  const deleteCargo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cargos_publicos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos_publicos"] });
      toast.success("Cargo excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir cargo:", error);
      toast.error("Erro ao excluir cargo");
    },
  });

  return {
    cargos,
    isLoading,
    error,
    createCargo,
    updateCargo,
    deleteCargo,
  };
}
