import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Secretaria } from "@/contexts/SecretariaContext";

type SecretariaInsert = {
  municipio_id: string;
  nome: string;
  sigla: string;
  tipo?: "finalistico" | "administrativo";
  codigo_orcamentario?: string;
  nivel_hierarquico?: number;
  email_institucional?: string;
  telefone_principal?: string;
  endereco?: string;
  missao?: string;
  competencias?: string;
  base_legal?: string;
  data_criacao?: string;
  icone?: string;
  cor_tema?: string;
  ordem_exibicao?: number;
};

type SecretariaUpdate = Partial<SecretariaInsert> & { id: string };

export function useSecretarias(municipioId?: string) {
  const queryClient = useQueryClient();

  const { data: secretarias = [], isLoading, error } = useQuery({
    queryKey: ["secretarias", municipioId],
    queryFn: async () => {
      let query = supabase
        .from("secretarias")
        .select("*")
        .order("ordem_exibicao", { ascending: true });

      if (municipioId) {
        query = query.eq("municipio_id", municipioId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Secretaria[];
    },
  });

  const createSecretaria = useMutation({
    mutationFn: async (data: SecretariaInsert) => {
      const { data: result, error } = await supabase
        .from("secretarias")
        .insert({
          ...data,
          tipo: data.tipo || "finalistico",
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretarias"] });
      toast.success("Secretaria criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar secretaria:", error);
      toast.error("Erro ao criar secretaria");
    },
  });

  const updateSecretaria = useMutation({
    mutationFn: async ({ id, ...data }: SecretariaUpdate) => {
      const { data: result, error } = await supabase
        .from("secretarias")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretarias"] });
      toast.success("Secretaria atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar secretaria:", error);
      toast.error("Erro ao atualizar secretaria");
    },
  });

  const deleteSecretaria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("secretarias")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secretarias"] });
      toast.success("Secretaria removida com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao remover secretaria:", error);
      toast.error("Erro ao remover secretaria");
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "ativa" ? "inativa" : "ativa";
      const { error } = await supabase
        .from("secretarias")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["secretarias"] });
      toast.success(`Secretaria ${newStatus === "ativa" ? "ativada" : "inativada"} com sucesso!`);
    },
    onError: (error) => {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status da secretaria");
    },
  });

  return {
    secretarias,
    isLoading,
    error,
    createSecretaria,
    updateSecretaria,
    deleteSecretaria,
    toggleStatus,
  };
}
