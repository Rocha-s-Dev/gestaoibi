
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Download, FileText, TrendingUp, Users, School, Award } from "lucide-react";

export function RelatoriosEducacao() {
  const [selectedSchool, setSelectedSchool] = useState<string>("todas");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2024");

  // Mock data para relatórios
  const desempenhoEscolas = [
    { escola: "EMEI Pequeno Príncipe", alunos: 180, aprovacao: 95, evasao: 2, nota_municipal: 8.5 },
    { escola: "EMEF Dom Pedro II", alunos: 350, aprovacao: 88, evasao: 5, nota_municipal: 7.8 },
    { escola: "EMEF Santos Dumont", alunos: 280, aprovacao: 92, evasao: 3, nota_municipal: 8.2 },
    { escola: "EJA Centro", alunos: 120, aprovacao: 85, evasao: 8, nota_municipal: 7.5 }
  ];

  const indicadoresMunicipais = [
    { mes: "Jan", matriculas: 1250, aprovacao: 89, evasao: 4 },
    { mes: "Fev", matriculas: 1280, aprovacao: 90, evasao: 3.8 },
    { mes: "Mar", matriculas: 1300, aprovacao: 91, evasao: 3.5 },
    { mes: "Abr", matriculas: 1320, aprovacao: 88, evasao: 4.2 },
    { mes: "Mai", matriculas: 1310, aprovacao: 89, evasao: 4.0 },
    { mes: "Jun", matriculas: 1300, aprovacao: 92, evasao: 3.2 }
  ];

  const resumoGeral = {
    totalEscolas: 15,
    totalAlunos: 2850,
    aprovacaoMedia: 89.2,
    evasaoMedia: 4.1,
    notaIdeb: 6.8
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar escola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Escolas</SelectItem>
              <SelectItem value="emei-pp">EMEI Pequeno Príncipe</SelectItem>
              <SelectItem value="emef-dp">EMEF Dom Pedro II</SelectItem>
              <SelectItem value="emef-sd">EMEF Santos Dumont</SelectItem>
              <SelectItem value="eja-centro">EJA Centro</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <School className="mr-2 h-4 w-4" />
              Total de Escolas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumoGeral.totalEscolas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumoGeral.totalAlunos.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="mr-2 h-4 w-4" />
              Taxa de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resumoGeral.aprovacaoMedia}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Taxa de Evasão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{resumoGeral.evasaoMedia}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Nota IDEB
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{resumoGeral.notaIdeb}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Escola</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={desempenhoEscolas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="escola" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="aprovacao" fill="#22c55e" name="Taxa de Aprovação (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores Municipais - {selectedPeriod}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={indicadoresMunicipais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="aprovacao" stroke="#22c55e" name="Aprovação (%)" />
                <Line type="monotone" dataKey="evasao" stroke="#ef4444" name="Evasão (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Escola</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Escola</th>
                  <th className="text-left p-2">Nº Alunos</th>
                  <th className="text-left p-2">Taxa Aprovação</th>
                  <th className="text-left p-2">Taxa Evasão</th>
                  <th className="text-left p-2">Nota Municipal</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {desempenhoEscolas.map((escola, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{escola.escola}</td>
                    <td className="p-2">{escola.alunos}</td>
                    <td className="p-2">
                      <span className="text-green-600 font-semibold">{escola.aprovacao}%</span>
                    </td>
                    <td className="p-2">
                      <span className="text-red-600 font-semibold">{escola.evasao}%</span>
                    </td>
                    <td className="p-2">
                      <span className="text-blue-600 font-semibold">{escola.nota_municipal}</span>
                    </td>
                    <td className="p-2">
                      <Badge className={
                        escola.aprovacao >= 90 ? "bg-green-100 text-green-800" :
                        escola.aprovacao >= 80 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {escola.aprovacao >= 90 ? "Excelente" :
                         escola.aprovacao >= 80 ? "Bom" : "Atenção"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
