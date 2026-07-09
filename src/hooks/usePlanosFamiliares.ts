import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const STATUS_PLANO_LABELS: Record<string, string> = {
  em_elaboracao: "Em elaboração",
  ativo: "Ativo",
  suspenso: "Suspenso",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_ACAO_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export interface PlanoFamiliar {
  id: string;
  familia_id: string;
  unidade_id: string | null;
  tecnico_responsavel_id: string | null;
  titulo: string;
  objetivos: string | null;
  data_inicio: string;
  data_prevista_fim: string | null;
  data_conclusao: string | null;
  resultados: string | null;
  situacao: string;
  secretaria_id: string | null;
  created_at: string;
  familia?: { responsavel_nome: string } | null;
  unidade?: { nome: string } | null;
}

export function usePlanosFamiliares(filtro?: { situacao?: string }) {
  const qc = useQueryClient();
  const { data: planos, isLoading } = useQuery({
    queryKey: ["planos_familiares", filtro],
    queryFn: async () => {
      let q = supabase.from("planos_acompanhamento_familiar")
        .select("*, familia:familia_id(responsavel_nome), unidade:unidade_id(nome)")
        .order("created_at", { ascending: false });
      if (filtro?.situacao && filtro.situacao !== "todos") q = q.eq("situacao", filtro.situacao as any);
      const { data, error } = await q;
      if (error) throw error;
      return data as any as PlanoFamiliar[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (p: Partial<PlanoFamiliar>) => {
      const payload: any = { ...p }; delete payload.familia; delete payload.unidade;
      if (payload.id) {
        const { error } = await supabase.from("planos_acompanhamento_familiar").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id;
        const { error } = await supabase.from("planos_acompanhamento_familiar").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["planos_familiares"] }); toast.success("Plano salvo"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("planos_acompanhamento_familiar").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["planos_familiares"] }); toast.success("Removido"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { planos, isLoading, salvar, remover };
}

export function usePlanoAcoes(planoId?: string) {
  const qc = useQueryClient();
  const { data: acoes } = useQuery({
    queryKey: ["plano_acoes", planoId],
    queryFn: async () => {
      if (!planoId) return [];
      const { data, error } = await supabase.from("plano_familiar_acoes").select("*").eq("plano_id", planoId).order("prazo");
      if (error) throw error;
      return data;
    },
    enabled: !!planoId,
  });

  const salvar = useMutation({
    mutationFn: async (p: any) => {
      if (p.id) {
        const { error } = await supabase.from("plano_familiar_acoes").update(p).eq("id", p.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        const { error } = await supabase.from("plano_familiar_acoes").insert({ ...p, created_by: u.user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plano_acoes"] }); toast.success("Ação salva"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("plano_familiar_acoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plano_acoes"] }); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { acoes, salvar, remover };
}

export function usePlanoEvolucoes(planoId?: string) {
  const qc = useQueryClient();
  const { data: evolucoes } = useQuery({
    queryKey: ["plano_evolucoes", planoId],
    queryFn: async () => {
      if (!planoId) return [];
      const { data, error } = await supabase.from("plano_familiar_evolucoes").select("*").eq("plano_id", planoId).order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!planoId,
  });

  const adicionar = useMutation({
    mutationFn: async (p: { plano_id: string; data: string; descricao: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("plano_familiar_evolucoes").insert({ ...p, tecnico_id: u.user?.id, created_by: u.user?.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["plano_evolucoes"] }); toast.success("Evolução registrada"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { evolucoes, adicionar };
}
