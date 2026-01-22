import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Escola = {
  id: string;
  nome: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  diretor?: string;
  tipo?: string;
  status?: string;
  capacidade?: number;
  capacidade_total?: number;
  codigo_mec?: string;
  cnpj?: string;
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  tem_biblioteca?: boolean;
  tem_laboratorio_informatica?: boolean;
  tem_quadra_esportes?: boolean;
  tem_cozinha?: boolean;
  tem_refeitorio?: boolean;
  tem_sala_professores?: boolean;
  tem_sala_diretoria?: boolean;
  tem_secretaria?: boolean;
  acessibilidade_cadeirante?: boolean;
  internet_banda_larga?: boolean;
  energia_eletrica?: boolean;
  agua_potavel?: boolean;
  esgoto_sanitario?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
};

export function useEscolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEscolas = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from("escolas" as any) as any).select('*').order('nome');
      if (error) throw error;
      setEscolas((data || []) as Escola[]);
    } catch (err) {
      console.error('Erro ao buscar escolas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally { setLoading(false); }
  };

  const createEscola = async (escolaData: Omit<Escola, 'id'>) => {
    try {
      const { data, error } = await (supabase.from("escolas" as any) as any).insert([escolaData]).select().single();
      if (error) throw error;
      await fetchEscolas();
      return data;
    } catch (err) { console.error('Erro ao criar escola:', err); throw err; }
  };

  const updateEscola = async (id: string, escolaData: Partial<Escola>) => {
    try {
      const { data, error } = await (supabase.from("escolas" as any) as any).update(escolaData).eq('id', id).select().single();
      if (error) throw error;
      await fetchEscolas();
      return data;
    } catch (err) { console.error('Erro ao atualizar escola:', err); throw err; }
  };

  const deleteEscola = async (id: string) => {
    try {
      const { error } = await (supabase.from("escolas" as any) as any).delete().eq('id', id);
      if (error) throw error;
      await fetchEscolas();
    } catch (err) { console.error('Erro ao deletar escola:', err); throw err; }
  };

  useEffect(() => { fetchEscolas(); }, []);

  return { escolas, loading, error, createEscola, updateEscola, deleteEscola, refreshEscolas: fetchEscolas };
}
