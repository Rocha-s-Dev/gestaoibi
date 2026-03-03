import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ProfessorDisciplina = {
  id: string;
  professor_id: string;
  disciplina_id: string;
  created_at: string;
};

export function useProfessorDisciplinas(professorId?: string) {
  const [disciplinaIds, setDisciplinaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDisciplinas = async (profId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professor_disciplinas')
        .select('disciplina_id')
        .eq('professor_id', profId);

      if (error) throw error;
      setDisciplinaIds((data || []).map((d: any) => d.disciplina_id));
    } catch (err) {
      console.error('Erro ao buscar disciplinas do professor:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveDisciplinas = async (profId: string, newDisciplinaIds: string[]) => {
    try {
      // Remove all existing
      await supabase
        .from('professor_disciplinas')
        .delete()
        .eq('professor_id', profId);

      // Insert new ones
      if (newDisciplinaIds.length > 0) {
        const { error } = await supabase
          .from('professor_disciplinas')
          .insert(newDisciplinaIds.map(did => ({
            professor_id: profId,
            disciplina_id: did,
          })));

        if (error) throw error;
      }

      setDisciplinaIds(newDisciplinaIds);
    } catch (err) {
      console.error('Erro ao salvar disciplinas do professor:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (professorId) {
      fetchDisciplinas(professorId);
    }
  }, [professorId]);

  return {
    disciplinaIds,
    loading,
    saveDisciplinas,
    fetchDisciplinas,
  };
}
