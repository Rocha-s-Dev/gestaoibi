import { useState } from "react";
import { useOrdensPagamento, useLiquidacoes } from "@/hooks/useGestaoFinanceira";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, CreditCard, Check } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function OrdensPagamentoManagement() {
  const { ordens, isLoading, createOrdemPagamento, efetuarPagamento } = useOrdensPagamento();
  const { liquidacoes } = useLiquidacoes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    numero: "",
    liquidacao_id: "",
    data_ordem: new Date().toISOString().split("T")[0],
    valor_bruto: "",
    valor_retencoes: "",
    valor_liquido: "",
  });

  const liquidacoesPendentes = liquidacoes.filter((l) => l.status === "pendente" || l.status === "aprovado");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrdemPagamento.mutateAsync({
      ...formData,
      valor_bruto: parseFloat(formData.valor_bruto),
      valor_retencoes: parseFloat(formData.valor_retencoes || "0"),
      valor_liquido: parseFloat(formData.valor_liquido),
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      liquidacao_id: "",
      data_ordem: new Date().toISOString().split("T")[0],
      valor_bruto: "",
      valor_retencoes: "",
      valor_liquido: "",
    });
  };

  const handleValorBrutoChange = (valorBruto: string) => {
    const bruto = parseFloat(valorBruto) || 0;
    const retencoes = parseFloat(formData.valor_retencoes) || 0;
    setFormData({
      ...formData,
      valor_bruto: valorBruto,
      valor_liquido: (bruto - retencoes).toFixed(2),
    });
  };

  const handleRetencoesChange = (valorRetencoes: string) => {
    const bruto = parseFloat(formData.valor_bruto) || 0;
    const retencoes = parseFloat(valorRetencoes) || 0;
    setFormData({
      ...formData,
      valor_retencoes: valorRetencoes,
      valor_liquido: (bruto - retencoes).toFixed(2),
    });
  };

  const filteredOrdens = ordens.filter(
    (o) =>
      o.numero.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "outline",
      autorizado: "default",
      pago: "secondary",
      cancelado: "destructive",
    };
    const labels: Record<string, string> = {
      pendente: "Pendente",
      autorizado: "Autorizado",
      pago: "Pago",
      cancelado: "Cancelado",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ordens de Pagamento</h2>
          <p className="text-muted-foreground">
            Autorização e efetivação de pagamentos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem de Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Ordem de Pagamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número da OP</Label>
                  <Input
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="OP-2026/0001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data da Ordem</Label>
                  <Input
                    type="date"
                    value={formData.data_ordem}
                    onChange={(e) => setFormData({ ...formData, data_ordem: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Liquidação</Label>
                <Select
                  value={formData.liquidacao_id}
                  onValueChange={(v) => {
                    const liquidacao = liquidacoes.find((l) => l.id === v);
                    setFormData({
                      ...formData,
                      liquidacao_id: v,
                      valor_bruto: liquidacao?.valor_liquidado.toString() || "",
                      valor_liquido: liquidacao?.valor_liquidado.toString() || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a liquidação" />
                  </SelectTrigger>
                  <SelectContent>
                    {liquidacoesPendentes.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.numero} - {l.empenho?.descricao?.substring(0, 40)}... ({formatCurrency(l.valor_liquidado)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Valor Bruto (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_bruto}
                    onChange={(e) => handleValorBrutoChange(e.target.value)}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Retenções (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_retencoes}
                    onChange={(e) => handleRetencoesChange(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Líquido (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_liquido}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createOrdemPagamento.isPending}>
                  {createOrdemPagamento.isPending ? "Criando..." : "Criar Ordem"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar ordens..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Carregando ordens de pagamento...</p>
          ) : filteredOrdens.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma ordem de pagamento encontrada
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor Bruto</TableHead>
                    <TableHead className="text-right">Retenções</TableHead>
                    <TableHead className="text-right">Valor Líquido</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Pagamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrdens.map((ordem) => (
                    <TableRow key={ordem.id}>
                      <TableCell className="font-medium">{ordem.numero}</TableCell>
                      <TableCell>
                        {format(new Date(ordem.data_ordem), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(ordem.valor_bruto)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(ordem.valor_retencoes)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(ordem.valor_liquido)}
                      </TableCell>
                      <TableCell>{getStatusBadge(ordem.status)}</TableCell>
                      <TableCell>
                        {ordem.data_pagamento
                          ? format(new Date(ordem.data_pagamento), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {ordem.status === "pendente" || ordem.status === "autorizado" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => efetuarPagamento.mutate(ordem.id)}
                            disabled={efetuarPagamento.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" title="Ver detalhes">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
