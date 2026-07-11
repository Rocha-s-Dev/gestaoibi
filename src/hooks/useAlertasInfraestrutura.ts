import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AlertaInfraestrutura {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  prioridade: string;
  status: string;
  entidade: string | null;
  entidade_id: string | null;
  responsavel_id: string | null;
  data_limite: string | null;
  resolvido_em: string | null;
  resolvido_por: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const TIPOS_ALERTA_INFRAESTRUTURA = [
  { value: "obra_atrasada", label: "Obra atrasada" },
  { value: "prazo_vencido", label: "Prazo vencido" },
  { value: "iluminacao_critica", label: "Iluminação crítica" },
  { value: "chamado_urgente", label: "Chamado urgente" },
  { value: "manutencao_pendente", label: "Manutenção pendente" },
  { value: "meta_em_risco", label: "Meta em risco" },
  { value: "documento_pendente", label: "Documento pendente" },
  { value: "equipe_sem_responsavel", label: "Equipe sem responsável" },
];

export function useAlertasInfraestrutura() {
  const qc = useQueryClient();

  const { data: alertas = [], isLoading } = useQuery({
    queryKey: ["alertas_infraestrutura"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas_infraestrutura" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as AlertaInfraestrutura[];
    },
  });

  const createAlerta = useMutation({
    mutationFn: async (payload: Partial<AlertaInfraestrutura>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("alertas_infraestrutura" as any).insert({
        ...payload,
        created_by: auth.user?.id ?? null,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alertas_infraestrutura"] });
      toast.success("Alerta registrado.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao registrar alerta."),
  });

  const resolverAlerta = useMutation({
    mutationFn: async (id: string) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("alertas_infraestrutura" as any).update({
        status: "resolvido",
        resolvido_em: new Date().toISOString(),
        resolvido_por: auth.user?.id ?? null,
      } as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alertas_infraestrutura"] });
      toast.success("Alerta resolvido.");
    },
    onError: (e: any) => toast.error(e.message || "Erro ao resolver alerta."),
  });

  const deleteAlerta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alertas_infraestrutura" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertas_infraestrutura"] }),
  });

  return { alertas, isLoading, createAlerta, resolverAlerta, deleteAlerta };
}
