import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Professor = {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  especialidade: string | null;
  escola_id: string | null;
  user_id: string | null;
  escola_principal?: { nome: string } | null;
  [key: string]: unknown;
};

export function useProfessores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('professores')
        .select(`
          *,
          escola_principal:escolas(nome)
        `)
        .order('nome');

      if (error) throw error;
      setProfessores(data as unknown as Professor[] || []);
    } catch (err) {
      console.error('Erro ao buscar professores:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createProfessor = async (professorData: Omit<Professor, 'id'>) => {
    try {
      const { escola_principal, ...insertData } = professorData;
      const { data, error } = await supabase
        .from('professores')
        .insert([insertData as any])
        .select()
        .single();

      if (error) throw error;
      
      await fetchProfessores();
      return data;
    } catch (err) {
      console.error('Erro ao criar professor:', err);
      throw err;
    }
  };

  const updateProfessor = async (id: string, professorData: Partial<Professor>) => {
    try {
      const { escola_principal, ...updateData } = professorData;
      const { data, error } = await supabase
        .from('professores')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchProfessores();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar professor:', err);
      throw err;
    }
  };

  const deleteProfessor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProfessores();
    } catch (err) {
      console.error('Erro ao deletar professor:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  return {
    professores,
    loading,
    error,
    createProfessor,
    updateProfessor,
    deleteProfessor,
    refreshProfessores: fetchProfessores
  };
}
