import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useProgramasSustentabilidade() {
  const [programas, setProgramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgramas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("programas_sustentabilidade")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar programas: " + error.message);
    } else {
      setProgramas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProgramas(); }, []);

  const addPrograma = async (programa: any) => {
    const { error } = await supabase.from("programas_sustentabilidade").insert(programa);
    if (error) { toast.error("Erro ao adicionar programa: " + error.message); return false; }
    toast.success("Programa cadastrado com sucesso!");
    fetchProgramas();
    return true;
  };

  const updatePrograma = async (id: string, programa: any) => {
    const { error } = await supabase.from("programas_sustentabilidade").update(programa).eq("id", id);
    if (error) { toast.error("Erro ao atualizar programa: " + error.message); return false; }
    toast.success("Programa atualizado com sucesso!");
    fetchProgramas();
    return true;
  };

  const deletePrograma = async (id: string) => {
    const { error } = await supabase.from("programas_sustentabilidade").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir programa: " + error.message); return false; }
    toast.success("Programa excluído com sucesso!");
    fetchProgramas();
    return true;
  };

  return { programas, loading, fetchProgramas, addPrograma, updatePrograma, deletePrograma };
}

export function useMetasAmbientais() {
  const [metas, setMetas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("metas_ambientais")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar metas: " + error.message);
    } else {
      setMetas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMetas(); }, []);

  const addMeta = async (meta: any) => {
    const { error } = await supabase.from("metas_ambientais").insert(meta);
    if (error) { toast.error("Erro ao adicionar meta: " + error.message); return false; }
    toast.success("Meta cadastrada com sucesso!");
    fetchMetas();
    return true;
  };

  const updateMeta = async (id: string, meta: any) => {
    const { error } = await supabase.from("metas_ambientais").update(meta).eq("id", id);
    if (error) { toast.error("Erro ao atualizar meta: " + error.message); return false; }
    toast.success("Meta atualizada com sucesso!");
    fetchMetas();
    return true;
  };

  const deleteMeta = async (id: string) => {
    const { error } = await supabase.from("metas_ambientais").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir meta: " + error.message); return false; }
    toast.success("Meta excluída com sucesso!");
    fetchMetas();
    return true;
  };

  return { metas, loading, fetchMetas, addMeta, updateMeta, deleteMeta };
}

export function useLicenciamentosAmbientais() {
  const [licenciamentos, setLicenciamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLicenciamentos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("licenciamentos_ambientais")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar licenciamentos: " + error.message);
    } else {
      setLicenciamentos(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLicenciamentos(); }, []);

  const addLicenciamento = async (lic: any) => {
    const { error } = await supabase.from("licenciamentos_ambientais").insert(lic);
    if (error) { toast.error("Erro ao adicionar licenciamento: " + error.message); return false; }
    toast.success("Licenciamento registrado com sucesso!");
    fetchLicenciamentos();
    return true;
  };

  const updateLicenciamento = async (id: string, lic: any) => {
    const { error } = await supabase.from("licenciamentos_ambientais").update(lic).eq("id", id);
    if (error) { toast.error("Erro ao atualizar licenciamento: " + error.message); return false; }
    toast.success("Licenciamento atualizado com sucesso!");
    fetchLicenciamentos();
    return true;
  };

  const deleteLicenciamento = async (id: string) => {
    const { error } = await supabase.from("licenciamentos_ambientais").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir licenciamento: " + error.message); return false; }
    toast.success("Licenciamento excluído com sucesso!");
    fetchLicenciamentos();
    return true;
  };

  return { licenciamentos, loading, fetchLicenciamentos, addLicenciamento, updateLicenciamento, deleteLicenciamento };
}

export function useDenunciasAmbientais() {
  const [denuncias, setDenuncias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDenuncias = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("denuncias_ambientais")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Erro ao carregar denúncias: " + error.message);
    } else {
      setDenuncias(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDenuncias(); }, []);

  const addDenuncia = async (den: any) => {
    const { error } = await supabase.from("denuncias_ambientais").insert(den);
    if (error) { toast.error("Erro ao registrar denúncia: " + error.message); return false; }
    toast.success("Denúncia registrada com sucesso!");
    fetchDenuncias();
    return true;
  };

  const updateDenuncia = async (id: string, den: any) => {
    const { error } = await supabase.from("denuncias_ambientais").update(den).eq("id", id);
    if (error) { toast.error("Erro ao atualizar denúncia: " + error.message); return false; }
    toast.success("Denúncia atualizada com sucesso!");
    fetchDenuncias();
    return true;
  };

  const deleteDenuncia = async (id: string) => {
    const { error } = await supabase.from("denuncias_ambientais").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir denúncia: " + error.message); return false; }
    toast.success("Denúncia excluída com sucesso!");
    fetchDenuncias();
    return true;
  };

  return { denuncias, loading, fetchDenuncias, addDenuncia, updateDenuncia, deleteDenuncia };
}
