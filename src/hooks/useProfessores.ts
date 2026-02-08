import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Professor = {
  id: string;
  user_id: string;
  especialidade?: string | null;
  escola_id?: string | null;
  secretaria_id?: string | null;
  created_at?: string;
  updated_at?: string;
  // Joined from profiles
  nome: string;
  email: string | null;
  cpf: string | null;
  // Relations
  escola_principal?: { nome: string } | null;
};

export function useProfessores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("professores")
        .select(`
          *,
          profiles:user_id(user_id, name, email, cpf),
          escola_principal:escolas!professores_escola_id_fkey(nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map joined profile data to flat structure
      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        especialidade: p.especialidade,
        escola_id: p.escola_id,
        secretaria_id: p.secretaria_id,
        created_at: p.created_at,
        updated_at: p.updated_at,
        nome: p.profiles?.name || "Sem nome",
        email: p.profiles?.email || null,
        cpf: p.profiles?.cpf || null,
        escola_principal: p.escola_principal,
      }));

      setProfessores(mapped);
    } catch (err) {
      console.error("Erro ao buscar professores:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const vincularProfessor = async (data: {
    user_id: string;
    especialidade?: string;
    escola_id?: string;
    secretaria_id?: string;
  }) => {
    try {
      const { data: result, error } = await supabase
        .from("professores")
        .insert([data as any])
        .select()
        .single();

      if (error) throw error;
      await fetchProfessores();
      return result;
    } catch (err) {
      console.error("Erro ao vincular professor:", err);
      throw err;
    }
  };

  const updateProfessor = async (id: string, data: Partial<{ especialidade: string; escola_id: string; secretaria_id: string }>) => {
    try {
      const { data: result, error } = await supabase
        .from("professores")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      await fetchProfessores();
      return result;
    } catch (err) {
      console.error("Erro ao atualizar professor:", err);
      throw err;
    }
  };

  const desvincularProfessor = async (id: string) => {
    try {
      const { error } = await supabase
        .from("professores")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchProfessores();
    } catch (err) {
      console.error("Erro ao desvincular professor:", err);
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
    vincularProfessor,
    updateProfessor,
    desvincularProfessor,
    refreshProfessores: fetchProfessores,
  };
}
