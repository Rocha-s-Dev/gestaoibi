import { Tractor, Users, CalendarCheck, Gift } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { useAgricultura } from "@/hooks/useAgricultura";

export function DashboardAgricultura() {
  const { produtores, propriedades, visitas, programas, beneficios } = useAgricultura();

  const stats = [
    { title: "Produtores Rurais", value: produtores?.length || 0, subtitle: "Cadastrados", icon: Users },
    { title: "Propriedades", value: propriedades?.length || 0, subtitle: "Registradas", icon: Tractor },
    { title: "Visitas Técnicas", value: visitas?.length || 0, subtitle: "Realizadas", icon: CalendarCheck },
    { title: "Benefícios", value: beneficios?.length || 0, subtitle: "Concedidos", icon: Gift },
  ];

  const pieData = [
    { name: "Produtores", value: produtores?.length || 0 },
    { name: "Propriedades", value: propriedades?.length || 0 },
    { name: "Visitas", value: visitas?.length || 0 },
    { name: "Programas", value: programas?.length || 0 },
  ].filter(d => d.value > 0);

  return <DashboardSecretaria stats={stats} pieData={pieData} pieTitle="Distribuição por Módulo" />;
}
