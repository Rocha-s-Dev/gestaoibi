import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const STATUS_PAIF_LABELS: Record<string, string> = {
  ativo: "Ativo", suspenso: "Suspenso", concluido: "Concluído",
};

export interface PaifAcompanhamento {
  id: string;
  familia_id: string;
  unidade_id: string | null;
  tecnico_responsavel_id: string | null;
  data_inicio: string;
  data_encerramento: string | null;
  objetivos: string | null;
  situacao: string;
  motivo_encerramento: string | null;
  secretaria_id: string | null;
  created_at: string;
  familia?: { responsavel_nome: string } | null;
  unidade?: { nome: string } | null;
}

export function usePAIF(filtro?: { situacao?: string }) {
  const qc = useQueryClient();
  const { data: itens, isLoading } = useQuery({
    queryKey: ["paif", filtro],
    queryFn: async () => {
      let q = supabase.from("paif_acompanhamentos")
        .select("*, familia:familia_id(responsavel_nome), unidade:unidade_id(nome)")
        .order("data_inicio", { ascending: false });
      if (filtro?.situacao && filtro.situacao !== "todos") q = q.eq("situacao", filtro.situacao as any);
      const { data, error } = await q;
      if (error) throw error;
      return data as any as PaifAcompanhamento[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (p: Partial<PaifAcompanhamento>) => {
      const payload: any = { ...p }; delete payload.familia; delete payload.unidade;
      if (payload.id) {
        const { error } = await supabase.from("paif_acompanhamentos").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id;
        const { error } = await supabase.from("paif_acompanhamentos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paif"] }); toast.success("PAIF salvo"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("paif_acompanhamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paif"] }); toast.success("Removido"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { itens, isLoading, salvar, remover };
}

export function usePAIFEvolucoes(paifId?: string) {
  const qc = useQueryClient();
  const { data: evolucoes } = useQuery({
    queryKey: ["paif_evolucoes", paifId],
    queryFn: async () => {
      if (!paifId) return [];
      const { data, error } = await supabase.from("paif_evolucoes").select("*").eq("paif_id", paifId).order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!paifId,
  });

  const adicionar = useMutation({
    mutationFn: async (p: { paif_id: string; data: string; descricao: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("paif_evolucoes").insert({ ...p, tecnico_id: u.user?.id, created_by: u.user?.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paif_evolucoes"] }); toast.success("Evolução registrada"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { evolucoes, adicionar };
}
