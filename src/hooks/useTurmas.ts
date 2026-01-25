import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Turma = {
  id: string;
  nome: string;
  serie?: string | null;
  ano_letivo: number;
  turno?: string | null;
  modalidade?: string | null;
  capacidade?: number | null;
  sala?: string | null;
  status?: string | null;
  escola_id: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  escola?: { nome: string };
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
          escola:escolas(nome)
        `)
        .order('nome');

      if (error) throw error;
      setTurmas((data as unknown as Turma[]) || []);
    } catch (err) {
      console.error('Erro ao buscar turmas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createTurma = async (turmaData: Omit<Turma, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .insert([{
          nome: turmaData.nome,
          serie: turmaData.serie,
          ano_letivo: turmaData.ano_letivo,
          turno: turmaData.turno,
          modalidade: turmaData.modalidade,
          capacidade: turmaData.capacidade,
          sala: turmaData.sala,
          status: turmaData.status,
          escola_id: turmaData.escola_id
        }])
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
