import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useEstoqueFarmaceutico() {
  const queryClient = useQueryClient();

  const { data: medicamentos = [], isLoading: loadingMedicamentos } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medicamentos")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: lotes = [], isLoading: loadingLotes } = useQuery({
    queryKey: ["lotes_medicamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes_medicamentos")
        .select("*, medicamentos(nome), unidades_saude(nome)")
        .order("data_validade");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: movimentacoes = [] } = useQuery({
    queryKey: ["movimentacoes_estoque"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimentacoes_estoque")
        .select("*, medicamentos(nome), unidades_saude(nome)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: dispensacoes = [] } = useQuery({
    queryKey: ["dispensacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispensacoes")
        .select("*, medicamentos(nome), pacientes(nome), unidades_saude(nome)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const createMedicamento = useMutation({
    mutationFn: async (data: {
      nome: string;
      principio_ativo?: string;
      dosagem?: string;
      apresentacao?: string;
      codigo_interno?: string;
      estoque_minimo?: number;
      unidade_medida?: string;
    }) => {
      const { error } = await supabase.from("medicamentos").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicamentos"] });
      toast.success("Medicamento cadastrado com sucesso");
    },
    onError: () => toast.error("Erro ao cadastrar medicamento"),
  });

  const createLote = useMutation({
    mutationFn: async (data: {
      medicamento_id: string;
      numero_lote: string;
      data_validade: string;
      quantidade_inicial: number;
      quantidade_atual: number;
      unidade_id: string;
      fornecedor?: string;
      nota_fiscal?: string;
    }) => {
      const { error } = await supabase.from("lotes_medicamentos").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes_medicamentos"] });
      toast.success("Lote cadastrado com sucesso");
    },
    onError: () => toast.error("Erro ao cadastrar lote"),
  });

  const createMovimentacao = useMutation({
    mutationFn: async (data: {
      medicamento_id: string;
      lote_id?: string;
      unidade_id: string;
      tipo: string;
      quantidade: number;
      motivo?: string;
      profissional_id?: string;
    }) => {
      const { error } = await supabase.from("movimentacoes_estoque").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimentacoes_estoque"] });
      queryClient.invalidateQueries({ queryKey: ["lotes_medicamentos"] });
      toast.success("Movimentação registrada");
    },
    onError: () => toast.error("Erro ao registrar movimentação"),
  });

  const createDispensacao = useMutation({
    mutationFn: async (data: {
      medicamento_id: string;
      lote_id?: string;
      paciente_id: string;
      prontuario_id?: string;
      profissional_id: string;
      unidade_id: string;
      quantidade: number;
      observacoes?: string;
    }) => {
      const { error } = await supabase.from("dispensacoes").insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispensacoes"] });
      toast.success("Dispensação registrada");
    },
    onError: () => toast.error("Erro ao registrar dispensação"),
  });

  // Alertas: medicamentos próximos do vencimento e estoque baixo
  const alertasVencimento = lotes.filter((l: any) => {
    const validade = new Date(l.data_validade);
    const hoje = new Date();
    const diff = (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0 && l.quantidade_atual > 0;
  });

  const alertasEstoqueBaixo = medicamentos.filter((m: any) => {
    const totalEstoque = lotes
      .filter((l: any) => l.medicamento_id === m.id)
      .reduce((sum: number, l: any) => sum + (l.quantidade_atual || 0), 0);
    return totalEstoque <= m.estoque_minimo;
  });

  return {
    medicamentos,
    lotes,
    movimentacoes,
    dispensacoes,
    loadingMedicamentos,
    loadingLotes,
    alertasVencimento,
    alertasEstoqueBaixo,
    createMedicamento,
    createLote,
    createMovimentacao,
    createDispensacao,
  };
}
