import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Newspaper, Instagram, MessageSquare, FileText, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { useComunicacoesInstitucionais } from "@/hooks/useGabinetePrefeito";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ComunicacaoInstitucional() {
  const { comunicacoes, isLoading, createComunicacao } = useComunicacoesInstitucionais();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: "release",
    titulo: "",
    conteudo: "",
    resumo: "",
    canal: "",
    veiculo: "",
    rede_social: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createComunicacao.mutateAsync(formData);
    setDialogOpen(false);
    setFormData({
      tipo: "release",
      titulo: "",
      conteudo: "",
      resumo: "",
      canal: "",
      veiculo: "",
      rede_social: "",
    });
  };

  const getTipoBadge = (tipo: string) => {
    const config: Record<string, { label: string; icon: React.ReactNode }> = {
      discurso: { label: "Discurso", icon: <Megaphone className="h-3 w-3" /> },
      pronunciamento: { label: "Pronunciamento", icon: <Megaphone className="h-3 w-3" /> },
      release: { label: "Release", icon: <Newspaper className="h-3 w-3" /> },
      nota_oficial: { label: "Nota Oficial", icon: <FileText className="h-3 w-3" /> },
      post_rede_social: { label: "Rede Social", icon: <Instagram className="h-3 w-3" /> },
      entrevista: { label: "Entrevista", icon: <MessageSquare className="h-3 w-3" /> },
      comunicado: { label: "Comunicado", icon: <FileText className="h-3 w-3" /> },
    };
    const { label, icon } = config[tipo] || { label: tipo, icon: null };
    return (
      <Badge variant="outline" className="gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      rascunho: { variant: "secondary", label: "Rascunho" },
      em_revisao: { variant: "secondary", label: "Em Revisão" },
      aprovado: { variant: "default", label: "Aprovado" },
      publicado: { variant: "outline", label: "Publicado" },
      arquivado: { variant: "secondary", label: "Arquivado" },
    };
    const config = variants[status] || variants.rascunho;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSentimentoIcon = (sentimento: string | null) => {
    if (!sentimento) return null;
    const icons: Record<string, React.ReactNode> = {
      positivo: <ThumbsUp className="h-4 w-4 text-green-500" />,
      negativo: <ThumbsDown className="h-4 w-4 text-red-500" />,
      neutro: <Minus className="h-4 w-4 text-gray-500" />,
    };
    return icons[sentimento];
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
          <h2 className="text-2xl font-bold">Comunicação Institucional</h2>
          <p className="text-muted-foreground">
            Gestão de discursos, releases e comunicações oficiais
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Comunicação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Nova Comunicação</DialogTitle>
                <DialogDescription>
                  Crie uma nova comunicação institucional
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
                        <SelectItem value="discurso">Discurso</SelectItem>
                        <SelectItem value="pronunciamento">Pronunciamento</SelectItem>
                        <SelectItem value="release">Release</SelectItem>
                        <SelectItem value="nota_oficial">Nota Oficial</SelectItem>
                        <SelectItem value="post_rede_social">Post em Rede Social</SelectItem>
                        <SelectItem value="entrevista">Entrevista</SelectItem>
                        <SelectItem value="comunicado">Comunicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="canal">Canal</Label>
                    <Select
                      value={formData.canal}
                      onValueChange={(value) => setFormData({ ...formData, canal: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imprensa">Imprensa</SelectItem>
                        <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                        <SelectItem value="interno">Interno</SelectItem>
                        <SelectItem value="publico">Público Geral</SelectItem>
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
                  <Label htmlFor="resumo">Resumo</Label>
                  <Textarea
                    id="resumo"
                    value={formData.resumo}
                    onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo *</Label>
                  <Textarea
                    id="conteudo"
                    value={formData.conteudo}
                    onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                    rows={6}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="veiculo">Veículo de Comunicação</Label>
                    <Input
                      id="veiculo"
                      value={formData.veiculo}
                      onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                      placeholder="Ex: Jornal Local, TV Regional..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rede_social">Rede Social</Label>
                    <Select
                      value={formData.rede_social}
                      onValueChange={(value) => setFormData({ ...formData, rede_social: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createComunicacao.isPending}>
                  {createComunicacao.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Comunicações */}
      {comunicacoes && comunicacoes.length > 0 ? (
        <div className="grid gap-4">
          {comunicacoes.map((com) => (
            <Card key={com.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{com.titulo}</h3>
                      {getTipoBadge(com.tipo)}
                      {getStatusBadge(com.status || "rascunho")}
                    </div>
                    {com.resumo && (
                      <p className="text-sm text-muted-foreground mb-2">{com.resumo}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {com.canal && <span>Canal: {com.canal}</span>}
                      {com.veiculo && <span>• {com.veiculo}</span>}
                      {com.rede_social && <span>• {com.rede_social}</span>}
                      <span>• {format(new Date(com.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {com.sentimento && getSentimentoIcon(com.sentimento)}
                    {com.alcance && (
                      <div className="text-right">
                        <div className="text-lg font-bold">{com.alcance.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">alcance</div>
                      </div>
                    )}
                    {com.engajamento && (
                      <div className="text-right">
                        <div className="text-lg font-bold">{com.engajamento.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">engajamento</div>
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
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma comunicação cadastrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
