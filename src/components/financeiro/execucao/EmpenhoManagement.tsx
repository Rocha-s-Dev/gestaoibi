import { useState } from "react";
import { useEmpenhos, useFornecedores } from "@/hooks/useGestaoFinanceira";
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
import { Plus, FileText, Search, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function EmpenhoManagement() {
  const { empenhos, isLoading, createEmpenho, anularEmpenho } = useEmpenhos();
  const { fornecedores } = useFornecedores();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    numero: "",
    credor_id: "",
    tipo: "ordinario" as const,
    data_empenho: new Date().toISOString().split("T")[0],
    valor_empenhado: "",
    descricao: "",
    processo_licitatorio: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEmpenho.mutateAsync({
      ...formData,
      valor_empenhado: parseFloat(formData.valor_empenhado),
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      credor_id: "",
      tipo: "ordinario",
      data_empenho: new Date().toISOString().split("T")[0],
      valor_empenhado: "",
      descricao: "",
      processo_licitatorio: "",
    });
  };

  const filteredEmpenhos = empenhos.filter(
    (e) =>
      e.numero.toLowerCase().includes(search.toLowerCase()) ||
      e.descricao.toLowerCase().includes(search.toLowerCase()) ||
      e.credor?.razao_social?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ativo: "default",
      liquidado: "secondary",
      pago: "outline",
      anulado: "destructive",
      inscrito_rap: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Empenhos</h2>
          <p className="text-muted-foreground">
            Gestão de notas de empenho e execução orçamentária
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Empenho
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Emitir Nota de Empenho</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número do Empenho</Label>
                  <Input
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="NE-2026/0001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ordinario">Ordinário</SelectItem>
                      <SelectItem value="estimativo">Estimativo</SelectItem>
                      <SelectItem value="global">Global</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credor/Fornecedor</Label>
                  <Select
                    value={formData.credor_id}
                    onValueChange={(v) => setFormData({ ...formData, credor_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o credor" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.razao_social} ({f.cpf_cnpj})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data do Empenho</Label>
                  <Input
                    type="date"
                    value={formData.data_empenho}
                    onChange={(e) => setFormData({ ...formData, data_empenho: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Empenhado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_empenhado}
                    onChange={(e) => setFormData({ ...formData, valor_empenhado: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Processo Licitatório</Label>
                  <Input
                    value={formData.processo_licitatorio}
                    onChange={(e) =>
                      setFormData({ ...formData, processo_licitatorio: e.target.value })
                    }
                    placeholder="PE-001/2026"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição/Objeto</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o objeto do empenho..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEmpenho.isPending}>
                  {createEmpenho.isPending ? "Emitindo..." : "Emitir Empenho"}
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
                placeholder="Buscar empenhos..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Carregando empenhos...</p>
          ) : filteredEmpenhos.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum empenho encontrado
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Credor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Empenhado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpenhos.map((empenho) => (
                    <TableRow key={empenho.id}>
                      <TableCell className="font-medium">{empenho.numero}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{empenho.credor?.razao_social}</p>
                          <p className="text-sm text-muted-foreground">
                            {empenho.credor?.cpf_cnpj}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{empenho.tipo}</TableCell>
                      <TableCell>
                        {format(new Date(empenho.data_empenho), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(empenho.valor_empenhado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(empenho.saldo_empenho)}
                      </TableCell>
                      <TableCell>{getStatusBadge(empenho.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Ver detalhes">
                            <FileText className="h-4 w-4" />
                          </Button>
                          {empenho.status === "ativo" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Anular"
                              onClick={() =>
                                anularEmpenho.mutate({
                                  id: empenho.id,
                                  valor: empenho.saldo_empenho,
                                  motivo: "Anulação solicitada",
                                })
                              }
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
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
