import { useState } from "react";
import { useProcessosTrabalhistas, useAudiencias, useMovimentacoes, useProvisionamentos } from "@/hooks/useProcessosTrabalhistas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Plus, Eye, Gavel, DollarSign, FileText, Calendar, Loader2 } from "lucide-react";

export function ProcessosTrabalhistasManagement() {
  const { processos, isLoading, criarProcesso, STATUS_LABELS, FASE_LABELS } = useProcessosTrabalhistas();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProcesso, setSelectedProcesso] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome_reclamante: "",
    numero_processo: "",
    cpf_reclamante: "",
    vara: "",
    comarca: "",
    tribunal: "",
    valor_causa: "",
    advogado_responsavel: "",
    oab_advogado: "",
    observacoes: "",
  });

  const handleSubmit = () => {
    criarProcesso.mutate({
      nome_reclamante: formData.nome_reclamante,
      numero_processo: formData.numero_processo,
      cpf_reclamante: formData.cpf_reclamante || undefined,
      vara: formData.vara || undefined,
      comarca: formData.comarca || undefined,
      tribunal: formData.tribunal || undefined,
      valor_causa: formData.valor_causa ? parseFloat(formData.valor_causa) : undefined,
      advogado_responsavel: formData.advogado_responsavel || undefined,
      oab_advogado: formData.oab_advogado || undefined,
      observacoes: formData.observacoes || undefined,
    });
    setDialogOpen(false);
    setFormData({
      nome_reclamante: "",
      numero_processo: "",
      cpf_reclamante: "",
      vara: "",
      comarca: "",
      tribunal: "",
      valor_causa: "",
      advogado_responsavel: "",
      oab_advogado: "",
      observacoes: "",
    });
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ativo: "default",
      suspenso: "secondary",
      arquivado: "outline",
      transitado_julgado: "destructive",
      acordo: "default",
      extinto: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{STATUS_LABELS[status] || status}</Badge>;
  };

  const totalProvisionado = processos?.reduce((acc, p) => acc + (p.valor_provisionado || 0), 0) || 0;
  const processosAtivos = processos?.filter(p => p.status === "ativo").length || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Processos Trabalhistas</h2>
          <p className="text-muted-foreground">Gestão de ações judiciais e provisionamentos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Processo Trabalhista</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <Label>Nome do Reclamante *</Label>
                <Input
                  value={formData.nome_reclamante}
                  onChange={(e) => setFormData({ ...formData, nome_reclamante: e.target.value })}
                />
              </div>
              <div>
                <Label>CPF do Reclamante</Label>
                <Input
                  value={formData.cpf_reclamante}
                  onChange={(e) => setFormData({ ...formData, cpf_reclamante: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Número do Processo *</Label>
                <Input
                  value={formData.numero_processo}
                  onChange={(e) => setFormData({ ...formData, numero_processo: e.target.value })}
                  placeholder="0000000-00.0000.0.00.0000"
                />
              </div>
              <div>
                <Label>Vara</Label>
                <Input
                  value={formData.vara}
                  onChange={(e) => setFormData({ ...formData, vara: e.target.value })}
                />
              </div>
              <div>
                <Label>Comarca</Label>
                <Input
                  value={formData.comarca}
                  onChange={(e) => setFormData({ ...formData, comarca: e.target.value })}
                />
              </div>
              <div>
                <Label>Tribunal</Label>
                <Input
                  value={formData.tribunal}
                  onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
                  placeholder="TRT-XX"
                />
              </div>
              <div>
                <Label>Valor da Causa</Label>
                <Input
                  type="number"
                  value={formData.valor_causa}
                  onChange={(e) => setFormData({ ...formData, valor_causa: e.target.value })}
                />
              </div>
              <div>
                <Label>Advogado Responsável</Label>
                <Input
                  value={formData.advogado_responsavel}
                  onChange={(e) => setFormData({ ...formData, advogado_responsavel: e.target.value })}
                />
              </div>
              <div>
                <Label>OAB</Label>
                <Input
                  value={formData.oab_advogado}
                  onChange={(e) => setFormData({ ...formData, oab_advogado: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Button onClick={handleSubmit} className="w-full" disabled={criarProcesso.isPending}>
                  {criarProcesso.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cadastrar Processo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Processos</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Gavel className="h-5 w-5 text-primary" />
              {processos?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Processos Ativos</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-yellow-500" />
              {processosAtivos}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Provisionado</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-red-500" />
              {formatCurrency(totalProvisionado)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Valor em Acordos</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              {formatCurrency(processos?.reduce((acc, p) => acc + (p.valor_acordo || 0), 0) || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabela de Processos */}
      <Card>
        <CardHeader>
          <CardTitle>Processos Trabalhistas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Reclamante</TableHead>
                <TableHead>Vara/Comarca</TableHead>
                <TableHead>Valor Causa</TableHead>
                <TableHead>Provisionado</TableHead>
                <TableHead>Fase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processos?.map((processo) => (
                <TableRow key={processo.id}>
                  <TableCell className="font-mono text-sm">{processo.numero_processo}</TableCell>
                  <TableCell>{processo.nome_reclamante}</TableCell>
                  <TableCell>
                    {processo.vara && processo.comarca
                      ? `${processo.vara} - ${processo.comarca}`
                      : processo.vara || processo.comarca || "-"}
                  </TableCell>
                  <TableCell>{formatCurrency(processo.valor_causa)}</TableCell>
                  <TableCell className="text-red-600 font-medium">
                    {formatCurrency(processo.valor_provisionado)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{FASE_LABELS[processo.fase] || processo.fase}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(processo.status)}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedProcesso(processo.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!processos || processos.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    Nenhum processo trabalhista encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Processo */}
      {selectedProcesso && (
        <ProcessoDetalhesDialog
          processoId={selectedProcesso}
          onClose={() => setSelectedProcesso(null)}
        />
      )}
    </div>
  );
}

function ProcessoDetalhesDialog({ processoId, onClose }: { processoId: string; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("audiencias");
  const { audiencias, isLoading: loadingAudiencias } = useAudiencias(processoId);
  const { movimentacoes, isLoading: loadingMovimentacoes } = useMovimentacoes(processoId);
  const { provisionamentos, isLoading: loadingProvisionamentos } = useProvisionamentos(processoId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Detalhes do Processo
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="audiencias">Audiências</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="provisionamentos">Provisionamentos</TabsTrigger>
          </TabsList>

          <TabsContent value="audiencias" className="mt-4">
            {loadingAudiencias ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audiencias?.map((aud) => (
                    <TableRow key={aud.id}>
                      <TableCell>{format(new Date(aud.data_hora), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell>{aud.tipo}</TableCell>
                      <TableCell>{aud.local || "-"}</TableCell>
                      <TableCell>{aud.resultado || "-"}</TableCell>
                      <TableCell>
                        {aud.realizada ? (
                          <Badge variant="default">Realizada</Badge>
                        ) : (
                          <Badge variant="secondary">Agendada</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!audiencias || audiencias.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma audiência registrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="movimentacoes" className="mt-4">
            {loadingMovimentacoes ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentacoes?.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell>{format(new Date(mov.data), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{mov.descricao}</TableCell>
                      <TableCell>
                        {mov.tem_prazo && mov.data_prazo
                          ? format(new Date(mov.data_prazo), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {mov.tem_prazo && (
                          mov.prazo_cumprido ? (
                            <Badge variant="default">Cumprido</Badge>
                          ) : (
                            <Badge variant="destructive">Pendente</Badge>
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!movimentacoes || movimentacoes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhuma movimentação registrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="provisionamentos" className="mt-4">
            {loadingProvisionamentos ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provisionamentos?.map((prov) => (
                    <TableRow key={prov.id}>
                      <TableCell>{format(new Date(prov.data), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={prov.tipo === "baixa" || prov.tipo === "reducao" ? "default" : "destructive"}>
                          {prov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>{prov.motivo}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        prov.tipo === "baixa" || prov.tipo === "reducao" ? "text-green-600" : "text-red-600"
                      }`}>
                        {prov.tipo === "baixa" || prov.tipo === "reducao" ? "-" : "+"}
                        {formatCurrency(prov.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!provisionamentos || provisionamentos.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Nenhum provisionamento registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
