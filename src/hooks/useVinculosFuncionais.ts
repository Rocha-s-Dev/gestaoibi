import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VinculoFuncionalView {
  id: string;
  user_id: string;
  secretaria_id: string | null;
  cargo_id: string | null;
  funcao_id: string | null;
  unidade_id: string | null;
  cargo_secretaria_id: string | null;
  escola_id: string | null;
  unidade_saude_id: string | null;
  matricula: string | null;
  situacao: string | null;
  is_primary: boolean | null;
  data_admissao: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined fields from the view
  profile_nome: string | null;
  profile_email: string | null;
  cargo_publico_nome: string | null;
  cargo_publico_codigo: string | null;
  funcao_nome: string | null;
  funcao_codigo: string | null;
  secretaria_nome: string | null;
  unidade_nome: string | null;
  cargo_secretaria_nome: string | null;
  cargo_secretaria_nivel: string | null;
  escola_nome: string | null;
  unidade_saude_nome: string | null;
}

export function useVinculosFuncionais(secretariaId?: string) {
  const queryClient = useQueryClient();

  const { data: vinculos, isLoading, error } = useQuery({
    queryKey: ["vinculos_funcionais", secretariaId],
    queryFn: async () => {
      let query = supabase
        .from("vinculos_funcionais_view" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (secretariaId) {
        query = query.eq("secretaria_id", secretariaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as VinculoFuncionalView[];
    },
  });

  const createVinculo = useMutation({
    mutationFn: async (vinculo: Record<string, any>) => {
      const { data, error } = await supabase
        .from("vinculos_funcionais")
        .insert(vinculo as any)
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
    mutationFn: async ({ id, ...vinculo }: Record<string, any> & { id: string }) => {
      const { data, error } = await supabase
        .from("vinculos_funcionais")
        .update(vinculo as any)
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
