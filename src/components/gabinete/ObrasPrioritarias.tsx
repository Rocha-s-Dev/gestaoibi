import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, MapPin, Calendar, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { useObrasPrioritarias } from "@/hooks/useGabinetePrefeito";
import { useSecretarias } from "@/hooks/useSecretarias";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ObrasPrioritarias() {
  const { obras, isLoading, createObra } = useObrasPrioritarias();
  const { secretarias } = useSecretarias();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    localizacao: "",
    secretaria_responsavel_id: "",
    data_inicio_prevista: "",
    data_fim_prevista: "",
    valor_total: "",
    fonte_recurso: "",
    prioridade: "alta",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createObra.mutateAsync({
      ...formData,
      valor_total: formData.valor_total ? parseFloat(formData.valor_total) : 0,
      secretaria_responsavel_id: formData.secretaria_responsavel_id || null,
    });
    setDialogOpen(false);
    setFormData({
      nome: "",
      descricao: "",
      localizacao: "",
      secretaria_responsavel_id: "",
      data_inicio_prevista: "",
      data_fim_prevista: "",
      valor_total: "",
      fonte_recurso: "",
      prioridade: "alta",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      planejada: { variant: "secondary", label: "Planejada" },
      em_licitacao: { variant: "secondary", label: "Em Licitação" },
      em_execucao: { variant: "default", label: "Em Execução" },
      paralisada: { variant: "destructive", label: "Paralisada" },
      concluida: { variant: "outline", label: "Concluída" },
      cancelada: { variant: "destructive", label: "Cancelada" },
    };
    const config = variants[status] || variants.planejada;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: "destructive" | "secondary" | "outline"; label: string }> = {
      critica: { variant: "destructive", label: "Crítica" },
      alta: { variant: "destructive", label: "Alta" },
      media: { variant: "secondary", label: "Média" },
    };
    const config = variants[prioridade] || variants.alta;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
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
          <h2 className="text-2xl font-bold">Obras Prioritárias</h2>
          <p className="text-muted-foreground">
            Acompanhamento das obras estratégicas do município
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Obra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nova Obra Prioritária</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova obra estratégica para acompanhamento
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Obra *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={formData.prioridade}
                      onValueChange={(value) => setFormData({ ...formData, prioridade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critica">Crítica</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="localizacao">Localização</Label>
                    <Input
                      id="localizacao"
                      value={formData.localizacao}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secretaria">Secretaria Responsável</Label>
                    <Select
                      value={formData.secretaria_responsavel_id}
                      onValueChange={(value) => setFormData({ ...formData, secretaria_responsavel_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {secretarias?.map((sec) => (
                          <SelectItem key={sec.id} value={sec.id}>
                            {sec.sigla} - {sec.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio_prevista">Data Início Prevista</Label>
                    <Input
                      id="data_inicio_prevista"
                      type="date"
                      value={formData.data_inicio_prevista}
                      onChange={(e) => setFormData({ ...formData, data_inicio_prevista: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_fim_prevista">Data Fim Prevista</Label>
                    <Input
                      id="data_fim_prevista"
                      type="date"
                      value={formData.data_fim_prevista}
                      onChange={(e) => setFormData({ ...formData, data_fim_prevista: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor_total">Valor Total (R$)</Label>
                    <Input
                      id="valor_total"
                      type="number"
                      step="0.01"
                      value={formData.valor_total}
                      onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fonte_recurso">Fonte de Recurso</Label>
                    <Input
                      id="fonte_recurso"
                      value={formData.fonte_recurso}
                      onChange={(e) => setFormData({ ...formData, fonte_recurso: e.target.value })}
                      placeholder="Ex: Recursos próprios, Convênio Federal..."
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createObra.isPending}>
                  {createObra.isPending ? "Salvando..." : "Salvar Obra"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Obras */}
      {obras && obras.length > 0 ? (
        <div className="grid gap-4">
          {obras.map((obra) => (
            <Card key={obra.id} className={obra.destaque ? "border-primary" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{obra.nome}</h3>
                      {getStatusBadge(obra.status || "planejada")}
                      {getPrioridadeBadge(obra.prioridade || "alta")}
                      {obra.alerta_atraso && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {obra.dias_atraso} dias de atraso
                        </Badge>
                      )}
                    </div>
                    {obra.descricao && (
                      <p className="text-sm text-muted-foreground mb-3">{obra.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {obra.localizacao && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {obra.localizacao}
                        </span>
                      )}
                      {obra.secretaria && (
                        <span className="text-muted-foreground">
                          {(obra.secretaria as { sigla?: string })?.sigla}
                        </span>
                      )}
                      {obra.data_fim_prevista && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Prazo: {format(new Date(obra.data_fim_prevista), "dd/MM/yyyy")}
                        </span>
                      )}
                      {obra.fonte_recurso && (
                        <span className="text-muted-foreground">
                          Fonte: {obra.fonte_recurso}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right min-w-[220px]">
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Execução Física</span>
                        <span className="font-medium">{obra.percentual_fisico || 0}%</span>
                      </div>
                      <Progress value={obra.percentual_fisico || 0} className="h-2" />
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Execução Financeira</span>
                        <span className="font-medium">{obra.percentual_financeiro || 0}%</span>
                      </div>
                      <Progress value={obra.percentual_financeiro || 0} className="h-2" />
                    </div>
                    {obra.valor_total && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Valor: </span>
                        <span className="font-medium">{formatCurrency(obra.valor_total)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma obra prioritária cadastrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
