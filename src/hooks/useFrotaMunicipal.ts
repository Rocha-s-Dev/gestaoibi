import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function useFrotaMunicipal() {
  const queryClient = useQueryClient();
  const { secretariaAtiva } = useSecretariaContext();

  // Veículos
  const { data: veiculos = [], isLoading: loadingVeiculos } = useQuery({
    queryKey: ["veiculos_frota", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("veiculos_frota")
        .select("*, motoristas(id, nome)")
        .order("placa");

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createVeiculo = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("veiculos_frota")
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
      queryClient.invalidateQueries({ queryKey: ["veiculos_frota"] });
      toast.success("Veículo cadastrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao cadastrar veículo:", error);
      toast.error("Erro ao cadastrar veículo");
    },
  });

  const updateVeiculo = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("veiculos_frota")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos_frota"] });
      toast.success("Veículo atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar veículo:", error);
      toast.error("Erro ao atualizar veículo");
    },
  });

  // Manutenções
  const { data: manutencoes = [], isLoading: loadingManutencoes } = useQuery({
    queryKey: ["manutencoes_veiculos", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("manutencoes_veiculos")
        .select("*, veiculos_frota(placa, modelo)")
        .order("data_entrada", { ascending: false });

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createManutencao = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("manutencoes_veiculos")
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
      queryClient.invalidateQueries({ queryKey: ["manutencoes_veiculos"] });
      toast.success("Manutenção registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar manutenção:", error);
      toast.error("Erro ao registrar manutenção");
    },
  });

  // Abastecimentos
  const { data: abastecimentos = [], isLoading: loadingAbastecimentos } = useQuery({
    queryKey: ["abastecimentos", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("abastecimentos")
        .select("*, veiculos_frota(placa, modelo), motoristas(nome)")
        .order("data_abastecimento", { ascending: false });

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const createAbastecimento = useMutation({
    mutationFn: async (data: any) => {
      // Buscar último km do veículo
      const { data: ultimoAbastecimento } = await supabase
        .from("abastecimentos")
        .select("km_atual")
        .eq("veiculo_id", data.veiculo_id)
        .order("data_abastecimento", { ascending: false })
        .limit(1)
        .single();

      const kmAnterior = ultimoAbastecimento?.km_atual || null;
      const mediaKmLitro = kmAnterior && data.litros > 0 
        ? (data.km_atual - kmAnterior) / data.litros 
        : null;

      const { data: result, error } = await supabase
        .from("abastecimentos")
        .insert({
          ...data,
          secretaria_id: secretariaAtiva?.id,
          km_anterior: kmAnterior,
          media_km_litro: mediaKmLitro,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abastecimentos"] });
      toast.success("Abastecimento registrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar abastecimento:", error);
      toast.error("Erro ao registrar abastecimento");
    },
  });

  // Alertas da Frota
  const { data: alertas = [], isLoading: loadingAlertas } = useQuery({
    queryKey: ["alertas_frota"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas_frota")
        .select("*, veiculos_frota(placa, modelo)")
        .eq("resolvido", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const resolverAlerta = useMutation({
    mutationFn: async (alertaId: string) => {
      const { error } = await supabase
        .from("alertas_frota")
        .update({ 
          resolvido: true, 
          data_resolucao: new Date().toISOString() 
        })
        .eq("id", alertaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas_frota"] });
      toast.success("Alerta resolvido!");
    },
  });

  return {
    veiculos,
    loadingVeiculos,
    createVeiculo,
    updateVeiculo,
    manutencoes,
    loadingManutencoes,
    createManutencao,
    abastecimentos,
    loadingAbastecimentos,
    createAbastecimento,
    alertas,
    loadingAlertas,
    resolverAlerta,
  };
}
