import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotaLote {
  aluno_id: string;
  disciplina_id: string;
  turma_id: string;
  bimestre: number;
  ano_letivo: number;
  nota: number | null;
  observacoes?: string;
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
      const notasValidas = notas.filter(n => n.nota !== null && n.nota !== undefined);

      if (notasValidas.length === 0) {
        toast.warning('Nenhuma nota válida para salvar');
        return false;
      }

      for (const nota of notasValidas) {
        const { data: existente } = await (supabase
          .from('notas')
          .select('id')
          .eq('aluno_id', nota.aluno_id)
          .eq('disciplina_id', nota.disciplina_id)
          .eq('turma_id', nota.turma_id)
          .eq('bimestre', nota.bimestre)
          .eq('ano_letivo', nota.ano_letivo)
          .maybeSingle() as any);

        if (existente) {
          const { error } = await supabase
            .from('notas')
            .update({
              nota: nota.nota,
              observacoes: nota.observacoes
            })
            .eq('id', existente.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('notas')
            .insert({
              aluno_id: nota.aluno_id,
              disciplina_id: nota.disciplina_id,
              turma_id: nota.turma_id,
              bimestre: nota.bimestre,
              ano_letivo: nota.ano_letivo,
              nota: nota.nota,
              observacoes: nota.observacoes
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
    dataAula: string
  ) => {
    if (presencas.length === 0) {
      toast.warning('Nenhum aluno selecionado');
      return false;
    }

    setLoading(true);
    try {
      // Registrar apenas as faltas (ausências)
      const faltas = presencas
        .filter(p => !p.presente)
        .map(p => ({
          aluno_id: p.aluno_id,
          data: dataAula,
          justificada: !!p.justificativa,
          motivo: p.justificativa || null
        }));

      if (faltas.length > 0) {
        // Remover faltas existentes para essa data
        await supabase
          .from('faltas')
          .delete()
          .eq('data', dataAula)
          .in('aluno_id', faltas.map(f => f.aluno_id));

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
    ano_letivo: number
  ) => {
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('aluno_id, nota')
        .eq('turma_id', turma_id)
        .eq('disciplina_id', disciplina_id)
        .eq('bimestre', bimestre)
        .eq('ano_letivo', ano_letivo);

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
        .select('aluno_id, justificada, motivo')
        .eq('data', data);

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
