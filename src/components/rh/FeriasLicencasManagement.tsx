import { useState } from "react";
import { usePeriodosAquisitivos, useSolicitacoesFerias, useLicencas } from "@/hooks/useFeriasLicencas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Palmtree, FileText, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";

export function FeriasLicencasManagement() {
  const [activeTab, setActiveTab] = useState("ferias");
  const { periodos, isLoading: loadingPeriodos } = usePeriodosAquisitivos();
  const { solicitacoes, isLoading: loadingSolicitacoes, aprovarFerias } = useSolicitacoesFerias();
  const { licencas, isLoading: loadingLicencas, aprovarLicenca, TIPO_LICENCA_LABELS } = useLicencas();

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pendente: { variant: "secondary", label: "Pendente" },
      aprovada_chefia: { variant: "outline", label: "Aguardando RH" },
      aprovada_rh: { variant: "default", label: "Aprovada" },
      rejeitada: { variant: "destructive", label: "Rejeitada" },
      cancelada: { variant: "destructive", label: "Cancelada" },
      usufruida: { variant: "default", label: "Usufruída" },
    };
    const c = config[status] || { variant: "outline", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const isLoading = loadingPeriodos || loadingSolicitacoes || loadingLicencas;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const periodosVencidos = periodos?.filter(p => p.vencido).length || 0;
  const feriasPendentes = solicitacoes?.filter(s => s.status === "pendente" || s.status === "aprovada_chefia").length || 0;
  const licencasPendentes = licencas?.filter(l => l.status === "pendente").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Férias e Licenças</h2>
        <p className="text-muted-foreground">Gestão de períodos aquisitivos, férias e afastamentos</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Períodos Aquisitivos</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              {periodos?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Períodos Vencidos</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {periodosVencidos}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Férias Pendentes</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Palmtree className="h-5 w-5 text-green-500" />
              {feriasPendentes}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Licenças Pendentes</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              {licencasPendentes}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ferias">Solicitações de Férias</TabsTrigger>
          <TabsTrigger value="periodos">Períodos Aquisitivos</TabsTrigger>
          <TabsTrigger value="licencas">Licenças</TabsTrigger>
        </TabsList>

        <TabsContent value="ferias" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Férias</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Abono Pecuniário</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoes?.map((sol) => (
                    <TableRow key={sol.id}>
                      <TableCell>{sol.servidor?.name || "-"}</TableCell>
                      <TableCell>{format(new Date(sol.data_inicio), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(sol.data_fim), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{sol.dias_solicitados}</TableCell>
                      <TableCell>
                        {sol.abono_pecuniario ? (
                          <Badge variant="secondary">{sol.dias_abono} dias</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{formatCurrency(sol.valor_total)}</TableCell>
                      <TableCell>{getStatusBadge(sol.status)}</TableCell>
                      <TableCell>
                        {sol.status === "pendente" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarFerias.mutate({ id: sol.id, etapa: "chefia", aprovado: true })}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarFerias.mutate({ id: sol.id, etapa: "chefia", aprovado: false })}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                        {sol.status === "aprovada_chefia" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarFerias.mutate({ id: sol.id, etapa: "rh", aprovado: true })}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarFerias.mutate({ id: sol.id, etapa: "rh", aprovado: false })}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!solicitacoes || solicitacoes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhuma solicitação de férias encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periodos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Períodos Aquisitivos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Direito</TableHead>
                    <TableHead className="text-right">Usufruídos</TableHead>
                    <TableHead className="text-right">Vendidos</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periodos?.map((per) => (
                    <TableRow key={per.id}>
                      <TableCell>{per.servidor?.name || "-"}</TableCell>
                      <TableCell>{format(new Date(per.inicio), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(per.fim), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {per.data_vencimento ? format(new Date(per.data_vencimento), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right">{per.dias_direito}</TableCell>
                      <TableCell className="text-right">{per.dias_usufruidos}</TableCell>
                      <TableCell className="text-right">{per.dias_vendidos}</TableCell>
                      <TableCell className="text-right font-medium">{per.dias_saldo}</TableCell>
                      <TableCell>
                        {per.vencido ? (
                          <Badge variant="destructive">Vencido</Badge>
                        ) : per.dias_saldo === 0 ? (
                          <Badge variant="default">Quitado</Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!periodos || periodos.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        Nenhum período aquisitivo encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licencas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Licenças</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Remuneração</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licencas?.map((lic) => (
                    <TableRow key={lic.id}>
                      <TableCell>{lic.servidor?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{TIPO_LICENCA_LABELS[lic.tipo] || lic.tipo}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(lic.data_inicio), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(lic.data_fim), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{lic.dias_totais}</TableCell>
                      <TableCell>
                        {lic.remunerada ? (
                          <span className="text-green-600">{lic.percentual_remuneracao}%</span>
                        ) : (
                          <span className="text-muted-foreground">Não</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(lic.status)}</TableCell>
                      <TableCell>
                        {lic.status === "pendente" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarLicenca.mutate({ id: lic.id, aprovado: true })}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarLicenca.mutate({ id: lic.id, aprovado: false })}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!licencas || licencas.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhuma licença encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
