import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  useUnidadesSaude,
  usePacientes,
  useAgendamentos,
  useTratamentos,
  useIndicadoresSaude,
  useMetasSaude,
} from "@/hooks/useSaude";
import { useEstatisticasVacinacao } from "@/hooks/useVacinas";
import {
  Building2,
  Users,
  Calendar,
  Stethoscope,
  Syringe,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Activity,
} from "lucide-react";
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
  Legend,
} from "recharts";
import { isToday, parseISO } from "date-fns";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function DashboardSaude() {
  const { unidades, loading: loadingUnidades } = useUnidadesSaude();
  const { pacientes, loading: loadingPacientes } = usePacientes();
  const { agendamentos, loading: loadingAgendamentos } = useAgendamentos();
  const { tratamentos, loading: loadingTratamentos } = useTratamentos();
  const { indicadores, loading: loadingIndicadores } = useIndicadoresSaude();
  const { metas, loading: loadingMetas } = useMetasSaude();
  const { estatisticas: estatisticasVacina, loading: loadingVacinas } = useEstatisticasVacinacao();

  const loading =
    loadingUnidades ||
    loadingPacientes ||
    loadingAgendamentos ||
    loadingTratamentos ||
    loadingIndicadores ||
    loadingMetas ||
    loadingVacinas;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Estatísticas
  const unidadesAtivas = unidades.filter((u) => u.status === "ativo").length;
  const pacientesAtivos = pacientes.filter((p) => p.status === "ativo").length;
  const agendamentosHoje = agendamentos.filter((a) => isToday(parseISO(a.data_hora))).length;
  const tratamentosAtivos = tratamentos.filter((t) => t.status === "em_andamento").length;

  // Dados para gráficos
  const atendimentosPorTipo = agendamentos.reduce((acc, a) => {
    acc[a.tipo] = (acc[a.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosAtendimentos = Object.entries(atendimentosPorTipo).map(([tipo, quantidade]) => ({
    nome: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    quantidade,
  }));

  const statusAgendamentos = agendamentos.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosStatus = Object.entries(statusAgendamentos).map(([status, value]) => ({
    name: status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1),
    value,
  }));

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      critico: "text-red-600",
      atencao: "text-yellow-600",
      normal: "text-green-600",
      excelente: "text-emerald-600",
    };
    return colors[status] || "text-gray-600";
  };

  const getTendenciaIcon = (tendencia: string | null) => {
    if (tendencia === "alta") return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (tendencia === "baixa") return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unidades de Saúde</p>
                <p className="text-2xl font-bold">{unidadesAtivas}</p>
                <p className="text-xs text-muted-foreground">{unidades.length} total cadastradas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Cadastrados</p>
                <p className="text-2xl font-bold">{pacientesAtivos}</p>
                <p className="text-xs text-muted-foreground">{pacientes.length} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                <p className="text-2xl font-bold">{agendamentosHoje}</p>
                <p className="text-xs text-muted-foreground">{agendamentos.length} total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Stethoscope className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tratamentos Ativos</p>
                <p className="text-2xl font-bold">{tratamentosAtivos}</p>
                <p className="text-xs text-muted-foreground">{tratamentos.length} total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Syringe className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vacinas no Mês</p>
                <p className="text-2xl font-bold">{estatisticasVacina.totalVacinasMes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobertura Vacinal</p>
                <p className="text-2xl font-bold">{estatisticasVacina.coberturaVacinal}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Próximas Vacinas (30 dias)</p>
                <p className="text-2xl font-bold">{estatisticasVacina.proximasVacinas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Atendimentos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosAtendimentos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status dos Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dadosStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicadores de Saúde */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Indicadores de Saúde</CardTitle>
          </CardHeader>
          <CardContent>
            {indicadores.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum indicador cadastrado</p>
            ) : (
              <div className="space-y-4">
                {indicadores.slice(0, 5).map((indicador) => (
                  <div key={indicador.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTendenciaIcon(indicador.tendencia)}
                      <div>
                        <p className="font-medium text-sm">{indicador.nome}</p>
                        <p className="text-xs text-muted-foreground">{indicador.periodo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getStatusColor(indicador.status || "normal")}`}>
                        {indicador.valor} {indicador.unidade_medida}
                      </p>
                      {indicador.meta && (
                        <p className="text-xs text-muted-foreground">Meta: {indicador.meta}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metas de Saúde */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Metas de Saúde Pública</CardTitle>
          </CardHeader>
          <CardContent>
            {metas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma meta cadastrada</p>
            ) : (
              <div className="space-y-4">
                {metas.slice(0, 5).map((meta) => {
                  const progresso = meta.valor_meta > 0 ? (meta.valor_atual / meta.valor_meta) * 100 : 0;
                  return (
                    <div key={meta.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{meta.titulo}</p>
                        <Badge
                          variant={
                            meta.status === "atingida"
                              ? "default"
                              : meta.status === "em_andamento"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {meta.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Progress value={Math.min(progresso, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {meta.valor_atual} / {meta.valor_meta} {meta.unidade_medida}
                        </span>
                        <span>{progresso.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
