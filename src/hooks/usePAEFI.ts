import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaefiAcompanhamento {
  id: string;
  familia_id: string;
  unidade_id: string | null;
  tecnico_responsavel_id: string | null;
  motivo: string;
  tipo_violacao: string | null;
  data_inicio: string;
  data_encerramento: string | null;
  encaminhamentos: string | null;
  situacao: string;
  secretaria_id: string | null;
  created_at: string;
  familia?: { responsavel_nome: string } | null;
  unidade?: { nome: string } | null;
}

export function usePAEFI(filtro?: { situacao?: string }) {
  const qc = useQueryClient();
  const { data: itens, isLoading } = useQuery({
    queryKey: ["paefi", filtro],
    queryFn: async () => {
      let q = supabase.from("paefi_acompanhamentos")
        .select("*, familia:familia_id(responsavel_nome), unidade:unidade_id(nome)")
        .order("data_inicio", { ascending: false });
      if (filtro?.situacao && filtro.situacao !== "todos") q = q.eq("situacao", filtro.situacao as any);
      const { data, error } = await q;
      if (error) throw error;
      return data as any as PaefiAcompanhamento[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (p: Partial<PaefiAcompanhamento>) => {
      const payload: any = { ...p }; delete payload.familia; delete payload.unidade;
      if (payload.id) {
        const { error } = await supabase.from("paefi_acompanhamentos").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id;
        const { error } = await supabase.from("paefi_acompanhamentos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paefi"] }); toast.success("PAEFI salvo"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("paefi_acompanhamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paefi"] }); toast.success("Removido"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { itens, isLoading, salvar, remover };
}

export function usePAEFIEvolucoes(paefiId?: string) {
  const qc = useQueryClient();
  const { data: evolucoes } = useQuery({
    queryKey: ["paefi_evolucoes", paefiId],
    queryFn: async () => {
      if (!paefiId) return [];
      const { data, error } = await supabase.from("paefi_evolucoes").select("*").eq("paefi_id", paefiId).order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!paefiId,
  });

  const adicionar = useMutation({
    mutationFn: async (p: { paefi_id: string; data: string; descricao: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("paefi_evolucoes").insert({ ...p, tecnico_id: u.user?.id, created_by: u.user?.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["paefi_evolucoes"] }); toast.success("Evolução registrada"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { evolucoes, adicionar };
}
