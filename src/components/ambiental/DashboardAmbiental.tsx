import { Leaf, FileText, AlertTriangle, Target, Search as SearchIcon, Shield, Flame, TreePine, Recycle, GraduationCap, BarChart3 } from "lucide-react";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { useProgramasSustentabilidade, useMetasAmbientais, useLicenciamentosAmbientais, useDenunciasAmbientais } from "@/hooks/useAmbiental";
import { useFiscalizacoesAmbientais, useAutosInfracaoAmbiental, useOcorrenciasQueimadas, useAreasProtegidas, useArvoresUrbanas } from "@/hooks/useAmbientalExpanded";

export function DashboardAmbiental() {
  const { programas } = useProgramasSustentabilidade();
  const { metas } = useMetasAmbientais();
  const { licenciamentos } = useLicenciamentosAmbientais();
  const { denuncias } = useDenunciasAmbientais();
  const { data: fiscalizacoes } = useFiscalizacoesAmbientais();
  const { data: autos } = useAutosInfracaoAmbiental();
  const { data: queimadas } = useOcorrenciasQueimadas();
  const { data: areas } = useAreasProtegidas();
  const { data: arvores } = useArvoresUrbanas();

  const licencasAtivas = (licenciamentos || []).filter((l: any) => l.status === "ativa").length;
  const denunciasPendentes = (denuncias || []).filter((d: any) => d.status === "recebida" || d.status === "em_investigacao").length;
  const denunciasResolvidas = (denuncias || []).filter((d: any) => d.status === "resolvida").length;
  const fiscRealizadas = (fiscalizacoes || []).filter((f: any) => f.status === "realizada" || f.status === "encerrada").length;

  const stats = [
    { title: "Total Denúncias", value: denuncias?.length || 0, subtitle: `${denunciasResolvidas} resolvidas`, icon: AlertTriangle },
    { title: "Denúncias Pendentes", value: denunciasPendentes, subtitle: "Aguardando análise", icon: AlertTriangle },
    { title: "Licenças Emitidas", value: licencasAtivas, subtitle: `De ${licenciamentos?.length || 0} total`, icon: FileText },
    { title: "Fiscalizações", value: fiscalizacoes?.length || 0, subtitle: `${fiscRealizadas} realizadas`, icon: SearchIcon },
    { title: "Infrações", value: autos?.length || 0, subtitle: "Autos emitidos", icon: Shield },
    { title: "Queimadas", value: queimadas?.length || 0, subtitle: "Ocorrências registradas", icon: Flame },
    { title: "Áreas Protegidas", value: areas?.length || 0, subtitle: "Monitoradas", icon: Leaf },
    { title: "Árvores Plantadas", value: arvores?.length || 0, subtitle: "Cadastradas", icon: TreePine },
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
