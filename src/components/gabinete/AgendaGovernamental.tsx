import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, MapPin, Users, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useAgendaGovernamental } from "@/hooks/useGabinetePrefeito";
import { format, isToday, isTomorrow, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AgendaGovernamental() {
  const { eventos, isLoading, createEvento } = useAgendaGovernamental();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "reuniao",
    data_inicio: "",
    data_fim: "",
    local: "",
    endereco: "",
    pauta: "",
    prioridade: "media",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEvento.mutateAsync({
      ...formData,
      data_inicio: new Date(formData.data_inicio).toISOString(),
      data_fim: formData.data_fim ? new Date(formData.data_fim).toISOString() : null,
    });
    setDialogOpen(false);
    setFormData({
      titulo: "",
      descricao: "",
      tipo: "reuniao",
      data_inicio: "",
      data_fim: "",
      local: "",
      endereco: "",
      pauta: "",
      prioridade: "media",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      agendado: { variant: "secondary", label: "Agendado" },
      confirmado: { variant: "default", label: "Confirmado" },
      em_andamento: { variant: "default", label: "Em Andamento" },
      concluido: { variant: "outline", label: "Concluído" },
      cancelado: { variant: "destructive", label: "Cancelado" },
      adiado: { variant: "secondary", label: "Adiado" },
    };
    const config = variants[status] || variants.agendado;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      reuniao: "Reunião",
      evento: "Evento",
      visita: "Visita",
      cerimonia: "Cerimônia",
      entrevista: "Entrevista",
      audiencia: "Audiência",
      outro: "Outro",
    };
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>;
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  // Agrupar eventos por data
  const eventosAgrupados = eventos?.reduce((acc, evento) => {
    const dateKey = format(new Date(evento.data_inicio), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(evento);
    return acc;
  }, {} as Record<string, typeof eventos>) || {};

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
          <h2 className="text-2xl font-bold">Agenda Governamental</h2>
          <p className="text-muted-foreground">
            Compromissos oficiais e eventos do gabinete
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Novo Evento na Agenda</DialogTitle>
                <DialogDescription>
                  Adicione um novo compromisso à agenda governamental
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="visita">Visita</SelectItem>
                        <SelectItem value="cerimonia">Cerimônia</SelectItem>
                        <SelectItem value="entrevista">Entrevista</SelectItem>
                        <SelectItem value="audiencia">Audiência</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio">Data/Hora Início *</Label>
                    <Input
                      id="data_inicio"
                      type="datetime-local"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_fim">Data/Hora Fim</Label>
                    <Input
                      id="data_fim"
                      type="datetime-local"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      value={formData.local}
                      onChange={(e) => setFormData({ ...formData, local: e.target.value })}
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
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pauta">Pauta</Label>
                  <Textarea
                    id="pauta"
                    value={formData.pauta}
                    onChange={(e) => setFormData({ ...formData, pauta: e.target.value })}
                    rows={3}
                    placeholder="Pontos a serem discutidos..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEvento.isPending}>
                  {createEvento.isPending ? "Salvando..." : "Salvar Evento"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Eventos */}
      <div className="space-y-6">
        {Object.keys(eventosAgrupados).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum evento agendado</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(eventosAgrupados)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateKey, dayEvents]) => (
              <div key={dateKey} className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {getDateLabel(dateKey)}
                  <span className="text-muted-foreground font-normal text-sm">
                    ({format(new Date(dateKey), "EEEE", { locale: ptBR })})
                  </span>
                </h3>
                <div className="space-y-2">
                  {dayEvents?.map((evento) => (
                    <Card key={evento.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{evento.titulo}</h4>
                              {getTipoBadge(evento.tipo)}
                              {getStatusBadge(evento.status || "agendado")}
                              {evento.conflito_detectado && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Conflito
                                </Badge>
                              )}
                            </div>
                            {evento.descricao && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {evento.descricao}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(evento.data_inicio), "HH:mm", { locale: ptBR })}
                                {evento.data_fim && (
                                  <> - {format(new Date(evento.data_fim), "HH:mm", { locale: ptBR })}</>
                                )}
                              </span>
                              {evento.local && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {evento.local}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
