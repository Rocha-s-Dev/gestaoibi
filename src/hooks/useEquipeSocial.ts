import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type SocialRole = Database["public"]["Enums"]["social_role"];

export const SOCIAL_ROLE_LABELS: Record<SocialRole, string> = {
  secretario_assistencia_social: "Secretário(a) de Assistência Social",
  coordenador_cras: "Coordenador(a) de CRAS",
  coordenador_creas: "Coordenador(a) de CREAS",
  assistente_social: "Assistente Social",
  psicologo_social: "Psicólogo(a) Social",
  tecnico_nivel_medio: "Técnico(a) de Nível Médio",
  agente_social: "Agente Social",
  gestor_beneficios: "Gestor(a) de Benefícios",
};

export function useEquipeSocial(secretariaId?: string) {
  const qc = useQueryClient();

  const { data: membros, isLoading } = useQuery({
    queryKey: ["user_social_roles", secretariaId],
    queryFn: async () => {
      let q = supabase
        .from("user_social_roles")
        .select(`
          *,
          profiles:user_id(id, name, email, cpf, telefone),
          unidade:unidade_id(id, nome, tipo)
        `)
        .order("created_at", { ascending: false });
      if (secretariaId) q = q.eq("secretaria_id", secretariaId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });

  const addMembro = useMutation({
    mutationFn: async (payload: {
      user_id: string;
      role: SocialRole;
      secretaria_id: string;
      unidade_id?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("user_social_roles")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_social_roles"] });
      toast.success("Membro vinculado à equipe social!");
    },
    onError: (e: any) => toast.error("Erro ao vincular: " + e.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({
      id,
      role,
      unidade_id,
    }: {
      id: string;
      role: SocialRole;
      unidade_id?: string | null;
    }) => {
      const { error } = await supabase
        .from("user_social_roles")
        .update({ role, unidade_id: unidade_id ?? null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_social_roles"] });
      toast.success("Papel atualizado!");
    },
    onError: (e: any) => toast.error("Erro ao atualizar: " + e.message),
  });

  const removeMembro = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_social_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_social_roles"] });
      toast.success("Membro removido da equipe!");
    },
    onError: (e: any) => toast.error("Erro ao remover: " + e.message),
  });

  return { membros, isLoading, addMembro, updateRole, removeMembro };
}
