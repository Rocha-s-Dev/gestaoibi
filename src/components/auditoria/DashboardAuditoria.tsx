import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEstatisticasAuditoria } from "@/hooks/useAuditoria";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Shield,
  Database,
  DollarSign,
  FileText,
  Activity,
  TrendingUp,
} from "lucide-react";

const CATEGORIA_COLORS = {
  seguranca: "#ef4444",
  dados: "#3b82f6",
  financeiro: "#22c55e",
  documental: "#a855f7",
};

const CATEGORIA_LABELS = {
  seguranca: "Segurança",
  dados: "Dados",
  financeiro: "Financeiro",
  documental: "Documental",
};

export function DashboardAuditoria() {
  const { data: stats, isLoading } = useEstatisticasAuditoria();

  const categoriaData = useMemo(() => {
    if (!stats?.porCategoria) return [];
    return Object.entries(stats.porCategoria).map(([name, value]) => ({
      name: CATEGORIA_LABELS[name as keyof typeof CATEGORIA_LABELS] || name,
      value,
      color: CATEGORIA_COLORS[name as keyof typeof CATEGORIA_COLORS] || "#888",
    }));
  }, [stats?.porCategoria]);

  const acaoData = useMemo(() => {
    if (!stats?.porTipoAcao) return [];
    return Object.entries(stats.porTipoAcao)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [stats?.porTipoAcao]);

  const tendenciaData = useMemo(() => {
    if (!stats?.porDia) return [];
    return Object.entries(stats.porDia)
      .map(([date, value]) => ({
        date: date.slice(5), // MM-DD
        value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [stats?.porDia]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Segurança</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.porCategoria?.seguranca || 0}</div>
            <p className="text-xs text-muted-foreground">Eventos de segurança</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financeiro</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.porCategoria?.financeiro || 0}</div>
            <p className="text-xs text-muted-foreground">Operações financeiras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dados</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.porCategoria?.dados || 0}</div>
            <p className="text-xs text-muted-foreground">Alterações de dados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Distribuição por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoriaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {categoriaData.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por Tipo de Ação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Por Tipo de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={acaoData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendência Diária */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Tendência de Atividade (Último Mês)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tendenciaData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
