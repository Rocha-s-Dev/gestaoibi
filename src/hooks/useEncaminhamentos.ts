import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEncaminhamentos() {
  const queryClient = useQueryClient();

  const { data: encaminhamentos = [], isLoading } = useQuery({
    queryKey: ["encaminhamentos_saude"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("encaminhamentos_saude")
        .select(`
          *,
          pacientes:paciente_id(id, nome, cpf),
          profissionais_saude:medico_solicitante_id(id, user_id, profiles:user_id(name)),
          unidade_origem:unidade_origem_id(id, nome),
          unidade_destino:unidade_destino_id(id, nome)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((e: any) => ({
        ...e,
        paciente_nome: e.pacientes?.nome || "—",
        paciente_cpf: e.pacientes?.cpf || "—",
        medico_nome: e.profissionais_saude?.profiles?.name || "—",
        unidade_origem_nome: e.unidade_origem?.nome || "—",
        unidade_destino_nome: e.unidade_destino?.nome || "—",
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (data: {
      paciente_id: string;
      medico_solicitante_id: string;
      unidade_origem_id: string;
      especialidade: string;
      justificativa: string;
      prioridade?: string;
      unidade_destino_id?: string;
    }) => {
      const { error } = await supabase.from("encaminhamentos_saude").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encaminhamentos_saude"] });
      toast.success("Encaminhamento registrado");
    },
    onError: () => toast.error("Erro ao registrar encaminhamento"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; data_regulacao?: string; data_agendamento?: string; unidade_destino_id?: string; observacoes?: string }) => {
      const { error } = await supabase.from("encaminhamentos_saude").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encaminhamentos_saude"] });
      toast.success("Encaminhamento atualizado");
    },
    onError: () => toast.error("Erro ao atualizar"),
  });

  return { encaminhamentos, isLoading, create, update };
}
