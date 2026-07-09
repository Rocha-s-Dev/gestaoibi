import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const TIPO_ALERTA_LABELS: Record<string, string> = {
  familia_sem_acompanhamento: "Família sem acompanhamento",
  plano_vencido: "Plano vencido",
  beneficio_vencendo: "Benefício vencendo",
  documentacao_pendente: "Documentação pendente",
  retorno_pendente: "Retorno pendente",
  alta_vulnerabilidade: "Alta vulnerabilidade",
  encaminhamento_sem_resposta: "Encaminhamento sem resposta",
};

export interface AlertaSocial {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  familia_id: string | null;
  entidade_tipo: string | null;
  entidade_id: string | null;
  severidade: string;
  resolvido: boolean;
  resolvido_por: string | null;
  resolvido_em: string | null;
  observacao_resolucao: string | null;
  unidade_id: string | null;
  created_at: string;
  familia?: { responsavel_nome: string } | null;
}

export function useAlertasSociais(filtro?: { resolvido?: boolean }) {
  const qc = useQueryClient();
  const { data: alertas, isLoading } = useQuery({
    queryKey: ["alertas_sociais", filtro],
    queryFn: async () => {
      let q = supabase.from("alertas_sociais")
        .select("*, familia:familia_id(responsavel_nome)")
        .order("created_at", { ascending: false });
      if (typeof filtro?.resolvido === "boolean") q = q.eq("resolvido", filtro.resolvido);
      const { data, error } = await q;
      if (error) throw error;
      return data as any as AlertaSocial[];
    },
  });

  const resolver = useMutation({
    mutationFn: async ({ id, observacao }: { id: string; observacao?: string }) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("alertas_sociais").update({
        resolvido: true,
        resolvido_por: u.user?.id,
        resolvido_em: new Date().toISOString(),
        observacao_resolucao: observacao,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alertas_sociais"] }); toast.success("Alerta resolvido"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const criar = useMutation({
    mutationFn: async (p: Partial<AlertaSocial>) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("alertas_sociais").insert({ ...p, created_by: u.user?.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alertas_sociais"] }); toast.success("Alerta criado"); },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { alertas, isLoading, resolver, criar };
}

// Gera alertas automáticos consultando o banco (executa no cliente conforme padrão de outros módulos)
export async function gerarAlertasAutomaticos() {
  const alerts: any[] = [];
  const hoje = new Date();
  const diasSem = 90;
  const limite = new Date(hoje.getTime() - diasSem * 86400000).toISOString();

  // Famílias sem acompanhamento recente
  const { data: fams } = await supabase.from("familias_cadunico").select("id, responsavel_nome, updated_at").lt("updated_at", limite).eq("status", "ativo").limit(50);
  for (const f of fams || []) {
    const { data: exists } = await supabase.from("alertas_sociais").select("id").eq("familia_id", f.id).eq("tipo", "familia_sem_acompanhamento").eq("resolvido", false).maybeSingle();
    if (!exists) alerts.push({ tipo: "familia_sem_acompanhamento", titulo: `Família sem acompanhamento: ${f.responsavel_nome}`, familia_id: f.id, severidade: "media" });
  }

  // Planos vencidos
  const { data: planos } = await supabase.from("planos_acompanhamento_familiar").select("id, titulo, familia_id, data_prevista_fim").lt("data_prevista_fim", new Date().toISOString().slice(0, 10)).eq("situacao", "ativo");
  for (const p of planos || []) {
    const { data: exists } = await supabase.from("alertas_sociais").select("id").eq("entidade_id", p.id).eq("tipo", "plano_vencido").eq("resolvido", false).maybeSingle();
    if (!exists) alerts.push({ tipo: "plano_vencido", titulo: `Plano vencido: ${p.titulo}`, familia_id: p.familia_id, entidade_tipo: "plano_familiar", entidade_id: p.id, severidade: "alta" });
  }

  // Encaminhamentos sem resposta há +30 dias
  const limiteEnc = new Date(hoje.getTime() - 30 * 86400000).toISOString().slice(0, 10);
  const { data: encs } = await supabase.from("encaminhamentos_sociais").select("id, protocolo, familia_id, data_encaminhamento").lt("data_encaminhamento", limiteEnc).in("status", ["aberto", "enviado"]);
  for (const e of encs || []) {
    const { data: exists } = await supabase.from("alertas_sociais").select("id").eq("entidade_id", e.id).eq("tipo", "encaminhamento_sem_resposta").eq("resolvido", false).maybeSingle();
    if (!exists) alerts.push({ tipo: "encaminhamento_sem_resposta", titulo: `Encaminhamento sem resposta: ${e.protocolo}`, familia_id: e.familia_id, entidade_tipo: "encaminhamento", entidade_id: e.id, severidade: "alta" });
  }

  // Alta vulnerabilidade
  const { data: vulns } = await supabase.from("vulnerabilidade_avaliacoes").select("id, familia_id, nivel_calculado, nivel_manual").in("nivel_calculado", ["alta", "muito_alta"]);
  for (const v of vulns || []) {
    const { data: exists } = await supabase.from("alertas_sociais").select("id").eq("familia_id", v.familia_id).eq("tipo", "alta_vulnerabilidade").eq("resolvido", false).maybeSingle();
    if (!exists) alerts.push({ tipo: "alta_vulnerabilidade", titulo: `Família em alta vulnerabilidade`, familia_id: v.familia_id, entidade_tipo: "vulnerabilidade", entidade_id: v.id, severidade: "alta" });
  }

  if (alerts.length) {
    const { data: u } = await supabase.auth.getUser();
    const payload = alerts.map(a => ({ ...a, created_by: u.user?.id }));
    await supabase.from("alertas_sociais").insert(payload as any);
  }
  return alerts.length;
}
