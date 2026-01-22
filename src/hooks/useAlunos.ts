import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Aluno = {
  id: string;
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string;
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
  data_matricula?: string;
  escola_id?: string;
  turma_id?: string;
  turma_atual_id?: string;
  situacao?: string;
  status?: string;
  observacoes?: string;
  necessidades_especiais?: string;
  responsavel_nome?: string;
  responsavel_telefone?: string;
  responsavel_email?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

export type Responsavel = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  grau_parentesco: string;
  [key: string]: any;
};

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from("alunos" as any) as any)
        .select(`*, escola:escolas(nome), turma_atual:turmas(nome)`)
        .order('nome');
      if (error) throw error;
      setAlunos((data || []) as Aluno[]);
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createAluno = async (alunoData: Omit<Aluno, 'id' | 'numero_matricula'>) => {
    try {
      const numeroMatricula = `MAT${Date.now()}`;
      const { data, error } = await (supabase.from("alunos" as any) as any)
        .insert([{ ...alunoData, numero_matricula: numeroMatricula }]).select().single();
      if (error) throw error;
      await fetchAlunos();
      return data;
    } catch (err) { console.error('Erro ao criar aluno:', err); throw err; }
  };

  const updateAluno = async (id: string, alunoData: Partial<Aluno>) => {
    try {
      const { data, error } = await (supabase.from("alunos" as any) as any)
        .update(alunoData).eq('id', id).select().single();
      if (error) throw error;
      await fetchAlunos();
      return data;
    } catch (err) { console.error('Erro ao atualizar aluno:', err); throw err; }
  };

  const deleteAluno = async (id: string) => {
    try {
      const { error } = await (supabase.from("alunos" as any) as any).delete().eq('id', id);
      if (error) throw error;
      await fetchAlunos();
    } catch (err) { console.error('Erro ao deletar aluno:', err); throw err; }
  };

  useEffect(() => { fetchAlunos(); }, []);

  return { alunos, loading, error, createAluno, updateAluno, deleteAluno, refreshAlunos: fetchAlunos };
}

export function useResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponsaveis = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from("responsaveis_alunos" as any) as any).select('*').order('created_at');
      if (error) throw error;
      setResponsaveis((data || []) as Responsavel[]);
    } catch (err) {
      console.error('Erro ao buscar responsáveis:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally { setLoading(false); }
  };

  const createResponsavel = async (responsavelData: Omit<Responsavel, 'id'>) => {
    try {
      const { data, error } = await (supabase.from("responsaveis_alunos" as any) as any).insert([responsavelData]).select().single();
      if (error) throw error;
      await fetchResponsaveis();
      return data;
    } catch (err) { console.error('Erro ao criar responsável:', err); throw err; }
  };

  useEffect(() => { fetchResponsaveis(); }, []);

  return { responsaveis, loading, error, createResponsavel, refreshResponsaveis: fetchResponsaveis };
}
