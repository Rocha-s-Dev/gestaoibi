import { useState } from "react";
import { useLiquidacoes, useEmpenhos } from "@/hooks/useGestaoFinanceira";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, FileCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function LiquidacaoManagement() {
  const { liquidacoes, isLoading, createLiquidacao } = useLiquidacoes();
  const { empenhos } = useEmpenhos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    numero: "",
    empenho_id: "",
    data_liquidacao: new Date().toISOString().split("T")[0],
    valor_liquidado: "",
    documento_fiscal: "",
    tipo_documento: "nf",
  });

  const empenhosAtivos = empenhos.filter((e) => e.status === "ativo" && e.saldo_empenho > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLiquidacao.mutateAsync({
      ...formData,
      valor_liquidado: parseFloat(formData.valor_liquidado),
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      empenho_id: "",
      data_liquidacao: new Date().toISOString().split("T")[0],
      valor_liquidado: "",
      documento_fiscal: "",
      tipo_documento: "nf",
    });
  };

  const filteredLiquidacoes = liquidacoes.filter(
    (l) =>
      l.numero.toLowerCase().includes(search.toLowerCase()) ||
      l.empenho?.numero?.toLowerCase().includes(search.toLowerCase()) ||
      l.documento_fiscal?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pendente: "outline",
      aprovado: "default",
      pago: "secondary",
      estornado: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Liquidações</h2>
          <p className="text-muted-foreground">
            Reconhecimento de obrigações a pagar
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Liquidação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Liquidação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número da Liquidação</Label>
                  <Input
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="LQ-2026/0001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data da Liquidação</Label>
                  <Input
                    type="date"
                    value={formData.data_liquidacao}
                    onChange={(e) => setFormData({ ...formData, data_liquidacao: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Empenho</Label>
                <Select
                  value={formData.empenho_id}
                  onValueChange={(v) => setFormData({ ...formData, empenho_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o empenho" />
                  </SelectTrigger>
                  <SelectContent>
                    {empenhosAtivos.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.numero} - {e.descricao.substring(0, 50)}... (Saldo:{" "}
                        {formatCurrency(e.saldo_empenho)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Liquidado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_liquidado}
                    onChange={(e) => setFormData({ ...formData, valor_liquidado: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={formData.tipo_documento}
                    onValueChange={(v) => setFormData({ ...formData, tipo_documento: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nf">Nota Fiscal</SelectItem>
                      <SelectItem value="nfs">Nota Fiscal de Serviço</SelectItem>
                      <SelectItem value="fatura">Fatura</SelectItem>
                      <SelectItem value="recibo">Recibo</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Número do Documento Fiscal</Label>
                <Input
                  value={formData.documento_fiscal}
                  onChange={(e) => setFormData({ ...formData, documento_fiscal: e.target.value })}
                  placeholder="Número da NF ou documento"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createLiquidacao.isPending}>
                  {createLiquidacao.isPending ? "Registrando..." : "Registrar Liquidação"}
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
                placeholder="Buscar liquidações..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Carregando liquidações...</p>
          ) : filteredLiquidacoes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhuma liquidação encontrada
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Empenho</TableHead>
                    <TableHead>Documento Fiscal</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLiquidacoes.map((liquidacao) => (
                    <TableRow key={liquidacao.id}>
                      <TableCell className="font-medium">{liquidacao.numero}</TableCell>
                      <TableCell>{liquidacao.empenho?.numero}</TableCell>
                      <TableCell>{liquidacao.documento_fiscal || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(liquidacao.data_liquidacao), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(liquidacao.valor_liquidado)}
                      </TableCell>
                      <TableCell>{getStatusBadge(liquidacao.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" title="Ver detalhes">
                          <FileCheck className="h-4 w-4" />
                        </Button>
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
