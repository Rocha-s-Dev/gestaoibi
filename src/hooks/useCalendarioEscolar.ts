import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EventoCalendario = {
  id: string;
  escola_id: string | null;
  titulo: string;
  descricao: string | null;
  tipo_evento: string;
  data_inicio: string;
  data_fim: string | null;
  turmas_especificas: string[] | null;
  created_at?: string;
  updated_at?: string;
  // Relations
  escola?: { nome: string };
};

export function useCalendarioEscolar() {
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendario_escolar')
        .select(`
          *,
          escola:escolas(nome)
        `)
        .order('data_inicio', { ascending: true });

      if (error) throw error;
      setEventos(data || []);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (eventoData: Omit<EventoCalendario, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('calendario_escolar')
        .insert([eventoData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchEventos();
      return data;
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      throw err;
    }
  };

  const updateEvento = async (id: string, eventoData: Partial<EventoCalendario>) => {
    try {
      const { data, error } = await supabase
        .from('calendario_escolar')
        .update(eventoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchEventos();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      throw err;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calendario_escolar')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchEventos();
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
      throw err;
    }
  };

  const getEventosByEscola = async (escolaId: string) => {
    try {
      const { data, error } = await supabase
        .from('calendario_escolar')
        .select('*')
        .or(`escola_id.eq.${escolaId},escola_id.is.null`)
        .order('data_inicio');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar eventos por escola:', err);
      throw err;
    }
  };

  const getEventosByPeriodo = async (dataInicio: string, dataFim: string) => {
    try {
      const { data, error } = await supabase
        .from('calendario_escolar')
        .select(`
          *,
          escola:escolas(nome)
        `)
        .gte('data_inicio', dataInicio)
        .lte('data_inicio', dataFim)
        .order('data_inicio');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar eventos por período:', err);
      throw err;
    }
  };

  const getProximosEventos = async (limite: number = 5) => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('calendario_escolar')
        .select(`
          *,
          escola:escolas(nome)
        `)
        .gte('data_inicio', hoje)
        .order('data_inicio')
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar próximos eventos:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return {
    eventos,
    loading,
    error,
    createEvento,
    updateEvento,
    deleteEvento,
    getEventosByEscola,
    getEventosByPeriodo,
    getProximosEventos,
    refreshEventos: fetchEventos
  };
}