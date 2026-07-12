import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Obra {
  id: string;
  secretaria_id: string | null;
  numero_obra: string | null;
  numero_processo: string | null;
  numero_contrato: string | null;
  convenio: string | null;
  programa: string | null;
  fonte_recurso: string | null;
  categoria: string | null;
  tipo: string | null;
  situacao: string;
  nome: string;
  descricao: string | null;
  municipio: string | null;
  bairro: string | null;
  endereco: string | null;
  cep: string | null;
  latitude: number | null;
  longitude: number | null;
  empresa_executora: string | null;
  engenheiro_responsavel: string | null;
  fiscal_responsavel: string | null;
  secretaria_solicitante_id: string | null;
  valor_contratado: number | null;
  valor_executado: number | null;
  valor_medido: number | null;
  percentual_fisico: number | null;
  percentual_financeiro: number | null;
  data_inicio: string | null;
  previsao_conclusao: string | null;
  data_conclusao: string | null;
  art: string | null;
  crea: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const SITUACOES_OBRA = [
  { value: "planejamento", label: "Planejamento", color: "bg-blue-100 text-blue-800" },
  { value: "licitacao", label: "Em Licitação", color: "bg-purple-100 text-purple-800" },
  { value: "andamento", label: "Em Andamento", color: "bg-green-100 text-green-800" },
  { value: "parada", label: "Parada", color: "bg-yellow-100 text-yellow-800" },
  { value: "atrasada", label: "Atrasada", color: "bg-orange-100 text-orange-800" },
  { value: "concluida", label: "Concluída", color: "bg-gray-100 text-gray-800" },
  { value: "cancelada", label: "Cancelada", color: "bg-red-100 text-red-800" },
];

export const CATEGORIAS_OBRA = [
  "Edificação", "Pavimentação", "Saneamento", "Drenagem",
  "Iluminação", "Praça / Área verde", "Reforma", "Ampliação", "Outros",
];

export const TIPOS_OBRA = [
  "Nova", "Reforma", "Ampliação", "Manutenção", "Recuperação",
];

export function useObras() {
  const qc = useQueryClient();

  const { data: obras = [], isLoading } = useQuery({
    queryKey: ["obras"],
    queryFn: async () => {
      const { data, error } = await supabase.from("obras" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Obra[];
    },
  });

  const createObra = useMutation({
    mutationFn: async (payload: Partial<Obra>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("obras" as any).insert({ ...payload, created_by: auth.user?.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["obras"] }); toast.success("Obra cadastrada."); },
    onError: (e: any) => toast.error(e.message || "Erro ao cadastrar obra."),
  });

  const updateObra = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Obra> & { id: string }) => {
      const { error } = await supabase.from("obras" as any).update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["obras"] }); toast.success("Obra atualizada."); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar."),
  });

  const deleteObra = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obras" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["obras"] }); toast.success("Obra removida."); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover."),
  });

  return { obras, isLoading, createObra, updateObra, deleteObra };
}

/** Genérico para as sub-entidades da obra */
function useObraSubResource<T extends { id: string }>(table: string, obraId?: string) {
  const qc = useQueryClient();
  const queryKey = [table, obraId];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase.from(table as any).select("*").order("created_at", { ascending: false });
      if (obraId) q = q.eq("obra_id", obraId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as unknown as T[];
    },
    enabled: !!obraId,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<T>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from(table as any).insert({ ...payload, obra_id: obraId, created_by: auth.user?.id } as any);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success("Registro adicionado."); },
    onError: (e: any) => toast.error(e.message || "Erro ao salvar."),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<T> & { id: string }) => {
      const { error } = await supabase.from(table as any).update(payload as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success("Atualizado."); },
    onError: (e: any) => toast.error(e.message || "Erro ao atualizar."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey }); toast.success("Removido."); },
    onError: (e: any) => toast.error(e.message || "Erro ao remover."),
  });

  return { items, isLoading, create, update, remove };
}

export const useObraCronograma = (obraId?: string) => useObraSubResource<any>("obras_cronograma", obraId);
export const useObraDiario = (obraId?: string) => useObraSubResource<any>("obras_diario", obraId);
export const useObraMedicoes = (obraId?: string) => useObraSubResource<any>("obras_medicoes", obraId);
export const useObraFiscalizacoes = (obraId?: string) => useObraSubResource<any>("obras_fiscalizacoes", obraId);
export const useObraFotos = (obraId?: string) => useObraSubResource<any>("obras_fotos", obraId);

export function useObraHistorico(obraId?: string) {
  return useQuery({
    queryKey: ["obras_historico", obraId],
    queryFn: async () => {
      const { data, error } = await supabase.from("obras_historico" as any).select("*").eq("obra_id", obraId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!obraId,
  });
}

/** Upload de foto para bucket obras-fotos */
export async function uploadObraFoto(obraId: string, file: File, meta: { categoria: string; legenda?: string }) {
  const { data: auth } = await supabase.auth.getUser();
  const path = `${obraId}/${Date.now()}_${file.name}`;
  const up = await supabase.storage.from("obras-fotos").upload(path, file);
  if (up.error) throw up.error;
  const { error } = await supabase.from("obras_fotos" as any).insert({
    obra_id: obraId, categoria: meta.categoria, legenda: meta.legenda ?? null,
    arquivo_path: path, arquivo_nome: file.name, created_by: auth.user?.id,
  } as any);
  if (error) throw error;
}

export async function getFotoSignedUrl(path: string) {
  const { data, error } = await supabase.storage.from("obras-fotos").createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
