import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useExamesSaude() {
  const queryClient = useQueryClient();

  const { data: exames = [], isLoading } = useQuery({
    queryKey: ["exames_saude"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exames_saude")
        .select(`
          *,
          pacientes:paciente_id(id, nome, cpf),
          profissionais_saude:medico_solicitante_id(id, user_id, profiles:user_id(name)),
          unidades_saude:unidade_id(id, nome)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((e: any) => ({
        ...e,
        paciente_nome: e.pacientes?.nome || "—",
        paciente_cpf: e.pacientes?.cpf || "—",
        medico_nome: e.profissionais_saude?.profiles?.name || "—",
        unidade_nome: e.unidades_saude?.nome || "—",
      }));
    },
  });

  const create = useMutation({
    mutationFn: async (data: {
      paciente_id: string;
      medico_solicitante_id: string;
      unidade_id: string;
      tipo: string;
      justificativa?: string;
    }) => {
      const { error } = await supabase.from("exames_saude").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exames_saude"] });
      toast.success("Exame solicitado");
    },
    onError: () => toast.error("Erro ao solicitar exame"),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; resultado?: string; data_realizacao?: string; laudo_url?: string }) => {
      const { error } = await supabase.from("exames_saude").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exames_saude"] });
      toast.success("Exame atualizado");
    },
    onError: () => toast.error("Erro ao atualizar exame"),
  });

  return { exames, isLoading, create, update };
}
