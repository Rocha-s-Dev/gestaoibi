
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, MapPin, Clock, Users } from "lucide-react";

// Interface para eventos
interface Evento {
  id: string;
  nome: string;
  descricao: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  categoria: "cultural" | "esportivo";
  status: "planejamento" | "confirmado" | "cancelado";
  publicoEsperado: number;
}

// Dados simulados de eventos
const eventosData: Evento[] = [
  {
    id: "1",
    nome: "Festival de Música da Cidade",
    descricao: "Festival anual de música com artistas locais e regionais",
    data: new Date(2024, 5, 15), // Junho 15, 2024
    horaInicio: "19:00",
    horaFim: "23:00",
    local: "Praça Central",
    categoria: "cultural",
    status: "confirmado",
    publicoEsperado: 2000
  },
  {
    id: "2",
    nome: "Campeonato Municipal de Futebol - Final",
    descricao: "Final do campeonato municipal de futebol",
    data: new Date(2024, 6, 20), // Julho 20, 2024
    horaInicio: "15:00",
    horaFim: "17:00",
    local: "Estádio Municipal",
    categoria: "esportivo",
    status: "confirmado",
    publicoEsperado: 1500
  },
  {
    id: "3",
    nome: "Oficina de Pintura para Crianças",
    descricao: "Oficina de arte e pintura para crianças de 6 a 12 anos",
    data: new Date(2024, 5, 22), // Junho 22, 2024
    horaInicio: "14:00",
    horaFim: "16:00",
    local: "Centro Cultural",
    categoria: "cultural",
    status: "planejamento",
    publicoEsperado: 50
  }
];

export function CalendarioEventos() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventos] = useState<Evento[]>(eventosData);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todos");
  const [filtroLocal, setFiltroLocal] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  // Filtrar eventos baseado nos filtros
  const eventosFiltrados = eventos.filter((evento) => {
    const matchCategoria = filtroCategoria === "todos" || evento.categoria === filtroCategoria;
    const matchLocal = !filtroLocal || evento.local.toLowerCase().includes(filtroLocal.toLowerCase());
    const matchStatus = filtroStatus === "todos" || evento.status === filtroStatus;
    return matchCategoria && matchLocal && matchStatus;
  });

  // Eventos para a data selecionada
  const eventosDataSelecionada = selectedDate 
    ? eventosFiltrados.filter(evento => 
        evento.data.toDateString() === selectedDate.toDateString()
      )
    : [];

  // Dias com eventos para destaque no calendário
  const diasComEventos = eventosFiltrados.map(evento => evento.data);

  const getStatusBadge = (status: Evento["status"]) => {
    const statusConfig = {
      planejamento: { label: "Planejamento", variant: "secondary" as const },
      confirmado: { label: "Confirmado", variant: "default" as const },
      cancelado: { label: "Cancelado", variant: "destructive" as const },
    };
    return statusConfig[status];
  };

  const getCategoryBadge = (categoria: Evento["categoria"]) => {
    const categoryConfig = {
      cultural: { label: "Cultural", variant: "default" as const },
      esportivo: { label: "Esportivo", variant: "secondary" as const },
    };
    return categoryConfig[categoria];
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="esportivo">Esportivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Local</label>
              <Input
                placeholder="Filtrar por local..."
                value={filtroLocal}
                onChange={(e) => setFiltroLocal(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setFiltroCategoria("todos");
                  setFiltroLocal("");
                  setFiltroStatus("todos");
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasEvent: diasComEventos,
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  borderRadius: '4px',
                },
              }}
              className="rounded-md border"
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <p>• Datas em destaque possuem eventos programados</p>
              <p>• Clique em uma data para ver os eventos do dia</p>
            </div>
          </CardContent>
        </Card>

        {/* Eventos da data selecionada */}
        <Card>
          <CardHeader>
            <CardTitle>
              Eventos - {selectedDate?.toLocaleDateString('pt-BR') || 'Selecione uma data'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventosDataSelecionada.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento programado para esta data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventosDataSelecionada.map((evento) => {
                  const statusConfig = getStatusBadge(evento.status);
                  const categoryConfig = getCategoryBadge(evento.categoria);
                  
                  return (
                    <div key={evento.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{evento.nome}</h3>
                        <div className="flex gap-2">
                          <Badge variant={categoryConfig.variant}>
                            {categoryConfig.label}
                          </Badge>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {evento.horaInicio} - {evento.horaFim}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {evento.local}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {evento.publicoEsperado} pessoas esperadas
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo de eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo dos Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {eventosFiltrados.filter(e => e.status === "confirmado").length}
              </div>
              <div className="text-sm text-blue-800">Eventos Confirmados</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {eventosFiltrados.filter(e => e.status === "planejamento").length}
              </div>
              <div className="text-sm text-yellow-800">Em Planejamento</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {eventosFiltrados.reduce((total, evento) => total + evento.publicoEsperado, 0)}
              </div>
              <div className="text-sm text-green-800">Público Total Esperado</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
