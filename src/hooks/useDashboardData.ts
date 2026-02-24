import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { useAuth } from "@/contexts/AuthContext";

export function useDashboardData() {
  const { session } = useAuth();
  const { isAdmin, isPrefeito, isGestorRH, municipio, secretariaAtiva } = useSecretariaContext();

  const isExecutivo = isAdmin || isPrefeito;
  const userId = session?.user?.id;

  const { data: totalServidores = 0 } = useQuery({
    queryKey: ["dashboard_servidores"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status_cadastral", "ativo");
      return count || 0;
    },
    enabled: isExecutivo || isGestorRH,
  });

  const { data: servidoresPendentes = 0 } = useQuery({
    queryKey: ["dashboard_servidores_pendentes"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("status_cadastral", "pendente_regularizacao");
      return count || 0;
    },
    enabled: isExecutivo || isGestorRH,
  });

  const { data: totalSecretarias = 0 } = useQuery({
    queryKey: ["dashboard_secretarias"],
    queryFn: async () => {
      const { count } = await supabase
        .from("secretarias")
        .select("*", { count: "exact", head: true })
        .eq("status", "ativa");
      return count || 0;
    },
    enabled: isExecutivo,
  });

  const { data: metasGoverno = [] } = useQuery({
    queryKey: ["dashboard_metas_governo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("metas_plano_governo")
        .select("id, titulo, status, meta_valor, valor_atual, prioridade")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: isExecutivo,
  });

  const { data: obrasAndamento = 0 } = useQuery({
    queryKey: ["dashboard_obras"],
    queryFn: async () => {
      const { count } = await supabase
        .from("obras_prioritarias")
        .select("*", { count: "exact", head: true })
        .eq("status", "em_andamento");
      return count || 0;
    },
    enabled: isExecutivo,
  });

  const { data: alertasPendentes = [] } = useQuery({
    queryKey: ["dashboard_alertas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("alertas_executivos")
        .select("id, titulo, descricao, prioridade, tipo, categoria, created_at")
        .eq("status", "pendente")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: isExecutivo,
  });

  const { data: notificacoesRecentes = [] } = useQuery({
    queryKey: ["dashboard_notificacoes", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, type, read, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: folhaMes = { total: 0, count: 0 } } = useQuery({
    queryKey: ["dashboard_folha"],
    queryFn: async () => {
      const now = new Date();
      const mesAtual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const { data } = await supabase
        .from("folha_pagamento")
        .select("total_liquido")
        .eq("competencia", mesAtual);
      const items = data || [];
      return {
        total: items.reduce((s, i) => s + (Number(i.total_liquido) || 0), 0),
        count: items.length,
      };
    },
    enabled: isGestorRH || isExecutivo,
  });

  // Metas por status (para gráfico)
  const metasPorStatus = (() => {
    const statusMap: Record<string, number> = {};
    metasGoverno.forEach((m) => {
      const s = m.status || "indefinido";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  })();

  // Progresso médio das metas (valor_atual / meta_valor)
  const progressoMedioMetas = (() => {
    const validas = metasGoverno.filter((m) => m.meta_valor && m.meta_valor > 0);
    if (!validas.length) return 0;
    const avg = validas.reduce((s, m) => s + ((m.valor_atual || 0) / m.meta_valor!) * 100, 0) / validas.length;
    return Math.round(avg);
  })();

  return {
    isExecutivo,
    isGestorRH,
    municipio,
    secretariaAtiva,
    totalServidores,
    servidoresPendentes,
    totalSecretarias,
    metasGoverno,
    metasPorStatus,
    progressoMedioMetas,
    obrasAndamento,
    alertasPendentes,
    notificacoesRecentes,
    folhaMes,
  };
}
