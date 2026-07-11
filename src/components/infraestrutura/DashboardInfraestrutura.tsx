import { Building, Wrench, Target, HardHat, Users, AlertTriangle, Lightbulb, Clock } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { usePontosIluminacao, useSolicitacoesIluminacao } from "@/hooks/useOuvidoriaIluminacao";
import { useEquipeInfraestrutura } from "@/hooks/useEquipeInfraestrutura";
import { useAlertasInfraestrutura } from "@/hooks/useAlertasInfraestrutura";
import { useSecretariaContext } from "@/contexts/SecretariaContext";

export function DashboardInfraestrutura() {
  const { secretariaAtiva } = useSecretariaContext();
  const { data: pontosIluminacao } = usePontosIluminacao();
  const { data: solicitacoesIluminacao } = useSolicitacoesIluminacao();
  const { vinculos } = useEquipeInfraestrutura(secretariaAtiva?.id);
  const { alertas } = useAlertasInfraestrutura();

  const pontos = pontosIluminacao || [];
  const solicitacoes = solicitacoesIluminacao || [];

  const pontosAtivos = pontos.filter((p: any) => p.status === "funcionando").length;
  const pontosPendentes = pontos.filter((p: any) => p.status !== "funcionando").length;

  const solicPendentes = solicitacoes.filter((s: any) => s.status === "aberta" || s.status === "em_andamento").length;
  const solicConcluidas = solicitacoes.filter((s: any) => s.status === "concluida").length;
  const solicUrgentes = solicitacoes.filter((s: any) => s.prioridade === "alta" || s.prioridade === "critica").length;

  const tempos = solicitacoes
    .filter((s: any) => s.status === "concluida" && s.data_conclusao && s.created_at)
    .map((s: any) => (new Date(s.data_conclusao).getTime() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const tempoMedio = tempos.length ? (tempos.reduce((a, b) => a + b, 0) / tempos.length).toFixed(1) : "0";

  const alertasPendentes = alertas.filter((a) => a.status !== "resolvido").length;
  const alertasCriticos = alertas.filter((a) => a.status !== "resolvido" && (a.prioridade === "critica" || a.prioridade === "alta")).length;

  const stats = [
    { title: "Solicitações Pendentes", value: solicPendentes, subtitle: `${solicUrgentes} urgentes`, icon: Wrench },
    { title: "Solicitações Concluídas", value: solicConcluidas, subtitle: `Tempo médio: ${tempoMedio} dias`, icon: Clock },
    { title: "Iluminação Ativa", value: pontosAtivos, subtitle: `${pontosPendentes} com manutenção pendente`, icon: Lightbulb },
    { title: "Taxa Funcionamento", value: pontos.length ? `${Math.round((pontosAtivos / pontos.length) * 100)}%` : "0%", subtitle: `${pontos.length} pontos totais`, icon: Target },
    { title: "Equipe Vinculada", value: vinculos.length, subtitle: "Servidores no módulo", icon: Users },
    { title: "Alertas Pendentes", value: alertasPendentes, subtitle: `${alertasCriticos} de alta prioridade`, icon: AlertTriangle },
    { title: "Pontos de Iluminação", value: pontos.length, subtitle: "Rede pública", icon: Building },
    { title: "Chamados Totais", value: solicitacoes.length, subtitle: "Histórico completo", icon: HardHat },
  ];

  const statusSolicitacoes = solicitacoes.reduce((acc: Record<string, number>, s: any) => {
    const k = s.status || "aberta";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(statusSolicitacoes).map(([name, value]) => ({ name, value: value as number }));

  const prioridadeChamados = solicitacoes.reduce((acc: Record<string, number>, s: any) => {
    const k = s.prioridade || "media";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(prioridadeChamados).map(([name, value]) => ({ name, value: value as number }));

  return (
    <DashboardSecretaria
      stats={stats}
      barData={barData}
      barTitle="Solicitações por Status"
      pieData={pieData}
      pieTitle="Chamados por Prioridade"
    />
  );
}
