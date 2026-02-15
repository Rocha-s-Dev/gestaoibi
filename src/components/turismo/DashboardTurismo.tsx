import { useTurismoCultura } from "@/hooks/useTurismoCultura";
import { MapPin, Route, Handshake, BarChart3 } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";

export function DashboardTurismo() {
  const { pontosTuristicos, roteiros, parceiros, indicadores } = useTurismoCultura();

  const totalVisitantes = (indicadores as any[]).reduce(
    (sum: number, i: any) => sum + (i.visitantes_nacionais || 0) + (i.visitantes_internacionais || 0), 0
  );

  const stats = [
    { title: "Pontos Turísticos", value: pontosTuristicos.length, subtitle: "Cadastrados", icon: MapPin },
    { title: "Roteiros", value: roteiros.length, subtitle: "Disponíveis", icon: Route },
    { title: "Parceiros", value: parceiros.length, subtitle: "Ativos", icon: Handshake },
    { title: "Visitantes", value: totalVisitantes.toLocaleString(), subtitle: "Total registrado", icon: BarChart3 },
  ];

  const pontosPorTipo = pontosTuristicos.reduce((acc: Record<string, number>, p: any) => {
    acc[p.tipo] = (acc[p.tipo] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(pontosPorTipo).map(([name, value]) => ({ name, value: value as number }));

  const parceirosPorTipo = parceiros.reduce((acc: Record<string, number>, p: any) => {
    acc[p.tipo] = (acc[p.tipo] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(parceirosPorTipo).map(([name, value]) => ({ name, value: value as number }));

  return <DashboardSecretaria stats={stats} pieData={pieData} pieTitle="Pontos por Tipo" barData={barData} barTitle="Parceiros por Tipo" />;
}
