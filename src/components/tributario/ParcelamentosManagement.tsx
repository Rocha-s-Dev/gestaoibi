import { useState } from "react";
import { useParcelamentos, useContribuintes, useDividaAtiva } from "@/hooks/useArrecadacao";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Calendar, Percent, FileText, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export function ParcelamentosManagement() {
  const { programasRefis, parcelamentos, isLoading, createRefis, createParcelamento } = useParcelamentos();
  const { contribuintes } = useContribuintes();
  const { dividas } = useDividaAtiva();
  const [dialogRefis, setDialogRefis] = useState(false);
  const [dialogParcelamento, setDialogParcelamento] = useState(false);

  const [refisForm, setRefisForm] = useState({
    nome: "",
    lei_numero: "",
    data_inicio: "",
    data_fim: "",
    desconto_multa: "1.00",
    desconto_juros: "1.00",
    desconto_correcao: "0.50",
    parcelas_maxima: 60,
    valor_parcela_minima: "50",
  });

  const [parcelamentoForm, setParcelamentoForm] = useState({
    contribuinte_id: "",
    programa_refis_id: "",
    dividas_ativas_ids: [] as string[],
    valor_principal: "",
    valor_multa_original: "",
    valor_juros_original: "",
    valor_total_original: "",
    desconto_multa: "0",
    desconto_juros: "0",
    valor_total_parcelado: "",
    numero_parcelas: 12,
    valor_entrada: "0",
    valor_parcela: "",
    dia_vencimento: 10,
  });

  const handleCreateRefis = () => {
    createRefis.mutate({
      ...refisForm,
      desconto_multa: parseFloat(refisForm.desconto_multa),
      desconto_juros: parseFloat(refisForm.desconto_juros),
      desconto_correcao: parseFloat(refisForm.desconto_correcao),
      valor_parcela_minima: parseFloat(refisForm.valor_parcela_minima),
    }, {
      onSuccess: () => setDialogRefis(false),
    });
  };

  const handleCreateParcelamento = () => {
    createParcelamento.mutate({
      ...parcelamentoForm,
      valor_principal: parseFloat(parcelamentoForm.valor_principal) || 0,
      valor_multa_original: parseFloat(parcelamentoForm.valor_multa_original) || 0,
      valor_juros_original: parseFloat(parcelamentoForm.valor_juros_original) || 0,
      valor_total_original: parseFloat(parcelamentoForm.valor_total_original) || 0,
      desconto_multa: parseFloat(parcelamentoForm.desconto_multa) || 0,
      desconto_juros: parseFloat(parcelamentoForm.desconto_juros) || 0,
      valor_total_parcelado: parseFloat(parcelamentoForm.valor_total_parcelado) || 0,
      valor_entrada: parseFloat(parcelamentoForm.valor_entrada) || 0,
      valor_parcela: parseFloat(parcelamentoForm.valor_parcela) || 0,
      programa_refis_id: parcelamentoForm.programa_refis_id || null,
    }, {
      onSuccess: () => setDialogParcelamento(false),
    });
  };

  const calcularParcelamento = () => {
    const total = parseFloat(parcelamentoForm.valor_total_original) || 0;
    const descontoMulta = parseFloat(parcelamentoForm.desconto_multa) || 0;
    const descontoJuros = parseFloat(parcelamentoForm.desconto_juros) || 0;
    const entrada = parseFloat(parcelamentoForm.valor_entrada) || 0;
    
    const totalComDesconto = total - descontoMulta - descontoJuros;
    const valorAParcelar = totalComDesconto - entrada;
    const valorParcela = valorAParcelar / parcelamentoForm.numero_parcelas;
    
    setParcelamentoForm({
      ...parcelamentoForm,
      valor_total_parcelado: totalComDesconto.toFixed(2),
      valor_parcela: valorParcela.toFixed(2),
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ativo: "outline",
      em_dia: "default",
      atrasado: "destructive",
      quitado: "default",
      rescindido: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status?.replace("_", " ")}</Badge>;
  };

  return (
    <Tabs defaultValue="refis" className="space-y-4">
      <TabsList>
        <TabsTrigger value="refis" className="flex items-center gap-1">
          <Percent className="h-4 w-4" />
          Programas REFIS
        </TabsTrigger>
        <TabsTrigger value="parcelamentos" className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Parcelamentos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="refis" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={dialogRefis} onOpenChange={setDialogRefis}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Programa REFIS
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Criar Programa de Regularização Fiscal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Programa</Label>
                    <Input
                      value={refisForm.nome}
                      onChange={(e) => setRefisForm({ ...refisForm, nome: e.target.value })}
                      placeholder="REFIS 2026"
                    />
                  </div>
                  <div>
                    <Label>Lei/Decreto</Label>
                    <Input
                      value={refisForm.lei_numero}
                      onChange={(e) => setRefisForm({ ...refisForm, lei_numero: e.target.value })}
                      placeholder="Lei 1234/2026"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data Início</Label>
                    <Input
                      type="date"
                      value={refisForm.data_inicio}
                      onChange={(e) => setRefisForm({ ...refisForm, data_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Data Fim</Label>
                    <Input
                      type="date"
                      value={refisForm.data_fim}
                      onChange={(e) => setRefisForm({ ...refisForm, data_fim: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Descontos Oferecidos</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Desconto Multa (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        max="1"
                        value={refisForm.desconto_multa}
                        onChange={(e) => setRefisForm({ ...refisForm, desconto_multa: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Desconto Juros (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        max="1"
                        value={refisForm.desconto_juros}
                        onChange={(e) => setRefisForm({ ...refisForm, desconto_juros: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Desconto Correção (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        max="1"
                        value={refisForm.desconto_correcao}
                        onChange={(e) => setRefisForm({ ...refisForm, desconto_correcao: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Máximo de Parcelas</Label>
                    <Input
                      type="number"
                      value={refisForm.parcelas_maxima}
                      onChange={(e) => setRefisForm({ ...refisForm, parcelas_maxima: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Valor Mínimo Parcela (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={refisForm.valor_parcela_minima}
                      onChange={(e) => setRefisForm({ ...refisForm, valor_parcela_minima: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleCreateRefis} className="w-full">
                  Criar Programa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programasRefis.map((refis: any) => (
            <Card key={refis.id} className={!refis.ativo ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{refis.nome}</CardTitle>
                    <CardDescription>{refis.lei_numero}</CardDescription>
                  </div>
                  <Badge variant={refis.ativo ? "default" : "secondary"}>
                    {refis.ativo ? "Ativo" : "Encerrado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vigência:</span>
                    <span>
                      {format(new Date(refis.data_inicio), "dd/MM/yyyy")} - {format(new Date(refis.data_fim), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desconto Multa:</span>
                    <span className="text-green-600 font-medium">{(refis.desconto_multa * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Desconto Juros:</span>
                    <span className="text-green-600 font-medium">{(refis.desconto_juros * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Até:</span>
                    <span>{refis.parcelas_maxima}x</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="parcelamentos" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={dialogParcelamento} onOpenChange={setDialogParcelamento}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Parcelamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Criar Parcelamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Contribuinte</Label>
                  <Select
                    value={parcelamentoForm.contribuinte_id}
                    onValueChange={(v) => setParcelamentoForm({ ...parcelamentoForm, contribuinte_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar contribuinte" />
                    </SelectTrigger>
                    <SelectContent>
                      {contribuintes.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome_razao_social} - {c.cpf_cnpj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Programa REFIS (opcional)</Label>
                  <Select
                    value={parcelamentoForm.programa_refis_id}
                    onValueChange={(v) => setParcelamentoForm({ ...parcelamentoForm, programa_refis_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem programa</SelectItem>
                      {programasRefis.filter((r: any) => r.ativo).map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Principal (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parcelamentoForm.valor_principal}
                      onChange={(e) => setParcelamentoForm({ ...parcelamentoForm, valor_principal: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Valor Total Original (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parcelamentoForm.valor_total_original}
                      onChange={(e) => setParcelamentoForm({ ...parcelamentoForm, valor_total_original: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Nº Parcelas</Label>
                    <Input
                      type="number"
                      min={2}
                      max={60}
                      value={parcelamentoForm.numero_parcelas}
                      onChange={(e) => setParcelamentoForm({ ...parcelamentoForm, numero_parcelas: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Entrada (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={parcelamentoForm.valor_entrada}
                      onChange={(e) => setParcelamentoForm({ ...parcelamentoForm, valor_entrada: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Dia Vencimento</Label>
                    <Input
                      type="number"
                      min={1}
                      max={28}
                      value={parcelamentoForm.dia_vencimento}
                      onChange={(e) => setParcelamentoForm({ ...parcelamentoForm, dia_vencimento: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={calcularParcelamento} className="w-full">
                  Calcular Parcelamento
                </Button>

                {parcelamentoForm.valor_parcela && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span>Valor Total com Desconto:</span>
                      <span className="font-bold">{formatCurrency(parseFloat(parcelamentoForm.valor_total_parcelado) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor da Parcela:</span>
                      <span className="font-bold text-lg">{formatCurrency(parseFloat(parcelamentoForm.valor_parcela) || 0)}</span>
                    </div>
                  </div>
                )}

                <Button onClick={handleCreateParcelamento} className="w-full">
                  Confirmar Parcelamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parcelamentos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Termo</TableHead>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Valor Parcela</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcelamentos.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">{p.numero_termo}</TableCell>
                    <TableCell>{p.contribuintes?.nome_razao_social}</TableCell>
                    <TableCell>{p.programas_refis?.nome || "-"}</TableCell>
                    <TableCell>{formatCurrency(p.valor_total_parcelado || 0)}</TableCell>
                    <TableCell>
                      {p.parcelas_pagas}/{p.numero_parcelas}
                    </TableCell>
                    <TableCell>{formatCurrency(p.valor_parcela || 0)}</TableCell>
                    <TableCell>{getStatusBadge(p.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
