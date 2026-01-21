import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
import {
  TrendingUp,
  TrendingDown,
  Users,
  School,
  AlertTriangle,
  Award,
  GraduationCap,
  CalendarCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react";
import { useIndicadoresEducacionais } from "@/hooks/useIndicadoresEducacionais";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function IndicadoresEducacionais() {
  const { indicadoresGerais, indicadoresPorEscola, loading, refreshIndicadores } = useIndicadoresEducacionais();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!indicadoresGerais) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum dado disponível para calcular indicadores.
        </CardContent>
      </Card>
    );
  }

  const statusData = Object.entries(indicadoresGerais.alunos_por_status).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  const escolasChartData = indicadoresPorEscola.slice(0, 10).map((e) => ({
    nome: e.escola_nome.length > 20 ? e.escola_nome.substring(0, 20) + "..." : e.escola_nome,
    IDEB: e.ideb_estimado,
    Media: e.media_notas,
    Frequencia: e.frequencia_media,
  }));

  const getIndicatorColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return "text-green-600";
    if (value >= thresholds.warning) return "text-yellow-600";
    return "text-red-600";
  };

  const getIdebStatus = (ideb: number) => {
    if (ideb >= 6) return { label: "Excelente", color: "bg-green-500" };
    if (ideb >= 5) return { label: "Bom", color: "bg-blue-500" };
    if (ideb >= 4) return { label: "Regular", color: "bg-yellow-500" };
    return { label: "Crítico", color: "bg-red-500" };
  };

  const idebStatus = getIdebStatus(indicadoresGerais.ideb_medio_estimado);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Indicadores Educacionais</h2>
          <p className="text-muted-foreground">
            Análise automática de desempenho da rede municipal
          </p>
        </div>
        <Button variant="outline" onClick={refreshIndicadores}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">IDEB Estimado</p>
                <p className={`text-3xl font-bold ${getIndicatorColor(indicadoresGerais.ideb_medio_estimado, { good: 6, warning: 4 })}`}>
                  {indicadoresGerais.ideb_medio_estimado.toFixed(1)}
                </p>
                <Badge className={`mt-1 ${idebStatus.color}`}>{idebStatus.label}</Badge>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Taxa de Aprovação</p>
                <p className={`text-3xl font-bold ${getIndicatorColor(indicadoresGerais.taxa_aprovacao_geral, { good: 80, warning: 60 })}`}>
                  {indicadoresGerais.taxa_aprovacao_geral.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Meta: 90%</span>
                </div>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Frequência Média</p>
                <p className={`text-3xl font-bold ${getIndicatorColor(indicadoresGerais.frequencia_media_geral, { good: 90, warning: 75 })}`}>
                  {indicadoresGerais.frequencia_media_geral.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1 text-sm text-purple-600">
                  <CalendarCheck className="h-4 w-4" />
                  <span>Mínimo: 75%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <CalendarCheck className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Taxa de Evasão</p>
                <p className={`text-3xl font-bold ${indicadoresGerais.taxa_evasao_geral <= 2 ? "text-green-600" : indicadoresGerais.taxa_evasao_geral <= 5 ? "text-yellow-600" : "text-red-600"}`}>
                  {indicadoresGerais.taxa_evasao_geral.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Meta: &lt;2%</span>
                </div>
              </div>
              <div className="p-3 bg-red-500 rounded-full">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
                <p className="text-2xl font-bold">{indicadoresGerais.total_alunos.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full">
                <School className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Escolas Ativas</p>
                <p className="text-2xl font-bold">{indicadoresGerais.total_escolas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alunos em Risco</p>
                <p className="text-2xl font-bold text-amber-600">{indicadoresGerais.alunos_em_risco}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IDEB por Escola */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              IDEB Estimado por Escola (Top 10)
            </CardTitle>
            <CardDescription>
              Comparativo de desempenho entre as escolas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={escolasChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 10]} />
                  <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="IDEB" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Distribuição de Alunos por Status
            </CardTitle>
            <CardDescription>
              Situação atual dos alunos matriculados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo por Escola */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comparativo de Indicadores por Escola
          </CardTitle>
          <CardDescription>
            Média de notas, frequência e IDEB estimado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={escolasChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="IDEB" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Media" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Escola</CardTitle>
          <CardDescription>
            Todos os indicadores calculados para cada unidade escolar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Escola</th>
                  <th className="text-center p-3 font-semibold">Alunos</th>
                  <th className="text-center p-3 font-semibold">Média</th>
                  <th className="text-center p-3 font-semibold">Frequência</th>
                  <th className="text-center p-3 font-semibold">Evasão</th>
                  <th className="text-center p-3 font-semibold">IDEB Est.</th>
                  <th className="text-center p-3 font-semibold">Em Risco</th>
                </tr>
              </thead>
              <tbody>
                {indicadoresPorEscola.map((escola) => {
                  const idebStatusEscola = getIdebStatus(escola.ideb_estimado);
                  return (
                    <tr key={escola.escola_id} className="border-b hover:bg-muted/30">
                      <td className="p-3 font-medium">{escola.escola_nome}</td>
                      <td className="text-center p-3">{escola.total_alunos}</td>
                      <td className={`text-center p-3 font-semibold ${getIndicatorColor(escola.media_notas, { good: 7, warning: 5 })}`}>
                        {escola.media_notas.toFixed(1)}
                      </td>
                      <td className={`text-center p-3 font-semibold ${getIndicatorColor(escola.frequencia_media, { good: 90, warning: 75 })}`}>
                        {escola.frequencia_media.toFixed(1)}%
                      </td>
                      <td className={`text-center p-3 font-semibold ${escola.taxa_evasao <= 2 ? "text-green-600" : escola.taxa_evasao <= 5 ? "text-yellow-600" : "text-red-600"}`}>
                        {escola.taxa_evasao.toFixed(1)}%
                      </td>
                      <td className="text-center p-3">
                        <Badge className={idebStatusEscola.color}>
                          {escola.ideb_estimado.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="text-center p-3">
                        {escola.alunos_em_risco > 0 ? (
                          <Badge variant="destructive">{escola.alunos_em_risco}</Badge>
                        ) : (
                          <Badge variant="outline">0</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
