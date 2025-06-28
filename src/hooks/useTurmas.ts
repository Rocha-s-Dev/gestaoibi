
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Turma = {
  id: string;
  nome: string;
  serie: string;
  ano_letivo: number;
  turno: 'matutino' | 'vespertino' | 'noturno' | 'integral';
  modalidade: 'infantil' | 'fundamental_i' | 'fundamental_ii' | 'eja' | 'creche';
  capacidade: number;
  sala?: string;
  status: string;
  escola_id: string;
  professor_responsavel_id?: string;
  created_at?: string;
  updated_at?: string;
};

export function useTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('turmas')
        .select(`
          *,
          escola:escolas(nome),
          professor_responsavel:professores(nome)
        `)
        .order('nome');

      if (error) throw error;
      setTurmas(data || []);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createTurma = async (turmaData: Omit<Turma, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .insert([turmaData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTurmas();
      return data;
    } catch (err) {
      console.error('Erro ao criar turma:', err);
      throw err;
    }
  };

  const updateTurma = async (id: string, turmaData: Partial<Turma>) => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .update(turmaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTurmas();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar turma:', err);
      throw err;
    }
  };

  const deleteTurma = async (id: string) => {
    try {
      const { error } = await supabase
        .from('turmas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchTurmas();
    } catch (err) {
      console.error('Erro ao deletar turma:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  return {
    turmas,
    loading,
    error,
    createTurma,
    updateTurma,
    deleteTurma,
    refreshTurmas: fetchTurmas
  };
}
