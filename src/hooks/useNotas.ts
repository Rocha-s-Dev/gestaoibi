import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Nota = {
  id: string;
  aluno_id: string;
  disciplina_id: string;
  professor_id: string;
  turma_id: string;
  bimestre: number;
  ano_letivo: number;
  nota: number | null;
  data_avaliacao: string | null;
  observacoes: string | null;
  tipo_avaliacao: string;
  created_at?: string;
  updated_at?: string;
  // Relations
  aluno?: { nome: string; numero_matricula: string };
  disciplina?: { nome: string };
  professor?: { nome: string };
  turma?: { nome: string };
};

export function useNotas() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notas')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula),
          disciplina:disciplinas(nome),
          professor:professores(nome),
          turma:turmas(nome)
        `)
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;
      setNotas(data || []);
    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createNota = async (notaData: Omit<Nota, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .insert([notaData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchNotas();
      return data;
    } catch (err) {
      console.error('Erro ao criar nota:', err);
      throw err;
    }
  };

  const updateNota = async (id: string, notaData: Partial<Nota>) => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .update(notaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchNotas();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar nota:', err);
      throw err;
    }
  };

  const deleteNota = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchNotas();
    } catch (err) {
      console.error('Erro ao deletar nota:', err);
      throw err;
    }
  };

  const getNotasByTurma = async (turmaId: string, bimestre?: number) => {
    try {
      let query = supabase
        .from('notas')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula),
          disciplina:disciplinas(nome),
          professor:professores(nome)
        `)
        .eq('turma_id', turmaId);

      if (bimestre) {
        query = query.eq('bimestre', bimestre);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar notas por turma:', err);
      throw err;
    }
  };

  const getNotasByAluno = async (alunoId: string, anoLetivo?: number) => {
    try {
      let query = supabase
        .from('notas')
        .select(`
          *,
          disciplina:disciplinas(nome),
          professor:professores(nome),
          turma:turmas(nome)
        `)
        .eq('aluno_id', alunoId);

      if (anoLetivo) {
        query = query.eq('ano_letivo', anoLetivo);
      }

      const { data, error } = await query.order('bimestre');
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar notas por aluno:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  return {
    notas,
    loading,
    error,
    createNota,
    updateNota,
    deleteNota,
    getNotasByTurma,
    getNotasByAluno,
    refreshNotas: fetchNotas
  };
}