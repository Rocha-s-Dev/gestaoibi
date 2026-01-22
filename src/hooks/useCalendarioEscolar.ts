import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EventoCalendario = {
  id: string;
  escola_id?: string;
  titulo: string;
  descricao?: string;
  tipo?: string;
  tipo_evento?: string;
  data_inicio: string;
  data_fim?: string;
  ano_letivo?: number;
  turmas_especificas?: string[];
  created_at?: string;
  escola?: { nome: string };
  [key: string]: any;
};

export function useCalendarioEscolar() {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.from("calendario_escolar" as any) as any)
        .select(`*, escola:escolas(nome)`).order('data_inicio', { ascending: true });
      if (error) throw error;
      setEventos((data || []) as EventoCalendario[]);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally { setLoading(false); }
  };

  const createEvento = async (eventoData: Omit<EventoCalendario, 'id'>) => {
    try {
      const { data, error } = await (supabase.from("calendario_escolar" as any) as any).insert([eventoData]).select().single();
      if (error) throw error;
      await fetchEventos();
      return data;
    } catch (err) { console.error('Erro ao criar evento:', err); throw err; }
  };

  const updateEvento = async (id: string, eventoData: Partial<EventoCalendario>) => {
    try {
      const { data, error } = await (supabase.from("calendario_escolar" as any) as any).update(eventoData).eq('id', id).select().single();
      if (error) throw error;
      await fetchEventos();
      return data;
    } catch (err) { console.error('Erro ao atualizar evento:', err); throw err; }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await (supabase.from("calendario_escolar" as any) as any).delete().eq('id', id);
      if (error) throw error;
      await fetchEventos();
    } catch (err) { console.error('Erro ao deletar evento:', err); throw err; }
  };

  const getEventosByEscola = async (escolaId: string) => {
    const { data } = await (supabase.from("calendario_escolar" as any) as any).select('*').or(`escola_id.eq.${escolaId},escola_id.is.null`).order('data_inicio');
    return (data || []) as EventoCalendario[];
  };

  const getEventosByPeriodo = async (dataInicio: string, dataFim: string) => {
    const { data } = await (supabase.from("calendario_escolar" as any) as any).select(`*, escola:escolas(nome)`).gte('data_inicio', dataInicio).lte('data_inicio', dataFim).order('data_inicio');
    return (data || []) as EventoCalendario[];
  };

  const getProximosEventos = async (limite: number = 5) => {
    const hoje = new Date().toISOString().split('T')[0];
    const { data } = await (supabase.from("calendario_escolar" as any) as any).select(`*, escola:escolas(nome)`).gte('data_inicio', hoje).order('data_inicio').limit(limite);
    return (data || []) as EventoCalendario[];
  };

  useEffect(() => { fetchEventos(); }, []);

  return { eventos, loading, error, createEvento, updateEvento, deleteEvento, getEventosByEscola, getEventosByPeriodo, getProximosEventos, refreshEventos: fetchEventos };
}
