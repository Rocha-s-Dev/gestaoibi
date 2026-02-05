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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target, Plus, TrendingUp, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useMetasPlanoGoverno } from "@/hooks/useGabinetePrefeito";
import { useSecretarias } from "@/hooks/useSecretarias";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function MetasPlanoGoverno() {
  const { metas, isLoading, createMeta, updateMeta } = useMetasPlanoGoverno();
  const { secretarias } = useSecretarias();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    area: "",
    secretaria_responsavel_id: "",
    indicador_nome: "",
    indicador_unidade: "%",
    meta_valor: "",
    valor_atual: "0",
    orcamento_previsto: "",
    data_inicio: "",
    data_fim: "",
    prioridade: "media",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMeta.mutateAsync({
      ...formData,
      meta_valor: formData.meta_valor ? parseFloat(formData.meta_valor) : null,
      valor_atual: parseFloat(formData.valor_atual),
      orcamento_previsto: formData.orcamento_previsto ? parseFloat(formData.orcamento_previsto) : null,
      secretaria_responsavel_id: formData.secretaria_responsavel_id || null,
    });
    setDialogOpen(false);
    setFormData({
      titulo: "",
      descricao: "",
      area: "",
      secretaria_responsavel_id: "",
      indicador_nome: "",
      indicador_unidade: "%",
      meta_valor: "",
      valor_atual: "0",
      orcamento_previsto: "",
      data_inicio: "",
      data_fim: "",
      prioridade: "media",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      planejada: { variant: "secondary", label: "Planejada", icon: <Clock className="h-3 w-3" /> },
      em_andamento: { variant: "default", label: "Em Andamento", icon: <TrendingUp className="h-3 w-3" /> },
      atrasada: { variant: "destructive", label: "Atrasada", icon: <AlertTriangle className="h-3 w-3" /> },
      concluida: { variant: "outline", label: "Concluída", icon: <CheckCircle2 className="h-3 w-3" /> },
      cancelada: { variant: "secondary", label: "Cancelada", icon: null },
    };
    const config = variants[status] || variants.planejada;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: "destructive" | "secondary" | "outline"; label: string }> = {
      critica: { variant: "destructive", label: "Crítica" },
      alta: { variant: "destructive", label: "Alta" },
      media: { variant: "secondary", label: "Média" },
      baixa: { variant: "outline", label: "Baixa" },
    };
    const config = variants[prioridade] || variants.media;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calcularProgresso = (meta: { meta_valor: number | null; valor_atual: number | null }) => {
    if (!meta.meta_valor || meta.meta_valor === 0) return 0;
    return Math.min(((meta.valor_atual || 0) / meta.meta_valor) * 100, 100);
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
          <h2 className="text-2xl font-bold">Metas do Plano de Governo</h2>
          <p className="text-muted-foreground">
            Acompanhamento das metas estratégicas do mandato
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nova Meta Estratégica</DialogTitle>
                <DialogDescription>
                  Cadastre uma nova meta do plano de governo
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="area">Área *</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => setFormData({ ...formData, area: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                        <SelectItem value="seguranca">Segurança</SelectItem>
                        <SelectItem value="social">Assistência Social</SelectItem>
                        <SelectItem value="meio_ambiente">Meio Ambiente</SelectItem>
                        <SelectItem value="cultura">Cultura</SelectItem>
                        <SelectItem value="esporte">Esporte</SelectItem>
                        <SelectItem value="economia">Desenvolvimento Econômico</SelectItem>
                        <SelectItem value="administracao">Administração</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                        <SelectItem value="baixa">Baixa</SelectItem>
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="indicador_nome">Indicador</Label>
                    <Input
                      id="indicador_nome"
                      value={formData.indicador_nome}
                      onChange={(e) => setFormData({ ...formData, indicador_nome: e.target.value })}
                      placeholder="Ex: Vagas criadas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meta_valor">Meta</Label>
                    <Input
                      id="meta_valor"
                      type="number"
                      value={formData.meta_valor}
                      onChange={(e) => setFormData({ ...formData, meta_valor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="indicador_unidade">Unidade</Label>
                    <Select
                      value={formData.indicador_unidade}
                      onValueChange={(value) => setFormData({ ...formData, indicador_unidade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="%">Percentual (%)</SelectItem>
                        <SelectItem value="unidades">Unidades</SelectItem>
                        <SelectItem value="km">Quilômetros</SelectItem>
                        <SelectItem value="m2">Metros²</SelectItem>
                        <SelectItem value="pessoas">Pessoas</SelectItem>
                        <SelectItem value="R$">Reais (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orcamento_previsto">Orçamento Previsto (R$)</Label>
                    <Input
                      id="orcamento_previsto"
                      type="number"
                      step="0.01"
                      value={formData.orcamento_previsto}
                      onChange={(e) => setFormData({ ...formData, orcamento_previsto: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data Início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data Fim</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMeta.isPending}>
                  {createMeta.isPending ? "Salvando..." : "Salvar Meta"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Metas */}
      {metas && metas.length > 0 ? (
        <div className="space-y-4">
          {metas.map((meta) => (
            <Card key={meta.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{meta.titulo}</h3>
                      {getStatusBadge(meta.status || "planejada")}
                      {getPrioridadeBadge(meta.prioridade || "media")}
                    </div>
                    {meta.descricao && (
                      <p className="text-sm text-muted-foreground mb-3">{meta.descricao}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-primary" />
                        {meta.area}
                      </span>
                      {meta.secretaria && (
                        <span className="text-muted-foreground">
                          {(meta.secretaria as { sigla?: string })?.sigla}
                        </span>
                      )}
                      {meta.data_fim && (
                        <span className="text-muted-foreground">
                          Prazo: {format(new Date(meta.data_fim), "dd/MM/yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right min-w-[200px]">
                    {meta.meta_valor && (
                      <>
                        <div className="text-2xl font-bold">
                          {meta.valor_atual || 0} / {meta.meta_valor}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {meta.indicador_unidade}
                          </span>
                        </div>
                        <Progress 
                          value={calcularProgresso(meta)} 
                          className="h-2 mt-2" 
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {calcularProgresso(meta).toFixed(1)}% concluído
                        </p>
                      </>
                    )}
                    {meta.orcamento_previsto && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Orçamento: {formatCurrency(meta.orcamento_previsto)}
                      </p>
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
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma meta cadastrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
