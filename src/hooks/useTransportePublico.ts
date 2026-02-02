import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function useTransportePublico() {
  const queryClient = useQueryClient();
  const { secretariaAtiva, municipio } = useSecretariaContext();

  // Linhas de Transporte
  const { data: linhas = [], isLoading: loadingLinhas } = useQuery({
    queryKey: ["linhas_transporte", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("linhas_transporte")
        .select("*")
        .order("codigo");

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createLinha = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("linhas_transporte")
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
      queryClient.invalidateQueries({ queryKey: ["linhas_transporte"] });
      toast.success("Linha cadastrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar linha:", error);
      toast.error("Erro ao cadastrar linha");
    },
  });

  const updateLinha = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("linhas_transporte")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linhas_transporte"] });
      toast.success("Linha atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar linha:", error);
      toast.error("Erro ao atualizar linha");
    },
  });

  // Pontos de Parada
  const { data: pontosParada = [], isLoading: loadingPontos } = useQuery({
    queryKey: ["pontos_parada", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("pontos_parada")
        .select("*, linhas_transporte(codigo, nome)")
        .order("nome");

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createPontoParada = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("pontos_parada")
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
      queryClient.invalidateQueries({ queryKey: ["pontos_parada"] });
      toast.success("Ponto cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar ponto:", error);
      toast.error("Erro ao cadastrar ponto");
    },
  });

  // Ocorrências de Trânsito
  const { data: ocorrencias = [], isLoading: loadingOcorrencias } = useQuery({
    queryKey: ["ocorrencias_transito", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("ocorrencias_transito")
        .select("*")
        .order("data_ocorrencia", { ascending: false });

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createOcorrencia = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("ocorrencias_transito")
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
      queryClient.invalidateQueries({ queryKey: ["ocorrencias_transito"] });
      toast.success("Ocorrência registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar ocorrência:", error);
      toast.error("Erro ao registrar ocorrência");
    },
  });

  // Sinalização Viária
  const { data: sinalizacao = [], isLoading: loadingSinalizacao } = useQuery({
    queryKey: ["sinalizacao_viaria", municipio?.id],
    queryFn: async () => {
      let query = supabase
        .from("sinalizacao_viaria")
        .select("*")
        .order("logradouro");

      if (municipio?.id) {
        query = query.eq("municipio_id", municipio.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createSinalizacao = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("sinalizacao_viaria")
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
      queryClient.invalidateQueries({ queryKey: ["sinalizacao_viaria"] });
      toast.success("Sinalização cadastrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar sinalização:", error);
      toast.error("Erro ao cadastrar sinalização");
    },
  });

  return {
    linhas,
    loadingLinhas,
    createLinha,
    updateLinha,
    pontosParada,
    loadingPontos,
    createPontoParada,
    ocorrencias,
    loadingOcorrencias,
    createOcorrencia,
    sinalizacao,
    loadingSinalizacao,
    createSinalizacao,
  };
}
