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
      const anoAtual = new Date().getFullYear();

      // Buscar contagens em paralelo
      const [escolasRes, escolasAtivasRes, alunosRes, professoresRes, turmasRes] = await Promise.all([
        (supabase.from("escolas" as any) as any).select('*', { count: 'exact', head: true }),
        (supabase.from("escolas" as any) as any).select('*', { count: 'exact', head: true }).eq('tipo', 'municipal'),
        (supabase.from("alunos" as any) as any).select('*', { count: 'exact', head: true }),
        (supabase.from("professores" as any) as any).select('*', { count: 'exact', head: true }),
        (supabase.from("turmas" as any) as any).select('*', { count: 'exact', head: true }),
      ]);

      const totalEscolas = escolasRes.count || 0;
      const escolasAtivas = escolasAtivasRes.count || 0;
      const totalAlunos = alunosRes.count || 0;
      const totalProfessores = professoresRes.count || 0;
      const totalTurmas = turmasRes.count || 0;

      // Buscar notas e faltas em paralelo
      const [notasRes, faltasRes] = await Promise.all([
        (supabase.from("notas" as any) as any).select('nota, aluno_id').eq('ano_letivo', anoAtual).not('nota', 'is', null),
        (supabase.from("faltas" as any) as any).select('aluno_id').gte('data', `${anoAtual}-01-01`).lt('data', `${anoAtual + 1}-01-01`),
      ]);

      const notasData = (notasRes.data || []) as any[];
      const faltasData = (faltasRes.data || []) as any[];

      // Calcular métricas
      const totalAulas = notasData.length || 1;
      const totalFaltas = faltasData.length || 0;
      const taxaFrequenciaMedia = Math.max(0, ((totalAulas - totalFaltas) / totalAulas) * 100);

      const somaNotas = notasData.reduce((acc: number, n: any) => acc + (Number(n.nota) || 0), 0);
      const desempenhoMedio = notasData.length ? somaNotas / notasData.length : 0;

      const alunosComNotasBaixas = notasData.filter((n: any) => (Number(n.nota) || 0) < 6.0);
      const alunosEmRiscoSet = new Set(alunosComNotasBaixas.map((a: any) => a.aluno_id));

      const alunosAprovados = notasData.filter((n: any) => (Number(n.nota) || 0) >= 6.0).length;
      const taxaAprovacao = notasData.length ? (alunosAprovados / notasData.length) * 100 : 0;

      setStats({
        totalEscolas,
        totalAlunos,
        totalProfessores,
        totalTurmas,
        taxaFrequenciaMedia: Number(taxaFrequenciaMedia.toFixed(1)),
        desempenhoMedio: Number(desempenhoMedio.toFixed(1)),
        alunosEmRisco: alunosEmRiscoSet.size,
        taxaAprovacao: Number(taxaAprovacao.toFixed(1)),
        escolasAtivas,
        escolasInativas: totalEscolas - escolasAtivas,
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
      const { data: escolas } = await (supabase.from("escolas" as any) as any)
        .select('id, nome, capacidade');

      if (!escolas) return;

      // Buscar dados em paralelo para todas as escolas
      const estatisticas = await Promise.all(
        (escolas as any[]).map(async (escola: any) => {
          const [alunosRes, turmasRes, professoresRes] = await Promise.all([
            (supabase.from("alunos" as any) as any).select('*', { count: 'exact', head: true }).eq('escola_id', escola.id),
            (supabase.from("turmas" as any) as any).select('*', { count: 'exact', head: true }).eq('escola_id', escola.id),
            (supabase.from("professores" as any) as any).select('*', { count: 'exact', head: true }).eq('escola_id', escola.id),
          ]);

          const totalAlunos = alunosRes.count || 0;
          const capacidade = escola.capacidade || 0;
          const taxaOcupacao = capacidade > 0 
            ? (totalAlunos / capacidade) * 100 
            : 0;

          return {
            escola_id: escola.id,
            escola_nome: escola.nome,
            total_alunos: totalAlunos,
            total_turmas: turmasRes.count || 0,
            total_professores: professoresRes.count || 0,
            taxa_frequencia: 0,
            desempenho_medio: 0,
            taxa_ocupacao: Number(taxaOcupacao.toFixed(1)),
            capacidade_total: capacidade,
            alunos_em_risco: 0,
          };
        })
      );

      setStatsPorEscola(estatisticas);
    } catch (err) {
      console.error('Erro ao buscar estatísticas por escola:', err);
    }
  };

  const fetchDesempenhoPorDisciplina = async () => {
    try {
      const anoAtual = new Date().getFullYear();
      
      const { data: notas } = await (supabase.from("notas" as any) as any)
        .select(`nota, disciplina_id, disciplina:disciplinas(nome)`)
        .eq('ano_letivo', anoAtual)
        .not('nota', 'is', null);

      if (!notas) return;

      const disciplinasMap = new Map<string, { nome: string; notas: number[] }>();

      (notas as any[]).forEach((nota: any) => {
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
      
      const { data: turmas } = await (supabase.from("turmas" as any) as any)
        .select(`id, nome, escola:escolas(nome)`)
        .eq('ano_letivo', anoAtual);

      if (!turmas) return;

      const frequencia = await Promise.all(
        (turmas as any[]).map(async (turma: any) => {
          const [alunosRes, faltasRes] = await Promise.all([
            (supabase.from("alunos" as any) as any).select('*', { count: 'exact', head: true }).eq('turma_id', turma.id),
            (supabase.from("faltas" as any) as any).select('*', { count: 'exact', head: true })
              .eq('aluno_id', turma.id)
              .gte('data', `${anoAtual}-01-01`)
              .lt('data', `${anoAtual + 1}-01-01`),
          ]);

          const totalAlunos = alunosRes.count || 0;
          const totalFaltas = faltasRes.count || 0;
          const diasLetivos = 200;
          const presencasEsperadas = totalAlunos * diasLetivos;
          const presencasReais = presencasEsperadas - totalFaltas;
          const taxaPresenca = presencasEsperadas > 0 
            ? (presencasReais / presencasEsperadas) * 100 
            : 100;

          return {
            turma_id: turma.id,
            turma_nome: turma.nome,
            escola_nome: turma.escola?.nome || 'Sem escola',
            total_alunos: totalAlunos,
            total_faltas: totalFaltas,
            taxa_presenca: Number(taxaPresenca.toFixed(1)),
          };
        })
      );

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
