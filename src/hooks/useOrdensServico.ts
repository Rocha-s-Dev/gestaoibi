import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const STATUS_OS = [
  { value: "aberta", label: "Aberta", color: "bg-blue-100 text-blue-800" },
  { value: "designada", label: "Designada", color: "bg-purple-100 text-purple-800" },
  { value: "em_execucao", label: "Em execução", color: "bg-amber-100 text-amber-800" },
  { value: "suspensa", label: "Suspensa", color: "bg-orange-100 text-orange-800" },
  { value: "concluida", label: "Concluída", color: "bg-green-100 text-green-800" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-100 text-red-800" },
];

export const PRIORIDADES_OS = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export interface ServicoTipo {
  id: string;
  nome: string;
  categoria: string | null;
  unidade_medida: string | null;
  descricao: string | null;
  ativo: boolean;
}

export interface OrdemServico {
  id: string;
  numero_os: string | null;
  tipo_id: string | null;
  tipo_nome: string | null;
  categoria: string | null;
  prioridade: string;
  status: string;
  data_abertura: string | null;
  data_prevista: string | null;
  data_conclusao: string | null;
  solicitante_nome: string | null;
  solicitante_contato: string | null;
  bairro: string | null;
  endereco: string | null;
  referencia: string | null;
  latitude: number | null;
  longitude: number | null;
  descricao: string | null;
  observacoes: string | null;
  equipe_id: string | null;
  responsavel_id: string | null;
  quantidade_prevista: number | null;
  quantidade_executada: number | null;
  valor_estimado: number | null;
  valor_executado: number | null;
  obra_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrdemExecucao {
  id: string;
  ordem_id: string;
  data: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  equipe_id: string | null;
  equipe_presente: string | null;
  quantidade_executada: number | null;
  unidade: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface OrdemMaterial {
  id: string;
  ordem_id: string;
  execucao_id: string | null;
  material: string;
  quantidade: number | null;
  unidade: string | null;
  valor_estimado: number | null;
  valor_utilizado: number | null;
  observacoes: string | null;
  created_at: string;
}

export interface OrdemEquipamentoUso {
  id: string;
  ordem_id: string;
  equipamento_id: string | null;
  equipamento_nome: string | null;
  horas_utilizadas: number | null;
  km_utilizados: number | null;
  observacoes: string | null;
  created_at: string;
}

export interface OrdemHistorico {
  id: string;
  ordem_id: string;
  tipo: string | null;
  titulo: string;
  descricao: string | null;
  created_at: string;
}

export interface OrdemDesignacao {
  id: string;
  ordem_id: string;
  equipe_id: string | null;
  equipe_nome: string | null;
  responsavel_nome: string | null;
  data_designacao: string | null;
  prazo: string | null;
  observacoes: string | null;
  created_at: string;
}

const t = (name: string) => supabase.from(name as any);

export function useServicosTipos() {
  const { data: tipos = [], isLoading } = useQuery({
    queryKey: ["servicos_tipos"],
    queryFn: async () => {
      const { data, error } = await t("servicos_tipos").select("*").eq("ativo", true).order("nome");
      if (error) throw error;
      return (data || []) as unknown as ServicoTipo[];
    },
  });
  return { tipos, isLoading };
}

export function useOrdensServico() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["servicos_ordens"] });

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ["servicos_ordens"],
    queryFn: async () => {
      const { data, error } = await t("servicos_ordens").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OrdemServico[];
    },
  });

  const createOrdem = useMutation({
    mutationFn: async (payload: Partial<OrdemServico>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await t("servicos_ordens").insert({ ...payload, created_by: auth.user?.id ?? null } as any);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Ordem de serviço criada."); },
    onError: (e: any) => toast.error(e.message || "Erro ao criar OS."),
  });

  const updateOrdem = useMutation({
    mutationFn: async ({ id, ...patch }: Partial<OrdemServico> & { id: string }) => {
      const { error } = await t("servicos_ordens").update(patch as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Ordem de serviço atualizada."); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar OS."),
  });

  const deleteOrdem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await t("servicos_ordens").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Ordem de serviço removida."); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover OS."),
  });

  return { ordens, isLoading, createOrdem, updateOrdem, deleteOrdem };
}

function useSubRecurso<T>(table: string, ordemId?: string, label = "Registro") {
  const qc = useQueryClient();
  const key = [table, ordemId];
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["servicos_ordens"] });
    qc.invalidateQueries({ queryKey: ["servicos_ordens_historico", ordemId] });
  };

  const { data: itens = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await t(table).select("*").eq("ordem_id", ordemId!).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as T[];
    },
    enabled: !!ordemId,
  });

  const create = useMutation({
    mutationFn: async (payload: any) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await t(table).insert({ ...payload, ordem_id: ordemId, created_by: auth.user?.id ?? null } as any);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success(`${label} registrado.`); },
    onError: (e: any) => toast.error(e.message || `Erro ao registrar ${label.toLowerCase()}.`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await t(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success(`${label} removido.`); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover."),
  });

  return { itens, isLoading, create, remove };
}

export function useOrdemExecucoes(ordemId?: string) {
  return useSubRecurso<OrdemExecucao>("servicos_ordens_execucoes", ordemId, "Execução");
}
export function useOrdemMateriais(ordemId?: string) {
  return useSubRecurso<OrdemMaterial>("servicos_ordens_materiais", ordemId, "Material");
}
export function useOrdemEquipamentosUso(ordemId?: string) {
  return useSubRecurso<OrdemEquipamentoUso>("servicos_ordens_equipamentos", ordemId, "Equipamento");
}
export function useOrdemDesignacoes(ordemId?: string) {
  return useSubRecurso<OrdemDesignacao>("servicos_ordens_designacoes", ordemId, "Designação");
}

export function useOrdemHistorico(ordemId?: string) {
  const { data: historico = [], isLoading } = useQuery({
    queryKey: ["servicos_ordens_historico", ordemId],
    queryFn: async () => {
      const { data, error } = await t("servicos_ordens_historico")
        .select("*").eq("ordem_id", ordemId!).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as OrdemHistorico[];
    },
    enabled: !!ordemId,
  });
  return { historico, isLoading };
}
