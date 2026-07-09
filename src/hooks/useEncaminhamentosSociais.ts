import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const STATUS_ENC_LABELS: Record<string, string> = {
  aberto: "Aberto",
  enviado: "Enviado",
  em_atendimento: "Em atendimento",
  concluido: "Concluído",
  sem_retorno: "Sem retorno",
  cancelado: "Cancelado",
};

export const DESTINO_LABELS: Record<string, string> = {
  saude: "Saúde",
  educacao: "Educação",
  cras: "CRAS",
  creas: "CREAS",
  conselho_tutelar: "Conselho Tutelar",
  habitacao: "Habitação",
  emprego: "Emprego",
  juridico: "Jurídico",
  outros: "Outros",
};

export interface EncaminhamentoSocial {
  id: string;
  protocolo: string;
  familia_id: string | null;
  membro_id: string | null;
  destino: string;
  destino_detalhe: string | null;
  motivo: string;
  data_encaminhamento: string;
  responsavel_id: string | null;
  status: string;
  data_retorno: string | null;
  retorno: string | null;
  observacoes: string | null;
  unidade_id: string | null;
  secretaria_id: string | null;
  created_at: string;
  familia?: { responsavel_nome: string } | null;
}

export function useEncaminhamentosSociais(filtro?: { status?: string; destino?: string }) {
  const qc = useQueryClient();
  const { data: encaminhamentos, isLoading } = useQuery({
    queryKey: ["encaminhamentos_sociais", filtro],
    queryFn: async () => {
      let q = supabase.from("encaminhamentos_sociais")
        .select("*, familia:familia_id(responsavel_nome)")
        .order("data_encaminhamento", { ascending: false });
      if (filtro?.status && filtro.status !== "todos") q = q.eq("status", filtro.status as any);
      if (filtro?.destino && filtro.destino !== "todos") q = q.eq("destino", filtro.destino as any);
      const { data, error } = await q;
      if (error) throw error;
      return data as any as EncaminhamentoSocial[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (p: Partial<EncaminhamentoSocial>) => {
      const payload: any = { ...p }; delete payload.familia; delete payload.protocolo;
      if (payload.id) {
        const { error } = await supabase.from("encaminhamentos_sociais").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id;
        payload.responsavel_id = payload.responsavel_id || u.user?.id;
        const { error } = await supabase.from("encaminhamentos_sociais").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["encaminhamentos_sociais"] }); toast.success("Encaminhamento salvo"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("encaminhamentos_sociais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["encaminhamentos_sociais"] }); toast.success("Removido"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { encaminhamentos, isLoading, salvar, remover };
}

export function useEncaminhamentoHistorico(encaminhamentoId?: string) {
  const { data: historico } = useQuery({
    queryKey: ["enc_historico", encaminhamentoId],
    queryFn: async () => {
      if (!encaminhamentoId) return [];
      const { data, error } = await supabase.from("encaminhamentos_sociais_historico").select("*").eq("encaminhamento_id", encaminhamentoId).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!encaminhamentoId,
  });
  return { historico };
}
