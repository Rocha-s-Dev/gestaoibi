import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Vacina {
  id: string;
  paciente_id: string;
  profissional_id: string | null;
  unidade_id: string | null;
  nome_vacina: string;
  lote: string | null;
  fabricante: string | null;
  dose: string | null;
  data_aplicacao: string;
  data_proxima_dose: string | null;
  local_aplicacao: string | null;
  observacoes: string | null;
  created_at: string;
  paciente?: {
    id: string;
    nome: string;
    cpf: string | null;
    data_nascimento: string | null;
  };
  profissional?: {
    id: string;
    nome: string;
  };
  unidade?: {
    id: string;
    nome: string;
  };
}

export function useVacinas(pacienteId?: string) {
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVacinas = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("vacinas")
        .select(`
          *,
          paciente:pacientes(id, nome, cpf, data_nascimento),
          profissional:profissionais_saude(id, nome),
          unidade:unidades_saude(id, nome)
        `)
        .order("data_aplicacao", { ascending: false });

      if (pacienteId) {
        query = query.eq("paciente_id", pacienteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVacinas(data as unknown as Vacina[]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar vacinas";
      setError(message);
      console.error("Erro ao carregar vacinas:", err);
    } finally {
      setLoading(false);
    }
  }, [pacienteId]);

  const createVacina = async (vacina: Omit<Vacina, "id" | "created_at" | "paciente" | "profissional" | "unidade">) => {
    const { data, error } = await supabase
      .from("vacinas")
      .insert(vacina)
      .select()
      .single();

    if (error) throw error;
    await fetchVacinas();
    return data;
  };

  const deleteVacina = async (id: string) => {
    const { error } = await supabase.from("vacinas").delete().eq("id", id);
    if (error) throw error;
    await fetchVacinas();
  };

  useEffect(() => {
    fetchVacinas();
  }, [fetchVacinas]);

  return { vacinas, loading, error, fetchVacinas, createVacina, deleteVacina };
}

// Hook para estatísticas de vacinação
export function useEstatisticasVacinacao() {
  const [estatisticas, setEstatisticas] = useState<{
    totalVacinasMes: number;
    vacinasPorTipo: Array<{ nome: string; quantidade: number }>;
    coberturaVacinal: number;
    proximasVacinas: number;
  }>({
    totalVacinasMes: 0,
    vacinasPorTipo: [],
    coberturaVacinal: 0,
    proximasVacinas: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchEstatisticas = useCallback(async () => {
    try {
      setLoading(true);
      
      const dataInicioMes = new Date();
      dataInicioMes.setDate(1);
      dataInicioMes.setHours(0, 0, 0, 0);

      // Vacinas do mês
      const { data: vacinasMes, error: errorMes } = await supabase
        .from("vacinas")
        .select("id")
        .gte("data_aplicacao", dataInicioMes.toISOString().split("T")[0]);

      if (errorMes) throw errorMes;

      // Vacinas por tipo
      const { data: vacinasTipo, error: errorTipo } = await supabase
        .from("vacinas")
        .select("nome_vacina");

      if (errorTipo) throw errorTipo;

      const vacinasPorTipoMap: Record<string, number> = {};
      vacinasTipo?.forEach((v) => {
        vacinasPorTipoMap[v.nome_vacina] = (vacinasPorTipoMap[v.nome_vacina] || 0) + 1;
      });

      const vacinasPorTipo = Object.entries(vacinasPorTipoMap)
        .map(([nome, quantidade]) => ({ nome, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 10);

      // Próximas vacinas (próximos 30 dias)
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 30);

      const { data: proximasVacinas, error: errorProximas } = await supabase
        .from("vacinas")
        .select("id")
        .not("data_proxima_dose", "is", null)
        .lte("data_proxima_dose", dataFutura.toISOString().split("T")[0])
        .gte("data_proxima_dose", new Date().toISOString().split("T")[0]);

      if (errorProximas) throw errorProximas;

      setEstatisticas({
        totalVacinasMes: vacinasMes?.length || 0,
        vacinasPorTipo,
        coberturaVacinal: 85, // Este seria calculado com base na população
        proximasVacinas: proximasVacinas?.length || 0,
      });
    } catch (err) {
      console.error("Erro ao carregar estatísticas de vacinação:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEstatisticas();
  }, [fetchEstatisticas]);

  return { estatisticas, loading, fetchEstatisticas };
}
