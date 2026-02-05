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
import { FileText, Plus, Scale, CheckCircle2, Clock, Send, Eye } from "lucide-react";
import { useAtosAdministrativos } from "@/hooks/useGabinetePrefeito";
import { useSecretarias } from "@/hooks/useSecretarias";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AtosAdministrativos() {
  const { atos, isLoading, createAto, updateAto } = useAtosAdministrativos();
  const { secretarias } = useSecretarias();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    tipo: "decreto",
    titulo: "",
    ementa: "",
    conteudo: "",
    fundamentacao_legal: "",
    secretaria_origem_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAto.mutateAsync({
      ...formData,
      secretaria_origem_id: formData.secretaria_origem_id || null,
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      tipo: "decreto",
      titulo: "",
      ementa: "",
      conteudo: "",
      fundamentacao_legal: "",
      secretaria_origem_id: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      rascunho: { variant: "secondary", label: "Rascunho", icon: <FileText className="h-3 w-3" /> },
      em_analise_juridica: { variant: "secondary", label: "Em Análise Jurídica", icon: <Scale className="h-3 w-3" /> },
      aprovado_juridico: { variant: "default", label: "Aprovado", icon: <CheckCircle2 className="h-3 w-3" /> },
      aguardando_assinatura: { variant: "secondary", label: "Aguardando Assinatura", icon: <Clock className="h-3 w-3" /> },
      assinado: { variant: "default", label: "Assinado", icon: <CheckCircle2 className="h-3 w-3" /> },
      publicado: { variant: "outline", label: "Publicado", icon: <Send className="h-3 w-3" /> },
      revogado: { variant: "destructive", label: "Revogado", icon: null },
    };
    const config = variants[status] || variants.rascunho;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      decreto: "Decreto",
      portaria: "Portaria",
      lei: "Lei",
      resolucao: "Resolução",
      instrucao_normativa: "Instrução Normativa",
      sancao: "Sanção",
      veto: "Veto",
      outro: "Outro",
    };
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>;
  };

  const handleEnviarAnalise = async (id: string) => {
    await updateAto.mutateAsync({
      id,
      status: "em_analise_juridica",
    });
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
          <h2 className="text-2xl font-bold">Atos Administrativos</h2>
          <p className="text-muted-foreground">
            Decretos, portarias, leis e outros atos oficiais
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Ato
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Novo Ato Administrativo</DialogTitle>
                <DialogDescription>
                  Elabore um novo decreto, portaria ou outro ato oficial
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="Ex: 001/2024"
                      required
                    />
                  </div>
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
                        <SelectItem value="decreto">Decreto</SelectItem>
                        <SelectItem value="portaria">Portaria</SelectItem>
                        <SelectItem value="lei">Lei</SelectItem>
                        <SelectItem value="resolucao">Resolução</SelectItem>
                        <SelectItem value="instrucao_normativa">Instrução Normativa</SelectItem>
                        <SelectItem value="sancao">Sanção</SelectItem>
                        <SelectItem value="veto">Veto</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secretaria">Secretaria de Origem</Label>
                    <Select
                      value={formData.secretaria_origem_id}
                      onValueChange={(value) => setFormData({ ...formData, secretaria_origem_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {secretarias?.map((sec) => (
                          <SelectItem key={sec.id} value={sec.id}>
                            {sec.sigla}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                <div className="space-y-2">
                  <Label htmlFor="ementa">Ementa</Label>
                  <Textarea
                    id="ementa"
                    value={formData.ementa}
                    onChange={(e) => setFormData({ ...formData, ementa: e.target.value })}
                    rows={2}
                    placeholder="Resumo do conteúdo do ato..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo *</Label>
                  <Textarea
                    id="conteudo"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    rows={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundamentacao_legal">Fundamentação Legal</Label>
                  <Textarea
                    id="fundamentacao_legal"
                    value={formData.fundamentacao_legal}
                    onChange={(e) => setFormData({ ...formData, fundamentacao_legal: e.target.value })}
                    rows={2}
                    placeholder="Leis, artigos e normas que fundamentam o ato..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createAto.isPending}>
                  {createAto.isPending ? "Salvando..." : "Salvar Rascunho"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Atos */}
      {atos && atos.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atos.map((ato) => (
                  <TableRow key={ato.id}>
                    <TableCell className="font-medium">{ato.numero}</TableCell>
                    <TableCell>{getTipoBadge(ato.tipo)}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{ato.titulo}</TableCell>
                    <TableCell>
                      {ato.secretaria ? (ato.secretaria as { sigla?: string })?.sigla : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(ato.status || "rascunho")}</TableCell>
                    <TableCell>
                      {format(new Date(ato.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {ato.status === "rascunho" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEnviarAnalise(ato.id)}
                            disabled={updateAto.isPending}
                          >
                            <Scale className="h-4 w-4 mr-1" />
                            Enviar p/ Análise
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
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum ato administrativo cadastrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
