import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Type aligned with actual database schema
export type Falta = {
  id: string;
  aluno_id: string;
  data: string;
  justificada?: boolean | null;
  motivo?: string | null;
  created_at?: string;
  // Relations
  aluno?: { nome: string; numero_matricula: string } | null;
};

export function useFaltas() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaltas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faltas')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula)
        `)
        .order('data', { ascending: false });

      if (error) throw error;
      setFaltas((data as unknown as Falta[]) || []);
    } catch (err) {
      console.error('Erro ao buscar faltas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createFalta = async (faltaData: Omit<Falta, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('faltas')
        .insert([faltaData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchFaltas();
      return data;
    } catch (err) {
      console.error('Erro ao criar falta:', err);
      throw err;
    }
  };

  const updateFalta = async (id: string, faltaData: Partial<Falta>) => {
    try {
      const { data, error } = await supabase
        .from('faltas')
        .update(faltaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchFaltas();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar falta:', err);
      throw err;
    }
  };

  const deleteFalta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faltas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchFaltas();
    } catch (err) {
      console.error('Erro ao deletar falta:', err);
      throw err;
    }
  };

  const getFaltasByAluno = async (alunoId: string, dataInicio?: string, dataFim?: string) => {
    try {
      let query = supabase
        .from('faltas')
        .select('*')
        .eq('aluno_id', alunoId);

      if (dataInicio && dataFim) {
        query = query.gte('data', dataInicio).lte('data', dataFim);
      }

      const { data, error } = await query.order('data', { ascending: false });
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar faltas por aluno:', err);
      throw err;
    }
  };

  const getResumoFaltas = async (alunoId: string, anoLetivo: number) => {
    try {
      const { data, error } = await supabase
        .from('faltas')
        .select('justificada')
        .eq('aluno_id', alunoId)
        .gte('data', `${anoLetivo}-01-01`)
        .lt('data', `${anoLetivo + 1}-01-01`);

      if (error) throw error;

      const resumo = {
        total: data?.length || 0,
        justificadas: data?.filter(f => f.justificada).length || 0,
        injustificadas: data?.filter(f => !f.justificada).length || 0,
      };

      return resumo;
    } catch (err) {
      console.error('Erro ao buscar resumo de faltas:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFaltas();
  }, []);

  return {
    faltas,
    loading,
    error,
    createFalta,
    updateFalta,
    deleteFalta,
    getFaltasByAluno,
    getResumoFaltas,
    refreshFaltas: fetchFaltas
  };
}
