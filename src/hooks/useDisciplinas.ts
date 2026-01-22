import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Disciplina = {
  id: string;
  nome: string;
  codigo?: string;
  carga_horaria?: number;
  created_at?: string;
};

export function useDisciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisciplinas = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from("disciplinas" as any) as any)
        .select('*')
        .order('nome');

      if (error) throw error;
      setDisciplinas((data || []) as Disciplina[]);
    } catch (err) {
      console.error('Erro ao buscar disciplinas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createDisciplina = async (disciplinaData: Omit<Disciplina, 'id'>) => {
    try {
      const { data, error } = await (supabase.from("disciplinas" as any) as any)
        .insert([disciplinaData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDisciplinas();
      return data;
    } catch (err) {
      console.error('Erro ao criar disciplina:', err);
      throw err;
    }
  };

  const updateDisciplina = async (id: string, disciplinaData: Partial<Disciplina>) => {
    try {
      const { data, error } = await (supabase.from("disciplinas" as any) as any)
        .update(disciplinaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchDisciplinas();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar disciplina:', err);
      throw err;
    }
  };

  const deleteDisciplina = async (id: string) => {
    try {
      const { error } = await (supabase.from("disciplinas" as any) as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchDisciplinas();
    } catch (err) {
      console.error('Erro ao deletar disciplina:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchDisciplinas();
  }, []);

  return {
    disciplinas,
    loading,
    error,
    createDisciplina,
    updateDisciplina,
    deleteDisciplina,
    refreshDisciplinas: fetchDisciplinas
  };
}
