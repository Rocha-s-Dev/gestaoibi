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
  escola_origem_id?: string;
  escola_destino_id?: string;
  turma_destino_id?: string;
  motivo?: string;
  status: StatusTransferencia;
  data_solicitacao: string;
  data_efetivacao?: string;
  observacoes?: string;
  aluno?: { nome: string; numero_matricula: string };
  escola_origem?: { nome: string };
  escola_destino?: { nome: string };
  turma_destino?: { nome: string };
}

// Generate historical data from existing notas and faltas tables
// since historico_escolar table doesn't exist in the schema
export function useHistoricoEscolar() {
  const [historicos, setHistoricos] = useState<HistoricoEscolar[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistoricos = useCallback(async (alunoId?: string) => {
    try {
      setLoading(true);
      
      // Fetch alunos with their escola and turma info
      let alunosQuery = supabase
        .from('alunos')
        .select(`
          id,
          nome,
          numero_matricula,
          escola_id,
          turma_id,
          situacao,
          escola:escolas(nome),
          turma:turmas(nome, serie)
        `);

      if (alunoId) {
        alunosQuery = alunosQuery.eq('id', alunoId);
      }

      const { data: alunosData } = await alunosQuery;

      if (!alunosData || alunosData.length === 0) {
        setHistoricos([]);
        return;
      }

      const anoAtual = new Date().getFullYear();
      const historicosList: HistoricoEscolar[] = [];

      for (const aluno of alunosData) {
        // Fetch notas for this student
        const { data: notasData } = await supabase
          .from('notas')
          .select(`
            nota,
            trimestre,
            ano_letivo,
            disciplina:disciplinas(nome)
          `)
          .eq('aluno_id', aluno.id);

        // Fetch faltas count
        const { count: faltasCount } = await supabase
          .from('faltas')
          .select('*', { count: 'exact', head: true })
          .eq('aluno_id', aluno.id);

        // Group notes by year
        const notasPorAno: Record<number, Record<string, number[]>> = {};
        notasData?.forEach(n => {
          const ano = n.ano_letivo || anoAtual;
          const disciplina = (n.disciplina as { nome: string })?.nome || 'Sem disciplina';
          
          if (!notasPorAno[ano]) notasPorAno[ano] = {};
          if (!notasPorAno[ano][disciplina]) notasPorAno[ano][disciplina] = [];
          
          if (n.nota !== null) {
            notasPorAno[ano][disciplina].push(n.nota);
          }
        });

        // Generate historico for each year with data
        Object.entries(notasPorAno).forEach(([ano, disciplinas]) => {
          const notasFinais: Record<string, number> = {};
          let somaMedias = 0;
          let contDisciplinas = 0;

          Object.entries(disciplinas).forEach(([disc, notas]) => {
            if (notas.length > 0) {
              const media = notas.reduce((a, b) => a + b, 0) / notas.length;
              notasFinais[disc] = media;
              somaMedias += media;
              contDisciplinas++;
            }
          });

          const mediaGeral = contDisciplinas > 0 ? somaMedias / contDisciplinas : 0;
          const totalFaltas = faltasCount || 0;
          const percentualFrequencia = 100 - (totalFaltas / 200 * 100);

          let situacao: SituacaoAnoLetivo = 'em_curso';
          if (parseInt(ano) < anoAtual) {
            situacao = mediaGeral >= 6 ? 'aprovado' : 'reprovado';
          }

          historicosList.push({
            id: `${aluno.id}-${ano}`,
            aluno_id: aluno.id,
            ano_letivo: parseInt(ano),
            serie: (aluno.turma as { serie?: string })?.serie || 'N/A',
            turma_nome: (aluno.turma as { nome?: string })?.nome,
            escola_nome: (aluno.escola as { nome?: string })?.nome || 'N/A',
            escola_id: aluno.escola_id || undefined,
            notas_finais: notasFinais,
            media_geral: mediaGeral,
            total_faltas: totalFaltas,
            percentual_frequencia: percentualFrequencia,
            situacao,
            aluno: { nome: aluno.nome, numero_matricula: aluno.numero_matricula }
          });
        });

        // If no notas exist, still create an "em_curso" entry for current year
        if (Object.keys(notasPorAno).length === 0) {
          historicosList.push({
            id: `${aluno.id}-${anoAtual}`,
            aluno_id: aluno.id,
            ano_letivo: anoAtual,
            serie: (aluno.turma as { serie?: string })?.serie || 'N/A',
            turma_nome: (aluno.turma as { nome?: string })?.nome,
            escola_nome: (aluno.escola as { nome?: string })?.nome || 'N/A',
            escola_id: aluno.escola_id || undefined,
            notas_finais: {},
            media_geral: 0,
            total_faltas: faltasCount || 0,
            percentual_frequencia: 100 - ((faltasCount || 0) / 200 * 100),
            situacao: 'em_curso',
            aluno: { nome: aluno.nome, numero_matricula: aluno.numero_matricula }
          });
        }
      }

      setHistoricos(historicosList.sort((a, b) => b.ano_letivo - a.ano_letivo));
    } catch (err) {
      console.error('Erro ao buscar históricos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getHistoricoAluno = async (alunoId: string) => {
    await fetchHistoricos(alunoId);
    return historicos.filter(h => h.aluno_id === alunoId);
  };

  const gerarHistoricoAnoAtual = async (alunoId: string) => {
    await fetchHistoricos(alunoId);
    toast.success('Histórico atualizado com sucesso');
  };

  useEffect(() => {
    fetchHistoricos();
  }, [fetchHistoricos]);

  return { 
    historicos, 
    loading, 
    fetchHistoricos, 
    getHistoricoAluno,
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

  const solicitarTransferencia = async (transferencia: Omit<Transferencia, 'id' | 'status' | 'data_solicitacao' | 'aluno' | 'escola_origem' | 'escola_destino' | 'turma_destino'>) => {
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
      const { error } = await supabase
        .from('transferencias')
        .update({ 
          status: 'aprovada'
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

      // Update student data
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

      // Update transfer status
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
