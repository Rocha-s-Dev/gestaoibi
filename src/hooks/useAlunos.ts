import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Type aligned with actual database schema
export type Aluno = {
  id: string;
  nome: string;
  cpf?: string | null;
  data_nascimento?: string | null;
  endereco?: string | null;
  numero_matricula: string;
  data_matricula?: string | null;
  escola_id?: string | null;
  turma_id?: string | null;
  situacao?: string | null;
  responsavel_nome?: string | null;
  responsavel_telefone?: string | null;
  responsavel_email?: string | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  escola?: { nome: string } | null;
  turma_atual?: { nome: string } | null;
};

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          escola:escolas(nome),
          turma_atual:turmas(nome)
        `)
        .order('nome');

      if (error) throw error;
      setAlunos((data as unknown as Aluno[]) || []);
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createAluno = async (alunoData: Omit<Aluno, 'id' | 'numero_matricula' | 'created_at' | 'updated_at'>) => {
    try {
      // Generate registration number manually
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const numeroMatricula = `${new Date().getFullYear()}${timestamp}${random}`;

      const { data, error } = await supabase
        .from('alunos')
        .insert([{ ...alunoData, numero_matricula: numeroMatricula }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchAlunos();
      return data;
    } catch (err) {
      console.error('Erro ao criar aluno:', err);
      throw err;
    }
  };

  const updateAluno = async (id: string, alunoData: Partial<Aluno>) => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .update(alunoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchAlunos();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar aluno:', err);
      throw err;
    }
  };

  const deleteAluno = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchAlunos();
    } catch (err) {
      console.error('Erro ao deletar aluno:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  return {
    alunos,
    loading,
    error,
    createAluno,
    updateAluno,
    deleteAluno,
    refreshAlunos: fetchAlunos
  };
}
