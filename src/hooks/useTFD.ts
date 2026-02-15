import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useViagensTFD(secretariaFilter?: "saude" | "transporte") {
  const queryClient = useQueryClient();

  const { data: viagens = [], isLoading } = useQuery({
    queryKey: ["viagens_tfd", secretariaFilter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viagens_tfd")
        .select("*")
        .order("data_viagem", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createViagem = useMutation({
    mutationFn: async (viagem: any) => {
      // Generate protocol
      const { data: protocolo } = await supabase.rpc("gerar_protocolo_tfd");
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("viagens_tfd")
        .insert({ ...viagem, protocolo, solicitante_id: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viagens_tfd"] });
      toast.success("Viagem TFD criada com sucesso!");
    },
    onError: (e: any) => toast.error("Erro ao criar viagem: " + e.message),
  });

  const updateViagem = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase.from("viagens_tfd").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viagens_tfd"] });
      toast.success("Viagem atualizada!");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  return { viagens, isLoading, createViagem, updateViagem };
}

export function useDestinosTFD(viagemId?: string) {
  const queryClient = useQueryClient();

  const { data: destinos = [], isLoading } = useQuery({
    queryKey: ["destinos_tfd", viagemId],
    queryFn: async () => {
      if (!viagemId) return [];
      const { data, error } = await supabase
        .from("destinos_tfd")
        .select("*")
        .eq("viagem_id", viagemId)
        .order("ordem");
      if (error) throw error;
      return data;
    },
    enabled: !!viagemId,
  });

  const createDestino = useMutation({
    mutationFn: async (destino: any) => {
      const { data, error } = await supabase.from("destinos_tfd").insert(destino).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinos_tfd"] });
      toast.success("Destino adicionado!");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const deleteDestino = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("destinos_tfd").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["destinos_tfd"] }),
  });

  return { destinos, isLoading, createDestino, deleteDestino };
}

export function usePacientesTFD(viagemId?: string) {
  const queryClient = useQueryClient();

  const { data: pacientes = [], isLoading } = useQuery({
    queryKey: ["pacientes_tfd", viagemId],
    queryFn: async () => {
      if (!viagemId) return [];
      const { data, error } = await supabase
        .from("pacientes_tfd")
        .select("*, destinos_tfd:destino_id(cidade_destino, hospital_unidade)")
        .eq("viagem_id", viagemId);
      if (error) throw error;
      return data;
    },
    enabled: !!viagemId,
  });

  const createPaciente = useMutation({
    mutationFn: async (paciente: any) => {
      const { data, error } = await supabase.from("pacientes_tfd").insert(paciente).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacientes_tfd"] });
      toast.success("Paciente adicionado à viagem!");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const deletePaciente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pacientes_tfd").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pacientes_tfd"] }),
  });

  return { pacientes, isLoading, createPaciente, deletePaciente };
}

export function useVeiculosTFD(viagemId?: string) {
  const queryClient = useQueryClient();

  const { data: veiculos = [], isLoading } = useQuery({
    queryKey: ["veiculos_tfd", viagemId],
    queryFn: async () => {
      if (!viagemId) return [];
      const { data, error } = await supabase
        .from("veiculos_tfd")
        .select("*, veiculos_frota:veiculo_id(placa, modelo, marca), motoristas:motorista_id(id)")
        .eq("viagem_id", viagemId);
      if (error) throw error;
      return data;
    },
    enabled: !!viagemId,
  });

  const createVeiculo = useMutation({
    mutationFn: async (veiculo: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("veiculos_tfd")
        .insert({ ...veiculo, designado_por: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veiculos_tfd"] });
      toast.success("Veículo designado!");
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const deleteVeiculo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("veiculos_tfd").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["veiculos_tfd"] }),
  });

  return { veiculos, isLoading, createVeiculo, deleteVeiculo };
}
