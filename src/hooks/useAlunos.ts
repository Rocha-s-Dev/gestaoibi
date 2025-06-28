
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Aluno = {
  id: string;
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento: string;
  genero?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  numero_endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  numero_matricula: string;
  data_matricula: string;
  escola_id: string;
  turma_atual_id?: string;
  status: 'matriculado' | 'transferido' | 'evadido' | 'concluido';
  observacoes?: string;
  necessidades_especiais?: string;
  created_at?: string;
  updated_at?: string;
};

export type Responsavel = {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  genero?: string;
  telefone: string;
  email?: string;
  endereco?: string;
  numero_endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  profissao?: string;
  local_trabalho?: string;
  telefone_trabalho?: string;
  grau_parentesco: string;
  created_at?: string;
  updated_at?: string;
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
      setAlunos(data || []);
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createAluno = async (alunoData: Omit<Aluno, 'id' | 'numero_matricula'>) => {
    try {
      // Gerar número de matrícula automaticamente
      const { data: numeroMatricula, error: matriculaError } = await supabase
        .rpc('gerar_numero_matricula');

      if (matriculaError) throw matriculaError;

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

export function useResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponsaveis = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('responsaveis')
        .select('*')
        .order('nome');

      if (error) throw error;
      setResponsaveis(data || []);
    } catch (err) {
      console.error('Erro ao buscar responsáveis:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createResponsavel = async (responsavelData: Omit<Responsavel, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('responsaveis')
        .insert([responsavelData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchResponsaveis();
      return data;
    } catch (err) {
      console.error('Erro ao criar responsável:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchResponsaveis();
  }, []);

  return {
    responsaveis,
    loading,
    error,
    createResponsavel,
    refreshResponsaveis: fetchResponsaveis
  };
}
