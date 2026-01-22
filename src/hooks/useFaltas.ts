import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Falta = {
  id: string;
  aluno_id: string;
  disciplina_id: string;
  professor_id: string;
  turma_id: string;
  data_falta: string;
  tipo: 'justificada' | 'injustificada';
  justificativa: string | null;
  created_at?: string;
  // Relations
  aluno?: { nome: string; numero_matricula: string };
  disciplina?: { nome: string };
  professor?: { nome: string };
  turma?: { nome: string };
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
          aluno:alunos(nome, numero_matricula),
          disciplina:disciplinas(nome),
          professor:professores(nome),
          turma:turmas(nome)
        `)
        .order('data_falta', { ascending: false });

      if (error) throw error;
      setFaltas(data || []);
    } catch (err) {
      console.error('Erro ao buscar faltas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createFalta = async (faltaData: Omit<Falta, 'id'>) => {
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

  const getFaltasByTurma = async (turmaId: string, dataInicio?: string, dataFim?: string) => {
    try {
      let query = supabase
        .from('faltas')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula),
          disciplina:disciplinas(nome),
          professor:professores(nome)
        `)
        .eq('turma_id', turmaId);

      if (dataInicio && dataFim) {
        query = query.gte('data_falta', dataInicio).lte('data_falta', dataFim);
      }

      const { data, error } = await query.order('data_falta', { ascending: false });
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar faltas por turma:', err);
      throw err;
    }
  };

  const getFaltasByAluno = async (alunoId: string, dataInicio?: string, dataFim?: string) => {
    try {
      let query = supabase
        .from('faltas')
        .select(`
          *,
          disciplina:disciplinas(nome),
          professor:professores(nome),
          turma:turmas(nome)
        `)
        .eq('aluno_id', alunoId);

      if (dataInicio && dataFim) {
        query = query.gte('data_falta', dataInicio).lte('data_falta', dataFim);
      }

      const { data, error } = await query.order('data_falta', { ascending: false });
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
        .select('tipo, disciplina:disciplinas(nome)')
        .eq('aluno_id', alunoId)
        .gte('data_falta', `${anoLetivo}-01-01`)
        .lt('data_falta', `${anoLetivo + 1}-01-01`);

      if (error) throw error;

      const resumo = {
        total: data?.length || 0,
        justificadas: data?.filter(f => f.tipo === 'justificada').length || 0,
        injustificadas: data?.filter(f => f.tipo === 'injustificada').length || 0,
        porDisciplina: {} as Record<string, number>
      };

      data?.forEach(falta => {
        const disciplina = falta.disciplina?.nome || 'Sem disciplina';
        resumo.porDisciplina[disciplina] = (resumo.porDisciplina[disciplina] || 0) + 1;
      });

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
    getFaltasByTurma,
    getFaltasByAluno,
    getResumoFaltas,
    refreshFaltas: fetchFaltas
  };
}