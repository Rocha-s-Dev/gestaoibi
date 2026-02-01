import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmpenhoManagement } from "@/components/financeiro/execucao/EmpenhoManagement";
import { LiquidacaoManagement } from "@/components/financeiro/execucao/LiquidacaoManagement";
import { ConveniosManagement } from "@/components/financeiro/execucao/ConveniosManagement";
import { usePlanejamentoOrcamentario, useClassificacoesOrcamentarias, useRestosAPagar } from "@/hooks/useGestaoFinanceira";
import { 
  FileText, 
  Receipt, 
  Wallet, 
  HandCoins,
  Building2,
  Landmark,
  Calendar,
  BarChart3,
  AlertTriangle
} from "lucide-react";

export default function GestaoFinanceiraPublica() {
  const [activeTab, setActiveTab] = useState("execucao");
  const { ppaList, ldoList, loaList, dotacoes, isLoading } = usePlanejamentoOrcamentario();
  const { naturezasDespesa, fontesRecursos, funcoesSubfuncoes } = useClassificacoesOrcamentarias();
  const { restosAPagar } = useRestosAPagar();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  // Calcular totais
  const totalDotacoes = dotacoes.reduce((sum, d) => sum + (d.valor_inicial || 0), 0);
  const totalEmpenhado = dotacoes.reduce((sum, d) => sum + (d.valor_empenhado || 0), 0);
  const totalLiquidado = dotacoes.reduce((sum, d) => sum + (d.valor_liquidado || 0), 0);
  const totalPago = dotacoes.reduce((sum, d) => sum + (d.valor_pago || 0), 0);
  const totalRAP = restosAPagar.reduce((sum, r) => sum + (r.saldo || 0), 0);

  const percentualExecucao = totalDotacoes > 0 ? (totalEmpenhado / totalDotacoes) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira Pública</h1>
          <p className="text-muted-foreground mt-2">
            Planejamento orçamentário, execução e controle financeiro municipal
          </p>
        </header>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                Orçamento (LOA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalDotacoes)}</div>
              <p className="text-xs text-muted-foreground">
                {loaList.length > 0 ? `LOA ${loaList[0].lei_numero || "vigente"}` : "Sem LOA"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-600" />
                Empenhado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalEmpenhado)}</div>
              <p className="text-xs text-muted-foreground">
                {percentualExecucao.toFixed(1)}% do orçamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Receipt className="h-4 w-4 text-purple-600" />
                Liquidado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalLiquidado)}</div>
              <p className="text-xs text-muted-foreground">
                {totalEmpenhado > 0 ? ((totalLiquidado / totalEmpenhado) * 100).toFixed(1) : 0}% do empenhado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-600" />
                Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalPago)}</div>
              <p className="text-xs text-muted-foreground">
                {totalLiquidado > 0 ? ((totalPago / totalLiquidado) * 100).toFixed(1) : 0}% do liquidado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Restos a Pagar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{formatCurrency(totalRAP)}</div>
              <p className="text-xs text-muted-foreground">
                {restosAPagar.length} inscritos
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="execucao" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Execução
            </TabsTrigger>
            <TabsTrigger value="liquidacoes" className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              Liquidações
            </TabsTrigger>
            <TabsTrigger value="convenios" className="flex items-center gap-1">
              <HandCoins className="h-4 w-4" />
              Convênios
            </TabsTrigger>
            <TabsTrigger value="planejamento" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              PPA/LDO/LOA
            </TabsTrigger>
            <TabsTrigger value="classificacoes" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" />
              Classificações
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="execucao">
              <EmpenhoManagement />
            </TabsContent>

            <TabsContent value="liquidacoes">
              <LiquidacaoManagement />
            </TabsContent>

            <TabsContent value="convenios">
              <ConveniosManagement />
            </TabsContent>

            <TabsContent value="planejamento">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PPA */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" />
                        Plano Plurianual (PPA)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ppaList.length === 0 ? (
                        <p className="text-muted-foreground">Nenhum PPA cadastrado</p>
                      ) : (
                        <div className="space-y-3">
                          {ppaList.slice(0, 3).map((ppa) => (
                            <div key={ppa.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {ppa.ano_inicio} - {ppa.ano_fim}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {ppa.lei_numero || "Sem número"}
                                  </p>
                                </div>
                                <Badge
                                  variant={ppa.status === "vigente" ? "default" : "secondary"}
                                >
                                  {ppa.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* LDO */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        LDO
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ldoList.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma LDO cadastrada</p>
                      ) : (
                        <div className="space-y-3">
                          {ldoList.slice(0, 3).map((ldo: any) => (
                            <div key={ldo.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">Exercício {ldo.exercicio}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {ldo.lei_numero || "Sem número"}
                                  </p>
                                </div>
                                <Badge
                                  variant={ldo.status === "vigente" ? "default" : "secondary"}
                                >
                                  {ldo.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* LOA */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        LOA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loaList.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma LOA cadastrada</p>
                      ) : (
                        <div className="space-y-3">
                          {loaList.slice(0, 3).map((loa) => (
                            <div key={loa.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{loa.lei_numero || "LOA"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatCurrency(loa.valor_total)}
                                  </p>
                                </div>
                                <Badge
                                  variant={loa.status === "vigente" ? "default" : "secondary"}
                                >
                                  {loa.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="classificacoes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Naturezas de Despesa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {naturezasDespesa.map((nd: any) => (
                        <div key={nd.id} className="flex justify-between items-center p-2 border rounded">
                          <span className="font-mono text-sm">{nd.codigo}</span>
                          <span className="text-sm truncate ml-2">{nd.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Fontes de Recursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {fontesRecursos.map((fr: any) => (
                        <div key={fr.id} className="flex justify-between items-center p-2 border rounded">
                          <span className="font-mono text-sm">{fr.codigo}</span>
                          <span className="text-sm truncate ml-2">{fr.descricao}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Funções e Subfunções</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                      {funcoesSubfuncoes.map((fs: any) => (
                        <div key={fs.id} className="p-2 border rounded">
                          <span className="font-mono text-sm">{fs.codigo_funcao}.{fs.codigo_subfuncao}</span>
                          <span className="text-sm block truncate">{fs.nome_funcao} - {fs.nome_subfuncao}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
