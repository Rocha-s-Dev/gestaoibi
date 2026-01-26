import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ModuloSistema = Database["public"]["Tables"]["modulos_sistema"]["Row"];
type PermissaoPapel = Database["public"]["Tables"]["permissoes_papel"]["Row"];
type PermissaoPapelInsert = Database["public"]["Tables"]["permissoes_papel"]["Insert"];
type PermissaoPapelUpdate = Database["public"]["Tables"]["permissoes_papel"]["Update"];
type TipoPermissao = Database["public"]["Enums"]["tipo_permissao"];
type PapelSistemico = Database["public"]["Enums"]["papel_sistemico"];

export function useModulosSistema() {
  const { data: modulos, isLoading, error } = useQuery({
    queryKey: ["modulos_sistema"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modulos_sistema")
        .select("*")
        .eq("ativo", true)
        .order("ordem");

      if (error) throw error;
      return data as ModuloSistema[];
    },
  });

  return { modulos, isLoading, error };
}

export function usePermissoesPapel(papel?: PapelSistemico) {
  const queryClient = useQueryClient();

  const { data: permissoes, isLoading, error } = useQuery({
    queryKey: ["permissoes_papel", papel],
    queryFn: async () => {
      let query = supabase
        .from("permissoes_papel")
        .select(`
          *,
          modulos_sistema:modulo_id(id, nome, codigo, descricao)
        `);

      if (papel) {
        query = query.eq("papel", papel);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createPermissao = useMutation({
    mutationFn: async (permissao: PermissaoPapelInsert) => {
      const { data, error } = await supabase
        .from("permissoes_papel")
        .insert(permissao)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissoes_papel"] });
      toast.success("Permissão criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar permissão:", error);
      toast.error("Erro ao criar permissão");
    },
  });

  const updatePermissao = useMutation({
    mutationFn: async ({ id, ...permissao }: PermissaoPapelUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("permissoes_papel")
        .update(permissao)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissoes_papel"] });
      toast.success("Permissão atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar permissão:", error);
      toast.error("Erro ao atualizar permissão");
    },
  });

  const deletePermissao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("permissoes_papel")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissoes_papel"] });
      toast.success("Permissão removida com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao remover permissão:", error);
      toast.error("Erro ao remover permissão");
    },
  });

  return {
    permissoes,
    isLoading,
    error,
    createPermissao,
    updatePermissao,
    deletePermissao,
  };
}

export function useCheckPermission() {
  const { data: currentUser } = useQuery({
    queryKey: ["current_user_permission_check"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const checkPermission = async (modulo: string, acao: TipoPermissao): Promise<boolean> => {
    if (!currentUser?.id) return false;

    const { data, error } = await supabase.rpc("tem_permissao", {
      _user_id: currentUser.id,
      _modulo: modulo,
      _acao: acao,
    });

    if (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }

    return data || false;
  };

  return { checkPermission, currentUserId: currentUser?.id };
}
