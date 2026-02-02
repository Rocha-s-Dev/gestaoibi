import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, AlertTriangle, Trophy, Download } from "lucide-react";
import { useRelatoriosISS } from "@/hooks/useISSCompleto";
import { format } from "date-fns";

export function RelatoriosISS() {
  const {
    getArrecadacaoPorAtividade,
    getRankingContribuintes,
    getInadimplencia,
    getEstatisticas,
  } = useRelatoriosISS();

  const [activeTab, setActiveTab] = useState("resumo");
  const [periodoInicio, setPeriodoInicio] = useState(
    `${new Date().getFullYear()}-01`
  );
  const [periodoFim, setPeriodoFim] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  );
  const [estatisticas, setEstatisticas] = useState<any>({});
  const [ranking, setRanking] = useState<any[]>([]);
  const [inadimplentes, setInadimplentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stats, rank, inad] = await Promise.all([
        getEstatisticas(),
        getRankingContribuintes(periodoInicio, periodoFim),
        getInadimplencia(),
      ]);
      setEstatisticas(stats);
      setRanking(rank as any[]);
      setInadimplentes(inad as any[]);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setLoading(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const totalInadimplencia = inadimplentes.reduce(
    (acc, i) => acc + Number(i.valor_total || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Arrecadado no Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estatisticas.totalArrecadadoAno)}
            </div>
            <p className="text-xs text-muted-foreground">Ano de {new Date().getFullYear()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Arrecadado no Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(estatisticas.totalArrecadadoMes)}
            </div>
            <p className="text-xs text-muted-foreground">Mês atual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Total Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(estatisticas.totalPendente)}
            </div>
            <p className="text-xs text-muted-foreground">Guias em aberto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              NFS-e Emitidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {estatisticas.totalNfseEmitidas || 0}
            </div>
            <p className="text-xs text-muted-foreground">No ano</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="ranking">Ranking Contribuintes</TabsTrigger>
          <TabsTrigger value="inadimplencia">Inadimplência</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* Filtro de Período */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label>Período Início</Label>
                  <Input
                    type="month"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Período Fim</Label>
                  <Input
                    type="month"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                  />
                </div>
                <Button onClick={loadData} disabled={loading}>
                  Atualizar
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          <TabsContent value="resumo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Arrecadação por Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Gráfico de barras por mês
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Gráfico de pizza por atividade
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ranking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Maiores Contribuintes de ISS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Contribuinte</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Inscrição Municipal</TableHead>
                      <TableHead className="text-right">Total Arrecadado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : ranking.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum dado encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      ranking.slice(0, 20).map((item: any, index) => (
                        <TableRow key={item.contribuinte?.id || index}>
                          <TableCell className="font-bold">
                            {index + 1}
                            {index < 3 && <span className="ml-1">🏆</span>}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.contribuinte?.nome_razao_social}
                          </TableCell>
                          <TableCell>{item.contribuinte?.cpf_cnpj}</TableCell>
                          <TableCell>{item.contribuinte?.inscricao_municipal || "-"}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            {formatCurrency(item.total_arrecadado)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inadimplencia">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Guias em Atraso
                  </CardTitle>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total em atraso:</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(totalInadimplencia)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guia</TableHead>
                      <TableHead>Contribuinte</TableHead>
                      <TableHead>Competência</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Dias Atraso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : inadimplentes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Nenhuma guia em atraso
                        </TableCell>
                      </TableRow>
                    ) : (
                      inadimplentes.map((guia: any) => {
                        const diasAtraso = Math.floor(
                          (new Date().getTime() - new Date(guia.data_vencimento).getTime()) /
                            (1000 * 60 * 60 * 24)
                        );
                        return (
                          <TableRow key={guia.id}>
                            <TableCell className="font-medium">{guia.numero_guia}</TableCell>
                            <TableCell>{guia.contribuinte?.nome_razao_social}</TableCell>
                            <TableCell>{guia.competencia}</TableCell>
                            <TableCell>
                              {format(new Date(guia.data_vencimento), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(guia.valor_total)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-red-600 font-semibold">
                                {diasAtraso} dias
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
