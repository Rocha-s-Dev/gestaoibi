import { useState } from "react";
import { useIPTU, useImoveis } from "@/hooks/useArrecadacao";
import { useConfigLancamentoIPTU, useLancamentoLoteIPTU, useCarnesIPTU } from "@/hooks/useIPTUCompleto";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Plus, FileText, Settings, Play, Lock, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LancamentoAnual() {
  const { lancamentos, isLoading: loadingLanc, createLancamento } = useIPTU();
  const { imoveis } = useImoveis();
  const { configs, createConfig, updateConfig } = useConfigLancamentoIPTU();
  const { lotes, gerarLancamentoEmLote } = useLancamentoLoteIPTU();
  const { carnes, gerarCarne } = useCarnesIPTU();
  const { toast } = useToast();

  const [dialogConfig, setDialogConfig] = useState(false);
  const [dialogLote, setDialogLote] = useState(false);
  const [dialogLancamento, setDialogLancamento] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const exercicioAtual = new Date().getFullYear();

  const [configForm, setConfigForm] = useState({
    exercicio: exercicioAtual,
    data_vencimento_cota_unica: `${exercicioAtual}-02-28`,
    desconto_cota_unica: 10,
    numero_parcelas: 10,
    dia_vencimento_parcelas: 10,
    primeira_parcela_mes: 2,
    aliquota_residencial: 0.01,
    aliquota_comercial: 0.015,
    aliquota_industrial: 0.02,
    aliquota_territorial: 0.03,
    taxa_expediente: 0,
    taxa_limpeza_publica: 0,
    taxa_iluminacao: 0,
  });

  const [lancamentoForm, setLancamentoForm] = useState({
    imovel_id: "",
    exercicio: exercicioAtual,
    numero_parcelas: 10,
  });

  const handleCreateConfig = () => {
    createConfig.mutate(configForm, {
      onSuccess: () => setDialogConfig(false),
    });
  };

  const handleLancamentoLote = async () => {
    if (!selectedConfig) {
      toast({ title: "Selecione uma configuração", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await gerarLancamentoEmLote.mutateAsync({
        exercicio: selectedConfig.exercicio,
        configId: selectedConfig.id,
      });
    } finally {
      setIsProcessing(false);
      setDialogLote(false);
    }
  };

  const handleCreateLancamento = () => {
    const imovel = imoveis.find((i: any) => i.id === lancamentoForm.imovel_id);
    if (!imovel) return;

    const valorVenal = imovel.valor_venal_total || 0;
    const aliquota = imovel.aliquota_iptu || 0.01;
    const valorIPTU = valorVenal * aliquota;

    createLancamento.mutate({
      imovel_id: lancamentoForm.imovel_id,
      contribuinte_id: imovel.contribuinte_id,
      exercicio: lancamentoForm.exercicio,
      valor_venal: valorVenal,
      aliquota: aliquota,
      valor_iptu: valorIPTU,
      valor_total: valorIPTU,
      numero_parcelas: lancamentoForm.numero_parcelas,
      valor_cota_unica: valorIPTU * 0.9,
    }, {
      onSuccess: () => setDialogLancamento(false),
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      em_aberto: "outline",
      vencido: "destructive",
      pago: "default",
      parcelado: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const imoveisAtivos = imoveis.filter((i: any) => i.status === "ativo" && !i.isento && !i.imune);
  const configAtual = configs.find((c: any) => c.exercicio === exercicioAtual);

  return (
    <Tabs defaultValue="configuracao" className="space-y-4">
      <TabsList>
        <TabsTrigger value="configuracao" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          Configuração
        </TabsTrigger>
        <TabsTrigger value="lancamentos" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Lançamentos
        </TabsTrigger>
        <TabsTrigger value="lotes" className="flex items-center gap-1">
          <Play className="h-4 w-4" />
          Lotes Gerados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="configuracao" className="space-y-4">
        {/* Resumo Exercício Atual */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Imóveis Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{imoveisAtivos.length}</div>
              <p className="text-xs text-muted-foreground">Passíveis de lançamento</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lançamentos {exercicioAtual}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lancamentos.filter((l: any) => l.exercicio === exercicioAtual).length}
              </div>
              <p className="text-xs text-muted-foreground">Gerados este ano</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Lançado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  lancamentos
                    .filter((l: any) => l.exercicio === exercicioAtual)
                    .reduce((sum: number, l: any) => sum + (l.valor_total || 0), 0)
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status Configuração</CardTitle>
            </CardHeader>
            <CardContent>
              {configAtual ? (
                <Badge variant={configAtual.bloqueado ? "secondary" : "default"}>
                  {configAtual.bloqueado ? "Bloqueado" : configAtual.status}
                </Badge>
              ) : (
                <Badge variant="destructive">Não configurado</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configurações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Configurações de Lançamento</CardTitle>
              <CardDescription>Defina os parâmetros para o lançamento anual do IPTU</CardDescription>
            </div>
            <Dialog open={dialogConfig} onOpenChange={setDialogConfig}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Configuração
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Configurar Lançamento IPTU</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Exercício *</Label>
                      <Input
                        type="number"
                        value={configForm.exercicio}
                        onChange={(e) => setConfigForm({ ...configForm, exercicio: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Vencimento Cota Única *</Label>
                      <Input
                        type="date"
                        value={configForm.data_vencimento_cota_unica}
                        onChange={(e) => setConfigForm({ ...configForm, data_vencimento_cota_unica: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Desconto Cota Única (%)</Label>
                      <Input
                        type="number"
                        value={configForm.desconto_cota_unica}
                        onChange={(e) => setConfigForm({ ...configForm, desconto_cota_unica: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Número de Parcelas</Label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={configForm.numero_parcelas}
                        onChange={(e) => setConfigForm({ ...configForm, numero_parcelas: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Dia Vencimento Parcelas</Label>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={configForm.dia_vencimento_parcelas}
                        onChange={(e) => setConfigForm({ ...configForm, dia_vencimento_parcelas: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-base font-medium">Alíquotas por Tipo de Uso</Label>
                    <div className="grid grid-cols-4 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Residencial (%)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={configForm.aliquota_residencial * 100}
                          onChange={(e) => setConfigForm({ ...configForm, aliquota_residencial: parseFloat(e.target.value) / 100 })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Comercial (%)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={configForm.aliquota_comercial * 100}
                          onChange={(e) => setConfigForm({ ...configForm, aliquota_comercial: parseFloat(e.target.value) / 100 })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Industrial (%)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={configForm.aliquota_industrial * 100}
                          onChange={(e) => setConfigForm({ ...configForm, aliquota_industrial: parseFloat(e.target.value) / 100 })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Territorial (%)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={configForm.aliquota_territorial * 100}
                          onChange={(e) => setConfigForm({ ...configForm, aliquota_territorial: parseFloat(e.target.value) / 100 })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label className="text-base font-medium">Taxas Adicionais</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <Label className="text-sm">Taxa Expediente (R$)</Label>
                        <Input
                          type="number"
                          value={configForm.taxa_expediente}
                          onChange={(e) => setConfigForm({ ...configForm, taxa_expediente: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Taxa Limpeza (R$)</Label>
                        <Input
                          type="number"
                          value={configForm.taxa_limpeza_publica}
                          onChange={(e) => setConfigForm({ ...configForm, taxa_limpeza_publica: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Taxa Iluminação (R$)</Label>
                        <Input
                          type="number"
                          value={configForm.taxa_iluminacao}
                          onChange={(e) => setConfigForm({ ...configForm, taxa_iluminacao: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateConfig} disabled={createConfig.isPending}>
                    Salvar Configuração
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercício</TableHead>
                  <TableHead>Venc. Cota Única</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Alíq. Residencial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold">{c.exercicio}</TableCell>
                    <TableCell>{new Date(c.data_vencimento_cota_unica).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{c.desconto_cota_unica}%</TableCell>
                    <TableCell>{c.numero_parcelas}x</TableCell>
                    <TableCell>{(c.aliquota_residencial * 100).toFixed(2)}%</TableCell>
                    <TableCell>
                      <Badge variant={c.bloqueado ? "secondary" : "default"}>
                        {c.bloqueado ? "Bloqueado" : c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!c.bloqueado && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedConfig(c);
                            setDialogLote(true);
                          }}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Gerar Lote
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {configs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma configuração cadastrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="lancamentos" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Lançamentos de IPTU</h3>
          <Dialog open={dialogLancamento} onOpenChange={setDialogLancamento}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Lançamento Individual
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lançar IPTU Individual</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Imóvel</Label>
                  <Select
                    value={lancamentoForm.imovel_id}
                    onValueChange={(v) => setLancamentoForm({ ...lancamentoForm, imovel_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      {imoveisAtivos.map((im: any) => (
                        <SelectItem key={im.id} value={im.id}>
                          {im.inscricao_imobiliaria} - {im.logradouro}, {im.numero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Exercício</Label>
                    <Input
                      type="number"
                      value={lancamentoForm.exercicio}
                      onChange={(e) => setLancamentoForm({ ...lancamentoForm, exercicio: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Número de Parcelas</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={lancamentoForm.numero_parcelas}
                      onChange={(e) => setLancamentoForm({ ...lancamentoForm, numero_parcelas: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateLancamento} disabled={createLancamento.isPending} className="w-full">
                  Gerar Lançamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercício</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead>Valor Venal</TableHead>
                  <TableHead>Valor IPTU</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentos.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-bold">{l.exercicio}</TableCell>
                    <TableCell>{l.imoveis?.inscricao_imobiliaria}</TableCell>
                    <TableCell>{l.contribuintes?.nome_razao_social || "-"}</TableCell>
                    <TableCell>{formatCurrency(l.valor_venal || 0)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(l.valor_total || 0)}</TableCell>
                    <TableCell>{l.numero_parcelas}x</TableCell>
                    <TableCell>{getStatusBadge(l.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => gerarCarne.mutate(l.id)}
                        disabled={gerarCarne.isPending}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Carnê
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {lancamentos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum lançamento encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="lotes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Lotes de Lançamento Gerados</CardTitle>
            <CardDescription>Histórico de processamentos em lote</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Exercício</TableHead>
                  <TableHead>Imóveis</TableHead>
                  <TableHead>Total Lançado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lotes.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell>{new Date(l.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="font-bold">{l.exercicio}</TableCell>
                    <TableCell>{l.total_imoveis}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(l.total_lancado || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        l.status === "finalizado" ? "default" :
                        l.status === "processando" ? "secondary" : "destructive"
                      }>
                        {l.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {l.erros && l.erros.length > 0 ? (
                        <Badge variant="destructive">{l.erros.length} erros</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {lotes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum lote processado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Dialog Confirmação Lote */}
      <Dialog open={dialogLote} onOpenChange={setDialogLote}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Lançamento em Lote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta ação irá gerar lançamentos de IPTU para <strong>{imoveisAtivos.length} imóveis</strong> ativos
                para o exercício de <strong>{selectedConfig?.exercicio}</strong>.
              </AlertDescription>
            </Alert>
            
            {isProcessing && (
              <div className="space-y-2">
                <Label>Processando...</Label>
                <Progress value={50} className="animate-pulse" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogLote(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleLancamentoLote} disabled={isProcessing}>
              {isProcessing ? "Processando..." : "Confirmar Lançamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
