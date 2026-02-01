import { useState } from "react";
import { useConvenios } from "@/hooks/useGestaoFinanceira";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { Plus, Search, FileText, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ConveniosManagement() {
  const { convenios, isLoading, createConvenio } = useConvenios();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");

  const [formData, setFormData] = useState({
    numero: "",
    ano: new Date().getFullYear(),
    tipo: "recebido" as "recebido" | "concedido",
    concedente: "",
    convenente: "",
    objeto: "",
    valor_total: "",
    valor_repasse: "",
    valor_contrapartida: "",
    data_assinatura: new Date().toISOString().split("T")[0],
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createConvenio.mutateAsync({
      ...formData,
      valor_total: parseFloat(formData.valor_total),
      valor_repasse: parseFloat(formData.valor_repasse),
      valor_contrapartida: parseFloat(formData.valor_contrapartida || "0"),
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      ano: new Date().getFullYear(),
      tipo: "recebido",
      concedente: "",
      convenente: "",
      objeto: "",
      valor_total: "",
      valor_repasse: "",
      valor_contrapartida: "",
      data_assinatura: new Date().toISOString().split("T")[0],
      data_inicio: new Date().toISOString().split("T")[0],
      data_fim: "",
    });
  };

  const filteredConvenios = convenios.filter((c) => {
    const matchesSearch =
      c.numero.toLowerCase().includes(search.toLowerCase()) ||
      c.objeto.toLowerCase().includes(search.toLowerCase()) ||
      c.concedente.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = tipoFilter === "todos" || c.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      vigente: "default",
      encerrado: "secondary",
      rescindido: "destructive",
      em_prestacao: "outline",
    };
    const labels: Record<string, string> = {
      vigente: "Vigente",
      encerrado: "Encerrado",
      rescindido: "Rescindido",
      em_prestacao: "Em Prestação",
    };
    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const getProgress = (inicio: string, fim: string) => {
    const today = new Date();
    const start = new Date(inicio);
    const end = new Date(fim);
    const total = differenceInDays(end, start);
    const elapsed = differenceInDays(today, start);
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  // Estatísticas
  const totalRecebido = convenios
    .filter((c) => c.tipo === "recebido" && c.status === "vigente")
    .reduce((sum, c) => sum + c.valor_repasse, 0);

  const totalConcedido = convenios
    .filter((c) => c.tipo === "concedido" && c.status === "vigente")
    .reduce((sum, c) => sum + c.valor_repasse, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Convênios</h2>
          <p className="text-muted-foreground">
            Gestão de convênios recebidos e concedidos
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Convênio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Convênio</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    placeholder="CV-001/2026"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Input
                    type="number"
                    value={formData.ano}
                    onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
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
                      <SelectItem value="recebido">Recebido</SelectItem>
                      <SelectItem value="concedido">Concedido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Concedente</Label>
                  <Input
                    value={formData.concedente}
                    onChange={(e) => setFormData({ ...formData, concedente: e.target.value })}
                    placeholder="Órgão/Entidade concedente"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Convenente</Label>
                  <Input
                    value={formData.convenente}
                    onChange={(e) => setFormData({ ...formData, convenente: e.target.value })}
                    placeholder="Órgão/Entidade convenente"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Objeto</Label>
                <Textarea
                  value={formData.objeto}
                  onChange={(e) => setFormData({ ...formData, objeto: e.target.value })}
                  placeholder="Descrição do objeto do convênio..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Valor Total (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Repasse (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_repasse}
                    onChange={(e) => setFormData({ ...formData, valor_repasse: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contrapartida (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_contrapartida}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_contrapartida: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Data de Assinatura</Label>
                  <Input
                    type="date"
                    value={formData.data_assinatura}
                    onChange={(e) => setFormData({ ...formData, data_assinatura: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de Término</Label>
                  <Input
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createConvenio.isPending}>
                  {createConvenio.isPending ? "Salvando..." : "Cadastrar Convênio"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
              Convênios Recebidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRecebido)}</div>
            <p className="text-xs text-muted-foreground">
              {convenios.filter((c) => c.tipo === "recebido" && c.status === "vigente").length}{" "}
              convênios vigentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-blue-600" />
              Convênios Concedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalConcedido)}</div>
            <p className="text-xs text-muted-foreground">
              {convenios.filter((c) => c.tipo === "concedido" && c.status === "vigente").length}{" "}
              convênios vigentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Convênios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{convenios.length}</div>
            <p className="text-xs text-muted-foreground">
              {convenios.filter((c) => c.status === "vigente").length} vigentes
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar convênios..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="recebido">Recebidos</SelectItem>
                <SelectItem value="concedido">Concedidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Carregando convênios...</p>
          ) : filteredConvenios.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nenhum convênio encontrado
            </p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Concedente</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead className="text-right">Valor Repasse</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConvenios.map((convenio) => (
                    <TableRow key={convenio.id}>
                      <TableCell className="font-medium">{convenio.numero}</TableCell>
                      <TableCell>
                        <Badge
                          variant={convenio.tipo === "recebido" ? "default" : "secondary"}
                          className="flex items-center gap-1 w-fit"
                        >
                          {convenio.tipo === "recebido" ? (
                            <ArrowDownLeft className="h-3 w-3" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3" />
                          )}
                          {convenio.tipo === "recebido" ? "Recebido" : "Concedido"}
                        </Badge>
                      </TableCell>
                      <TableCell>{convenio.concedente}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{convenio.objeto}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(convenio.valor_repasse)}
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress
                            value={getProgress(convenio.data_inicio, convenio.data_fim)}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            até {format(new Date(convenio.data_fim), "dd/MM/yy")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(convenio.status)}</TableCell>
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
