import { Users, Home, Heart, Target } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { useSocial } from "@/hooks/useSocial";
import { useEffect } from "react";

export function DashboardSocialSecretaria() {
  const { familias, atendimentos, unidades, visitas, fetchFamilias, fetchAtendimentos, fetchUnidades, fetchVisitas } = useSocial();

  useEffect(() => {
    fetchFamilias();
    fetchAtendimentos();
    fetchUnidades();
    fetchVisitas();
  }, []);

  const stats = [
    { title: "Famílias CadÚnico", value: familias?.length || 0, subtitle: "Registradas", icon: Home },
    { title: "Atendimentos", value: atendimentos?.length || 0, subtitle: "Realizados", icon: Heart },
    { title: "Unidades CRAS", value: unidades?.length || 0, subtitle: "Ativas", icon: Target },
    { title: "Visitas", value: visitas?.length || 0, subtitle: "Domiciliares", icon: Users },
  ];

  const statusAtendimentos = (atendimentos || []).reduce((acc: Record<string, number>, a: any) => {
    acc[a.status || "pendente"] = (acc[a.status || "pendente"] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusAtendimentos).map(([name, value]) => ({ name, value: value as number }));

  return <DashboardSecretaria stats={stats} pieData={pieData} pieTitle="Atendimentos por Status" />;
}
