import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ClipboardList, Home, Package, AlertTriangle, ClipboardCheck, Send } from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import { useBeneficiosContinuados } from "@/hooks/useBeneficiosContinuados";
import { usePAIF } from "@/hooks/usePAIF";
import { usePAEFI } from "@/hooks/usePAEFI";
import { useEncaminhamentosSociais } from "@/hooks/useEncaminhamentosSociais";
import { useAlertasSociais } from "@/hooks/useAlertasSociais";
import { useVulnerabilidade } from "@/hooks/useVulnerabilidade";

export function DashboardSocial() {
  const { unidades, fetchUnidades, familias, fetchFamilias, atendimentos, fetchAtendimentos, visitas, fetchVisitas } = useSocial();

  useEffect(() => {
    fetchUnidades();
    fetchFamilias();
    fetchAtendimentos();
    fetchVisitas();
  }, [fetchUnidades, fetchFamilias, fetchAtendimentos, fetchVisitas]);

  const stats = [
    { label: "Unidades CRAS/CREAS", value: unidades.length, icon: Building2, color: "text-blue-600" },
    { label: "Famílias Cadastradas", value: familias.length, icon: Users, color: "text-green-600" },
    { label: "Atendimentos Realizados", value: atendimentos.length, icon: ClipboardList, color: "text-orange-600" },
    { label: "Visitas Domiciliares", value: visitas.length, icon: Home, color: "text-purple-600" },
  ];

  const familiasExtremaPobreza = familias.filter(f => f.renda_per_capita <= 218).length;
  const familiasBaixaRenda = familias.filter(f => f.renda_per_capita > 218 && f.renda_per_capita <= 660).length;
  const semAgua = familias.filter(f => !f.agua_encanada).length;
  const semEsgoto = familias.filter(f => !f.esgoto_sanitario).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Indicadores de Vulnerabilidade</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Extrema pobreza (≤ R$218/capita)</span>
              <span className="font-semibold">{familiasExtremaPobreza}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Baixa renda (R$218 - R$660/capita)</span>
              <span className="font-semibold">{familiasBaixaRenda}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sem água encanada</span>
              <span className="font-semibold text-destructive">{semAgua}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sem esgoto sanitário</span>
              <span className="font-semibold text-destructive">{semEsgoto}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Unidades por Tipo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {["CRAS", "CREAS", "Centro POP", "Abrigo"].map(tipo => (
              <div key={tipo} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{tipo}</span>
                <span className="font-semibold">{unidades.filter(u => u.tipo === tipo).length}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
