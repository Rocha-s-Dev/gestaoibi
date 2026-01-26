import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type FuncaoAdministrativa = Database["public"]["Tables"]["funcoes_administrativas"]["Row"];
type FuncaoAdministrativaInsert = Database["public"]["Tables"]["funcoes_administrativas"]["Insert"];
type FuncaoAdministrativaUpdate = Database["public"]["Tables"]["funcoes_administrativas"]["Update"];

export function useFuncoesAdministrativas(secretariaId?: string) {
  const queryClient = useQueryClient();

  const { data: funcoes, isLoading, error } = useQuery({
    queryKey: ["funcoes_administrativas", secretariaId],
    queryFn: async () => {
      let query = supabase
        .from("funcoes_administrativas")
        .select(`
          *,
          secretarias:secretaria_id(id, nome),
          cargo_vinculado:cargo_vinculado_id(id, nome, codigo),
          funcao_superior:funcao_superior_id(id, nome, codigo)
        `)
        .order("nome");

      if (secretariaId) {
        query = query.eq("secretaria_id", secretariaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createFuncao = useMutation({
    mutationFn: async (funcao: FuncaoAdministrativaInsert) => {
      const { data, error } = await supabase
        .from("funcoes_administrativas")
        .insert(funcao)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcoes_administrativas"] });
      toast.success("Função criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar função:", error);
      toast.error("Erro ao criar função");
    },
  });

  const updateFuncao = useMutation({
    mutationFn: async ({ id, ...funcao }: FuncaoAdministrativaUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("funcoes_administrativas")
        .update(funcao)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcoes_administrativas"] });
      toast.success("Função atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar função:", error);
      toast.error("Erro ao atualizar função");
    },
  });

  const deleteFuncao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("funcoes_administrativas")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcoes_administrativas"] });
      toast.success("Função excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir função:", error);
      toast.error("Erro ao excluir função");
    },
  });

  return {
    funcoes,
    isLoading,
    error,
    createFuncao,
    updateFuncao,
    deleteFuncao,
  };
}
