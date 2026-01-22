import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgendamentos, Agendamento } from "@/hooks/useSaude";
import { AgendamentoDialog } from "./AgendamentoDialog";
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { format, isToday, isTomorrow, parseISO, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AgendamentoConsultas() {
  const { agendamentos, loading, createAgendamento, updateAgendamento, cancelAgendamento } = useAgendamentos();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const filteredAgendamentos = agendamentos.filter((a) => {
    const matchesSearch =
      a.paciente?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.profissional?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.especialidade?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const agendamentosHoje = filteredAgendamentos.filter((a) => isToday(parseISO(a.data_hora)));

  const agendamentosDia = filteredAgendamentos.filter((a) => {
    const agendamentoDate = parseISO(a.data_hora);
    return (
      agendamentoDate >= startOfDay(selectedDate) && agendamentoDate <= endOfDay(selectedDate)
    );
  });

  const handleCreate = () => {
    setSelectedAgendamento(null);
    setDialogOpen(true);
  };

  const handleEdit = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<Agendamento>) => {
    try {
      if (selectedAgendamento) {
        await updateAgendamento(selectedAgendamento.id, data);
        toast.success("Agendamento atualizado com sucesso");
      } else {
        await createAgendamento(data as Omit<Agendamento, "id" | "created_at" | "updated_at" | "paciente" | "profissional" | "unidade">);
        toast.success("Agendamento criado com sucesso");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar agendamento");
    }
  };

  const handleCancel = async (agendamento: Agendamento) => {
    try {
      await cancelAgendamento(agendamento.id, "Cancelado pelo usuário");
      toast.success("Agendamento cancelado");
    } catch (error) {
      toast.error("Erro ao cancelar agendamento");
    }
  };

  const handleConfirm = async (agendamento: Agendamento) => {
    try {
      await updateAgendamento(agendamento.id, { status: "confirmado" });
      toast.success("Agendamento confirmado");
    } catch (error) {
      toast.error("Erro ao confirmar agendamento");
    }
  };

  const handleRealizado = async (agendamento: Agendamento) => {
    try {
      await updateAgendamento(agendamento.id, { status: "realizado" });
      toast.success("Atendimento registrado como realizado");
    } catch (error) {
      toast.error("Erro ao atualizar status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      agendado: { label: "Agendado", variant: "outline", icon: <Clock className="h-3 w-3" /> },
      confirmado: { label: "Confirmado", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      em_atendimento: { label: "Em Atendimento", variant: "secondary", icon: <AlertCircle className="h-3 w-3" /> },
      realizado: { label: "Realizado", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      cancelado: { label: "Cancelado", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      faltou: { label: "Faltou", variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    };
    const config = statusConfig[status] || statusConfig.agendado;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { label: string; className: string }> = {
      baixa: { label: "Baixa", className: "bg-gray-100 text-gray-800" },
      normal: { label: "Normal", className: "bg-blue-100 text-blue-800" },
      alta: { label: "Alta", className: "bg-orange-100 text-orange-800" },
      urgente: { label: "Urgente", className: "bg-red-100 text-red-800" },
    };
    const c = config[prioridade] || config.normal;
    return <Badge className={c.className}>{c.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                <p className="text-2xl font-bold">{agendamentosHoje.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold">
                  {agendamentosHoje.filter((a) => a.status === "confirmado").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {agendamentosHoje.filter((a) => a.status === "agendado").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgentes</p>
                <p className="text-2xl font-bold">
                  {agendamentosHoje.filter((a) => a.prioridade === "urgente").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de pesquisa e ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente, profissional ou especialidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ptBR}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Lista de agendamentos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Agendamentos - {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agendamentosDia.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum agendamento para esta data
                </p>
              ) : (
                agendamentosDia.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleEdit(agendamento)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-lg font-bold">
                          {format(parseISO(agendamento.data_hora), "HH:mm")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">{agendamento.paciente?.nome}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{agendamento.profissional?.nome || "Não definido"}</span>
                          <span>•</span>
                          <span>{agendamento.especialidade || agendamento.tipo}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{agendamento.unidade?.nome}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPrioridadeBadge(agendamento.prioridade)}
                      {getStatusBadge(agendamento.status)}
                      {agendamento.status === "agendado" && (
                        <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirm(agendamento)}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(agendamento)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                      {agendamento.status === "confirmado" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRealizado(agendamento);
                          }}
                        >
                          Realizado
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AgendamentoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agendamento={selectedAgendamento}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
