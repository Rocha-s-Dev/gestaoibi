import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type InfrastructureRole =
  | "secretario_infraestrutura" | "diretor_obras" | "coordenador_obras"
  | "engenheiro_civil" | "engenheiro_eletricista" | "arquiteto" | "fiscal_obras"
  | "coordenador_manutencao" | "supervisor_equipe" | "encarregado_servicos"
  | "tecnico_edificacoes" | "tecnico_eletrotecnico" | "operador_maquinas"
  | "eletricista" | "bombeiro_hidraulico" | "pedreiro" | "carpinteiro" | "pintor"
  | "soldador" | "mecanico" | "operador_rocadeira" | "jardineiro" | "agente_campo";

export const INFRASTRUCTURE_ROLE_LABELS: Record<InfrastructureRole, string> = {
  secretario_infraestrutura: "Secretário de Infraestrutura",
  diretor_obras: "Diretor de Obras",
  coordenador_obras: "Coordenador de Obras",
  engenheiro_civil: "Engenheiro Civil",
  engenheiro_eletricista: "Engenheiro Eletricista",
  arquiteto: "Arquiteto",
  fiscal_obras: "Fiscal de Obras",
  coordenador_manutencao: "Coordenador de Manutenção",
  supervisor_equipe: "Supervisor de Equipe",
  encarregado_servicos: "Encarregado de Serviços",
  tecnico_edificacoes: "Técnico em Edificações",
  tecnico_eletrotecnico: "Técnico Eletrotécnico",
  operador_maquinas: "Operador de Máquinas",
  eletricista: "Eletricista",
  bombeiro_hidraulico: "Bombeiro Hidráulico",
  pedreiro: "Pedreiro",
  carpinteiro: "Carpinteiro",
  pintor: "Pintor",
  soldador: "Soldador",
  mecanico: "Mecânico",
  operador_rocadeira: "Operador de Roçadeira",
  jardineiro: "Jardineiro",
  agente_campo: "Agente de Campo",
};

export interface EquipeInfraestruturaVinculo {
  id: string;
  user_id: string;
  role: InfrastructureRole;
  secretaria_id: string | null;
  unidade_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { name: string | null; email: string | null; cpf: string | null; status_cadastral: string | null } | null;
}

export function useEquipeInfraestrutura(secretariaId?: string) {
  const qc = useQueryClient();

  const { data: vinculos = [], isLoading } = useQuery({
    queryKey: ["equipe_infraestrutura", secretariaId],
    queryFn: async () => {
      let q = supabase
        .from("user_infrastructure_roles" as any)
        .select("*, profiles:user_id(name, email, cpf, status_cadastral)")
        .order("created_at", { ascending: false });
      if (secretariaId) q = q.eq("secretaria_id", secretariaId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as EquipeInfraestruturaVinculo[];
    },
  });

  const createVinculo = useMutation({
    mutationFn: async (payload: { user_id: string; role: InfrastructureRole; unidade_id?: string | null }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("user_infrastructure_roles" as any).insert({
        user_id: payload.user_id,
        role: payload.role,
        unidade_id: payload.unidade_id ?? null,
        secretaria_id: secretariaId ?? null,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipe_infraestrutura"] });
      toast.success("Servidor vinculado à equipe de Infraestrutura.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao vincular servidor."),
  });

  const updateVinculo = useMutation({
    mutationFn: async ({ id, ...patch }: { id: string; role?: InfrastructureRole; unidade_id?: string | null }) => {
      const { error } = await supabase.from("user_infrastructure_roles" as any).update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipe_infraestrutura"] });
      toast.success("Vínculo atualizado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar vínculo."),
  });

  const deleteVinculo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_infrastructure_roles" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipe_infraestrutura"] });
      toast.success("Vínculo removido. O servidor permanece no RH.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao remover vínculo."),
  });

  return { vinculos, isLoading, createVinculo, updateVinculo, deleteVinculo };
}
