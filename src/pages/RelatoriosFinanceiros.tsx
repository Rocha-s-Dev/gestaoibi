
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar, Filter, PieChart, BarChart as BarChartIcon, TrendingUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartPieChart, Pie, Cell } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Example data for charts
const monthlyData = [
  { name: 'Jan', receita: 12000, despesa: 8000 },
  { name: 'Fev', receita: 15000, despesa: 10000 },
  { name: 'Mar', receita: 18000, despesa: 12000 },
  { name: 'Abr', receita: 20000, despesa: 15000 },
  { name: 'Mai', receita: 22000, despesa: 17000 },
  { name: 'Jun', receita: 25000, despesa: 18000 },
];

const categoryData = [
  { name: 'Pessoal', value: 45000 },
  { name: 'Material', value: 15000 },
  { name: 'Serviços', value: 20000 },
  { name: 'Equipamentos', value: 12000 },
  { name: 'Outros', value: 8000 },
];

export default function RelatoriosFinanceiros() {
  const [dateRange, setDateRange] = useState({ start: "2025-01-01", end: "2025-04-30" });
  const [category, setCategory] = useState("all");
  const [reportType, setReportType] = useState("summary");
  
  const handleExportPDF = () => {
    // Em uma implementação real, esta função geraria um PDF
    console.log("Exportando para PDF");
  };
  
  const handleExportExcel = () => {
    // Em uma implementação real, esta função geraria um Excel
    console.log("Exportando para Excel");
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <header className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          </div>
          <p className="text-muted-foreground">
            Acesse e exporte relatórios financeiros detalhados da Secretaria Municipal de Administração e Finanças
          </p>
        </header>

        <div className="grid gap-6">
          <Card className="border-l-4 border-l-primary shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Filter className="mr-2 h-5 w-5 text-primary" />
                Filtros e Exportação
              </CardTitle>
              <CardDescription>
                Selecione o período e as categorias para gerar seus relatórios
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="start-date">Data Inicial</label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="end-date">Data Final</label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="category">Categoria</label>
                  <Select
                    value={category}
                    onValueChange={setCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="report-type">Tipo de Relatório</label>
                  <Select
                    value={reportType}
                    onValueChange={setReportType}
                  >
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Resumo Financeiro</SelectItem>
                      <SelectItem value="detailed">Detalhado por Categoria</SelectItem>
                      <SelectItem value="comparative">Comparativo Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button onClick={handleExportPDF} variant="outline" className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline" className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full md:w-[500px] grid-cols-3 mb-6">
              <TabsTrigger value="overview" className="text-sm">
                <PieChart className="mr-2 h-4 w-4" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="monthly" className="text-sm">
                <BarChartIcon className="mr-2 h-4 w-4" />
                Evolução Mensal
              </TabsTrigger>
              <TabsTrigger value="categories" className="text-sm">
                <TrendingUp className="mr-2 h-4 w-4" />
                Por Categoria
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-primary-800 font-medium">Total Receitas</CardDescription>
                    <CardTitle className="text-2xl text-primary-800 flex items-center">
                      <ArrowUpCircle className="text-primary mr-2 h-5 w-5" />
                      R$ 112.000,00
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-primary-700">Período: 01/01/2025 a 30/04/2025</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-red-800 font-medium">Total Despesas</CardDescription>
                    <CardTitle className="text-2xl text-red-800 flex items-center">
                      <ArrowDownCircle className="text-red-600 mr-2 h-5 w-5" />
                      R$ 80.000,00
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-red-700">Período: 01/01/2025 a 30/04/2025</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-blue-800 font-medium">Saldo Período</CardDescription>
                    <CardTitle className="text-2xl text-blue-800 flex items-center">
                      <TrendingUp className="text-blue-600 mr-2 h-5 w-5" />
                      R$ 32.000,00
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-blue-700">Superávit de 28,57%</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Composição das Despesas</CardTitle>
                  <CardDescription>Distribuição percentual por categoria</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal - Receitas x Despesas</CardTitle>
                  <CardDescription>Comparativo dos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="receita" name="Receitas" fill="#4ade80" />
                      <Bar dataKey="despesa" name="Despesas" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Saldo</CardTitle>
                  <CardDescription>Evolução do saldo acumulado no período</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyData.map((item, index) => {
                        const prevSaldo = index > 0 
                          ? monthlyData.slice(0, index).reduce((sum, i) => sum + (i.receita - i.despesa), 0) 
                          : 0;
                        return { 
                          ...item, 
                          saldo: prevSaldo + (item.receita - item.despesa) 
                        };
                      })}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="saldo" 
                        name="Saldo" 
                        stroke="#3b82f6" 
                        strokeWidth={2} 
                        dot={{ r: 6 }} 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Despesas por Categoria</CardTitle>
                  <CardDescription>Análise detalhada por tipo de despesa</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={categoryData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="value" name="Valor" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">Valores acumulados no período selecionado</p>
                </CardFooter>
              </Card>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Principais Despesas</CardTitle>
                    <CardDescription>Top 5 maiores despesas no período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { desc: "Folha de Pagamento - Março", valor: 22500, percent: 28 },
                        { desc: "Aquisição de Equipamentos", valor: 12000, percent: 15 },
                        { desc: "Serviços de Manutenção", valor: 8500, percent: 11 },
                        { desc: "Material de Consumo", valor: 7300, percent: 9 },
                        { desc: "Treinamento de Pessoal", valor: 5200, percent: 7 }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.desc}</span>
                            <span className="font-medium">R$ {item.valor.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${item.percent}%` }} 
                            />
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {item.percent}% do total
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Principais Receitas</CardTitle>
                    <CardDescription>Top 5 maiores receitas no período</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { desc: "Repasse Federal - Março", valor: 30000, percent: 27 },
                        { desc: "Arrecadação Municipal - Abril", valor: 25000, percent: 22 },
                        { desc: "Convênio Estadual", valor: 20000, percent: 18 },
                        { desc: "Multas e Juros", valor: 12000, percent: 11 },
                        { desc: "Emolumentos e Taxas", valor: 8000, percent: 7 }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.desc}</span>
                            <span className="font-medium">R$ {item.valor.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${item.percent}%` }} 
                            />
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {item.percent}% do total
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
