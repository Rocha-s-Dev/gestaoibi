import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, PackageCheck, PackageX, Tags, Ruler, MapPin, Info, Loader2 } from "lucide-react";
import {
  useAlmoxarifadoCategorias,
  useAlmoxarifadoLocalizacoes,
  useAlmoxarifadoMateriais,
  useAlmoxarifadoUnidades,
} from "@/hooks/useAlmoxarifado";

const Kpi = ({
  label, value, icon: Icon,
}: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

export function DashboardAlmoxarifado() {
  const { itens, isLoading } = useAlmoxarifadoMateriais();
  const { categorias } = useAlmoxarifadoCategorias();
  const { unidades } = useAlmoxarifadoUnidades();
  const { localizacoes } = useAlmoxarifadoLocalizacoes();

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi label="Total de materiais" value={itens.length} icon={Package} />
        <Kpi label="Materiais ativos" value={itens.filter((i) => i.ativo).length} icon={PackageCheck} />
        <Kpi label="Materiais inativos" value={itens.filter((i) => !i.ativo).length} icon={PackageX} />
        <Kpi label="Categorias ativas" value={categorias.filter((c) => c.ativo).length} icon={Tags} />
        <Kpi label="Unidades ativas" value={unidades.filter((u) => u.ativo).length} icon={Ruler} />
        <Kpi label="Localizações ativas" value={localizacoes.filter((l) => l.ativo).length} icon={MapPin} />
      </div>

      <Card>
        <CardContent className="flex items-start gap-2 pt-6 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Esta etapa contempla a fundação do Almoxarifado Central e o cadastro de materiais. O estoque
            permanece zerado até a implantação das entradas e movimentações.
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
