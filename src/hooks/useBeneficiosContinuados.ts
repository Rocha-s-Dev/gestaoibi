import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const STATUS_BC_LABELS: Record<string, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  encerrado: "Encerrado",
  cancelado: "Cancelado",
};

export const PERIODICIDADE_LABELS: Record<string, string> = {
  mensal: "Mensal",
  bimestral: "Bimestral",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
  unica: "Única",
};

export interface BeneficioContinuado {
  id: string;
  familia_id: string | null;
  membro_id: string | null;
  programa: string;
  beneficio: string;
  data_inicio: string;
  data_fim: string | null;
  valor: number;
  periodicidade: string;
  situacao: string;
  observacoes: string | null;
  tecnico_responsavel_id: string | null;
  unidade_id: string | null;
  secretaria_id: string | null;
  created_at: string;
  familia?: { responsavel_nome: string } | null;
  unidade?: { nome: string } | null;
}

export function useBeneficiosContinuados(filtro?: { situacao?: string; unidadeId?: string }) {
  const qc = useQueryClient();

  const { data: beneficios, isLoading } = useQuery({
    queryKey: ["beneficios_continuados", filtro],
    queryFn: async () => {
      let q = supabase
        .from("beneficios_continuados")
        .select("*, familia:familia_id(responsavel_nome), unidade:unidade_id(nome)")
        .order("created_at", { ascending: false });
      if (filtro?.situacao && filtro.situacao !== "todos") q = q.eq("situacao", filtro.situacao as any);
      if (filtro?.unidadeId && filtro.unidadeId !== "todos") q = q.eq("unidade_id", filtro.unidadeId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any as BeneficioContinuado[];
    },
  });

  const salvar = useMutation({
    mutationFn: async (p: Partial<BeneficioContinuado>) => {
      const payload: any = { ...p };
      delete payload.familia; delete payload.unidade;
      if (payload.id) {
        const { error } = await supabase.from("beneficios_continuados").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        payload.created_by = u.user?.id;
        const { error } = await supabase.from("beneficios_continuados").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beneficios_continuados"] }); toast.success("Benefício salvo"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("beneficios_continuados").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beneficios_continuados"] }); toast.success("Removido"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { beneficios, isLoading, salvar, remover };
}
