import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SituacaoAnoLetivo = 'aprovado' | 'reprovado' | 'transferido' | 'em_curso' | 'evadido';
export type StatusTransferencia = 'solicitada' | 'em_analise' | 'aprovada' | 'rejeitada' | 'cancelada' | 'concluida';
export type TipoTransferencia = 'interna_turma' | 'interna_escola' | 'externa_entrada' | 'externa_saida';

export interface HistoricoEscolar {
  id: string;
  aluno_id: string;
  ano_letivo: number;
  serie: string;
  turma_nome?: string;
  escola_nome: string;
  escola_id?: string;
  notas_finais?: Record<string, number>;
  media_geral?: number;
  total_faltas: number;
  percentual_frequencia?: number;
  situacao: SituacaoAnoLetivo;
  observacoes?: string;
  aluno?: { nome: string; numero_matricula: string };
}

export interface Transferencia {
  id: string;
  aluno_id: string;
  tipo: TipoTransferencia;
  escola_origem_id?: string;
  escola_destino_id?: string;
  turma_origem_id?: string;
  turma_destino_id?: string;
  escola_externa_origem?: string;
  escola_externa_destino?: string;
  motivo?: string;
  status: StatusTransferencia;
  data_solicitacao: string;
  data_efetivacao?: string;
  solicitado_por?: string;
  aprovado_por?: string;
  documentos_gerados?: string[];
  observacoes?: string;
  aluno?: { nome: string; numero_matricula: string };
  escola_origem?: { nome: string };
  escola_destino?: { nome: string };
  turma_origem?: { nome: string };
  turma_destino?: { nome: string };
}

export function useHistoricoEscolar() {
  const [historicos, setHistoricos] = useState<HistoricoEscolar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistoricos = useCallback(async (alunoId?: string) => {
    try {
      setLoading(true);
      // historico_escolar table may not exist - use type assertion
      let query = (supabase.from('historico_escolar' as any) as any)
        .select(`
          *,
          aluno:alunos(nome, numero_matricula)
        `)
        .order('ano_letivo', { ascending: false });

      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistoricos(data as unknown as HistoricoEscolar[] || []);
    } catch (err) {
      console.error('Erro ao buscar históricos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistoricoAluno = async (alunoId: string) => {
    try {
      const { data, error } = await (supabase.from('historico_escolar' as any) as any)
        .select('*')
        .eq('aluno_id', alunoId)
        .order('ano_letivo', { ascending: false });

      if (error) throw error;
      return data as unknown as HistoricoEscolar[] || [];
    } catch (err) {
      console.error('Erro ao buscar histórico do aluno:', err);
      return [];
    }
  };

  const createHistorico = async (historico: Omit<HistoricoEscolar, 'id' | 'aluno'>) => {
    try {
      const { error } = await (supabase.from('historico_escolar' as any) as any)
        .insert(historico);

      if (error) throw error;
      toast.success('Histórico criado');
      await fetchHistoricos();
    } catch (err) {
      console.error('Erro ao criar histórico:', err);
      toast.error('Erro ao criar histórico');
    }
  };

  const updateHistorico = async (id: string, updates: Partial<HistoricoEscolar>) => {
    try {
      const { error } = await (supabase.from('historico_escolar' as any) as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Histórico atualizado');
      await fetchHistoricos();
    } catch (err) {
      console.error('Erro ao atualizar histórico:', err);
      toast.error('Erro ao atualizar histórico');
    }
  };

  const gerarHistoricoAnoAtual = async (alunoId: string) => {
    try {
      // Buscar dados do aluno
      const { data: aluno } = await supabase
        .from('alunos')
        .select(`
          *,
          escola:escolas(nome),
          turma:turmas(nome, serie)
        `)
        .eq('id', alunoId)
        .single();

      if (!aluno) {
        toast.error('Aluno não encontrado');
        return;
      }

      // Buscar notas do aluno no ano atual
      const anoAtual = new Date().getFullYear();
      const { data: notas } = await supabase
        .from('notas')
        .select(`
          nota,
          disciplina:disciplinas(nome)
        `)
        .eq('aluno_id', alunoId)
        .eq('ano_letivo', anoAtual);

      // Calcular média por disciplina
      const notasPorDisciplina: Record<string, number[]> = {};
      notas?.forEach(n => {
        const disciplina = (n.disciplina as { nome: string })?.nome || 'Sem disciplina';
        if (!notasPorDisciplina[disciplina]) {
          notasPorDisciplina[disciplina] = [];
        }
        if (n.nota) {
          notasPorDisciplina[disciplina].push(n.nota);
        }
      });

      const notasFinais: Record<string, number> = {};
      Object.entries(notasPorDisciplina).forEach(([disciplina, notas]) => {
        notasFinais[disciplina] = notas.reduce((a, b) => a + b, 0) / notas.length;
      });

      const mediaGeral = Object.values(notasFinais).length > 0
        ? Object.values(notasFinais).reduce((a, b) => a + b, 0) / Object.values(notasFinais).length
        : 0;

      // Contar faltas
      const { count: totalFaltas } = await supabase
        .from('faltas')
        .select('*', { count: 'exact', head: true })
        .eq('aluno_id', alunoId);

      // Criar ou atualizar histórico
      const historico = {
        aluno_id: alunoId,
        ano_letivo: anoAtual,
        serie: (aluno.turma as { serie?: string })?.serie || 'N/A',
        turma_nome: (aluno.turma as { nome?: string })?.nome,
        escola_nome: (aluno.escola as { nome?: string })?.nome || 'N/A',
        escola_id: aluno.escola_id,
        notas_finais: notasFinais,
        media_geral: mediaGeral,
        total_faltas: totalFaltas || 0,
        percentual_frequencia: 100 - ((totalFaltas || 0) / 200 * 100),
        situacao: 'em_curso' as SituacaoAnoLetivo
      };

      const { data: existente } = await (supabase.from('historico_escolar' as any) as any)
        .select('id')
        .eq('aluno_id', alunoId)
        .eq('ano_letivo', anoAtual)
        .single();

      if (existente) {
        await updateHistorico(existente.id, historico);
      } else {
        await createHistorico(historico);
      }

      toast.success('Histórico gerado com sucesso');
    } catch (err) {
      console.error('Erro ao gerar histórico:', err);
      toast.error('Erro ao gerar histórico');
    }
  };

  useEffect(() => {
    fetchHistoricos();
  }, [fetchHistoricos]);

  return { 
    historicos, 
    loading, 
    fetchHistoricos, 
    getHistoricoAluno,
    createHistorico, 
    updateHistorico,
    gerarHistoricoAnoAtual
  };
}

export function useTransferencias() {
  const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransferencias = useCallback(async (status?: StatusTransferencia) => {
    try {
      setLoading(true);
      let query = supabase
        .from('transferencias')
        .select(`
          *,
          aluno:alunos(nome, numero_matricula),
          escola_origem:escolas!transferencias_escola_origem_id_fkey(nome),
          escola_destino:escolas!transferencias_escola_destino_id_fkey(nome),
          turma_origem:turmas!transferencias_turma_origem_id_fkey(nome),
          turma_destino:turmas!transferencias_turma_destino_id_fkey(nome)
        `)
        .order('data_solicitacao', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransferencias(data as unknown as Transferencia[] || []);
    } catch (err) {
      console.error('Erro ao buscar transferências:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const solicitarTransferencia = async (transferencia: Omit<Transferencia, 'id' | 'status' | 'data_solicitacao' | 'aluno' | 'escola_origem' | 'escola_destino' | 'turma_origem' | 'turma_destino'>) => {
    try {
      const { error } = await supabase
        .from('transferencias')
        .insert({
          ...transferencia,
          status: 'solicitada',
          data_solicitacao: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('Transferência solicitada');
      await fetchTransferencias();
    } catch (err) {
      console.error('Erro ao solicitar transferência:', err);
      toast.error('Erro ao solicitar transferência');
    }
  };

  const aprovarTransferencia = async (id: string, aprovadoPor?: string) => {
    try {
      const { data: transferencia } = await supabase
        .from('transferencias')
        .select('*')
        .eq('id', id)
        .single();

      if (!transferencia) {
        toast.error('Transferência não encontrada');
        return;
      }

      // Atualizar status da transferência
      const { error } = await supabase
        .from('transferencias')
        .update({ 
          status: 'aprovada',
          aprovado_por: aprovadoPor 
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Transferência aprovada');
      await fetchTransferencias();
    } catch (err) {
      console.error('Erro ao aprovar transferência:', err);
      toast.error('Erro ao aprovar transferência');
    }
  };

  const concluirTransferencia = async (id: string) => {
    try {
      const { data: transferencia } = await supabase
        .from('transferencias')
        .select('*')
        .eq('id', id)
        .single();

      if (!transferencia) {
        toast.error('Transferência não encontrada');
        return;
      }

      // Atualizar aluno se for transferência interna
      const tipo = (transferencia as any).tipo;
      if (tipo === 'interna_turma' || tipo === 'interna_escola') {
        const updates: Record<string, string | undefined> = {};
        
        if (transferencia.turma_destino_id) {
          updates.turma_id = transferencia.turma_destino_id;
        }
        if (transferencia.escola_destino_id) {
          updates.escola_id = transferencia.escola_destino_id;
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('alunos')
            .update(updates)
            .eq('id', transferencia.aluno_id);
        }
      }

      // Se for transferência externa de saída, atualizar status do aluno
      if (tipo === 'externa_saida') {
        await supabase
          .from('alunos')
          .update({ situacao: 'transferido' })
          .eq('id', transferencia.aluno_id);
      }

      // Atualizar status da transferência
      const { error } = await supabase
        .from('transferencias')
        .update({ 
          status: 'concluida',
          data_efetivacao: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Transferência concluída');
      await fetchTransferencias();
    } catch (err) {
      console.error('Erro ao concluir transferência:', err);
      toast.error('Erro ao concluir transferência');
    }
  };

  const rejeitarTransferencia = async (id: string, motivo?: string) => {
    try {
      const { error } = await supabase
        .from('transferencias')
        .update({ 
          status: 'rejeitada',
          observacoes: motivo 
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Transferência rejeitada');
      await fetchTransferencias();
    } catch (err) {
      console.error('Erro ao rejeitar transferência:', err);
      toast.error('Erro ao rejeitar transferência');
    }
  };

  const cancelarTransferencia = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transferencias')
        .update({ status: 'cancelada' })
        .eq('id', id);

      if (error) throw error;
      toast.success('Transferência cancelada');
      await fetchTransferencias();
    } catch (err) {
      console.error('Erro ao cancelar transferência:', err);
      toast.error('Erro ao cancelar transferência');
    }
  };

  useEffect(() => {
    fetchTransferencias();
  }, [fetchTransferencias]);

  return { 
    transferencias, 
    loading, 
    fetchTransferencias,
    solicitarTransferencia,
    aprovarTransferencia,
    concluirTransferencia,
    rejeitarTransferencia,
    cancelarTransferencia
  };
}
