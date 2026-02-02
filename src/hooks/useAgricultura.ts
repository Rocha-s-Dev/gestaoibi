import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function useAgricultura() {
  const queryClient = useQueryClient();
  const { secretariaAtiva, municipio } = useSecretariaContext();

  // Produtores Rurais
  const { data: produtores = [], isLoading: loadingProdutores } = useQuery({
    queryKey: ["produtores_rurais", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("produtores_rurais")
        .select("*")
        .order("nome");

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createProdutor = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("produtores_rurais")
        .insert({
          ...data,
          municipio_id: municipio?.id,
          secretaria_id: secretariaAtiva?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtores_rurais"] });
      toast.success("Produtor cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar produtor:", error);
      toast.error("Erro ao cadastrar produtor");
    },
  });

  const updateProdutor = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("produtores_rurais")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtores_rurais"] });
      toast.success("Produtor atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar produtor:", error);
      toast.error("Erro ao atualizar produtor");
    },
  });

  // Propriedades Rurais
  const { data: propriedades = [], isLoading: loadingPropriedades } = useQuery({
    queryKey: ["propriedades_rurais", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("propriedades_rurais")
        .select("*, produtores_rurais(nome)")
        .order("nome");

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createPropriedade = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("propriedades_rurais")
        .insert({
          ...data,
          municipio_id: municipio?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propriedades_rurais"] });
      toast.success("Propriedade cadastrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar propriedade:", error);
      toast.error("Erro ao cadastrar propriedade");
    },
  });

  // Culturas por Safra
  const { data: culturas = [], isLoading: loadingCulturas } = useQuery({
    queryKey: ["culturas_safra"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("culturas_safra")
        .select("*, propriedades_rurais(nome)")
        .order("safra", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createCultura = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("culturas_safra")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["culturas_safra"] });
      toast.success("Cultura cadastrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar cultura:", error);
      toast.error("Erro ao cadastrar cultura");
    },
  });

  // Visitas Técnicas
  const { data: visitas = [], isLoading: loadingVisitas } = useQuery({
    queryKey: ["visitas_tecnicas", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("visitas_tecnicas")
        .select("*, produtores_rurais(nome), propriedades_rurais(nome)")
        .order("data_visita", { ascending: false });

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createVisita = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("visitas_tecnicas")
        .insert({
          ...data,
          secretaria_id: secretariaAtiva?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitas_tecnicas"] });
      toast.success("Visita técnica registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar visita:", error);
      toast.error("Erro ao registrar visita");
    },
  });

  // Programas de Incentivo
  const { data: programas = [], isLoading: loadingProgramas } = useQuery({
    queryKey: ["programas_incentivo_rural", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("programas_incentivo_rural")
        .select("*")
        .order("nome");

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createPrograma = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("programas_incentivo_rural")
        .insert({
          ...data,
          secretaria_id: secretariaAtiva?.id,
          municipio_id: municipio?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programas_incentivo_rural"] });
      toast.success("Programa cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar programa:", error);
      toast.error("Erro ao cadastrar programa");
    },
  });

  // Benefícios Concedidos
  const { data: beneficios = [], isLoading: loadingBeneficios } = useQuery({
    queryKey: ["beneficios_rurais", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("beneficios_rurais")
        .select("*, produtores_rurais(nome), programas_incentivo_rural(nome)")
        .order("data_solicitacao", { ascending: false });

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createBeneficio = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("beneficios_rurais")
        .insert({
          ...data,
          secretaria_id: secretariaAtiva?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficios_rurais"] });
      toast.success("Benefício registrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar benefício:", error);
      toast.error("Erro ao registrar benefício");
    },
  });

  return {
    produtores,
    loadingProdutores,
    createProdutor,
    updateProdutor,
    propriedades,
    loadingPropriedades,
    createPropriedade,
    culturas,
    loadingCulturas,
    createCultura,
    visitas,
    loadingVisitas,
    createVisita,
    programas,
    loadingProgramas,
    createPrograma,
    beneficios,
    loadingBeneficios,
    createBeneficio,
  };
}
