import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface IndicadorEscola {
  escola_id: string;
  escola_nome: string;
  total_alunos: number;
  alunos_matriculados: number;
  alunos_evadidos: number;
  alunos_transferidos: number;
  taxa_evasao: number;
  media_notas: number;
  frequencia_media: number;
  total_faltas: number;
  ideb_estimado: number;
  alunos_em_risco: number;
  taxa_aprovacao: number;
}

export interface IndicadoresGerais {
  total_alunos: number;
  total_escolas: number;
  taxa_evasao_geral: number;
  media_geral: number;
  frequencia_media_geral: number;
  ideb_medio_estimado: number;
  alunos_em_risco: number;
  taxa_aprovacao_geral: number;
  alunos_por_status: Record<string, number>;
}

export function useIndicadoresEducacionais() {
  const [indicadoresGerais, setIndicadoresGerais] = useState<IndicadoresGerais | null>(null);
  const [indicadoresPorEscola, setIndicadoresPorEscola] = useState<IndicadorEscola[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calcularIDEBEstimado = (mediaNotas: number, taxaAprovacao: number): number => {
    // IDEB = N × P, onde:
    // N = média padronizada das notas (escala 0-10 para 0-10)
    // P = taxa de aprovação (0-1)
    // Simplificação: IDEB estimado = média * (taxa/100)
    if (mediaNotas <= 0 || taxaAprovacao <= 0) return 0;
    
    // Padronizar média para escala 0-10 e multiplicar pela taxa
    const mediasPadronizada = Math.min(mediaNotas, 10);
    const ideb = mediasPadronizada * (taxaAprovacao / 100);
    
    return Math.min(ideb, 10);
  };

  const fetchIndicadores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const anoAtual = new Date().getFullYear();

      // Buscar todas as escolas
      const { data: escolas, error: escolasError } = await supabase
        .from("escolas")
        .select("id, nome, status")
        .eq("status", "ativa");

      if (escolasError) throw escolasError;

      // Buscar todos os alunos com seu status
      const { data: alunos, error: alunosError } = await supabase
        .from("alunos")
        .select("id, escola_id, status");

      if (alunosError) throw alunosError;

      // Buscar todas as notas do ano atual
      const { data: notas, error: notasError } = await supabase
        .from("notas")
        .select("aluno_id, nota, disciplina_id")
        .eq("ano_letivo", anoAtual)
        .not("nota", "is", null);

      if (notasError) throw notasError;

      // Buscar todas as faltas do ano atual
      const { data: faltas, error: faltasError } = await supabase
        .from("faltas")
        .select("aluno_id")
        .gte("data_falta", `${anoAtual}-01-01`)
        .lt("data_falta", `${anoAtual + 1}-01-01`);

      if (faltasError) throw faltasError;

      // Contar alunos por status
      const alunosPorStatus: Record<string, number> = {};
      alunos?.forEach((a) => {
        const status = a.status || "ativo";
        alunosPorStatus[status] = (alunosPorStatus[status] || 0) + 1;
      });

      // Mapear faltas por aluno
      const faltasPorAluno = new Map<string, number>();
      faltas?.forEach((f) => {
        faltasPorAluno.set(f.aluno_id, (faltasPorAluno.get(f.aluno_id) || 0) + 1);
      });

      // Mapear notas por aluno
      const notasPorAluno = new Map<string, number[]>();
      notas?.forEach((n) => {
        if (!notasPorAluno.has(n.aluno_id)) {
          notasPorAluno.set(n.aluno_id, []);
        }
        notasPorAluno.get(n.aluno_id)?.push(Number(n.nota));
      });

      // Calcular indicadores por escola
      const indicadoresEscolas: IndicadorEscola[] = [];
      
      let totalGeralAlunos = 0;
      let somaMediasGeral = 0;
      let somaFrequenciaGeral = 0;
      let totalAlunosComNotas = 0;
      let totalAlunosEmRiscoGeral = 0;
      let totalEvadidosGeral = 0;
      let totalAprovadosGeral = 0;

      const diasLetivos = 200; // Estimativa de dias letivos

      for (const escola of escolas || []) {
        const alunosEscola = alunos?.filter((a) => a.escola_id === escola.id) || [];
        const totalAlunosEscola = alunosEscola.length;
        
        const alunosMatriculados = alunosEscola.filter((a) => a.status === "matriculado" || a.status === "concluido").length;
        const alunosEvadidos = alunosEscola.filter((a) => a.status === "evadido").length;
        const alunosTransferidos = alunosEscola.filter((a) => a.status === "transferido").length;
        
        const taxaEvasao = totalAlunosEscola > 0 ? (alunosEvadidos / totalAlunosEscola) * 100 : 0;

        // Calcular média de notas da escola
        let somaNotas = 0;
        let countNotas = 0;
        let alunosEmRisco = 0;
        let alunosAprovados = 0;

        alunosEscola.forEach((aluno) => {
          const notasAluno = notasPorAluno.get(aluno.id) || [];
          if (notasAluno.length > 0) {
            const mediaAluno = notasAluno.reduce((a, b) => a + b, 0) / notasAluno.length;
            somaNotas += mediaAluno;
            countNotas++;
            
            if (mediaAluno < 6) {
              alunosEmRisco++;
            } else {
              alunosAprovados++;
            }
          }
        });

        const mediaNotas = countNotas > 0 ? somaNotas / countNotas : 0;
        const taxaAprovacao = countNotas > 0 ? (alunosAprovados / countNotas) * 100 : 0;

        // Calcular frequência média
        let totalFaltas = 0;
        alunosEscola.forEach((aluno) => {
          totalFaltas += faltasPorAluno.get(aluno.id) || 0;
        });

        const presencasEsperadas = alunosMatriculados * diasLetivos;
        const frequenciaMedia = presencasEsperadas > 0 
          ? ((presencasEsperadas - totalFaltas) / presencasEsperadas) * 100 
          : 100;

        // Verificar frequência como fator de risco
        alunosEscola.forEach((aluno) => {
          const faltasAluno = faltasPorAluno.get(aluno.id) || 0;
          const freqAluno = ((diasLetivos - faltasAluno) / diasLetivos) * 100;
          if (freqAluno < 75 && !notasPorAluno.has(aluno.id)) {
            // Aluno com baixa frequência sem notas registradas
            alunosEmRisco++;
          }
        });

        const idebEstimado = calcularIDEBEstimado(mediaNotas, taxaAprovacao);

        indicadoresEscolas.push({
          escola_id: escola.id,
          escola_nome: escola.nome,
          total_alunos: totalAlunosEscola,
          alunos_matriculados: alunosMatriculados,
          alunos_evadidos: alunosEvadidos,
          alunos_transferidos: alunosTransferidos,
          taxa_evasao: Number(taxaEvasao.toFixed(2)),
          media_notas: Number(mediaNotas.toFixed(2)),
          frequencia_media: Number(frequenciaMedia.toFixed(2)),
          total_faltas: totalFaltas,
          ideb_estimado: Number(idebEstimado.toFixed(2)),
          alunos_em_risco: alunosEmRisco,
          taxa_aprovacao: Number(taxaAprovacao.toFixed(2)),
        });

        // Acumular para indicadores gerais
        totalGeralAlunos += totalAlunosEscola;
        if (countNotas > 0) {
          somaMediasGeral += mediaNotas * countNotas;
          totalAlunosComNotas += countNotas;
        }
        somaFrequenciaGeral += frequenciaMedia * alunosMatriculados;
        totalAlunosEmRiscoGeral += alunosEmRisco;
        totalEvadidosGeral += alunosEvadidos;
        totalAprovadosGeral += alunosAprovados;
      }

      // Calcular indicadores gerais
      const taxaEvasaoGeral = totalGeralAlunos > 0 ? (totalEvadidosGeral / totalGeralAlunos) * 100 : 0;
      const mediaGeral = totalAlunosComNotas > 0 ? somaMediasGeral / totalAlunosComNotas : 0;
      const frequenciaMediaGeral = totalGeralAlunos > 0 ? somaFrequenciaGeral / totalGeralAlunos : 0;
      const taxaAprovacaoGeral = totalAlunosComNotas > 0 ? (totalAprovadosGeral / totalAlunosComNotas) * 100 : 0;
      const idebMedioEstimado = calcularIDEBEstimado(mediaGeral, taxaAprovacaoGeral);

      setIndicadoresGerais({
        total_alunos: totalGeralAlunos,
        total_escolas: escolas?.length || 0,
        taxa_evasao_geral: Number(taxaEvasaoGeral.toFixed(2)),
        media_geral: Number(mediaGeral.toFixed(2)),
        frequencia_media_geral: Number(frequenciaMediaGeral.toFixed(2)),
        ideb_medio_estimado: Number(idebMedioEstimado.toFixed(2)),
        alunos_em_risco: totalAlunosEmRiscoGeral,
        taxa_aprovacao_geral: Number(taxaAprovacaoGeral.toFixed(2)),
        alunos_por_status: alunosPorStatus,
      });

      setIndicadoresPorEscola(indicadoresEscolas.sort((a, b) => b.ideb_estimado - a.ideb_estimado));

    } catch (err) {
      console.error("Erro ao buscar indicadores educacionais:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndicadores();
  }, [fetchIndicadores]);

  return {
    indicadoresGerais,
    indicadoresPorEscola,
    loading,
    error,
    refreshIndicadores: fetchIndicadores,
  };
}
