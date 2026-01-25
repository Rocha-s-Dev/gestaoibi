import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Type aligned with actual database schema
export type Escola = {
  id: string;
  nome: string;
  endereco?: string | null;
  telefone?: string | null;
  email?: string | null;
  diretor?: string | null;
  tipo?: string | null;
  capacidade?: number | null;
  created_at?: string;
  updated_at?: string;
};

export function useEscolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEscolas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escolas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setEscolas((data as Escola[]) || []);
    } catch (err) {
      console.error('Erro ao buscar escolas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createEscola = async (escolaData: Omit<Escola, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .insert([escolaData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchEscolas();
      return data;
    } catch (err) {
      console.error('Erro ao criar escola:', err);
      throw err;
    }
  };

  const updateEscola = async (id: string, escolaData: Partial<Escola>) => {
    try {
      const { data, error } = await supabase
        .from('escolas')
        .update(escolaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchEscolas();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar escola:', err);
      throw err;
    }
  };

  const deleteEscola = async (id: string) => {
    try {
      const { error } = await supabase
        .from('escolas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchEscolas();
    } catch (err) {
      console.error('Erro ao deletar escola:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEscolas();
  }, []);

  return {
    escolas,
    loading,
    error,
    createEscola,
    updateEscola,
    deleteEscola,
    refreshEscolas: fetchEscolas
  };
}
