import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TipoAlerta = 'faltas_excessivas' | 'nota_baixa' | 'risco_reprovacao' | 'evasao';
export type NivelAlerta = 'info' | 'warning' | 'critical';

export interface AlertaEducacional {
  id: string;
  aluno_id: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  mensagem: string;
  dados_adicionais?: Record<string, unknown>;
  lido: boolean;
  resolvido: boolean;
  data_resolucao?: string;
  created_at: string;
  updated_at: string;
  aluno?: {
    nome: string;
    numero_matricula: string;
    escola?: { nome: string };
    turma_atual?: { nome: string };
  };
}

export interface ConfiguracaoAlertas {
  id: string;
  percentual_faltas_warning: number;
  percentual_faltas_critical: number;
  nota_minima: number;
  dias_sem_frequencia_evasao: number;
}

export function useAlertasEducacionais() {
  const [alertas, setAlertas] = useState<AlertaEducacional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertas = useCallback(async (filtros?: { resolvido?: boolean; tipo?: TipoAlerta; nivel?: NivelAlerta }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('alertas_educacionais')
        .select(`
          *,
          aluno:alunos(
            nome,
            numero_matricula,
            escola:escolas(nome),
            turma_atual:turmas(nome)
          )
        `)
        .order('created_at', { ascending: false });

      if (filtros?.resolvido !== undefined) {
        query = query.eq('resolvido', filtros.resolvido);
      }
      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros?.nivel) {
        query = query.eq('nivel', filtros.nivel);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setAlertas(data as unknown as AlertaEducacional[] || []);
    } catch (err) {
      console.error('Erro ao buscar alertas:', err);
      setError('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  }, []);

  const marcarComoLido = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alertas_educacionais')
        .update({ lido: true })
        .eq('id', id);

      if (error) throw error;
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));
    } catch (err) {
      console.error('Erro ao marcar alerta como lido:', err);
      toast.error('Erro ao marcar alerta como lido');
    }
  };

  const resolverAlerta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alertas_educacionais')
        .update({ 
          resolvido: true, 
          data_resolucao: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, resolvido: true } : a));
      toast.success('Alerta marcado como resolvido');
    } catch (err) {
      console.error('Erro ao resolver alerta:', err);
      toast.error('Erro ao resolver alerta');
    }
  };

  const gerarAlertas = async () => {
    try {
      setLoading(true);
      
      // Buscar configurações
      const { data: config } = await supabase
        .from('configuracoes_alertas')
        .select('*')
        .single();

      if (!config) {
        toast.error('Configurações de alertas não encontradas');
        return;
      }

      // Buscar alunos com faltas
      const { data: alunos } = await supabase
        .from('alunos')
        .select('id, nome');

      if (!alunos) return;

      for (const aluno of alunos) {
        // Contar faltas do aluno
        const { count: totalFaltas } = await supabase
          .from('faltas')
          .select('*', { count: 'exact', head: true })
          .eq('aluno_id', aluno.id);

        // Buscar notas do aluno
        const { data: notas } = await supabase
          .from('notas')
          .select('nota')
          .eq('aluno_id', aluno.id);

        const mediaNotas = notas?.length 
          ? notas.reduce((acc, n) => acc + (n.nota || 0), 0) / notas.length 
          : null;

        // Verificar faltas excessivas (assumindo 200 dias letivos)
        const percentualFaltas = (totalFaltas || 0) / 200 * 100;
        
        if (percentualFaltas >= config.percentual_faltas_critical) {
          await criarAlertaSeNaoExistir(aluno.id, 'faltas_excessivas', 'critical', 
            `Aluno ${aluno.nome} com ${percentualFaltas.toFixed(1)}% de faltas (crítico)`);
        } else if (percentualFaltas >= config.percentual_faltas_warning) {
          await criarAlertaSeNaoExistir(aluno.id, 'faltas_excessivas', 'warning',
            `Aluno ${aluno.nome} com ${percentualFaltas.toFixed(1)}% de faltas`);
        }

        // Verificar notas baixas
        if (mediaNotas !== null && mediaNotas < config.nota_minima) {
          const nivel = mediaNotas < 4 ? 'critical' : 'warning';
          await criarAlertaSeNaoExistir(aluno.id, 'nota_baixa', nivel,
            `Aluno ${aluno.nome} com média ${mediaNotas.toFixed(1)} abaixo do mínimo`);
        }

        // Verificar risco de reprovação
        if (mediaNotas !== null && mediaNotas < config.nota_minima && percentualFaltas >= config.percentual_faltas_warning) {
          await criarAlertaSeNaoExistir(aluno.id, 'risco_reprovacao', 'critical',
            `Aluno ${aluno.nome} em risco de reprovação: média ${mediaNotas?.toFixed(1)} e ${percentualFaltas.toFixed(1)}% de faltas`);
        }
      }

      toast.success('Alertas gerados com sucesso');
      await fetchAlertas();
    } catch (err) {
      console.error('Erro ao gerar alertas:', err);
      toast.error('Erro ao gerar alertas');
    } finally {
      setLoading(false);
    }
  };

  const criarAlertaSeNaoExistir = async (
    aluno_id: string, 
    tipo: TipoAlerta, 
    nivel: NivelAlerta, 
    mensagem: string
  ) => {
    // Verificar se já existe alerta não resolvido
    const { data: existente } = await supabase
      .from('alertas_educacionais')
      .select('id')
      .eq('aluno_id', aluno_id)
      .eq('tipo', tipo)
      .eq('resolvido', false)
      .single();

    if (!existente) {
      await supabase.from('alertas_educacionais').insert({
        aluno_id,
        tipo,
        nivel,
        mensagem
      });
    }
  };

  useEffect(() => {
    fetchAlertas({ resolvido: false });
  }, [fetchAlertas]);

  return {
    alertas,
    loading,
    error,
    fetchAlertas,
    marcarComoLido,
    resolverAlerta,
    gerarAlertas,
    refreshAlertas: () => fetchAlertas({ resolvido: false })
  };
}

export function useConfiguracaoAlertas() {
  const [config, setConfig] = useState<ConfiguracaoAlertas | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_alertas')
        .select('*')
        .single();

      if (error) throw error;
      setConfig(data as ConfiguracaoAlertas);
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<ConfiguracaoAlertas>) => {
    if (!config) return;

    try {
      const { error } = await supabase
        .from('configuracoes_alertas')
        .update(updates)
        .eq('id', config.id);

      if (error) throw error;
      setConfig({ ...config, ...updates });
      toast.success('Configurações atualizadas');
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      toast.error('Erro ao atualizar configurações');
    }
  };

  return { config, loading, updateConfig, refreshConfig: fetchConfig };
}
