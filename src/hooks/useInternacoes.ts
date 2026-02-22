import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useInternacoes() {
  const queryClient = useQueryClient();

  const { data: internacoes = [], isLoading } = useQuery({
    queryKey: ["internacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internacoes")
        .select(`
          *,
          pacientes:paciente_id(id, nome, cpf),
          profissionais_saude:medico_responsavel_id(id, user_id, profiles:user_id(name)),
          unidades_saude:unidade_id(id, nome)
        `)
        .order("data_entrada", { ascending: false });
      if (error) throw error;
      return (data || []).map((i: any) => ({
        ...i,
        paciente_nome: i.pacientes?.nome || "—",
        paciente_cpf: i.pacientes?.cpf || "—",
        medico_nome: i.profissionais_saude?.profiles?.name || "—",
        unidade_nome: i.unidades_saude?.nome || "—",
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (data: {
      paciente_id: string;
      medico_responsavel_id: string;
      unidade_id: string;
      motivo_internacao: string;
      leito?: string;
    }) => {
      const { error } = await supabase.from("internacoes").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internacoes"] });
      toast.success("Internação registrada");
    },
    onError: () => toast.error("Erro ao registrar internação"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; evolucao?: string; data_alta?: string; motivo_alta?: string; leito?: string }) => {
      const { error } = await supabase.from("internacoes").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internacoes"] });
      toast.success("Internação atualizada");
    },
    onError: () => toast.error("Erro ao atualizar internação"),
  });

  return { internacoes, isLoading, create, update };
}
