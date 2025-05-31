
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Clock, FileText, Target } from "lucide-react";

type IndicadorProgresso = {
  id: string;
  politicaId: string;
  politicaNome: string;
  indicador: string;
  meta: string;
  valorAtual: number;
  valorMeta: number;
  unidade: string;
  progresso: number;
  status: "atingido" | "em_andamento" | "atrasado";
  ultimaAtualizacao: Date;
};

type RelatorioImpacto = {
  id: string;
  politicaId: string;
  politicaNome: string;
  periodo: string;
  beneficiarios: number;
  investimento: number;
  resultados: string[];
  impactoSocial: string;
  recomendacoes: string[];
};

export function AcompanhamentoPoliticas() {
  const [indicadores] = useState<IndicadorProgresso[]>([
    {
      id: "1",
      politicaId: "1",
      politicaNome: "Programa Habitação Popular",
      indicador: "Famílias Atendidas",
      meta: "1000 famílias atendidas",
      valorAtual: 750,
      valorMeta: 1000,
      unidade: "famílias",
      progresso: 75,
      status: "em_andamento",
      ultimaAtualizacao: new Date("2024-11-15")
    },
    {
      id: "2",
      politicaId: "1",
      politicaNome: "Programa Habitação Popular",
      indicador: "Satisfação",
      meta: "95% de satisfação",
      valorAtual: 92,
      valorMeta: 95,
      unidade: "%",
      progresso: 97,
      status: "em_andamento",
      ultimaAtualizacao: new Date("2024-11-10")
    },
    {
      id: "3",
      politicaId: "2",
      politicaNome: "Educação Digital",
      indicador: "Escolas Conectadas",
      meta: "100% escolas conectadas",
      valorAtual: 100,
      valorMeta: 100,
      unidade: "%",
      progresso: 100,
      status: "atingido",
      ultimaAtualizacao: new Date("2024-11-20")
    },
    {
      id: "4",
      politicaId: "2",
      politicaNome: "Educação Digital",
      indicador: "Professores Capacitados",
      meta: "500 professores capacitados",
      valorAtual: 320,
      valorMeta: 500,
      unidade: "professores",
      progresso: 64,
      status: "atrasado",
      ultimaAtualizacao: new Date("2024-11-18")
    }
  ]);

  const [relatorios] = useState<RelatorioImpacto[]>([
    {
      id: "1",
      politicaId: "1",
      politicaNome: "Programa Habitação Popular",
      periodo: "3º Trimestre 2024",
      beneficiarios: 750,
      investimento: 3750000,
      resultados: [
        "750 famílias beneficiadas com habitação",
        "Redução de 15% no déficit habitacional da região",
        "Geração de 200 empregos diretos na construção civil"
      ],
      impactoSocial: "Melhoria significativa na qualidade de vida das famílias atendidas, com redução da vulnerabilidade social e aumento da estabilidade habitacional.",
      recomendacoes: [
        "Acelerar o cronograma de entregas",
        "Implementar programa de acompanhamento pós-entrega",
        "Expandir parcerias com construtoras locais"
      ]
    },
    {
      id: "2",
      politicaId: "2",
      politicaNome: "Educação Digital",
      periodo: "3º Trimestre 2024",
      beneficiarios: 8500,
      investimento: 1200000,
      resultados: [
        "30 escolas conectadas à internet de alta velocidade",
        "320 professores capacitados em tecnologias educacionais",
        "8.500 alunos com acesso a recursos digitais"
      ],
      impactoSocial: "Significativa melhoria no engajamento dos alunos e modernização do processo de ensino-aprendizagem nas escolas municipais.",
      recomendacoes: [
        "Intensificar programa de capacitação docente",
        "Ampliar laboratórios de informática",
        "Desenvolver conteúdo digital específico"
      ]
    }
  ]);

  const dadosProgresso = indicadores.map(ind => ({
    politica: ind.politicaNome.substring(0, 20) + "...",
    progresso: ind.progresso
  }));

  const dadosStatus = [
    { name: "Atingido", value: indicadores.filter(i => i.status === "atingido").length, color: "#22c55e" },
    { name: "Em Andamento", value: indicadores.filter(i => i.status === "em_andamento").length, color: "#3b82f6" },
    { name: "Atrasado", value: indicadores.filter(i => i.status === "atrasado").length, color: "#ef4444" }
  ];

  const getStatusBadge = (status: IndicadorProgresso["status"]) => {
    const statusConfig = {
      atingido: { label: "Atingido", variant: "default" as const, icon: CheckCircle },
      em_andamento: { label: "Em Andamento", variant: "secondary" as const, icon: Clock },
      atrasado: { label: "Atrasado", variant: "destructive" as const, icon: AlertTriangle }
    };
    
    return statusConfig[status];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total de Indicadores</p>
                <p className="text-2xl font-bold">{indicadores.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Metas Atingidas</p>
                <p className="text-2xl font-bold">{indicadores.filter(i => i.status === "atingido").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Indicadores Atrasados</p>
                <p className="text-2xl font-bold">{indicadores.filter(i => i.status === "atrasado").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Progresso Médio</p>
                <p className="text-2xl font-bold">
                  {Math.round(indicadores.reduce((acc, ind) => acc + ind.progresso, 0) / indicadores.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="indicadores">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="indicadores">Indicadores de Progresso</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios de Impacto</TabsTrigger>
          <TabsTrigger value="graficos">Análise Gráfica</TabsTrigger>
        </TabsList>

        <TabsContent value="indicadores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento de Indicadores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicadores.map((indicador) => {
                  const StatusIcon = getStatusBadge(indicador.status).icon;
                  return (
                    <div key={indicador.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{indicador.politicaNome}</h4>
                          <p className="text-sm text-gray-600">{indicador.indicador}</p>
                        </div>
                        <Badge variant={getStatusBadge(indicador.status).variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusBadge(indicador.status).label}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Meta: {indicador.meta}</span>
                          <span>
                            {indicador.valorAtual} / {indicador.valorMeta} {indicador.unidade}
                          </span>
                        </div>
                        <Progress value={indicador.progresso} className="h-2" />
                        <p className="text-xs text-gray-500">
                          Última atualização: {formatDate(indicador.ultimaAtualizacao)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <div className="space-y-4">
            {relatorios.map((relatorio) => (
              <Card key={relatorio.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {relatorio.politicaNome} - {relatorio.periodo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Beneficiários Atendidos</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {relatorio.beneficiarios.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Investimento Realizado</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(relatorio.investimento)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Resultados Alcançados</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {relatorio.resultados.map((resultado, index) => (
                        <li key={index} className="text-sm">{resultado}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Impacto Social</h4>
                    <p className="text-sm text-gray-700">{relatorio.impactoSocial}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Recomendações</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {relatorio.recomendacoes.map((recomendacao, index) => (
                        <li key={index} className="text-sm">{recomendacao}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="graficos" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progresso por Política</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosProgresso}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="politica" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progresso" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status dos Indicadores</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {dadosStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
