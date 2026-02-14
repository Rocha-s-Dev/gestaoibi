import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function useCrudTable(tableName: string, label: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from(tableName as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(`Erro ao carregar ${label}: ${error.message}`);
    else setData(rows || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const add = async (item: any) => {
    const { error } = await supabase.from(tableName as any).insert(item);
    if (error) { toast.error(`Erro ao adicionar ${label}: ${error.message}`); return false; }
    toast.success(`${label} registrado(a) com sucesso!`);
    fetch();
    return true;
  };

  const update = async (id: string, item: any) => {
    const { error } = await supabase.from(tableName as any).update(item).eq("id", id);
    if (error) { toast.error(`Erro ao atualizar ${label}: ${error.message}`); return false; }
    toast.success(`${label} atualizado(a) com sucesso!`);
    fetch();
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from(tableName as any).delete().eq("id", id);
    if (error) { toast.error(`Erro ao excluir ${label}: ${error.message}`); return false; }
    toast.success(`${label} excluído(a) com sucesso!`);
    fetch();
    return true;
  };

  return { data, loading, fetch, add, update, remove };
}

export function useOuvidoria() {
  return useCrudTable("manifestacoes_ouvidoria", "Manifestação");
}

export function usePontosIluminacao() {
  return useCrudTable("pontos_iluminacao", "Ponto de iluminação");
}

export function useSolicitacoesIluminacao() {
  return useCrudTable("solicitacoes_iluminacao", "Solicitação");
}
