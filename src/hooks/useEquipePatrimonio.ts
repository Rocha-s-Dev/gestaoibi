import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type PatrimonioRole =
  | "gestor_patrimonio"
  | "agente_patrimonio"
  | "almoxarife"
  | "conferente_inventario"
  | "fiscal_patrimonio"
  | "secretario_administracao"
  | "auditor_patrimonio";

export const PATRIMONIO_ROLE_LABELS: Record<PatrimonioRole, string> = {
  gestor_patrimonio: "Gestor de Patrimônio",
  agente_patrimonio: "Agente de Patrimônio",
  almoxarife: "Almoxarife",
  conferente_inventario: "Conferente de Inventário",
  fiscal_patrimonio: "Fiscal de Patrimônio",
  secretario_administracao: "Secretário de Administração",
  auditor_patrimonio: "Auditor de Patrimônio",
};

export interface EquipePatrimonioVinculo {
  id: string;
  user_id: string;
  role: PatrimonioRole;
  secretaria_id: string | null;
  unidade_id: string | null;
  is_active: boolean;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { name: string | null; email: string | null; cpf: string | null; status_cadastral: string | null } | null;
}

export function useEquipePatrimonio(secretariaId?: string) {
  const qc = useQueryClient();

  const { data: vinculos = [], isLoading } = useQuery({
    queryKey: ["equipe_patrimonio", secretariaId],
    queryFn: async () => {
      let q = supabase
        .from("user_patrimonio_roles" as any)
        .select("*, profiles:user_id(name, email, cpf, status_cadastral)")
        .order("created_at", { ascending: false });
      if (secretariaId) q = q.eq("secretaria_id", secretariaId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as EquipePatrimonioVinculo[];
    },
  });

  const createVinculo = useMutation({
    mutationFn: async (payload: {
      user_id: string;
      role: PatrimonioRole;
      unidade_id?: string | null;
      secretaria_id?: string | null;
    }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("user_patrimonio_roles" as any).insert({
        user_id: payload.user_id,
        role: payload.role,
        unidade_id: payload.unidade_id ?? null,
        secretaria_id: payload.secretaria_id ?? secretariaId ?? null,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipe_patrimonio"] });
      toast.success("Servidor vinculado à equipe do Patrimônio.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao vincular servidor."),
  });

  const updateVinculo = useMutation({
    mutationFn: async ({
      id,
      ...patch
    }: {
      id: string;
      role?: PatrimonioRole;
      unidade_id?: string | null;
      secretaria_id?: string | null;
      is_active?: boolean;
    }) => {
      const { error } = await supabase.from("user_patrimonio_roles" as any).update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipe_patrimonio"] });
      toast.success("Vínculo atualizado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar vínculo."),
  });

  const deleteVinculo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_patrimonio_roles" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipe_patrimonio"] });
      toast.success("Vínculo patrimonial removido. O servidor permanece no RH.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao remover vínculo."),
  });

  return { vinculos, isLoading, createVinculo, updateVinculo, deleteVinculo };
}
