import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEducacaoStats } from "@/hooks/useEducacaoStats";
import { 
  School, 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  BarChart3
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

export function DashboardEducacional() {
  const { stats, statsPorEscola, desempenhoPorDisciplina, frequenciaPorTurma, loading } = useEducacaoStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando estatísticas...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Nenhum dado disponível</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Escolas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEscolas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.escolasAtivas} ativas • {stats.escolasInativas} inativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlunos}</div>
            <p className="text-xs text-muted-foreground">
              Matriculados na rede municipal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Professores</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfessores}</div>
            <p className="text-xs text-muted-foreground">
              Educadores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTurmas}</div>
            <p className="text-xs text-muted-foreground">
              Classes ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Desempenho */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Frequência</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaFrequenciaMedia}%</div>
            <Progress value={stats.taxaFrequenciaMedia} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.taxaFrequenciaMedia >= 75 ? "Ótima presença" : "Atenção necessária"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempenho Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.desempenhoMedio}</div>
            <Progress value={(stats.desempenhoMedio / 10) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.desempenhoMedio >= 7 ? "Acima da média" : "Precisa melhorar"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxaAprovacao}%</div>
            <Progress value={stats.taxaAprovacao} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: 90%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos em Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.alunosEmRisco}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Notas baixas ou faltas excessivas
            </p>
            {stats.alunosEmRisco > 0 && (
              <Badge variant="destructive" className="mt-2">Atenção Necessária</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Desempenho por Disciplina */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Disciplina</CardTitle>
          </CardHeader>
          <CardContent>
            {desempenhoPorDisciplina.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={desempenhoPorDisciplina}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="disciplina_nome" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="media_geral" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado de desempenho disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Frequência por Turma (Top 10) */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Presença por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            {frequenciaPorTurma.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={frequenciaPorTurma.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="turma_nome" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="taxa_presenca" 
                    stroke="hsl(var(--primary))" 
                    name="Taxa de Presença (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado de frequência disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Escola */}
      <Card>
        <CardHeader>
          <CardTitle>Desempenho por Escola</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statsPorEscola.map((escola) => (
              <div key={escola.escola_id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{escola.escola_nome}</h4>
                  <Badge variant={escola.taxa_ocupacao > 90 ? "destructive" : "secondary"}>
                    {escola.taxa_ocupacao}% ocupação
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Alunos</p>
                    <p className="font-medium">{escola.total_alunos}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Turmas</p>
                    <p className="font-medium">{escola.total_turmas}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Professores</p>
                    <p className="font-medium">{escola.total_professores}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Capacidade</p>
                    <p className="font-medium">{escola.total_alunos} / {escola.capacidade || 0}</p>
                  </div>
                </div>
                <Progress value={escola.taxa_ocupacao} className="mt-2" />
              </div>
            ))}
            {statsPorEscola.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma escola cadastrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
