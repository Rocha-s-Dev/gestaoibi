import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AuxiliarTurma = {
  id: string;
  auxiliar_id: string;
  turma_id: string;
  tipo_auxiliar: string;
  aluno_id: string | null;
  turno: string | null;
  ano_letivo: number;
  created_at: string;
  turma?: { nome: string; serie: string } | null;
  aluno?: { nome: string } | null;
};

export function useAuxiliarTurmas(auxiliarId?: string) {
  const [vinculos, setVinculos] = useState<AuxiliarTurma[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVinculos = useCallback(async () => {
    if (!auxiliarId) { setVinculos([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("auxiliar_turma")
        .select(`*, turma:turmas(nome, serie), aluno:alunos(nome)`)
        .eq("auxiliar_id", auxiliarId);
      if (error) throw error;
      setVinculos((data as any[]) || []);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [auxiliarId]);

  useEffect(() => { fetchVinculos(); }, [fetchVinculos]);

  const addVinculo = async (data: { auxiliar_id: string; turma_id: string; tipo_auxiliar: string; aluno_id?: string; turno?: string; ano_letivo?: number }) => {
    const { error } = await supabase.from("auxiliar_turma").insert([data as any]);
    if (error) throw error;
    await fetchVinculos();
  };

  const removeVinculo = async (id: string) => {
    const { error } = await supabase.from("auxiliar_turma").delete().eq("id", id);
    if (error) throw error;
    await fetchVinculos();
  };

  return { vinculos, loading, addVinculo, removeVinculo, refreshVinculos: fetchVinculos };
}

export function useTurmaAuxiliares(turmaId?: string) {
  const [auxiliares, setAuxiliares] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!turmaId) { setAuxiliares([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("auxiliar_turma")
        .select(`*, aluno:alunos(nome), auxiliar:auxiliares_classe(id, user_id, profiles:user_id(name))`)
        .eq("turma_id", turmaId);
      if (error) throw error;
      setAuxiliares((data as any[]) || []);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [turmaId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { auxiliares, loading, refresh: fetch };
}
