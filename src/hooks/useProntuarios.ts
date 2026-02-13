import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export type Prontuario = {
  id: string;
  paciente_id: string;
  profissional_id: string | null;
  unidade_id: string | null;
  agendamento_id: string | null;
  data_atendimento: string;
  tipo_atendimento: string;
  queixa_principal: string | null;
  historia_doenca_atual: string | null;
  sinais_vitais: Json | null;
  exame_fisico: Json | null;
  hipotese_diagnostica: string | null;
  cid_principal: string | null;
  cid_secundarios: string[] | null;
  conduta: string | null;
  prescricao_medicamentos: Json | null;
  solicitacao_exames: Json | null;
  encaminhamentos: string[] | null;
  observacoes: string | null;
  assinatura_digital: string | null;
  created_at: string;
  updated_at: string;
  paciente?: { nome: string; cartao_sus: string | null };
  profissional?: { id: string; especialidade: string | null };
  unidade?: { nome: string };
};

type ProntuarioInsert = {
  paciente_id: string;
  profissional_id?: string | null;
  unidade_id?: string | null;
  agendamento_id?: string | null;
  data_atendimento?: string;
  tipo_atendimento: string;
  queixa_principal?: string | null;
  historia_doenca_atual?: string | null;
  sinais_vitais?: Json | null;
  exame_fisico?: Json | null;
  hipotese_diagnostica?: string | null;
  cid_principal?: string | null;
  cid_secundarios?: string[] | null;
  conduta?: string | null;
  prescricao_medicamentos?: Json | null;
  solicitacao_exames?: Json | null;
  encaminhamentos?: string[] | null;
  observacoes?: string | null;
};

export function useProntuarios(pacienteId?: string) {
  const queryClient = useQueryClient();

  const { data: prontuarios = [], isLoading } = useQuery({
    queryKey: ["prontuarios", pacienteId],
    queryFn: async () => {
      let query = supabase
        .from("prontuarios")
        .select(`
          *,
          paciente:pacientes(nome, cartao_sus),
          profissional:profissionais_saude(id, especialidade),
          unidade:unidades_saude(nome)
        `)
        .order("data_atendimento", { ascending: false });

      if (pacienteId) {
        query = query.eq("paciente_id", pacienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Prontuario[];
    },
  });

  const createProntuario = useMutation({
    mutationFn: async (data: ProntuarioInsert) => {
      const { data: result, error } = await supabase
        .from("prontuarios")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prontuarios"] });
      toast.success("Prontuário registrado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao registrar prontuário:", error);
      toast.error("Erro ao registrar prontuário");
    },
  });

  return { prontuarios, isLoading, createProntuario };
}
