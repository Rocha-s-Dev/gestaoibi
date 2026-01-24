import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Municipio } from "@/contexts/SecretariaContext";

type MunicipioInsert = {
  nome: string;
  uf: string;
  cnpj?: string;
  codigo_ibge?: string;
  prefeito?: string;
  vice_prefeito?: string;
  email_institucional?: string;
  telefone_principal?: string;
  endereco_sede?: string;
  cep?: string;
  site_oficial?: string;
  data_fundacao?: string;
  populacao_estimada?: number;
  area_km2?: number;
};

type MunicipioUpdate = Partial<MunicipioInsert> & { id: string };

export function useMunicipios() {
  const queryClient = useQueryClient();

  const { data: municipios = [], isLoading, error } = useQuery({
    queryKey: ["municipios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("municipios")
        .select("*")
        .order("nome");

      if (error) throw error;
      return data as Municipio[];
    },
  });

  const { data: municipioAtivo } = useQuery({
    queryKey: ["municipio-ativo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("municipios")
        .select("*")
        .eq("status", "ativo")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data as Municipio | null;
    },
  });

  const createMunicipio = useMutation({
    mutationFn: async (data: MunicipioInsert) => {
      const { data: result, error } = await supabase
        .from("municipios")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipios"] });
      queryClient.invalidateQueries({ queryKey: ["municipio-ativo"] });
      toast.success("Município cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar município:", error);
      toast.error("Erro ao cadastrar município");
    },
  });

  const updateMunicipio = useMutation({
    mutationFn: async ({ id, ...data }: MunicipioUpdate) => {
      const { data: result, error } = await supabase
        .from("municipios")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipios"] });
      queryClient.invalidateQueries({ queryKey: ["municipio-ativo"] });
      toast.success("Município atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar município:", error);
      toast.error("Erro ao atualizar município");
    },
  });

  return {
    municipios,
    municipioAtivo,
    isLoading,
    error,
    createMunicipio,
    updateMunicipio,
  };
}
