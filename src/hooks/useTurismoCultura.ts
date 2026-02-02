import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function useTurismoCultura() {
  const queryClient = useQueryClient();
  const { secretariaAtiva, municipio } = useSecretariaContext();

  // Equipamentos Culturais
  const { data: equipamentos = [], isLoading: loadingEquipamentos } = useQuery({
    queryKey: ["equipamentos_culturais", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("equipamentos_culturais")
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

  const createEquipamento = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("equipamentos_culturais")
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
      queryClient.invalidateQueries({ queryKey: ["equipamentos_culturais"] });
      toast.success("Equipamento cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar equipamento:", error);
      toast.error("Erro ao cadastrar equipamento");
    },
  });

  // Agentes Culturais
  const { data: agentes = [], isLoading: loadingAgentes } = useQuery({
    queryKey: ["agentes_culturais", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("agentes_culturais")
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

  const createAgente = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("agentes_culturais")
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
      queryClient.invalidateQueries({ queryKey: ["agentes_culturais"] });
      toast.success("Agente cultural cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar agente:", error);
      toast.error("Erro ao cadastrar agente cultural");
    },
  });

  // Projetos Culturais
  const { data: projetos = [], isLoading: loadingProjetos } = useQuery({
    queryKey: ["projetos_culturais", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("projetos_culturais")
        .select("*, agentes_culturais(nome)")
        .order("data_inicio", { ascending: false });

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createProjeto = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("projetos_culturais")
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
      queryClient.invalidateQueries({ queryKey: ["projetos_culturais"] });
      toast.success("Projeto cultural cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar projeto:", error);
      toast.error("Erro ao cadastrar projeto cultural");
    },
  });

  // Eventos Municipais
  const { data: eventos = [], isLoading: loadingEventos } = useQuery({
    queryKey: ["eventos_municipais", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("eventos_municipais")
        .select("*")
        .order("data_inicio", { ascending: false });

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createEvento = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("eventos_municipais")
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
      queryClient.invalidateQueries({ queryKey: ["eventos_municipais"] });
      toast.success("Evento cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar evento:", error);
      toast.error("Erro ao cadastrar evento");
    },
  });

  const updateEvento = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("eventos_municipais")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventos_municipais"] });
      toast.success("Evento atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar evento:", error);
      toast.error("Erro ao atualizar evento");
    },
  });

  // Pontos Turísticos
  const { data: pontosTuristicos = [], isLoading: loadingPontos } = useQuery({
    queryKey: ["pontos_turisticos", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("pontos_turisticos")
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

  const createPontoTuristico = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("pontos_turisticos")
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
      queryClient.invalidateQueries({ queryKey: ["pontos_turisticos"] });
      toast.success("Ponto turístico cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar ponto turístico:", error);
      toast.error("Erro ao cadastrar ponto turístico");
    },
  });

  // Roteiros Turísticos
  const { data: roteiros = [], isLoading: loadingRoteiros } = useQuery({
    queryKey: ["roteiros_turisticos", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("roteiros_turisticos")
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

  const createRoteiro = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("roteiros_turisticos")
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
      queryClient.invalidateQueries({ queryKey: ["roteiros_turisticos"] });
      toast.success("Roteiro cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar roteiro:", error);
      toast.error("Erro ao cadastrar roteiro");
    },
  });

  // Parceiros de Turismo
  const { data: parceiros = [], isLoading: loadingParceiros } = useQuery({
    queryKey: ["parceiros_turismo", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("parceiros_turismo")
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

  const createParceiro = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("parceiros_turismo")
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
      queryClient.invalidateQueries({ queryKey: ["parceiros_turismo"] });
      toast.success("Parceiro cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar parceiro:", error);
      toast.error("Erro ao cadastrar parceiro");
    },
  });

  // Indicadores de Visitação - usando any para contornar types desatualizados
  const { data: indicadores = [], isLoading: loadingIndicadores } = useQuery({
    queryKey: ["indicadores_visitacao", municipio?.id],
    queryFn: async () => {
      let query = (supabase
        .from("indicadores_visitacao" as any)
        .select("*, pontos_turisticos(nome)")
        .order("periodo", { ascending: false }) as any);

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const createIndicador = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await (supabase
        .from("indicadores_visitacao" as any)
        .insert({
          ...data,
          municipio_id: municipio?.id,
        })
        .select()
        .single() as any);
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["indicadores_visitacao"] });
      toast.success("Indicador registrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar indicador:", error);
      toast.error("Erro ao registrar indicador");
    },
  });

  return {
    equipamentos,
    loadingEquipamentos,
    createEquipamento,
    agentes,
    loadingAgentes,
    createAgente,
    projetos,
    loadingProjetos,
    createProjeto,
    eventos,
    loadingEventos,
    createEvento,
    updateEvento,
    pontosTuristicos,
    loadingPontos,
    createPontoTuristico,
    roteiros,
    loadingRoteiros,
    createRoteiro,
    parceiros,
    loadingParceiros,
    createParceiro,
    indicadores,
    loadingIndicadores,
    createIndicador,
  };
}
