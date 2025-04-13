
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line } from "recharts";
import { Chart } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Dados simulados para as metas
const metasData = {
  atendimento: {
    metaAnual: 5000,
    atual: 3250,
    historico: [
      { mes: "Jan", valor: 380 },
      { mes: "Fev", valor: 420 },
      { mes: "Mar", valor: 510 },
      { mes: "Abr", valor: 580 },
      { mes: "Mai", valor: 650 },
      { mes: "Jun", valor: 710 },
    ],
    acumulado: [
      { mes: "Jan", valor: 380 },
      { mes: "Fev", valor: 800 },
      { mes: "Mar", valor: 1310 },
      { mes: "Abr", valor: 1890 },
      { mes: "Mai", valor: 2540 },
      { mes: "Jun", valor: 3250 },
    ],
    porPrograma: [
      { nome: "Bolsa Família", valor: 1450 },
      { nome: "Auxílio Moradia", valor: 680 },
      { nome: "Capacitação Profissional", valor: 520 },
      { nome: "Auxílio Alimentação", valor: 430 },
      { nome: "Outros", valor: 170 },
    ]
  },
  satisfacao: {
    metaPercentual: 90,
    atual: 84,
    historico: [
      { mes: "Jan", valor: 76 },
      { mes: "Fev", valor: 78 },
      { mes: "Mar", valor: 80 },
      { mes: "Abr", valor: 81 },
      { mes: "Mai", valor: 83 },
      { mes: "Jun", valor: 84 },
    ],
    porPrograma: [
      { nome: "Bolsa Família", valor: 86 },
      { nome: "Auxílio Moradia", valor: 82 },
      { nome: "Capacitação Profissional", valor: 88 },
      { nome: "Auxílio Alimentação", valor: 85 },
      { nome: "Outros", valor: 79 },
    ],
    aspectos: [
      { nome: "Atendimento", valor: 87 },
      { nome: "Rapidez", valor: 79 },
      { nome: "Informações", valor: 83 },
      { nome: "Acompanhamento", valor: 85 },
      { nome: "Qualidade do serviço", valor: 86 },
    ]
  }
};

export function MetasBeneficiarios() {
  const [metricas, setMetricas] = useState<"atendimento" | "satisfacao">("atendimento");

  const porcentagemAtendimento = Math.round((metasData.atendimento.atual / metasData.atendimento.metaAnual) * 100);
  
  return (
    <div className="space-y-6">
      <Tabs value={metricas} onValueChange={(v) => setMetricas(v as "atendimento" | "satisfacao")} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="atendimento">Aumento do Atendimento</TabsTrigger>
          <TabsTrigger value="satisfacao">Satisfação do Usuário</TabsTrigger>
        </TabsList>

        <TabsContent value="atendimento" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Meta Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metasData.atendimento.metaAnual.toLocaleString()} beneficiários</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metasData.atendimento.atual.toLocaleString()} beneficiários</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{porcentagemAtendimento}%</div>
                <Progress value={porcentagemAtendimento} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Últimos 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  +{metasData.atendimento.historico[metasData.atendimento.historico.length - 1].valor} beneficiários
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atendimentos Mensais</CardTitle>
                <CardDescription>Quantidade de novos beneficiários por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  type="line"
                  height={350}
                  data={metasData.atendimento.historico}
                  index="mes"
                  categories={["valor"]}
                  colors={["#10b981"]}
                  valueFormatter={(value) => `${value} beneficiários`}
                  yAxisWidth={48}
                >
                  <Line dataKey="valor" />
                </Chart>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progresso Acumulado</CardTitle>
                <CardDescription>Rumo à meta anual de {metasData.atendimento.metaAnual.toLocaleString()} beneficiários</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  type="line"
                  height={350}
                  data={metasData.atendimento.acumulado}
                  index="mes"
                  categories={["valor"]}
                  colors={["#6366f1"]}
                  valueFormatter={(value) => `${value} beneficiários`}
                  yAxisWidth={48}
                >
                  <Line dataKey="valor" />
                </Chart>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atendimentos por Programa</CardTitle>
              <CardDescription>Distribuição de beneficiários entre os programas sociais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metasData.atendimento.porPrograma.map((programa) => (
                  <div key={programa.nome}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{programa.nome}</span>
                      <span className="text-sm text-muted-foreground">
                        {programa.valor} ({Math.round((programa.valor / metasData.atendimento.atual) * 100)}%)
                      </span>
                    </div>
                    <Progress value={(programa.valor / metasData.atendimento.atual) * 100} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfacao" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Meta de Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metasData.satisfacao.metaPercentual}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Satisfação Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metasData.satisfacao.atual}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((metasData.satisfacao.atual / metasData.satisfacao.metaPercentual) * 100)}%
                </div>
                <Progress value={(metasData.satisfacao.atual / metasData.satisfacao.metaPercentual) * 100} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Variação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{metasData.satisfacao.historico[metasData.satisfacao.historico.length - 1].valor - 
                     metasData.satisfacao.historico[0].valor}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Evolução da Satisfação</CardTitle>
              <CardDescription>Pesquisas mensais de satisfação dos usuários (%)</CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                type="line"
                height={350}
                data={metasData.satisfacao.historico}
                index="mes"
                categories={["valor"]}
                colors={["#f59e0b"]}
                valueFormatter={(value) => `${value}%`}
                yAxisWidth={40}
              >
                <Line dataKey="valor" />
              </Chart>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Satisfação por Programa</CardTitle>
                <CardDescription>Percentual de satisfação por programa social</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metasData.satisfacao.porPrograma.map((programa) => (
                    <div key={programa.nome}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{programa.nome}</span>
                        <span className="text-sm text-muted-foreground">{programa.valor}%</span>
                      </div>
                      <Progress value={programa.valor} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aspectos Avaliados</CardTitle>
                <CardDescription>Índices de satisfação por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metasData.satisfacao.aspectos.map((aspecto) => (
                    <div key={aspecto.nome}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{aspecto.nome}</span>
                        <span className="text-sm text-muted-foreground">{aspecto.valor}%</span>
                      </div>
                      <Progress value={aspecto.valor} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
