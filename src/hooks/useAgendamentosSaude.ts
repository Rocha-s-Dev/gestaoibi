import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Agendamento = {
  id: string;
  paciente_id: string;
  unidade_id: string;
  profissional_id: string | null;
  data_hora: string;
  tipo: string;
  especialidade: string | null;
  status: string | null;
  prioridade: string | null;
  observacoes: string | null;
  motivo_cancelamento: string | null;
  created_at: string;
  updated_at: string;
  paciente?: { nome: string; cartao_sus: string | null; cpf: string | null };
  unidade?: { nome: string };
  profissional?: { id: string; user_id: string; especialidade: string | null };
};

type AgendamentoInsert = {
  paciente_id: string;
  unidade_id: string;
  profissional_id?: string | null;
  data_hora: string;
  tipo: string;
  especialidade?: string | null;
  status?: string;
  prioridade?: string | null;
  observacoes?: string | null;
};

export function useAgendamentosSaude() {
  const queryClient = useQueryClient();

  const { data: agendamentos = [], isLoading } = useQuery({
    queryKey: ["agendamentos_saude"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select(`
          *,
          paciente:pacientes(nome, cartao_sus, cpf),
          unidade:unidades_saude(nome),
          profissional:profissionais_saude(id, user_id, especialidade)
        `)
        .order("data_hora", { ascending: true });
      if (error) throw error;
      return data as Agendamento[];
    },
  });

  const createAgendamento = useMutation({
    mutationFn: async (data: AgendamentoInsert) => {
      const { data: result, error } = await supabase
        .from("agendamentos")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos_saude"] });
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar agendamento:", error);
      toast.error("Erro ao criar agendamento");
    },
  });

  const updateAgendamento = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Agendamento> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("agendamentos")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos_saude"] });
      toast.success("Agendamento atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro ao atualizar agendamento");
    },
  });

  const cancelAgendamento = useMutation({
    mutationFn: async ({ id, motivo }: { id: string; motivo: string }) => {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status: "cancelado", motivo_cancelamento: motivo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos_saude"] });
      toast.success("Agendamento cancelado!");
    },
    onError: (error) => {
      console.error("Erro ao cancelar agendamento:", error);
      toast.error("Erro ao cancelar agendamento");
    },
  });

  return { agendamentos, isLoading, createAgendamento, updateAgendamento, cancelAgendamento };
}
