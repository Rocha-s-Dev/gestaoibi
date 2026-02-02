import { useState } from "react";
import { useIPTU } from "@/hooks/useArrecadacao";
import { useBaixasManuaisIPTU } from "@/hooks/useIPTUCompleto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, QrCode, Barcode, FileDown, Check, AlertCircle } from "lucide-react";

export function CobrancaArrecadacao() {
  const { lancamentos, getParcelas, registrarPagamento } = useIPTU();
  const { baixas, registrarBaixaManual } = useBaixasManuaisIPTU();
  
  const [selectedLancamento, setSelectedLancamento] = useState<any>(null);
  const [parcelas, setParcelas] = useState<any[]>([]);
  const [dialogPagamento, setDialogPagamento] = useState(false);
  const [dialogBaixa, setDialogBaixa] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [pagamentoForm, setPagamentoForm] = useState({
    forma_pagamento: "boleto",
    valor_pago: "",
  });

  const [baixaForm, setBaixaForm] = useState({
    tipo_baixa: "deposito_judicial",
    motivo: "",
    numero_processo: "",
    valor_baixado: "",
    observacoes: "",
  });

  const handleSelectLancamento = async (lancamento: any) => {
    setSelectedLancamento(lancamento);
    setLoading(true);
    try {
      const data = await getParcelas(lancamento.id);
      setParcelas(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handlePagamento = () => {
    registrarPagamento.mutate({
      parcelaId: selectedParcela.id,
      formaPagamento: pagamentoForm.forma_pagamento,
      valorPago: parseFloat(pagamentoForm.valor_pago) || selectedParcela.valor,
    }, {
      onSuccess: () => {
        setDialogPagamento(false);
        handleSelectLancamento(selectedLancamento);
      },
    });
  };

  const handleBaixaManual = () => {
    registrarBaixaManual.mutate({
      parcela_id: selectedParcela.id,
      lancamento_id: selectedLancamento.id,
      tipo_baixa: baixaForm.tipo_baixa,
      motivo: baixaForm.motivo,
      numero_processo: baixaForm.numero_processo || null,
      valor_original: selectedParcela.valor,
      valor_baixado: parseFloat(baixaForm.valor_baixado) || selectedParcela.valor,
      observacoes: baixaForm.observacoes || null,
    }, {
      onSuccess: () => {
        setDialogBaixa(false);
        handleSelectLancamento(selectedLancamento);
      },
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      em_aberto: { variant: "outline", label: "Em Aberto" },
      vencido: { variant: "destructive", label: "Vencido" },
      pago: { variant: "default", label: "Pago" },
    };
    const c = config[status] || { variant: "outline", label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const lancamentosComDebito = lancamentos.filter((l: any) => 
    ["em_aberto", "vencido", "parcelado"].includes(l.status)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de Lançamentos */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Lançamentos com Débito</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {lancamentosComDebito.map((l: any) => (
                <div
                  key={l.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedLancamento?.id === l.id ? "bg-muted" : ""
                  }`}
                  onClick={() => handleSelectLancamento(l)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-medium text-sm">{l.imoveis?.inscricao_imobiliaria}</p>
                      <p className="text-sm text-muted-foreground">{l.contribuintes?.nome_razao_social}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(l.valor_total || 0)}</p>
                      <p className="text-xs text-muted-foreground">{l.exercicio}</p>
                    </div>
                  </div>
                </div>
              ))}
              {lancamentosComDebito.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum débito em aberto
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detalhes e Parcelas */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedLancamento ? (
                <>Parcelas - {selectedLancamento.imoveis?.inscricao_imobiliaria}</>
              ) : (
                "Selecione um lançamento"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLancamento ? (
              <div className="space-y-4">
                {/* Info do Lançamento */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label className="text-muted-foreground text-xs">Exercício</Label>
                    <p className="font-bold">{selectedLancamento.exercicio}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Valor Venal</Label>
                    <p>{formatCurrency(selectedLancamento.valor_venal || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Valor IPTU</Label>
                    <p className="font-bold">{formatCurrency(selectedLancamento.valor_total || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Cota Única</Label>
                    <p className="text-green-600 font-medium">
                      {formatCurrency(selectedLancamento.valor_cota_unica || 0)}
                    </p>
                  </div>
                </div>

                {/* Tabela de Parcelas */}
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando parcelas...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parcela</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Multa/Juros</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parcelas.map((p: any) => {
                        const vencida = new Date(p.data_vencimento) < new Date() && p.status === "em_aberto";
                        const multa = p.multa || 0;
                        const juros = p.juros || 0;
                        const total = (p.valor || 0) + multa + juros;
                        
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">{p.numero_parcela}ª</TableCell>
                            <TableCell>
                              <span className={vencida ? "text-destructive" : ""}>
                                {new Date(p.data_vencimento).toLocaleDateString("pt-BR")}
                              </span>
                            </TableCell>
                            <TableCell>{formatCurrency(p.valor || 0)}</TableCell>
                            <TableCell>
                              {multa + juros > 0 ? (
                                <span className="text-destructive">{formatCurrency(multa + juros)}</span>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="font-bold">{formatCurrency(total)}</TableCell>
                            <TableCell>{getStatusBadge(vencida ? "vencido" : p.status)}</TableCell>
                            <TableCell className="text-right">
                              {p.status !== "pago" && (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedParcela(p);
                                      setPagamentoForm({ ...pagamentoForm, valor_pago: total.toString() });
                                      setDialogPagamento(true);
                                    }}
                                  >
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedParcela(p);
                                      setBaixaForm({ ...baixaForm, valor_baixado: p.valor.toString() });
                                      setDialogBaixa(true);
                                    }}
                                  >
                                    <FileDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              {p.status === "pago" && (
                                <Check className="h-5 w-5 text-green-600 mx-auto" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}

                {/* Opções de Pagamento */}
                <div className="border-t pt-4">
                  <Label className="text-base font-medium mb-4 block">Formas de Pagamento Disponíveis</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6 text-center">
                        <Barcode className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="font-medium">Boleto</p>
                        <p className="text-xs text-muted-foreground">Qualquer banco</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6 text-center">
                        <QrCode className="h-8 w-8 mx-auto text-teal-600 mb-2" />
                        <p className="font-medium">PIX</p>
                        <p className="text-xs text-muted-foreground">Instantâneo</p>
                      </CardContent>
                    </Card>
                    <Card className="border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6 text-center">
                        <CreditCard className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                        <p className="font-medium">Cartão</p>
                        <p className="text-xs text-muted-foreground">Crédito/Débito</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um lançamento para ver as parcelas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Pagamento */}
      <Dialog open={dialogPagamento} onOpenChange={setDialogPagamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between">
                <span>Parcela {selectedParcela?.numero_parcela}ª</span>
                <span className="font-bold">{formatCurrency(selectedParcela?.valor || 0)}</span>
              </div>
            </div>
            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={pagamentoForm.forma_pagamento}
                onValueChange={(v) => setPagamentoForm({ ...pagamentoForm, forma_pagamento: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boleto">Boleto Bancário</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor Pago</Label>
              <Input
                type="number"
                value={pagamentoForm.valor_pago}
                onChange={(e) => setPagamentoForm({ ...pagamentoForm, valor_pago: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogPagamento(false)}>Cancelar</Button>
            <Button onClick={handlePagamento} disabled={registrarPagamento.isPending}>
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Baixa Manual */}
      <Dialog open={dialogBaixa} onOpenChange={setDialogBaixa}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Baixa Manual</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Baixa *</Label>
              <Select
                value={baixaForm.tipo_baixa}
                onValueChange={(v) => setBaixaForm({ ...baixaForm, tipo_baixa: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposito_judicial">Depósito Judicial</SelectItem>
                  <SelectItem value="compensacao">Compensação</SelectItem>
                  <SelectItem value="prescricao">Prescrição</SelectItem>
                  <SelectItem value="remissao">Remissão</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo *</Label>
              <Textarea
                value={baixaForm.motivo}
                onChange={(e) => setBaixaForm({ ...baixaForm, motivo: e.target.value })}
                placeholder="Descreva o motivo da baixa"
              />
            </div>
            <div>
              <Label>Nº Processo (se aplicável)</Label>
              <Input
                value={baixaForm.numero_processo}
                onChange={(e) => setBaixaForm({ ...baixaForm, numero_processo: e.target.value })}
              />
            </div>
            <div>
              <Label>Valor a Baixar</Label>
              <Input
                type="number"
                value={baixaForm.valor_baixado}
                onChange={(e) => setBaixaForm({ ...baixaForm, valor_baixado: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogBaixa(false)}>Cancelar</Button>
            <Button 
              onClick={handleBaixaManual} 
              disabled={!baixaForm.motivo || registrarBaixaManual.isPending}
            >
              Registrar Baixa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
