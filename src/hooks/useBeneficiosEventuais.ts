import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type TipoBeneficio = Database["public"]["Enums"]["tipo_beneficio_eventual"];

export const TIPO_BENEFICIO_LABELS: Record<TipoBeneficio, string> = {
  auxilio_funeral: "Auxílio Funeral",
  auxilio_natalidade: "Auxílio Natalidade",
  cesta_basica: "Cesta Básica",
  aluguel_social: "Aluguel Social",
  passagem: "Passagem",
  documentacao: "Documentação",
  outros: "Outros",
};

export const STATUS_BENEFICIO_LABELS: Record<string, string> = {
  solicitado: "Solicitado",
  em_analise: "Em Análise",
  aprovado: "Aprovado",
  concedido: "Concedido",
  indeferido: "Indeferido",
  cancelado: "Cancelado",
};

export interface BeneficioEventual {
  id: string;
  familia_id: string | null;
  membro_id: string | null;
  tipo_beneficio: TipoBeneficio;
  descricao: string | null;
  valor: number;
  quantidade: number;
  data_solicitacao: string;
  data_concessao: string | null;
  data_validade: string | null;
  parcela_atual: number;
  total_parcelas: number;
  justificativa: string;
  parecer_tecnico: string | null;
  documentos_anexos: any;
  status: string;
  tecnico_responsavel_id: string | null;
  aprovado_por: string | null;
  data_aprovacao: string | null;
  unidade_id: string | null;
  secretaria_id: string | null;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  familia?: { responsavel_nome: string } | null;
  unidade?: { nome: string; tipo: string } | null;
}

export function useBeneficiosEventuais(filtros?: {
  tipo?: TipoBeneficio | "todos";
  status?: string;
  unidadeId?: string;
}) {
  const qc = useQueryClient();

  const { data: beneficios, isLoading } = useQuery({
    queryKey: ["beneficios_eventuais", filtros],
    queryFn: async () => {
      let q = supabase
        .from("beneficios_eventuais")
        .select(`
          *,
          familia:familia_id(responsavel_nome),
          unidade:unidade_id(nome, tipo)
        `)
        .order("data_solicitacao", { ascending: false })
        .limit(300);
      if (filtros?.tipo && filtros.tipo !== "todos") q = q.eq("tipo_beneficio", filtros.tipo);
      if (filtros?.status && filtros.status !== "todos") q = q.eq("status", filtros.status);
      if (filtros?.unidadeId && filtros.unidadeId !== "todos") q = q.eq("unidade_id", filtros.unidadeId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]) as BeneficioEventual[];
    },
  });

  const saveBeneficio = useMutation({
    mutationFn: async (payload: Partial<BeneficioEventual>) => {
      const clean: any = { ...payload };
      delete clean.familia;
      delete clean.unidade;
      if (clean.id) {
        const { error } = await supabase
          .from("beneficios_eventuais")
          .update(clean)
          .eq("id", clean.id);
        if (error) throw error;
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        clean.created_by = userRes.user?.id ?? null;
        const { error } = await supabase.from("beneficios_eventuais").insert(clean);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficios_eventuais"] });
      toast.success("Benefício salvo com sucesso!");
    },
    onError: (e: any) => toast.error("Erro ao salvar: " + e.message),
  });

  const changeStatus = useMutation({
    mutationFn: async ({
      id,
      status,
      observacao,
    }: {
      id: string;
      status: string;
      observacao?: string;
    }) => {
      const update: any = { status };
      if (status === "aprovado") {
        const { data: userRes } = await supabase.auth.getUser();
        update.aprovado_por = userRes.user?.id ?? null;
        update.data_aprovacao = new Date().toISOString();
      }
      if (status === "concedido") update.data_concessao = new Date().toISOString().split("T")[0];
      const { error } = await supabase.from("beneficios_eventuais").update(update).eq("id", id);
      if (error) throw error;
      if (observacao) {
        await supabase.from("beneficios_eventuais_historico").insert({
          beneficio_id: id,
          status_novo: status,
          observacao,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficios_eventuais"] });
      toast.success("Status atualizado!");
    },
    onError: (e: any) => toast.error("Erro ao atualizar status: " + e.message),
  });

  const removeBeneficio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("beneficios_eventuais").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["beneficios_eventuais"] });
      toast.success("Benefício removido.");
    },
    onError: (e: any) => toast.error("Erro ao remover: " + e.message),
  });

  return { beneficios, isLoading, saveBeneficio, changeStatus, removeBeneficio };
}
