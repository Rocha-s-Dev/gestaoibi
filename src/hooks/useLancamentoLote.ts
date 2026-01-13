import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotaLote {
  aluno_id: string;
  disciplina_id: string;
  professor_id: string;
  turma_id: string;
  bimestre: number;
  ano_letivo: number;
  nota: number | null;
  tipo_avaliacao?: string;
  data_avaliacao?: string;
  observacoes?: string;
}

interface FaltaLote {
  aluno_id: string;
  disciplina_id: string;
  professor_id: string;
  turma_id: string;
  data_falta: string;
  tipo: 'justificada' | 'injustificada';
  justificativa?: string;
}

interface PresencaAluno {
  aluno_id: string;
  presente: boolean;
  justificativa?: string;
}

export function useLancamentoLote() {
  const [loading, setLoading] = useState(false);

  const salvarNotasEmLote = async (notas: NotaLote[]) => {
    if (notas.length === 0) {
      toast.warning('Nenhuma nota para salvar');
      return false;
    }

    setLoading(true);
    try {
      // Filtrar apenas notas válidas (com valor)
      const notasValidas = notas.filter(n => n.nota !== null && n.nota !== undefined);

      if (notasValidas.length === 0) {
        toast.warning('Nenhuma nota válida para salvar');
        return false;
      }

      // Para cada nota, verificar se já existe e atualizar ou inserir
      for (const nota of notasValidas) {
        const { data: existente } = await supabase
          .from('notas')
          .select('id')
          .eq('aluno_id', nota.aluno_id)
          .eq('disciplina_id', nota.disciplina_id)
          .eq('turma_id', nota.turma_id)
          .eq('bimestre', nota.bimestre)
          .eq('ano_letivo', nota.ano_letivo)
          .eq('tipo_avaliacao', nota.tipo_avaliacao || 'prova')
          .single();

        if (existente) {
          const { error } = await supabase
            .from('notas')
            .update({
              nota: nota.nota,
              data_avaliacao: nota.data_avaliacao,
              observacoes: nota.observacoes
            })
            .eq('id', existente.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('notas')
            .insert({
              ...nota,
              tipo_avaliacao: nota.tipo_avaliacao || 'prova'
            });

          if (error) throw error;
        }
      }

      toast.success(`${notasValidas.length} notas salvas com sucesso`);
      return true;
    } catch (err) {
      console.error('Erro ao salvar notas em lote:', err);
      toast.error('Erro ao salvar notas');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const salvarPresencaEmLote = async (
    presencas: PresencaAluno[],
    disciplina_id: string,
    professor_id: string,
    turma_id: string,
    data: string
  ) => {
    if (presencas.length === 0) {
      toast.warning('Nenhum aluno selecionado');
      return false;
    }

    setLoading(true);
    try {
      // Registrar apenas as faltas (ausências)
      const faltas: FaltaLote[] = presencas
        .filter(p => !p.presente)
        .map(p => ({
          aluno_id: p.aluno_id,
          disciplina_id,
          professor_id,
          turma_id,
          data_falta: data,
          tipo: p.justificativa ? 'justificada' : 'injustificada',
          justificativa: p.justificativa
        }));

      if (faltas.length > 0) {
        // Remover faltas existentes para essa data/turma/disciplina
        await supabase
          .from('faltas')
          .delete()
          .eq('turma_id', turma_id)
          .eq('disciplina_id', disciplina_id)
          .eq('data_falta', data);

        // Inserir novas faltas
        const { error } = await supabase
          .from('faltas')
          .insert(faltas);

        if (error) throw error;
      }

      const presentes = presencas.filter(p => p.presente).length;
      const ausentes = presencas.filter(p => !p.presente).length;

      toast.success(`Chamada registrada: ${presentes} presentes, ${ausentes} ausentes`);
      return true;
    } catch (err) {
      console.error('Erro ao salvar presença em lote:', err);
      toast.error('Erro ao registrar chamada');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buscarNotasTurma = async (
    turma_id: string,
    disciplina_id: string,
    bimestre: number,
    ano_letivo: number,
    tipo_avaliacao: string = 'prova'
  ) => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('aluno_id, nota')
        .eq('turma_id', turma_id)
        .eq('disciplina_id', disciplina_id)
        .eq('bimestre', bimestre)
        .eq('ano_letivo', ano_letivo)
        .eq('tipo_avaliacao', tipo_avaliacao);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar notas:', err);
      return [];
    }
  };

  const buscarFaltasData = async (
    turma_id: string,
    disciplina_id: string,
    data: string
  ) => {
    try {
      const { data: faltas, error } = await supabase
        .from('faltas')
        .select('aluno_id, tipo, justificativa')
        .eq('turma_id', turma_id)
        .eq('disciplina_id', disciplina_id)
        .eq('data_falta', data);

      if (error) throw error;
      return faltas || [];
    } catch (err) {
      console.error('Erro ao buscar faltas:', err);
      return [];
    }
  };

  return {
    loading,
    salvarNotasEmLote,
    salvarPresencaEmLote,
    buscarNotasTurma,
    buscarFaltasData
  };
}
