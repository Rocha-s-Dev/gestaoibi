import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CargoSaude } from "./useCargoSaude";

export interface ProfissionalSaude {
  id: string;
  user_id: string;
  cargo: CargoSaude;
  especialidade: string | null;
  registro_conselho: string | null;
  tipo_conselho: string | null;
  carga_horaria_semanal: number | null;
  unidade_id: string | null;
  status: string | null;
  created_at: string;
  profile_nome: string;
  profile_cpf: string;
  profile_email: string;
  unidade_nome: string | null;
}

export function useProfissionaisSaude(unidadeId?: string) {
  const queryClient = useQueryClient();

  const { data: profissionais = [], isLoading } = useQuery({
    queryKey: ["profissionais_saude", unidadeId],
    queryFn: async () => {
      let query = supabase
        .from("profissionais_saude")
        .select(`
          *,
          profiles:user_id(id, name, email, cpf),
          unidades_saude:unidade_id(id, nome)
        `)
        .order("created_at", { ascending: false });

      if (unidadeId) {
        query = query.eq("unidade_id", unidadeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p: any) => ({
        ...p,
        profile_nome: p.profiles?.name || "—",
        profile_cpf: p.profiles?.cpf || "",
        profile_email: p.profiles?.email || "",
        unidade_nome: p.unidades_saude?.nome || null,
      })) as ProfissionalSaude[];
    },
  });

  const createProfissional = useMutation({
    mutationFn: async (data: {
      user_id: string;
      cargo: CargoSaude;
      especialidade?: string;
      registro_conselho?: string;
      tipo_conselho?: string;
      carga_horaria_semanal?: number;
      unidade_id?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("profissionais_saude")
        .insert(data)
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          throw new Error("Este profissional já possui vínculo ativo nesta unidade.");
        }
        throw error;
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profissionais_saude"] });
      toast.success("Profissional vinculado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao vincular profissional:", error);
      toast.error(error.message || "Erro ao vincular profissional de saúde");
    },
  });

  const updateProfissional = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { data: result, error } = await supabase
        .from("profissionais_saude")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profissionais_saude"] });
      toast.success("Profissional atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar profissional:", error);
      toast.error("Erro ao atualizar profissional");
    },
  });

  const deactivateProfissional = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("profissionais_saude")
        .update({ status: "inativo" } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profissionais_saude"] });
      toast.success("Profissional inativado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao inativar profissional:", error);
      toast.error("Erro ao inativar profissional");
    },
  });

  return {
    profissionais,
    isLoading,
    createProfissional,
    updateProfissional,
    deactivateProfissional,
  };
}
