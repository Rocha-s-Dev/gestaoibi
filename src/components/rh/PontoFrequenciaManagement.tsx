import { useState } from "react";
import { usePontoServidor, useJustificativasPonto, useBancoHoras } from "@/hooks/usePontoServidor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export function PontoFrequenciaManagement() {
  const [activeTab, setActiveTab] = useState("registros");
  const { pontos, isLoading } = usePontoServidor();
  const { justificativas, aprovarJustificativa } = useJustificativasPonto();
  const { bancoHoras } = useBancoHoras();

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return format(new Date(time), "HH:mm");
  };

  const formatHoras = (horas: number) => {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Frequência e Jornada</h2>
        <p className="text-muted-foreground">Controle de ponto, justificativas e banco de horas</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registros Hoje</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {pontos?.filter(p => p.data === new Date().toISOString().split("T")[0]).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Justificativas Pendentes</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              {justificativas?.filter(j => j.status === "pendente").length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Faltas no Mês</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              {pontos?.filter(p => p.falta).length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Banco de Horas Total</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {formatHoras(bancoHoras?.reduce((acc, b) => acc + (b.saldo_atual || 0), 0) || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="registros">Registros de Ponto</TabsTrigger>
          <TabsTrigger value="justificativas">Justificativas</TabsTrigger>
          <TabsTrigger value="banco">Banco de Horas</TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Ponto</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída Intervalo</TableHead>
                    <TableHead>Retorno</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Horas Trab.</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pontos?.map((ponto) => (
                    <TableRow key={ponto.id}>
                      <TableCell>
                        {format(new Date(ponto.data), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{ponto.servidor?.name || "-"}</TableCell>
                      <TableCell>{formatTime(ponto.entrada)}</TableCell>
                      <TableCell>{formatTime(ponto.saida_intervalo)}</TableCell>
                      <TableCell>{formatTime(ponto.retorno_intervalo)}</TableCell>
                      <TableCell>{formatTime(ponto.saida)}</TableCell>
                      <TableCell>{formatHoras(ponto.horas_trabalhadas)}</TableCell>
                      <TableCell>
                        {ponto.falta ? (
                          <Badge variant="destructive">Falta</Badge>
                        ) : ponto.abono ? (
                          <Badge variant="secondary">Abonado</Badge>
                        ) : ponto.horas_extras > 0 ? (
                          <Badge variant="default">+{formatHoras(ponto.horas_extras)}</Badge>
                        ) : (
                          <Badge variant="outline">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!pontos || pontos.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Nenhum registro de ponto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="justificativas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Justificativas de Ponto</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {justificativas?.map((just) => (
                    <TableRow key={just.id}>
                      <TableCell>
                        {format(new Date(just.data), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{(just as { servidor?: { name: string } }).servidor?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{just.tipo}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{just.motivo}</TableCell>
                      <TableCell>
                        {just.status === "pendente" ? (
                          <Badge variant="secondary">Pendente</Badge>
                        ) : just.status === "aprovada" ? (
                          <Badge variant="default">Aprovada</Badge>
                        ) : (
                          <Badge variant="destructive">Rejeitada</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {just.status === "pendente" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarJustificativa.mutate({ id: just.id, aprovado: true })}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => aprovarJustificativa.mutate({ id: just.id, aprovado: false })}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!justificativas || justificativas.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Nenhuma justificativa encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banco" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Banco de Horas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competência</TableHead>
                    <TableHead>Servidor</TableHead>
                    <TableHead className="text-right">Saldo Anterior</TableHead>
                    <TableHead className="text-right">Creditado</TableHead>
                    <TableHead className="text-right">Debitado</TableHead>
                    <TableHead className="text-right">Saldo Atual</TableHead>
                    <TableHead className="text-right">Limite</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bancoHoras?.map((bh) => (
                    <TableRow key={bh.id}>
                      <TableCell>
                        {format(new Date(bh.competencia), "MMMM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{bh.servidor?.name || "-"}</TableCell>
                      <TableCell className="text-right">{formatHoras(bh.saldo_anterior)}</TableCell>
                      <TableCell className="text-right text-green-600">+{formatHoras(bh.horas_creditadas)}</TableCell>
                      <TableCell className="text-right text-red-600">-{formatHoras(bh.horas_debitadas)}</TableCell>
                      <TableCell className="text-right font-medium">{formatHoras(bh.saldo_atual)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatHoras(bh.limite_acumulado)}</TableCell>
                    </TableRow>
                  ))}
                  {(!bancoHoras || bancoHoras.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Nenhum registro de banco de horas encontrado
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
