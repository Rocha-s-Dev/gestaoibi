import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useVacinacao() {
  const queryClient = useQueryClient();

  // vacinas table = per-patient vaccination records
  const { data: registrosVacinas = [], isLoading: loadingRegistros } = useQuery({
    queryKey: ["vacinas_registros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vacinas")
        .select("*, pacientes(nome, cpf), unidades_saude(nome)")
        .order("data_aplicacao", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: campanhas = [], isLoading: loadingCampanhas } = useQuery({
    queryKey: ["campanhas_vacinacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campanhas_vacinacao")
        .select("*")
        .order("data_inicio", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Distinct vaccine names for autocomplete
  const nomesVacinas = [...new Set(registrosVacinas.map((r: any) => r.nome_vacina))].sort();

  const createRegistroVacina = useMutation({
    mutationFn: async (data: {
      paciente_id: string;
      nome_vacina: string;
      lote?: string;
      dose?: string;
      profissional_id?: string;
      unidade_id?: string;
      data_aplicacao: string;
      observacoes?: string;
      local_aplicacao?: string;
      data_proxima_dose?: string;
    }) => {
      const { error } = await supabase.from("vacinas").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vacinas_registros"] });
      toast.success("Vacinação registrada");
    },
    onError: () => toast.error("Erro ao registrar vacinação"),
  });

  const createCampanha = useMutation({
    mutationFn: async (data: {
      nome: string;
      publico_alvo?: string;
      data_inicio: string;
      data_fim?: string;
      meta_cobertura?: number;
    }) => {
      const { error } = await supabase.from("campanhas_vacinacao").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campanhas_vacinacao"] });
      toast.success("Campanha criada");
    },
    onError: () => toast.error("Erro ao criar campanha"),
  });

  return {
    registrosVacinas,
    campanhas,
    nomesVacinas,
    loadingRegistros,
    loadingCampanhas,
    createRegistroVacina,
    createCampanha,
  };
}
