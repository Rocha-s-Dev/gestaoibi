import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type VinculoFuncional = Database["public"]["Tables"]["vinculos_funcionais"]["Row"];
type VinculoFuncionalInsert = Database["public"]["Tables"]["vinculos_funcionais"]["Insert"];
type VinculoFuncionalUpdate = Database["public"]["Tables"]["vinculos_funcionais"]["Update"];

export function useVinculosFuncionais(secretariaId?: string) {
  const queryClient = useQueryClient();

  const { data: vinculos, isLoading, error } = useQuery({
    queryKey: ["vinculos_funcionais", secretariaId],
    queryFn: async () => {
      let query = supabase
        .from("vinculos_funcionais")
        .select(`
          *,
          profiles:user_id(id, first_name, last_name, email),
          cargos_publicos:cargo_id(id, nome, codigo),
          funcoes_administrativas:funcao_id(id, nome, codigo),
          secretarias:secretaria_id(id, nome),
          unidades_administrativas:unidade_id(id, nome)
        `)
        .order("created_at", { ascending: false });

      if (secretariaId) {
        query = query.eq("secretaria_id", secretariaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createVinculo = useMutation({
    mutationFn: async (vinculo: VinculoFuncionalInsert) => {
      const { data, error } = await supabase
        .from("vinculos_funcionais")
        .insert(vinculo)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vinculos_funcionais"] });
      toast.success("Vínculo funcional criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar vínculo:", error);
      toast.error("Erro ao criar vínculo funcional");
    },
  });

  const updateVinculo = useMutation({
    mutationFn: async ({ id, ...vinculo }: VinculoFuncionalUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("vinculos_funcionais")
        .update(vinculo)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vinculos_funcionais"] });
      toast.success("Vínculo funcional atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar vínculo:", error);
      toast.error("Erro ao atualizar vínculo funcional");
    },
  });

  const deleteVinculo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vinculos_funcionais")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vinculos_funcionais"] });
      toast.success("Vínculo funcional excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir vínculo:", error);
      toast.error("Erro ao excluir vínculo funcional");
    },
  });

  return {
    vinculos,
    isLoading,
    error,
    createVinculo,
    updateVinculo,
    deleteVinculo,
  };
}
