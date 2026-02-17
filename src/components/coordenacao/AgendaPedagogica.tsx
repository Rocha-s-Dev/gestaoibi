import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, FileText, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  eventos: any[];
  escolaId?: string | null;
  createEvento: any;
  updateEvento: any;
  deleteEvento: any;
}

export function AgendaPedagogica({ eventos, escolaId, createEvento, updateEvento, deleteEvento }: Props) {
  const { session } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [titulo, setTitulo] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [tipo, setTipo] = useState("reuniao");
  const [descricao, setDescricao] = useState("");
  const [participantes, setParticipantes] = useState("");
  const [selectedEvento, setSelectedEvento] = useState<any>(null);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfWeek = getDay(startOfMonth(currentMonth));

  const eventosDoMes = useMemo(() => {
    return eventos.filter((e: any) => {
      const d = new Date(e.data_evento);
      return isSameMonth(d, currentMonth);
    });
  }, [eventos, currentMonth]);

  const getEventosNoDia = (day: Date) => eventosDoMes.filter((e: any) => isSameDay(new Date(e.data_evento), day));

  const handleSubmit = () => {
    if (!titulo || !dataEvento) return;
    createEvento.mutate({
      titulo,
      data_evento: dataEvento,
      hora_inicio: horaInicio || null,
      hora_fim: horaFim || null,
      tipo,
      descricao: descricao || null,
      participantes: participantes ? participantes.split(",").map((p) => p.trim()) : [],
      escola_id: escolaId || null,
      criado_por: session?.user?.id,
    });
    resetForm();
  };

  const resetForm = () => {
    setDialogOpen(false);
    setTitulo("");
    setDataEvento("");
    setHoraInicio("");
    setHoraFim("");
    setTipo("reuniao");
    setDescricao("");
    setParticipantes("");
  };

  const tipoLabel: Record<string, string> = {
    reuniao: "Reunião Pedagógica",
    conselho_classe: "Conselho de Classe",
    formacao: "Formação Continuada",
    planejamento: "Planejamento",
    ata: "Registro de Ata",
    outro: "Outro",
  };

  const tipoColor: Record<string, string> = {
    reuniao: "bg-blue-100 text-blue-800",
    conselho_classe: "bg-purple-100 text-purple-800",
    formacao: "bg-green-100 text-green-800",
    planejamento: "bg-yellow-100 text-yellow-800",
    ata: "bg-gray-100 text-gray-800",
    outro: "bg-orange-100 text-orange-800",
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</Button>
          <span className="font-medium text-lg capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</Button>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Novo Evento</Button>
      </div>

      {/* Calendário visual */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {daysInMonth.map((day) => {
              const eventosNoDia = getEventosNoDia(day);
              return (
                <div key={day.toISOString()} className="p-1 min-h-[80px] border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="text-xs font-medium mb-1">{format(day, "d")}</div>
                  {eventosNoDia.slice(0, 2).map((e: any) => (
                    <div
                      key={e.id}
                      className={`text-[10px] px-1 py-0.5 rounded mb-0.5 cursor-pointer truncate ${tipoColor[e.tipo] || tipoColor.outro}`}
                      onClick={() => setSelectedEvento(e)}
                    >
                      {e.titulo}
                    </div>
                  ))}
                  {eventosNoDia.length > 2 && (
                    <div className="text-[10px] text-muted-foreground">+{eventosNoDia.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de eventos do mês */}
      <Card>
        <CardHeader><CardTitle>Eventos do Mês</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventosDoMes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum evento neste mês</p>
            ) : eventosDoMes.map((e: any) => (
              <div key={e.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{e.titulo}</span>
                    <Badge className={tipoColor[e.tipo] || tipoColor.outro}>{tipoLabel[e.tipo] || e.tipo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(e.data_evento), "dd/MM/yyyy")}
                    {e.hora_inicio && ` · ${e.hora_inicio}`}
                    {e.hora_fim && ` - ${e.hora_fim}`}
                  </p>
                  {e.descricao && <p className="text-sm">{e.descricao}</p>}
                  {e.participantes?.length > 0 && (
                    <p className="text-xs text-muted-foreground">Participantes: {e.participantes.join(", ")}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteEvento.mutate(e.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog novo evento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Evento Pedagógico</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Título</Label><Input value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
            <div><Label>Data</Label><Input type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Hora Início</Label><Input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} /></div>
              <div><Label>Hora Fim</Label><Input type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} /></div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="reuniao">Reunião Pedagógica</SelectItem>
                  <SelectItem value="conselho_classe">Conselho de Classe</SelectItem>
                  <SelectItem value="formacao">Formação Continuada</SelectItem>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="ata">Registro de Ata</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Descrição</Label><Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} /></div>
            <div><Label>Participantes (separados por vírgula)</Label><Input value={participantes} onChange={(e) => setParticipantes(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!titulo || !dataEvento}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog detalhes do evento */}
      <Dialog open={!!selectedEvento} onOpenChange={() => setSelectedEvento(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedEvento?.titulo}</DialogTitle></DialogHeader>
          {selectedEvento && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={tipoColor[selectedEvento.tipo] || tipoColor.outro}>{tipoLabel[selectedEvento.tipo] || selectedEvento.tipo}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(selectedEvento.data_evento), "dd/MM/yyyy")}
                  {selectedEvento.hora_inicio && ` · ${selectedEvento.hora_inicio}`}
                </span>
              </div>
              {selectedEvento.descricao && <p>{selectedEvento.descricao}</p>}
              {selectedEvento.ata && <div><Label>Ata</Label><p className="text-sm mt-1">{selectedEvento.ata}</p></div>}
              {selectedEvento.participantes?.length > 0 && (
                <div><Label>Participantes</Label><p className="text-sm mt-1">{selectedEvento.participantes.join(", ")}</p></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
