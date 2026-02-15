import { Car, Users, Route, Wrench } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { useFrotaMunicipal } from "@/hooks/useFrotaMunicipal";
import { useMotoristas } from "@/hooks/useMotoristas";

export function DashboardTransportes() {
  const { veiculos } = useFrotaMunicipal();
  const { motoristas } = useMotoristas();

  const veiculosAtivos = (veiculos || []).filter((v: any) => v.status === "ativo").length;
  const emManutencao = (veiculos || []).filter((v: any) => v.status === "manutencao").length;

  const stats = [
    { title: "Veículos", value: veiculos?.length || 0, subtitle: `${veiculosAtivos} ativos`, icon: Car },
    { title: "Motoristas", value: motoristas?.length || 0, subtitle: "Cadastrados", icon: Users },
    { title: "Em Manutenção", value: emManutencao, subtitle: "Veículos", icon: Wrench },
    { title: "Disponíveis", value: veiculosAtivos, subtitle: "Para uso", icon: Route },
  ];

  const statusData = [
    { name: "Ativos", value: veiculosAtivos },
    { name: "Manutenção", value: emManutencao },
    { name: "Outros", value: Math.max(0, (veiculos?.length || 0) - veiculosAtivos - emManutencao) },
  ].filter(d => d.value > 0);

  return <DashboardSecretaria stats={stats} pieData={statusData} pieTitle="Status da Frota" />;
}
