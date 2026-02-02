import { useState, useEffect } from "react";
import { useRelatoriosIPTU } from "@/hooks/useIPTUCompleto";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { Download, FileText, TrendingUp, MapPin, AlertTriangle } from "lucide-react";

export function RelatoriosIPTU() {
  const { getArrecadacaoPorBairro, getInadimplenciaPorPeriodo, getEvolucaoHistorica, getRelatorioTCE } = useRelatoriosIPTU();
  
  const [exercicio, setExercicio] = useState(new Date().getFullYear());
  const [dataInicio, setDataInicio] = useState(`${exercicio}-01-01`);
  const [dataFim, setDataFim] = useState(`${exercicio}-12-31`);
  
  const [dadosBairro, setDadosBairro] = useState<any[]>([]);
  const [dadosInadimplencia, setDadosInadimplencia] = useState<any[]>([]);
  const [dadosEvolucao, setDadosEvolucao] = useState<any[]>([]);
  const [relatorioTCE, setRelatorioTCE] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [exercicio]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bairro, evolucao, tce] = await Promise.all([
        getArrecadacaoPorBairro(exercicio),
        getEvolucaoHistorica(),
        getRelatorioTCE(exercicio),
      ]);
      setDadosBairro(bairro || []);
      setDadosEvolucao(evolucao || []);
      setRelatorioTCE(tce);
    } finally {
      setLoading(false);
    }
  };

  const loadInadimplencia = async () => {
    setLoading(true);
    try {
      const data = await getInadimplenciaPorPeriodo(dataInicio, dataFim);
      setDadosInadimplencia(data || []);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF6B6B"];

  const exercicios = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      {/* Seleção de Exercício */}
      <div className="flex items-center gap-4">
        <div>
          <Label>Exercício</Label>
          <Select value={exercicio.toString()} onValueChange={(v) => setExercicio(parseInt(v))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {exercicios.map((e) => (
                <SelectItem key={e} value={e.toString()}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline">
          Atualizar Dados
        </Button>
      </div>

      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumo" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            Resumo TCE
          </TabsTrigger>
          <TabsTrigger value="bairro" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Por Bairro
          </TabsTrigger>
          <TabsTrigger value="inadimplencia" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Inadimplência
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Evolução Histórica
          </TabsTrigger>
        </TabsList>

        {/* Resumo TCE */}
        <TabsContent value="resumo" className="space-y-4">
          {relatorioTCE && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Imóveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioTCE.totalImoveis}</div>
                    <p className="text-xs text-muted-foreground">Lançados em {exercicio}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Lançado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(relatorioTCE.totalLancado)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(relatorioTCE.totalArrecadado)}</div>
                    <p className="text-xs text-muted-foreground">{relatorioTCE.percentualArrecadacao}% do lançado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Em Aberto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(relatorioTCE.totalEmAberto)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Pizza */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição da Arrecadação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Arrecadado", value: relatorioTCE.totalArrecadado },
                            { name: "Em Aberto", value: relatorioTCE.totalEmAberto },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#f97316" />
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Botão Exportar */}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório TCE
              </Button>
            </>
          )}
        </TabsContent>

        {/* Por Bairro */}
        <TabsContent value="bairro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arrecadação por Bairro - {exercicio}</CardTitle>
              <CardDescription>Distribuição do lançamento de IPTU por localidade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosBairro} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="bairro" />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="valor" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bairro</TableHead>
                    <TableHead className="text-right">Valor Lançado</TableHead>
                    <TableHead className="text-right">% do Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosBairro.map((b: any, i: number) => {
                    const total = dadosBairro.reduce((sum: number, x: any) => sum + x.valor, 0);
                    const percentual = total > 0 ? ((b.valor / total) * 100).toFixed(2) : 0;
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{b.bairro}</TableCell>
                        <TableCell className="text-right">{formatCurrency(b.valor)}</TableCell>
                        <TableCell className="text-right">{percentual}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inadimplência */}
        <TabsContent value="inadimplencia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Inadimplência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div>
                  <Label>Data Início</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={loadInadimplencia} disabled={loading}>
                    Buscar
                  </Button>
                </div>
              </div>

              {dadosInadimplencia.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Inscrição</TableHead>
                      <TableHead>Contribuinte</TableHead>
                      <TableHead>Bairro</TableHead>
                      <TableHead>Parcela</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosInadimplencia.slice(0, 50).map((i: any) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-mono">{i.iptu_lancamentos?.imoveis?.inscricao_imobiliaria}</TableCell>
                        <TableCell>{i.iptu_lancamentos?.contribuintes?.nome_razao_social}</TableCell>
                        <TableCell>{i.iptu_lancamentos?.imoveis?.bairro}</TableCell>
                        <TableCell>{i.numero_parcela}ª</TableCell>
                        <TableCell className="text-destructive">
                          {new Date(i.data_vencimento).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(i.valor || 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Selecione um período e clique em buscar
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evolução Histórica */}
        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Histórica do IPTU</CardTitle>
              <CardDescription>Comparativo de lançamento e arrecadação ao longo dos anos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="exercicio" />
                    <YAxis tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="lancado" 
                      stroke="#3b82f6" 
                      name="Lançado"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="arrecadado" 
                      stroke="#22c55e" 
                      name="Arrecadado"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exercício</TableHead>
                    <TableHead className="text-right">Lançado</TableHead>
                    <TableHead className="text-right">Arrecadado</TableHead>
                    <TableHead className="text-right">% Arrecadação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosEvolucao.map((e: any) => {
                    const percentual = e.lancado > 0 ? ((e.arrecadado / e.lancado) * 100).toFixed(2) : 0;
                    return (
                      <TableRow key={e.exercicio}>
                        <TableCell className="font-bold">{e.exercicio}</TableCell>
                        <TableCell className="text-right">{formatCurrency(e.lancado)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(e.arrecadado)}</TableCell>
                        <TableCell className="text-right">{percentual}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
