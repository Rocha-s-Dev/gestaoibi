import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function useMotoristas() {
  const queryClient = useQueryClient();
  const { secretariaAtiva } = useSecretariaContext();

  const { data: motoristas = [], isLoading } = useQuery({
    queryKey: ["motoristas", secretariaAtiva?.id],
    queryFn: async () => {
      let query = supabase
        .from("motoristas")
        .select(`
          *,
          profiles:user_id(id, name, email, cpf)
        `)
        .order("created_at", { ascending: false });

      if (secretariaAtiva?.id) {
        query = query.eq("secretaria_id", secretariaAtiva.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((m: any) => ({
        ...m,
        profile_nome: m.profiles?.name || "—",
        profile_cpf: m.profiles?.cpf || "",
        profile_email: m.profiles?.email || "",
      }));
    },
  });

  const createMotorista = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from("motoristas")
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
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista vinculado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao vincular motorista:", error);
      toast.error("Erro ao vincular motorista");
    },
  });

  const updateMotorista = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("motoristas")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar motorista:", error);
      toast.error("Erro ao atualizar motorista");
    },
  });

  const deleteMotorista = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("motoristas")
        .update({ ativo: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista desativado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao desativar motorista:", error);
      toast.error("Erro ao desativar motorista");
    },
  });

  const { data: alertasCNH = [] } = useQuery({
    queryKey: ["motoristas_cnh_vencendo"],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + 30);

      const { data, error } = await supabase
        .from("motoristas")
        .select(`
          id, cnh_validade,
          profiles:user_id(name)
        `)
        .eq("ativo", true)
        .lte("cnh_validade", dataLimite.toISOString().split("T")[0])
        .order("cnh_validade");

      if (error) throw error;
      return (data || []).map((a: any) => ({
        ...a,
        nome: a.profiles?.name || "—",
      }));
    },
  });

  return {
    motoristas,
    isLoading,
    createMotorista,
    updateMotorista,
    deleteMotorista,
    alertasCNH,
  };
}
