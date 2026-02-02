import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, FileText, Edit, Search } from "lucide-react";
import { useDeclaracoesISS, useGuiasISS } from "@/hooks/useISSCompleto";
import { useContribuintes } from "@/hooks/useArrecadacao";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DeclaracoesISS() {
  const { declaracoes, isLoading, createDeclaracao, transmitirDeclaracao } = useDeclaracoesISS();
  const { gerarGuia } = useGuiasISS();
  const { contribuintes } = useContribuintes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [formData, setFormData] = useState({
    contribuinte_id: "",
    competencia: "",
  });

  const filteredDeclaracoes = declaracoes.filter((d: any) => {
    const matchSearch =
      d.numero_declaracao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contribuinte?.nome_razao_social?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus && filterStatus !== "all" ? d.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      rascunho: "bg-yellow-100 text-yellow-800",
      transmitida: "bg-green-100 text-green-800",
      retificada: "bg-blue-100 text-blue-800",
      cancelada: "bg-red-100 text-red-800",
    };
    return <Badge className={styles[status] || ""}>{status}</Badge>;
  };

  const handleSubmit = async () => {
    await createDeclaracao.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({ contribuinte_id: "", competencia: "" });
  };

  const handleTransmitir = async (id: string) => {
    await transmitirDeclaracao.mutateAsync(id);
  };

  const handleGerarGuia = async (id: string) => {
    await gerarGuia.mutateAsync(id);
  };

  const contribuintesPJ = contribuintes.filter((c: any) => c.tipo === "juridica");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Declarações Mensais de ISS</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Declaração
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número ou contribuinte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="transmitida">Transmitida</SelectItem>
                <SelectItem value="retificada">Retificada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Contribuinte</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead className="text-right">Valor Serviços</TableHead>
                <TableHead className="text-right">ISS Devido</TableHead>
                <TableHead className="text-right">ISS a Pagar</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredDeclaracoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma declaração encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredDeclaracoes.map((dec: any) => (
                  <TableRow key={dec.id}>
                    <TableCell className="font-medium">{dec.numero_declaracao}</TableCell>
                    <TableCell>{dec.contribuinte?.nome_razao_social || "-"}</TableCell>
                    <TableCell>{dec.competencia}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(dec.valor_servicos_prestados)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(dec.valor_iss_devido)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(dec.valor_iss_pagar)}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(dec.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {dec.status === "rascunho" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTransmitir(dec.id)}
                              title="Transmitir"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {dec.status === "transmitida" && dec.valor_iss_pagar > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGerarGuia(dec.id)}
                            title="Gerar Guia"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Declaração de ISS</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contribuinte *</Label>
              <Select
                value={formData.contribuinte_id}
                onValueChange={(v) => setFormData({ ...formData, contribuinte_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contribuinte" />
                </SelectTrigger>
                <SelectContent>
                  {contribuintesPJ.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome_razao_social} - {c.cpf_cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Competência (YYYY-MM) *</Label>
              <Input
                type="month"
                value={formData.competencia}
                onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.contribuinte_id || !formData.competencia || createDeclaracao.isPending}
            >
              Criar Declaração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
