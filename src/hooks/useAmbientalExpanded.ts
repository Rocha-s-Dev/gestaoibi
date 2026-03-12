import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function useCrudAmbiental(table: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const { data: rows, error } = await (supabase as any)
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(`Erro ao carregar ${table}: ${error.message}`);
    else setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const add = async (item: any) => {
    const { error } = await (supabase as any).from(table).insert(item);
    if (error) { toast.error(`Erro ao adicionar: ${error.message}`); return false; }
    toast.success("Registro cadastrado com sucesso!");
    fetchData();
    return true;
  };

  const update = async (id: string, item: any) => {
    const { error } = await (supabase as any).from(table).update(item).eq("id", id);
    if (error) { toast.error(`Erro ao atualizar: ${error.message}`); return false; }
    toast.success("Registro atualizado com sucesso!");
    fetchData();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) { toast.error(`Erro ao excluir: ${error.message}`); return false; }
    toast.success("Registro excluído com sucesso!");
    fetchData();
    return true;
  };

  return { data, loading, fetch: fetchData, add, update, remove };
}

export function useFiscalizacoesAmbientais() {
  return useCrudAmbiental("fiscalizacoes_ambientais");
}

export function useAutosInfracaoAmbiental() {
  return useCrudAmbiental("autos_infracao_ambiental");
}

export function useEmpreendimentosAmbientais() {
  return useCrudAmbiental("empreendimentos_ambientais");
}

export function useAreasProtegidas() {
  return useCrudAmbiental("areas_protegidas");
}

export function useOcorrenciasQueimadas() {
  return useCrudAmbiental("ocorrencias_queimadas");
}

export function useResiduosSolidos() {
  return useCrudAmbiental("residuos_solidos");
}

export function useArvoresUrbanas() {
  return useCrudAmbiental("arvores_urbanas");
}

export function useEventosEducacaoAmbiental() {
  return useCrudAmbiental("eventos_educacao_ambiental");
}

export function useIndicadoresAmbientais() {
  return useCrudAmbiental("indicadores_ambientais");
}
