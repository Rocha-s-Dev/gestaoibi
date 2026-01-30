import { useState } from "react";
import { useRelatoriosLegais } from "@/hooks/useRelatoriosLegais";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, FileText, Send, CheckCircle, Download, Loader2, FileSpreadsheet, Building2, Landmark } from "lucide-react";

export function RelatoriosLegaisManagement() {
  const { relatorios, isLoading, gerarRelatorio, marcarTransmitido, TIPO_RELATORIO_LABELS } = useRelatoriosLegais();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transmitirDialog, setTransmitirDialog] = useState<string | null>(null);
  const [protocolo, setProtocolo] = useState("");
  const [formData, setFormData] = useState({
    tipo: "",
    competencia: "",
  });

  const handleGerar = () => {
    if (formData.tipo && formData.competencia) {
      gerarRelatorio.mutate({
        tipo: formData.tipo,
        competencia: formData.competencia,
      });
      setDialogOpen(false);
      setFormData({ tipo: "", competencia: "" });
    }
  };

  const handleTransmitir = () => {
    if (transmitirDialog && protocolo) {
      marcarTransmitido.mutate({ id: transmitirDialog, protocolo });
      setTransmitirDialog(null);
      setProtocolo("");
    }
  };

  const getIconByTipo = (tipo: string) => {
    switch (tipo) {
      case "RAIS":
      case "CAGED":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "GFIP":
      case "DIRF":
        return <Landmark className="h-4 w-4" />;
      case "TCE":
        return <Building2 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const relatoriosPorTipo = (tipo: string) => relatorios?.filter(r => r.tipo === tipo).length || 0;
  const transmitidos = relatorios?.filter(r => r.transmitido).length || 0;

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
          <h2 className="text-2xl font-bold">Relatórios Legais</h2>
          <p className="text-muted-foreground">Geração de RAIS, CAGED, GFIP, DIRF e relatórios TCE</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Novo Relatório</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Tipo de Relatório</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RAIS">RAIS - Relação Anual de Informações Sociais</SelectItem>
                    <SelectItem value="CAGED">CAGED - Cadastro Geral de Empregados</SelectItem>
                    <SelectItem value="GFIP">GFIP - Guia de Recolhimento do FGTS</SelectItem>
                    <SelectItem value="DIRF">DIRF - Declaração do IRRF</SelectItem>
                    <SelectItem value="TCE">TCE - Relatório Tribunal de Contas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Competência</Label>
                <Input
                  type="month"
                  value={formData.competencia}
                  onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
                />
              </div>
              <Button onClick={handleGerar} className="w-full" disabled={gerarRelatorio.isPending}>
                {gerarRelatorio.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Gerar Relatório
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>RAIS</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              {relatoriosPorTipo("RAIS")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CAGED</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-500" />
              {relatoriosPorTipo("CAGED")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>GFIP</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Landmark className="h-5 w-5 text-yellow-500" />
              {relatoriosPorTipo("GFIP")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>DIRF</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Landmark className="h-5 w-5 text-red-500" />
              {relatoriosPorTipo("DIRF")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>TCE</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              {relatoriosPorTipo("TCE")}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabela de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Competência</TableHead>
                <TableHead>Gerado em</TableHead>
                <TableHead>Transmitido</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorios?.map((relatorio) => (
                <TableRow key={relatorio.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getIconByTipo(relatorio.tipo)}
                      <Badge variant="outline">{relatorio.tipo}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(relatorio.competencia + "-01"), "MMMM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(relatorio.created_at), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {relatorio.transmitido ? (
                      <Badge variant="default" className="flex items-center gap-1 w-fit">
                        <CheckCircle className="h-3 w-3" />
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {relatorio.protocolo || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!relatorio.transmitido && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTransmitirDialog(relatorio.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!relatorios || relatorios.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum relatório gerado ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Transmissão */}
      <Dialog open={!!transmitirDialog} onOpenChange={() => setTransmitirDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Transmissão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Protocolo de Transmissão</Label>
              <Input
                value={protocolo}
                onChange={(e) => setProtocolo(e.target.value)}
                placeholder="Informe o protocolo recebido"
              />
            </div>
            <Button onClick={handleTransmitir} className="w-full" disabled={marcarTransmitido.isPending}>
              {marcarTransmitido.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar Transmissão
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
