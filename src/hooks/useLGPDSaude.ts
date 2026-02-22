import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLGPDSaude() {
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["log_acesso_prontuario"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("log_acesso_prontuario")
        .select(`
          *,
          pacientes:paciente_id(id, nome, cpf),
          profiles:user_id(name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []).map((l: any) => ({
        ...l,
        paciente_nome: l.pacientes?.nome || "—",
        user_nome: l.profiles?.name || "—",
        user_email: l.profiles?.email || "—",
      }));
    },
  });

  const { data: consentimentos = [], isLoading: isLoadingConsentimentos } = useQuery({
    queryKey: ["consentimentos_lgpd"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consentimentos_lgpd")
        .select(`
          *,
          pacientes:paciente_id(id, nome, cpf)
        `)
        .order("data_consentimento", { ascending: false });
      if (error) throw error;
      return (data || []).map((c: any) => ({
        ...c,
        paciente_nome: c.pacientes?.nome || "—",
        paciente_cpf: c.pacientes?.cpf || "—",
      }));
    },
  });

  const createConsentimento = useMutation({
    mutationFn: async (data: {
      paciente_id: string;
      tipo_consentimento: string;
      consentido: boolean;
      observacoes?: string;
      responsavel_coleta_id?: string;
    }) => {
      const { error } = await supabase.from("consentimentos_lgpd").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consentimentos_lgpd"] });
      toast.success("Consentimento registrado");
    },
    onError: () => toast.error("Erro ao registrar consentimento"),
  });

  return { logs, consentimentos, isLoadingLogs, isLoadingConsentimentos, createConsentimento };
}
