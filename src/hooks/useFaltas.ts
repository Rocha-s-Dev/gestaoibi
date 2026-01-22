import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Falta = {
  id: string;
  aluno_id: string;
  data: string;
  data_falta?: string;
  disciplina_id?: string;
  professor_id?: string;
  turma_id?: string;
  tipo?: 'justificada' | 'injustificada';
  justificada?: boolean;
  justificativa?: string;
  motivo?: string;
  created_at?: string;
  aluno?: { nome: string; numero_matricula: string };
  disciplina?: { nome: string };
  professor?: { nome: string };
  turma?: { nome: string };
  [key: string]: any;
};

export function useFaltas() {
  const [faltas, setFaltas] = useState<Falta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaltas = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from("faltas" as any) as any)
        .select(`*, aluno:alunos(nome, numero_matricula)`)
        .order('data', { ascending: false });
      if (error) throw error;
      setFaltas((data || []) as Falta[]);
    } catch (err) {
      console.error('Erro ao buscar faltas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally { setLoading(false); }
  };

  const createFalta = async (faltaData: Omit<Falta, 'id'>) => {
    try {
      const { data, error } = await (supabase.from("faltas" as any) as any).insert([faltaData]).select().single();
      if (error) throw error;
      await fetchFaltas();
      return data;
    } catch (err) { console.error('Erro ao criar falta:', err); throw err; }
  };

  const updateFalta = async (id: string, faltaData: Partial<Falta>) => {
    try {
      const { data, error } = await (supabase.from("faltas" as any) as any).update(faltaData).eq('id', id).select().single();
      if (error) throw error;
      await fetchFaltas();
      return data;
    } catch (err) { console.error('Erro ao atualizar falta:', err); throw err; }
  };

  const deleteFalta = async (id: string) => {
    try {
      const { error } = await (supabase.from("faltas" as any) as any).delete().eq('id', id);
      if (error) throw error;
      await fetchFaltas();
    } catch (err) { console.error('Erro ao deletar falta:', err); throw err; }
  };

  const getFaltasByTurma = async (turmaId: string) => {
    const { data } = await (supabase.from("faltas" as any) as any).select(`*, aluno:alunos(nome, numero_matricula)`);
    return (data || []) as Falta[];
  };

  const getFaltasByAluno = async (alunoId: string) => {
    const { data } = await (supabase.from("faltas" as any) as any).select(`*`).eq('aluno_id', alunoId).order('data', { ascending: false });
    return (data || []) as Falta[];
  };

  const getResumoFaltas = async (alunoId: string, anoLetivo: number) => {
    const { data } = await (supabase.from("faltas" as any) as any).select('justificada').eq('aluno_id', alunoId);
    const faltasData = (data || []) as any[];
    return { total: faltasData.length, justificadas: faltasData.filter((f: any) => f.justificada).length, injustificadas: faltasData.filter((f: any) => !f.justificada).length };
  };

  useEffect(() => { fetchFaltas(); }, []);

  return { faltas, loading, error, createFalta, updateFalta, deleteFalta, getFaltasByTurma, getFaltasByAluno, getResumoFaltas, refreshFaltas: fetchFaltas };
}
