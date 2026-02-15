import { Leaf, FileText, AlertTriangle, Target } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { useProgramasSustentabilidade, useMetasAmbientais, useLicenciamentosAmbientais, useDenunciasAmbientais } from "@/hooks/useAmbiental";

export function DashboardAmbiental() {
  const { programas } = useProgramasSustentabilidade();
  const { metas } = useMetasAmbientais();
  const { licenciamentos } = useLicenciamentosAmbientais();
  const { denuncias } = useDenunciasAmbientais();

  const licencasAtivas = (licenciamentos || []).filter((l: any) => l.status === "ativa").length;
  const denunciasPendentes = (denuncias || []).filter((d: any) => d.status === "recebida" || d.status === "em_investigacao").length;

  const stats = [
    { title: "Programas", value: programas?.length || 0, subtitle: "De sustentabilidade", icon: Leaf },
    { title: "Metas", value: metas?.length || 0, subtitle: "Ambientais", icon: Target },
    { title: "Licenças Ativas", value: licencasAtivas, subtitle: `De ${licenciamentos?.length || 0} total`, icon: FileText },
    { title: "Denúncias Pendentes", value: denunciasPendentes, subtitle: "Aguardando análise", icon: AlertTriangle },
  ];

  const statusLicencas = (licenciamentos || []).reduce((acc: Record<string, number>, l: any) => {
    acc[l.status || "pendente"] = (acc[l.status || "pendente"] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusLicencas).map(([name, value]) => ({ name, value: value as number }));

  const statusDenuncias = (denuncias || []).reduce((acc: Record<string, number>, d: any) => {
    acc[d.status || "recebida"] = (acc[d.status || "recebida"] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.entries(statusDenuncias).map(([name, value]) => ({ name, value: value as number }));

  return <DashboardSecretaria stats={stats} pieData={pieData} pieTitle="Licenças por Status" barData={barData} barTitle="Denúncias por Status" />;
}
