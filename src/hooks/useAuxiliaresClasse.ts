import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AuxiliarClasse = {
  id: string;
  user_id: string;
  tipo_profissional: string | null;
  escola_id: string | null;
  status: string | null;
  data_inicio: string | null;
  created_at: string;
  nome: string;
  email: string | null;
  cpf: string | null;
  escola?: { nome: string } | null;
};

export function useAuxiliaresClasse() {
  const [auxiliares, setAuxiliares] = useState<AuxiliarClasse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAuxiliares = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("auxiliares_classe")
        .select(`*, profiles:user_id(name, email, cpf), escola:escolas(nome)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map((a: any) => ({
        id: a.id,
        user_id: a.user_id,
        tipo_profissional: a.tipo_profissional,
        escola_id: a.escola_id,
        status: a.status,
        data_inicio: a.data_inicio,
        created_at: a.created_at,
        nome: a.profiles?.name || "Sem nome",
        email: a.profiles?.email || null,
        cpf: a.profiles?.cpf || null,
        escola: a.escola,
      }));
      setAuxiliares(mapped);
    } catch (err) {
      console.error("Erro ao buscar auxiliares:", err);
    } finally {
      setLoading(false);
    }
  };

  const createAuxiliar = async (data: { user_id: string; tipo_profissional?: string; escola_id?: string; status?: string; data_inicio?: string }) => {
    const { error } = await supabase.from("auxiliares_classe").insert([data as any]);
    if (error) throw error;
    await fetchAuxiliares();
  };

  const updateAuxiliar = async (id: string, data: Partial<{ tipo_profissional: string; escola_id: string; status: string; data_inicio: string }>) => {
    const { error } = await supabase.from("auxiliares_classe").update(data).eq("id", id);
    if (error) throw error;
    await fetchAuxiliares();
  };

  const deleteAuxiliar = async (id: string) => {
    const { error } = await supabase.from("auxiliares_classe").delete().eq("id", id);
    if (error) throw error;
    await fetchAuxiliares();
  };

  useEffect(() => { fetchAuxiliares(); }, []);

  return { auxiliares, loading, createAuxiliar, updateAuxiliar, deleteAuxiliar, refreshAuxiliares: fetchAuxiliares };
}
