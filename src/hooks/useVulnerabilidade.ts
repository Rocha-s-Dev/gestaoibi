import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NIVEIS_VULNERABILIDADE: Record<string, { label: string; color: string }> = {
  baixa: { label: "Baixa", color: "bg-green-100 text-green-800" },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-800" },
  muito_alta: { label: "Muito Alta", color: "bg-red-100 text-red-800" },
};

export interface VulnerabilidadeAvaliacao {
  id: string;
  familia_id: string;
  data_avaliacao: string;
  criterio_renda: number;
  criterio_desemprego: number;
  criterio_moradia: number;
  criterio_deficiencia: number;
  criterio_idoso: number;
  criterio_gestante: number;
  criterio_crianca: number;
  criterio_violencia: number;
  criterio_abandono: number;
  criterio_dependencia_quimica: number;
  pontuacao_total: number;
  nivel_calculado: string;
  nivel_manual: string | null;
  justificativa_manual: string | null;
  observacoes: string | null;
  familia?: { responsavel_nome: string } | null;
}

export function useVulnerabilidade() {
  const qc = useQueryClient();
  const { data: avaliacoes, isLoading } = useQuery({
    queryKey: ["vulnerabilidade"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vulnerabilidade_avaliacoes")
        .select("*, familia:familia_id(responsavel_nome)")
        .order("data_avaliacao", { ascending: false });
      if (error) throw error;
      return data as any as VulnerabilidadeAvaliacao[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (p: Partial<VulnerabilidadeAvaliacao>) => {
      const payload: any = { ...p }; delete payload.familia;
      if (payload.id) {
        const { error } = await supabase.from("vulnerabilidade_avaliacoes").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id;
        payload.tecnico_id = u.user?.id;
        const { error } = await supabase.from("vulnerabilidade_avaliacoes").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vulnerabilidade"] }); toast.success("Avaliação salva"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vulnerabilidade_avaliacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vulnerabilidade"] }); toast.success("Removida"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { avaliacoes, isLoading, salvar, remover };
}
