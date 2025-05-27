import { useState } from "react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Dados simulados para os programas sociais
const programasData = [
  {
    nome: "Bolsa Família",
    eficacia: [
      { mes: "Jan", valor: 82 },
      { mes: "Fev", valor: 85 },
      { mes: "Mar", valor: 83 },
      { mes: "Abr", valor: 87 },
      { mes: "Mai", valor: 89 },
      { mes: "Jun", valor: 92 },
    ],
    beneficiarios: 1250,
    orcamento: "R$ 780.000,00",
    responsaveis: ["Maria Santos", "João Silva"],
    indicadores: ["Redução de pobreza extrema", "Frequência escolar"],
  },
  {
    nome: "Auxílio Moradia",
    eficacia: [
      { mes: "Jan", valor: 75 },
      { mes: "Fev", valor: 73 },
      { mes: "Mar", valor: 78 },
      { mes: "Abr", valor: 82 },
      { mes: "Mai", valor: 85 },
      { mes: "Jun", valor: 84 },
    ],
    beneficiarios: 580,
    orcamento: "R$ 450.000,00",
    responsaveis: ["Ana Oliveira", "Carlos Mendes"],
    indicadores: ["Famílias com moradia adequada", "Redução de pessoas em situação de rua"],
  },
  {
    nome: "Capacitação Profissional",
    eficacia: [
      { mes: "Jan", valor: 68 },
      { mes: "Fev", valor: 72 },
      { mes: "Mar", valor: 75 },
      { mes: "Abr", valor: 80 },
      { mes: "Mai", valor: 83 },
      { mes: "Jun", valor: 85 },
    ],
    beneficiarios: 320,
    orcamento: "R$ 280.000,00",
    responsaveis: ["Teresa Souza", "Ricardo Lima"],
    indicadores: ["Taxa de empregabilidade", "Aumento de renda familiar"],
  },
];

export function AcompanhamentoProgramas() {
  const [selectedPrograma, setSelectedPrograma] = useState(programasData[0].nome);
  
  const programaSelecionado = programasData.find(
    (programa) => programa.nome === selectedPrograma
  );

  const chartConfig = {
    valor: {
      label: "Eficácia (%)",
      color: "#4C9AFF",
    },
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Selecione o programa:</p>
          <Select
            value={selectedPrograma}
            onValueChange={setSelectedPrograma}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Selecione um programa" />
            </SelectTrigger>
            <SelectContent>
              {programasData.map((programa) => (
                <SelectItem key={programa.nome} value={programa.nome}>
                  {programa.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {programaSelecionado && (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Beneficiários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{programaSelecionado.beneficiarios}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Orçamento Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{programaSelecionado.orcamento}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Eficácia Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {programaSelecionado.eficacia[programaSelecionado.eficacia.length - 1].valor}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  +{programaSelecionado.eficacia[programaSelecionado.eficacia.length - 1].valor - 
                    programaSelecionado.eficacia[0].valor}%
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Eficácia do Programa</CardTitle>
                <CardDescription>
                  Índice de eficácia nos últimos 6 meses (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[350px]">
                  <BarChart data={programaSelecionado.eficacia}>
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="valor" fill="var(--color-valor)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Responsáveis</h4>
                    <ul className="list-disc pl-5">
                      {programaSelecionado.responsaveis.map((resp) => (
                        <li key={resp}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Indicadores de Desempenho</h4>
                    <ul className="list-disc pl-5">
                      {programaSelecionado.indicadores.map((ind) => (
                        <li key={ind}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
