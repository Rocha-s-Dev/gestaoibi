import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Nota = {
  id: string;
  aluno_id: string;
  disciplina_id: string;
  turma_id: string | null;
  trimestre: number;
  ano_letivo: number | null;
  nota: number | null;
  fechada: boolean | null;
  observacoes: string | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  aluno?: { nome: string; numero_matricula: string };
  disciplina?: { nome: string };
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
          turma:turmas(nome)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotas((data as unknown as Nota[]) || []);
    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createNota = async (notaData: Omit<Nota, 'id' | 'created_at' | 'updated_at' | 'aluno' | 'disciplina' | 'turma'>) => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .insert([{
          aluno_id: notaData.aluno_id,
          disciplina_id: notaData.disciplina_id,
          turma_id: notaData.turma_id,
          trimestre: notaData.trimestre,
          ano_letivo: notaData.ano_letivo,
          nota: notaData.nota,
          observacoes: notaData.observacoes,
          fechada: notaData.fechada || false
        }] as any)
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
        .update({
          nota: notaData.nota,
          observacoes: notaData.observacoes,
          fechada: notaData.fechada
        })
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

  const getNotasByTurma = async (turmaId: string, trimestre?: number) => {
    try {
      let query = supabase
        .from('notas')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula),
          disciplina:disciplinas(nome)
        `)
        .eq('turma_id', turmaId);

      if (trimestre) {
        query = query.eq('trimestre', trimestre);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data as unknown as Nota[]) || [];
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
          turma:turmas(nome)
        `)
        .eq('aluno_id', alunoId);

      if (anoLetivo) {
        query = query.eq('ano_letivo', anoLetivo);
      }

      const { data, error } = await (query.order('trimestre') as any);
      if (error) throw error;
      
      return (data as unknown as Nota[]) || [];
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
