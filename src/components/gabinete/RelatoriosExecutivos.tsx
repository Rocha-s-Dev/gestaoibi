import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileBarChart, Plus, Download, Eye, CheckCircle2, Clock, FileText } from "lucide-react";
import { useRelatoriosExecutivos } from "@/hooks/useGabinetePrefeito";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RelatoriosExecutivos() {
  const { relatorios, isLoading, createRelatorio } = useRelatoriosExecutivos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "mensal",
    titulo: "",
    periodo_inicio: "",
    periodo_fim: "",
    sumario_executivo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRelatorio.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({
      tipo: "mensal",
      titulo: "",
      periodo_inicio: "",
      periodo_fim: "",
      sumario_executivo: "",
    });
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      mensal: "Mensal",
      trimestral: "Trimestral",
      semestral: "Semestral",
      anual: "Anual",
      especial: "Especial",
      camara: "Câmara Municipal",
      tce: "TCE",
    };
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      rascunho: { variant: "secondary", label: "Rascunho", icon: <FileText className="h-3 w-3" /> },
      em_elaboracao: { variant: "secondary", label: "Em Elaboração", icon: <Clock className="h-3 w-3" /> },
      em_revisao: { variant: "secondary", label: "Em Revisão", icon: <Clock className="h-3 w-3" /> },
      aprovado: { variant: "default", label: "Aprovado", icon: <CheckCircle2 className="h-3 w-3" /> },
      publicado: { variant: "outline", label: "Publicado", icon: <CheckCircle2 className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.rascunho;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios Executivos</h2>
          <p className="text-muted-foreground">
            Relatórios consolidados para Câmara, TCE e gestão interna
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Novo Relatório Executivo</DialogTitle>
                <DialogDescription>
                  Crie um novo relatório consolidado
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="especial">Especial</SelectItem>
                        <SelectItem value="camara">Câmara Municipal</SelectItem>
                        <SelectItem value="tce">TCE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodo_inicio">Período Início *</Label>
                    <Input
                      id="periodo_inicio"
                      type="date"
                      value={formData.periodo_inicio}
                      onChange={(e) => setFormData({ ...formData, periodo_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodo_fim">Período Fim *</Label>
                    <Input
                      id="periodo_fim"
                      type="date"
                      value={formData.periodo_fim}
                      onChange={(e) => setFormData({ ...formData, periodo_fim: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sumario_executivo">Sumário Executivo</Label>
                  <Textarea
                    id="sumario_executivo"
                    value={formData.sumario_executivo}
                    onChange={(e) => setFormData({ ...formData, sumario_executivo: e.target.value })}
                    rows={4}
                    placeholder="Resumo executivo do relatório..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createRelatorio.isPending}>
                  {createRelatorio.isPending ? "Salvando..." : "Criar Relatório"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Relatórios */}
      {relatorios && relatorios.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assinado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorios.map((rel) => (
                  <TableRow key={rel.id}>
                    <TableCell className="font-medium">{rel.titulo}</TableCell>
                    <TableCell>{getTipoBadge(rel.tipo)}</TableCell>
                    <TableCell>
                      {format(new Date(rel.periodo_inicio), "dd/MM/yyyy")} - {format(new Date(rel.periodo_fim), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(rel.status || "rascunho")}</TableCell>
                    <TableCell>
                      {rel.assinado ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {rel.arquivo_url && (
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileBarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum relatório cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
