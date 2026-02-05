import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type MetaPlanoGoverno = Database["public"]["Tables"]["metas_plano_governo"]["Row"];
type MetaPlanoGovernoInsert = Database["public"]["Tables"]["metas_plano_governo"]["Insert"];
type AgendaGovernamental = Database["public"]["Tables"]["agenda_governamental"]["Row"];
type AgendaGovernamentalInsert = Database["public"]["Tables"]["agenda_governamental"]["Insert"];
type ObraPrioritaria = Database["public"]["Tables"]["obras_prioritarias"]["Row"];
type ObraPrioritariaInsert = Database["public"]["Tables"]["obras_prioritarias"]["Insert"];
type AtoAdministrativo = Database["public"]["Tables"]["atos_administrativos"]["Row"];
type AtoAdministrativoInsert = Database["public"]["Tables"]["atos_administrativos"]["Insert"];
type ComunicacaoInstitucional = Database["public"]["Tables"]["comunicacoes_institucionais"]["Row"];
type ComunicacaoInstitucionalInsert = Database["public"]["Tables"]["comunicacoes_institucionais"]["Insert"];
type AlertaExecutivo = Database["public"]["Tables"]["alertas_executivos"]["Row"];
type RelatorioExecutivo = Database["public"]["Tables"]["relatorios_executivos"]["Row"];
type RelatorioExecutivoInsert = Database["public"]["Tables"]["relatorios_executivos"]["Insert"];

// Hook para Metas do Plano de Governo
export function useMetasPlanoGoverno() {
  const queryClient = useQueryClient();

  const { data: metas, isLoading, error } = useQuery({
    queryKey: ["metas_plano_governo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metas_plano_governo")
        .select(`
          *,
          secretaria:secretaria_responsavel_id(id, nome, sigla)
        `)
        .order("prioridade", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createMeta = useMutation({
    mutationFn: async (meta: MetaPlanoGovernoInsert) => {
      const { data, error } = await supabase
        .from("metas_plano_governo")
        .insert(meta)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas_plano_governo"] });
      toast.success("Meta criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar meta:", error);
      toast.error("Erro ao criar meta");
    },
  });

  const updateMeta = useMutation({
    mutationFn: async ({ id, ...meta }: Partial<MetaPlanoGoverno> & { id: string }) => {
      const { data, error } = await supabase
        .from("metas_plano_governo")
        .update(meta)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas_plano_governo"] });
      toast.success("Meta atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar meta:", error);
      toast.error("Erro ao atualizar meta");
    },
  });

  const deleteMeta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("metas_plano_governo")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas_plano_governo"] });
      toast.success("Meta excluída com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir meta:", error);
      toast.error("Erro ao excluir meta");
    },
  });

  return { metas, isLoading, error, createMeta, updateMeta, deleteMeta };
}

// Hook para Agenda Governamental
export function useAgendaGovernamental() {
  const queryClient = useQueryClient();

  const { data: eventos, isLoading, error } = useQuery({
    queryKey: ["agenda_governamental"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agenda_governamental")
        .select("*")
        .order("data_inicio", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createEvento = useMutation({
    mutationFn: async (evento: AgendaGovernamentalInsert) => {
      const { data, error } = await supabase
        .from("agenda_governamental")
        .insert(evento)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda_governamental"] });
      toast.success("Evento criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar evento:", error);
      toast.error("Erro ao criar evento");
    },
  });

  const updateEvento = useMutation({
    mutationFn: async ({ id, ...evento }: Partial<AgendaGovernamental> & { id: string }) => {
      const { data, error } = await supabase
        .from("agenda_governamental")
        .update(evento)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda_governamental"] });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar evento:", error);
      toast.error("Erro ao atualizar evento");
    },
  });

  const deleteEvento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("agenda_governamental")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agenda_governamental"] });
      toast.success("Evento excluído com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao excluir evento:", error);
      toast.error("Erro ao excluir evento");
    },
  });

  return { eventos, isLoading, error, createEvento, updateEvento, deleteEvento };
}

// Hook para Obras Prioritárias
export function useObrasPrioritarias() {
  const queryClient = useQueryClient();

  const { data: obras, isLoading, error } = useQuery({
    queryKey: ["obras_prioritarias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("obras_prioritarias")
        .select(`
          *,
          secretaria:secretaria_responsavel_id(id, nome, sigla),
          contrato:contrato_id(id, numero, fornecedor)
        `)
        .order("prioridade", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const createObra = useMutation({
    mutationFn: async (obra: ObraPrioritariaInsert) => {
      const { data, error } = await supabase
        .from("obras_prioritarias")
        .insert(obra)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obras_prioritarias"] });
      toast.success("Obra prioritária cadastrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar obra:", error);
      toast.error("Erro ao cadastrar obra");
    },
  });

  const updateObra = useMutation({
    mutationFn: async ({ id, ...obra }: Partial<ObraPrioritaria> & { id: string }) => {
      const { data, error } = await supabase
        .from("obras_prioritarias")
        .update(obra)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obras_prioritarias"] });
      toast.success("Obra atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar obra:", error);
      toast.error("Erro ao atualizar obra");
    },
  });

  return { obras, isLoading, error, createObra, updateObra };
}

// Hook para Atos Administrativos
export function useAtosAdministrativos() {
  const queryClient = useQueryClient();

  const { data: atos, isLoading, error } = useQuery({
    queryKey: ["atos_administrativos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("atos_administrativos")
        .select(`
          *,
          secretaria:secretaria_origem_id(id, nome, sigla)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAto = useMutation({
    mutationFn: async (ato: AtoAdministrativoInsert) => {
      const { data, error } = await supabase
        .from("atos_administrativos")
        .insert(ato)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atos_administrativos"] });
      toast.success("Ato administrativo criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar ato:", error);
      toast.error("Erro ao criar ato administrativo");
    },
  });

  const updateAto = useMutation({
    mutationFn: async ({ id, ...ato }: Partial<AtoAdministrativo> & { id: string }) => {
      const { data, error } = await supabase
        .from("atos_administrativos")
        .update(ato)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["atos_administrativos"] });
      toast.success("Ato administrativo atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar ato:", error);
      toast.error("Erro ao atualizar ato");
    },
  });

  return { atos, isLoading, error, createAto, updateAto };
}

// Hook para Comunicações Institucionais
export function useComunicacoesInstitucionais() {
  const queryClient = useQueryClient();

  const { data: comunicacoes, isLoading, error } = useQuery({
    queryKey: ["comunicacoes_institucionais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comunicacoes_institucionais")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createComunicacao = useMutation({
    mutationFn: async (comunicacao: ComunicacaoInstitucionalInsert) => {
      const { data, error } = await supabase
        .from("comunicacoes_institucionais")
        .insert(comunicacao)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicacoes_institucionais"] });
      toast.success("Comunicação criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar comunicação:", error);
      toast.error("Erro ao criar comunicação");
    },
  });

  const updateComunicacao = useMutation({
    mutationFn: async ({ id, ...comunicacao }: Partial<ComunicacaoInstitucional> & { id: string }) => {
      const { data, error } = await supabase
        .from("comunicacoes_institucionais")
        .update(comunicacao)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comunicacoes_institucionais"] });
      toast.success("Comunicação atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar comunicação:", error);
      toast.error("Erro ao atualizar comunicação");
    },
  });

  return { comunicacoes, isLoading, error, createComunicacao, updateComunicacao };
}

// Hook para Alertas Executivos
export function useAlertasExecutivos() {
  const queryClient = useQueryClient();

  const { data: alertas, isLoading, error } = useQuery({
    queryKey: ["alertas_executivos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas_executivos")
        .select(`
          *,
          secretaria:secretaria_id(id, nome, sigla)
        `)
        .eq("status", "ativo")
        .order("prioridade", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const resolverAlerta = useMutation({
    mutationFn: async ({ id, resolucao }: { id: string; resolucao: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("alertas_executivos")
        .update({
          status: "resolvido",
          resolucao,
          data_resolucao: new Date().toISOString(),
          resolvido_por: user?.id,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas_executivos"] });
      toast.success("Alerta resolvido com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao resolver alerta:", error);
      toast.error("Erro ao resolver alerta");
    },
  });

  return { alertas, isLoading, error, resolverAlerta };
}

// Hook para Relatórios Executivos
export function useRelatoriosExecutivos() {
  const queryClient = useQueryClient();

  const { data: relatorios, isLoading, error } = useQuery({
    queryKey: ["relatorios_executivos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios_executivos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createRelatorio = useMutation({
    mutationFn: async (relatorio: RelatorioExecutivoInsert) => {
      const { data, error } = await supabase
        .from("relatorios_executivos")
        .insert(relatorio)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relatorios_executivos"] });
      toast.success("Relatório criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar relatório:", error);
      toast.error("Erro ao criar relatório");
    },
  });

  const updateRelatorio = useMutation({
    mutationFn: async ({ id, ...relatorio }: Partial<RelatorioExecutivo> & { id: string }) => {
      const { data, error } = await supabase
        .from("relatorios_executivos")
        .update(relatorio)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relatorios_executivos"] });
      toast.success("Relatório atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar relatório:", error);
      toast.error("Erro ao atualizar relatório");
    },
  });

  return { relatorios, isLoading, error, createRelatorio, updateRelatorio };
}

// Hook para Dashboard Estratégico (KPIs consolidados)
export function useDashboardEstrategico() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["dashboard_estrategico"],
    queryFn: async () => {
      // Buscar estatísticas consolidadas
      const [metasResult, obrasResult, alertasResult, atosResult] = await Promise.all([
        supabase.from("metas_plano_governo").select("status, prioridade"),
        supabase.from("obras_prioritarias").select("status, percentual_fisico, valor_total, valor_executado"),
        supabase.from("alertas_executivos").select("prioridade, tipo").eq("status", "ativo"),
        supabase.from("atos_administrativos").select("status, tipo"),
      ]);

      const metas = metasResult.data || [];
      const obras = obrasResult.data || [];
      const alertas = alertasResult.data || [];
      const atos = atosResult.data || [];

      return {
        metas: {
          total: metas.length,
          emAndamento: metas.filter(m => m.status === "em_andamento").length,
          concluidas: metas.filter(m => m.status === "concluida").length,
          atrasadas: metas.filter(m => m.status === "atrasada").length,
          criticas: metas.filter(m => m.prioridade === "critica").length,
        },
        obras: {
          total: obras.length,
          emExecucao: obras.filter(o => o.status === "em_execucao").length,
          concluidas: obras.filter(o => o.status === "concluida").length,
          paralisadas: obras.filter(o => o.status === "paralisada").length,
          mediaExecucao: obras.length > 0 
            ? obras.reduce((acc, o) => acc + (o.percentual_fisico || 0), 0) / obras.length 
            : 0,
          valorTotal: obras.reduce((acc, o) => acc + (o.valor_total || 0), 0),
          valorExecutado: obras.reduce((acc, o) => acc + (o.valor_executado || 0), 0),
        },
        alertas: {
          total: alertas.length,
          criticos: alertas.filter(a => a.prioridade === "critico").length,
          altos: alertas.filter(a => a.prioridade === "alto").length,
          financeiros: alertas.filter(a => a.tipo === "financeiro").length,
          juridicos: alertas.filter(a => a.tipo === "juridico").length,
          operacionais: alertas.filter(a => a.tipo === "operacional").length,
        },
        atos: {
          total: atos.length,
          publicados: atos.filter(a => a.status === "publicado").length,
          pendentes: atos.filter(a => ["rascunho", "em_analise_juridica", "aguardando_assinatura"].includes(a.status)).length,
        },
      };
    },
  });

  return { kpis, isLoading };
}
