import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type EstatisticasEducacao = {
  totalEscolas: number;
  totalAlunos: number;
  totalProfessores: number;
  totalTurmas: number;
  taxaFrequenciaMedia: number;
  desempenhoMedio: number;
  alunosEmRisco: number;
  taxaAprovacao: number;
  escolasAtivas: number;
  escolasInativas: number;
};

export type EstatisticasPorEscola = {
  escola_id: string;
  escola_nome: string;
  total_alunos: number;
  total_turmas: number;
  total_professores: number;
  taxa_frequencia: number;
  desempenho_medio: number;
  taxa_ocupacao: number;
  capacidade_total: number;
  alunos_em_risco: number;
};

export type DesempenhoPorDisciplina = {
  disciplina_id: string;
  disciplina_nome: string;
  media_geral: number;
  total_avaliacoes: number;
};

export type FrequenciaPorTurma = {
  turma_id: string;
  turma_nome: string;
  escola_nome: string;
  total_alunos: number;
  total_faltas: number;
  taxa_presenca: number;
};

export function useEducacaoStats() {
  const [stats, setStats] = useState<EstatisticasEducacao | null>(null);
  const [statsPorEscola, setStatsPorEscola] = useState<EstatisticasPorEscola[]>([]);
  const [desempenhoPorDisciplina, setDesempenhoPorDisciplina] = useState<DesempenhoPorDisciplina[]>([]);
  const [frequenciaPorTurma, setFrequenciaPorTurma] = useState<FrequenciaPorTurma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstatisticasGerais = async () => {
    try {
      setLoading(true);

      // Total de escolas
      const { count: totalEscolas } = await supabase
        .from('escolas')
        .select('*', { count: 'exact', head: true });

      // Escolas ativas/inativas
      const { count: escolasAtivas } = await supabase
        .from('escolas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativa');

      // Total de alunos
      const { count: totalAlunos } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true });

      // Total de professores
      const { count: totalProfessores } = await supabase
        .from('professores')
        .select('*', { count: 'exact', head: true });

      // Total de turmas
      const { count: totalTurmas } = await supabase
        .from('turmas')
        .select('*', { count: 'exact', head: true });

      // Calcular taxa de frequência média
      const anoAtual = new Date().getFullYear();
      const { data: totalAulasPorAluno } = await supabase
        .from('notas')
        .select('aluno_id')
        .eq('ano_letivo', anoAtual);

      const { data: faltasData } = await supabase
        .from('faltas')
        .select('aluno_id')
        .gte('data_falta', `${anoAtual}-01-01`)
        .lt('data_falta', `${anoAtual + 1}-01-01`);

      const totalAulas = totalAulasPorAluno?.length || 1;
      const totalFaltas = faltasData?.length || 0;
      const taxaFrequenciaMedia = ((totalAulas - totalFaltas) / totalAulas) * 100;

      // Calcular desempenho médio
      const { data: notasData } = await supabase
        .from('notas')
        .select('nota')
        .eq('ano_letivo', anoAtual)
        .not('nota', 'is', null);

      const somaNotas = notasData?.reduce((acc, n) => acc + (Number(n.nota) || 0), 0) || 0;
      const desempenhoMedio = notasData?.length ? somaNotas / notasData.length : 0;

      // Alunos em risco (nota < 6.0 ou faltas > 25%)
      const { data: alunosComNotasBaixas } = await supabase
        .from('notas')
        .select('aluno_id')
        .eq('ano_letivo', anoAtual)
        .lt('nota', 6.0);

      const alunosEmRiscoSet = new Set(alunosComNotasBaixas?.map(a => a.aluno_id) || []);

      // Taxa de aprovação (alunos com média >= 6.0)
      const alunosAprovados = notasData?.filter(n => (Number(n.nota) || 0) >= 6.0).length || 0;
      const taxaAprovacao = notasData?.length ? (alunosAprovados / notasData.length) * 100 : 0;

      setStats({
        totalEscolas: totalEscolas || 0,
        totalAlunos: totalAlunos || 0,
        totalProfessores: totalProfessores || 0,
        totalTurmas: totalTurmas || 0,
        taxaFrequenciaMedia: Number(taxaFrequenciaMedia.toFixed(1)),
        desempenhoMedio: Number(desempenhoMedio.toFixed(1)),
        alunosEmRisco: alunosEmRiscoSet.size,
        taxaAprovacao: Number(taxaAprovacao.toFixed(1)),
        escolasAtivas: escolasAtivas || 0,
        escolasInativas: (totalEscolas || 0) - (escolasAtivas || 0),
      });

    } catch (err) {
      console.error('Erro ao buscar estatísticas gerais:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticasPorEscola = async () => {
    try {
      const { data: escolas } = await supabase
        .from('escolas')
        .select('id, nome, capacidade_total');

      if (!escolas) return;

      const estatisticas: EstatisticasPorEscola[] = [];

      for (const escola of escolas) {
        // Total de alunos
        const { count: totalAlunos } = await supabase
          .from('alunos')
          .select('*', { count: 'exact', head: true })
          .eq('escola_id', escola.id);

        // Total de turmas
        const { count: totalTurmas } = await supabase
          .from('turmas')
          .select('*', { count: 'exact', head: true })
          .eq('escola_id', escola.id);

        // Total de professores (via escola_principal_id)
        const { count: totalProfessores } = await supabase
          .from('professores')
          .select('*', { count: 'exact', head: true })
          .eq('escola_principal_id', escola.id);

        // Taxa de ocupação
        const taxaOcupacao = escola.capacidade_total > 0 
          ? ((totalAlunos || 0) / escola.capacidade_total) * 100 
          : 0;

        estatisticas.push({
          escola_id: escola.id,
          escola_nome: escola.nome,
          total_alunos: totalAlunos || 0,
          total_turmas: totalTurmas || 0,
          total_professores: totalProfessores || 0,
          taxa_frequencia: 0, // Será calculado separadamente se necessário
          desempenho_medio: 0, // Será calculado separadamente se necessário
          taxa_ocupacao: Number(taxaOcupacao.toFixed(1)),
          capacidade_total: escola.capacidade_total,
          alunos_em_risco: 0,
        });
      }

      setStatsPorEscola(estatisticas);
    } catch (err) {
      console.error('Erro ao buscar estatísticas por escola:', err);
    }
  };

  const fetchDesempenhoPorDisciplina = async () => {
    try {
      const anoAtual = new Date().getFullYear();
      
      const { data: notas } = await supabase
        .from('notas')
        .select(`
          nota,
          disciplina_id,
          disciplina:disciplinas(nome)
        `)
        .eq('ano_letivo', anoAtual)
        .not('nota', 'is', null);

      if (!notas) return;

      const disciplinasMap = new Map<string, { nome: string; notas: number[] }>();

      notas.forEach((nota) => {
        const disciplinaId = nota.disciplina_id;
        const disciplinaNome = nota.disciplina?.nome || 'Sem nome';
        
        if (!disciplinasMap.has(disciplinaId)) {
          disciplinasMap.set(disciplinaId, { nome: disciplinaNome, notas: [] });
        }
        
        disciplinasMap.get(disciplinaId)?.notas.push(Number(nota.nota));
      });

      const desempenho: DesempenhoPorDisciplina[] = [];
      
      disciplinasMap.forEach((value, key) => {
        const soma = value.notas.reduce((acc, n) => acc + n, 0);
        const media = value.notas.length > 0 ? soma / value.notas.length : 0;
        
        desempenho.push({
          disciplina_id: key,
          disciplina_nome: value.nome,
          media_geral: Number(media.toFixed(1)),
          total_avaliacoes: value.notas.length,
        });
      });

      setDesempenhoPorDisciplina(desempenho);
    } catch (err) {
      console.error('Erro ao buscar desempenho por disciplina:', err);
    }
  };

  const fetchFrequenciaPorTurma = async () => {
    try {
      const anoAtual = new Date().getFullYear();
      
      const { data: turmas } = await supabase
        .from('turmas')
        .select(`
          id,
          nome,
          escola:escolas(nome)
        `)
        .eq('ano_letivo', anoAtual);

      if (!turmas) return;

      const frequencia: FrequenciaPorTurma[] = [];

      for (const turma of turmas) {
        const { count: totalAlunos } = await supabase
          .from('alunos')
          .select('*', { count: 'exact', head: true })
          .eq('turma_atual_id', turma.id);

        const { count: totalFaltas } = await supabase
          .from('faltas')
          .select('*', { count: 'exact', head: true })
          .eq('turma_id', turma.id)
          .gte('data_falta', `${anoAtual}-01-01`)
          .lt('data_falta', `${anoAtual + 1}-01-01`);

        // Assumindo média de 200 dias letivos
        const diasLetivos = 200;
        const presencasEsperadas = (totalAlunos || 0) * diasLetivos;
        const presencasReais = presencasEsperadas - (totalFaltas || 0);
        const taxaPresenca = presencasEsperadas > 0 
          ? (presencasReais / presencasEsperadas) * 100 
          : 100;

        frequencia.push({
          turma_id: turma.id,
          turma_nome: turma.nome,
          escola_nome: turma.escola?.nome || 'Sem escola',
          total_alunos: totalAlunos || 0,
          total_faltas: totalFaltas || 0,
          taxa_presenca: Number(taxaPresenca.toFixed(1)),
        });
      }

      setFrequenciaPorTurma(frequencia);
    } catch (err) {
      console.error('Erro ao buscar frequência por turma:', err);
    }
  };

  useEffect(() => {
    fetchEstatisticasGerais();
    fetchEstatisticasPorEscola();
    fetchDesempenhoPorDisciplina();
    fetchFrequenciaPorTurma();
  }, []);

  return {
    stats,
    statsPorEscola,
    desempenhoPorDisciplina,
    frequenciaPorTurma,
    loading,
    error,
    refreshStats: () => {
      fetchEstatisticasGerais();
      fetchEstatisticasPorEscola();
      fetchDesempenhoPorDisciplina();
      fetchFrequenciaPorTurma();
    },
  };
}
