import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type EnvironmentRole = Database["public"]["Enums"]["environment_role"];

export const ENVIRONMENT_ROLE_LABELS: Record<EnvironmentRole, string> = {
  secretario_meio_ambiente: "Secretário de Meio Ambiente",
  coordenador_ambiental: "Coordenador Ambiental",
  fiscal_ambiental: "Fiscal Ambiental",
  analista_ambiental: "Analista Ambiental",
  agente_ambiental: "Agente Ambiental",
  gestor_programas_ambientais: "Gestor de Programas Ambientais",
};

export function useEquipeAmbiental(secretariaId?: string) {
  const qc = useQueryClient();

  const { data: membros, isLoading } = useQuery({
    queryKey: ["user_environment_roles", secretariaId],
    queryFn: async () => {
      let q = supabase
        .from("user_environment_roles")
        .select(`
          *,
          profiles:user_id(id, first_name, last_name, email, cpf, telefone)
        `)
        .order("created_at", { ascending: false });
      if (secretariaId) q = q.eq("secretaria_id", secretariaId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });

  const addMembro = useMutation({
    mutationFn: async (payload: { user_id: string; role: EnvironmentRole; secretaria_id: string }) => {
      const { data, error } = await supabase
        .from("user_environment_roles")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_environment_roles"] });
      toast.success("Membro vinculado à equipe ambiental!");
    },
    onError: (e: any) => toast.error("Erro ao vincular: " + e.message),
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: EnvironmentRole }) => {
      const { error } = await supabase
        .from("user_environment_roles")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_environment_roles"] });
      toast.success("Papel atualizado!");
    },
    onError: (e: any) => toast.error("Erro ao atualizar: " + e.message),
  });

  const removeMembro = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_environment_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user_environment_roles"] });
      toast.success("Membro removido da equipe!");
    },
    onError: (e: any) => toast.error("Erro ao remover: " + e.message),
  });

  return { membros, isLoading, addMembro, updateRole, removeMembro };
}
