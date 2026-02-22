import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProgramasFederaisSaude() {
  const queryClient = useQueryClient();

  const { data: programas = [], isLoading } = useQuery({
    queryKey: ["programas_federais_saude"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programas_federais_saude")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: indicadores = [], isLoading: isLoadingIndicadores } = useQuery({
    queryKey: ["indicadores_programas_saude"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("indicadores_programas_saude")
        .select("*, programas_federais_saude:programa_id(nome)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((i: any) => ({
        ...i,
        programa_nome: i.programas_federais_saude?.nome || "—",
      }));
    },
  });

  const createPrograma = useMutation({
    mutationFn: async (data: { nome: string; tipo?: string; descricao?: string; meta_anual?: number }) => {
      const { error } = await supabase.from("programas_federais_saude").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programas_federais_saude"] });
      toast.success("Programa cadastrado");
    },
    onError: () => toast.error("Erro ao cadastrar programa"),
  });

  const updatePrograma = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; nome?: string; tipo?: string; descricao?: string; meta_anual?: number; percentual_execucao?: number; ativo?: boolean }) => {
      const { error } = await supabase.from("programas_federais_saude").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programas_federais_saude"] });
      toast.success("Programa atualizado");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const createIndicador = useMutation({
    mutationFn: async (data: { programa_id: string; nome: string; meta?: number; valor_atual?: number; unidade_medida?: string; competencia?: string }) => {
      const { error } = await supabase.from("indicadores_programas_saude").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicadores_programas_saude"] });
      toast.success("Indicador registrado");
    },
    onError: () => toast.error("Erro ao registrar indicador"),
  });

  const updateIndicador = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; valor_atual?: number; meta?: number }) => {
      const { error } = await supabase.from("indicadores_programas_saude").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicadores_programas_saude"] });
      toast.success("Indicador atualizado");
    },
    onError: () => toast.error("Erro ao atualizar indicador"),
  });

  return { programas, indicadores, isLoading, isLoadingIndicadores, createPrograma, updatePrograma, createIndicador, updateIndicador };
}
