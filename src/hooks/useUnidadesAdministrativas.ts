import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UnidadeAdministrativa {
  id: string;
  secretaria_id: string;
  unidade_superior_id: string | null;
  nome: string;
  sigla: string | null;
  tipo: "administrativa" | "operacional" | "tecnica";
  nivel: number;
  codigo: string | null;
  missao: string | null;
  atribuicoes: string | null;
  qtd_cargos_previstos: number;
  qtd_cargos_ocupados: number;
  responsavel_id: string | null;
  email: string | null;
  telefone: string | null;
  localizacao: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  children?: UnidadeAdministrativa[];
}

type UnidadeInsert = {
  secretaria_id: string;
  unidade_superior_id?: string;
  nome: string;
  sigla?: string;
  tipo?: "administrativa" | "operacional" | "tecnica";
  nivel?: number;
  codigo?: string;
  missao?: string;
  atribuicoes?: string;
  qtd_cargos_previstos?: number;
  email?: string;
  telefone?: string;
  localizacao?: string;
};

type UnidadeUpdate = Partial<UnidadeInsert> & { id: string };

export function useUnidadesAdministrativas(secretariaId?: string) {
  const queryClient = useQueryClient();

  const { data: unidades = [], isLoading, error } = useQuery({
    queryKey: ["unidades-administrativas", secretariaId],
    queryFn: async () => {
      let query = supabase
        .from("unidades_administrativas")
        .select("*")
        .order("nivel", { ascending: true })
        .order("nome", { ascending: true });

      if (secretariaId) {
        query = query.eq("secretaria_id", secretariaId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UnidadeAdministrativa[];
    },
    enabled: !!secretariaId || secretariaId === undefined,
  });

  // Build tree structure
  const unidadesTree = buildTree(unidades);

  const createUnidade = useMutation({
    mutationFn: async (data: UnidadeInsert) => {
      const { data: result, error } = await supabase
        .from("unidades_administrativas")
        .insert({
          ...data,
          tipo: data.tipo || "administrativa",
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades-administrativas"] });
      toast.success("Unidade criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar unidade:", error);
      toast.error("Erro ao criar unidade");
    },
  });

  const updateUnidade = useMutation({
    mutationFn: async ({ id, ...data }: UnidadeUpdate) => {
      const { data: result, error } = await supabase
        .from("unidades_administrativas")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades-administrativas"] });
      toast.success("Unidade atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar unidade:", error);
      toast.error("Erro ao atualizar unidade");
    },
  });

  const deleteUnidade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("unidades_administrativas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidades-administrativas"] });
      toast.success("Unidade removida com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao remover unidade:", error);
      toast.error("Erro ao remover unidade");
    },
  });

  return {
    unidades,
    unidadesTree,
    isLoading,
    error,
    createUnidade,
    updateUnidade,
    deleteUnidade,
  };
}

function buildTree(unidades: UnidadeAdministrativa[]): UnidadeAdministrativa[] {
  const map = new Map<string, UnidadeAdministrativa>();
  const roots: UnidadeAdministrativa[] = [];

  // Create a map of all unidades
  unidades.forEach((u) => {
    map.set(u.id, { ...u, children: [] });
  });

  // Build tree
  unidades.forEach((u) => {
    const node = map.get(u.id)!;
    if (u.unidade_superior_id && map.has(u.unidade_superior_id)) {
      map.get(u.unidade_superior_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
