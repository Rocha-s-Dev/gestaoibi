import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProfessorTurma = {
  id: string;
  professor_id: string;
  turma_id: string;
  disciplina_id: string | null;
  turno: string | null;
  ano_letivo: number;
  created_at: string;
  turma?: { nome: string; serie: string } | null;
  disciplina?: { nome: string } | null;
};

export function useProfessorTurmas(professorId?: string) {
  const [vinculos, setVinculos] = useState<ProfessorTurma[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchVinculos = useCallback(async () => {
    if (!professorId) { setVinculos([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("professor_turma")
        .select(`*, turma:turmas(nome, serie), disciplina:disciplinas(nome)`)
        .eq("professor_id", professorId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setVinculos((data as any[]) || []);
    } catch (err) {
      console.error("Erro ao buscar vínculos professor-turma:", err);
    } finally {
      setLoading(false);
    }
  }, [professorId]);

  useEffect(() => { fetchVinculos(); }, [fetchVinculos]);

  const addVinculo = async (data: { professor_id: string; turma_id: string; disciplina_id?: string; turno?: string; ano_letivo?: number }) => {
    const { error } = await supabase.from("professor_turma").insert([data as any]);
    if (error) throw error;
    await fetchVinculos();
  };

  const removeVinculo = async (id: string) => {
    const { error } = await supabase.from("professor_turma").delete().eq("id", id);
    if (error) throw error;
    await fetchVinculos();
  };

  return { vinculos, loading, addVinculo, removeVinculo, refreshVinculos: fetchVinculos };
}

// Fetch all professor-turma for a specific turma
export function useTurmaProfessores(turmaId?: string) {
  const [professores, setProfessores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!turmaId) { setProfessores([]); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("professor_turma")
        .select(`*, disciplina:disciplinas(nome), professor:professores(id, user_id, profiles:user_id(name))`)
        .eq("turma_id", turmaId);
      if (error) throw error;
      setProfessores((data as any[]) || []);
    } catch (err) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [turmaId]);

  useEffect(() => { fetch(); }, [fetch]);
  return { professores, loading, refresh: fetch };
}
