
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Download, FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const data = [
  { nome: 'Jan', receitas: 4000, despesas: 2400 },
  { nome: 'Fev', receitas: 3000, despesas: 1398 },
  { nome: 'Mar', receitas: 2000, despesas: 9800 },
  { nome: 'Abr', receitas: 2780, despesas: 3908 },
  { nome: 'Mai', receitas: 1890, despesas: 4800 },
  { nome: 'Jun', receitas: 2390, despesas: 3800 },
];

const dataPie = [
  { name: 'Folha de Pagamento', value: 35 },
  { name: 'Infraestrutura', value: 25 },
  { name: 'Serviços Públicos', value: 20 },
  { name: 'Saúde', value: 15 },
  { name: 'Outros', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function FinanceiroRelatorios() {
  const [dataInicio, setDataInicio] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date());
  const [tipoRelatorio, setTipoRelatorio] = useState("receitas-despesas");
  const [categoria, setCategoria] = useState("todos");

  const handleGerarPDF = () => {
    console.log("Gerando relatório em PDF");
    // Implementação futura para gerar PDF
  };

  const handleGerarExcel = () => {
    console.log("Gerando relatório em Excel");
    // Implementação futura para gerar Excel
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground mt-2">
            Geração de relatórios detalhados com filtros por período e categoria
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>
              Defina os parâmetros para gerar os relatórios financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="data-inicio">Data de início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataInicio ? format(dataInicio, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataInicio}
                      onSelect={setDataInicio}
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="data-fim">Data de fim</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataFim ? format(dataFim, 'dd/MM/yyyy') : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataFim}
                      onSelect={setDataFim}
                      locale={pt}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tipo-relatorio">Tipo de relatório</Label>
                <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receitas-despesas">Receitas x Despesas</SelectItem>
                    <SelectItem value="despesas-categoria">Despesas por categoria</SelectItem>
                    <SelectItem value="fluxo-caixa">Fluxo de caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="folha-pagamento">Folha de pagamento</SelectItem>
                    <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                    <SelectItem value="servicos-publicos">Serviços públicos</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={handleGerarExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button variant="outline" onClick={handleGerarPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="graficos" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="tabelas">Tabelas</TabsTrigger>
          </TabsList>

          <TabsContent value="graficos" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Receitas vs. Despesas</CardTitle>
                <CardDescription>
                  Comparativo mensal entre receitas e despesas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="receitas" fill="#4CAF50" name="Receitas" />
                      <Bar dataKey="despesas" fill="#F44336" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de despesas por categoria</CardTitle>
                <CardDescription>
                  Percentual de cada categoria nas despesas totais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataPie}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dataPie.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tabelas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento financeiro</CardTitle>
                <CardDescription>
                  Dados detalhados dos registros financeiros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50 text-sm">
                        <th className="p-3 text-left font-medium">Mês</th>
                        <th className="p-3 text-left font-medium">Receitas</th>
                        <th className="p-3 text-left font-medium">Despesas</th>
                        <th className="p-3 text-left font-medium">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-3">{item.nome}</td>
                          <td className="p-3 text-green-600">R$ {item.receitas.toLocaleString('pt-BR')}</td>
                          <td className="p-3 text-red-600">R$ {item.despesas.toLocaleString('pt-BR')}</td>
                          <td className={cn("p-3", (item.receitas - item.despesas) >= 0 ? "text-green-600" : "text-red-600")}>
                            R$ {(item.receitas - item.despesas).toLocaleString('pt-BR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 font-medium">
                        <td className="p-3">Total</td>
                        <td className="p-3 text-green-600">
                          R$ {data.reduce((sum, item) => sum + item.receitas, 0).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3 text-red-600">
                          R$ {data.reduce((sum, item) => sum + item.despesas, 0).toLocaleString('pt-BR')}
                        </td>
                        <td className={cn("p-3", 
                          (data.reduce((sum, item) => sum + item.receitas, 0) - 
                          data.reduce((sum, item) => sum + item.despesas, 0)) >= 0 
                            ? "text-green-600" 
                            : "text-red-600"
                        )}>
                          R$ {(
                            data.reduce((sum, item) => sum + item.receitas, 0) - 
                            data.reduce((sum, item) => sum + item.despesas, 0)
                          ).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
