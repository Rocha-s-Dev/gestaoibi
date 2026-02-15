import { Building, Wrench, Target, HardHat } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { usePontosIluminacao, useSolicitacoesIluminacao } from "@/hooks/useOuvidoriaIluminacao";

export function DashboardInfraestrutura() {
  const { data: pontosIluminacao } = usePontosIluminacao();
  const { data: solicitacoesIluminacao } = useSolicitacoesIluminacao();

  const pontosAtivos = (pontosIluminacao || []).filter((p: any) => p.status === "funcionando").length;
  const solicitacoesPendentes = (solicitacoesIluminacao || []).filter((s: any) => s.status === "aberta" || s.status === "em_andamento").length;

  const stats = [
    { title: "Pontos Iluminação", value: pontosIluminacao?.length || 0, subtitle: `${pontosAtivos} funcionando`, icon: Building },
    { title: "Solicitações", value: solicitacoesIluminacao?.length || 0, subtitle: `${solicitacoesPendentes} pendentes`, icon: Wrench },
    { title: "Taxa Funcionamento", value: pontosIluminacao?.length ? `${Math.round((pontosAtivos / pontosIluminacao.length) * 100)}%` : "0%", subtitle: "Iluminação pública", icon: Target },
    { title: "Atendidas", value: (solicitacoesIluminacao || []).filter((s: any) => s.status === "concluida").length, subtitle: "Solicitações concluídas", icon: HardHat },
  ];

  const statusSolicitacoes = (solicitacoesIluminacao || []).reduce((acc: Record<string, number>, s: any) => {
    acc[s.status || "aberta"] = (acc[s.status || "aberta"] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(statusSolicitacoes).map(([name, value]) => ({ name, value: value as number }));

  return <DashboardSecretaria stats={stats} barData={barData} barTitle="Solicitações por Status" />;
}
