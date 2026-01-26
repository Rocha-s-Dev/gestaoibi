import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type PapelUsuario = Database["public"]["Tables"]["papeis_usuario"]["Row"];
type PapelUsuarioInsert = Database["public"]["Tables"]["papeis_usuario"]["Insert"];
type PapelUsuarioUpdate = Database["public"]["Tables"]["papeis_usuario"]["Update"];
type PapelSistemico = Database["public"]["Enums"]["papel_sistemico"];

export function usePapeisUsuario(userId?: string) {
  const queryClient = useQueryClient();

  const { data: papeis, isLoading, error } = useQuery({
    queryKey: ["papeis_usuario", userId],
    queryFn: async () => {
      let query = supabase
        .from("papeis_usuario")
        .select(`
          *,
          profiles:user_id(id, first_name, last_name, email),
          secretarias:secretaria_id(id, nome),
          unidades_administrativas:unidade_id(id, nome),
          escolas:escola_id(id, nome)
        `)
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createPapel = useMutation({
    mutationFn: async (papel: PapelUsuarioInsert) => {
      const { data, error } = await supabase
        .from("papeis_usuario")
        .insert(papel)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["papeis_usuario"] });
      toast.success("Papel atribuído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atribuir papel:", error);
      toast.error("Erro ao atribuir papel");
    },
  });

  const updatePapel = useMutation({
    mutationFn: async ({ id, ...papel }: PapelUsuarioUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("papeis_usuario")
        .update(papel)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["papeis_usuario"] });
      toast.success("Papel atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar papel:", error);
      toast.error("Erro ao atualizar papel");
    },
  });

  const deletePapel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("papeis_usuario")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["papeis_usuario"] });
      toast.success("Papel removido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao remover papel:", error);
      toast.error("Erro ao remover papel");
    },
  });

  return {
    papeis,
    isLoading,
    error,
    createPapel,
    updatePapel,
    deletePapel,
  };
}

export function useUserPermissions() {
  const { data: currentUser } = useQuery({
    queryKey: ["current_user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: userPapeis, isLoading } = useQuery({
    queryKey: ["user_papeis", currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      
      const { data, error } = await supabase
        .from("papeis_usuario")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("is_active", true);
      
      if (error) throw error;
      return data as PapelUsuario[];
    },
    enabled: !!currentUser?.id,
  });

  const hasRole = (papel: PapelSistemico): boolean => {
    if (!userPapeis) return false;
    return userPapeis.some(p => p.papel === papel);
  };

  const isAdmin = (): boolean => {
    return hasRole("admin_municipal");
  };

  const isAuditor = (): boolean => {
    return hasRole("auditor");
  };

  const hasSecretariaAccess = (secretariaId: string): boolean => {
    if (isAdmin()) return true;
    if (!userPapeis) return false;
    return userPapeis.some(p => 
      p.secretaria_id === secretariaId || 
      p.secretaria_id === null
    );
  };

  return {
    userPapeis,
    isLoading,
    hasRole,
    isAdmin,
    isAuditor,
    hasSecretariaAccess,
    currentUserId: currentUser?.id,
  };
}
