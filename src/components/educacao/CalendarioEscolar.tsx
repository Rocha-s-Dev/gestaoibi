import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { EventoCalendarioDialog } from "./EventoCalendarioDialog";
import { useCalendarioEscolar } from "@/hooks/useCalendarioEscolar";
import { toast } from "sonner";

export function CalendarioEscolar() {
  const [eventoDialogOpen, setEventoDialogOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { eventos, loading, deleteEvento } = useCalendarioEscolar();

  // Navegação do calendário
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDeleteEvento = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        await deleteEvento(id);
        toast.success("Evento excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir evento.");
      }
    }
  };

  // Filtrar eventos do mês atual
  const eventosDoMes = eventos.filter(evento => {
    const eventDate = new Date(evento.data_inicio);
    return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
  });

  // Organizar eventos por dia
  const eventosPorDia: Record<number, any[]> = {};
  eventosDoMes.forEach(evento => {
    const day = new Date(evento.data_inicio).getDate();
    if (!eventosPorDia[day]) {
      eventosPorDia[day] = [];
    }
    eventosPorDia[day].push(evento);
  });

  const getTipoEventoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'feriado': return 'bg-red-100 text-red-800';
      case 'reuniao': return 'bg-blue-100 text-blue-800';
      case 'evento': return 'bg-green-100 text-green-800';
      case 'avaliacao': return 'bg-yellow-100 text-yellow-800';
      case 'formacao': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Gerar grid do calendário
  const calendarDays = [];
  
  // Dias vazios no início
  for (let i = 0; i < firstDayWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-32 bg-gray-50"></div>);
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = 
      day === new Date().getDate() &&
      currentMonth === new Date().getMonth() &&
      currentYear === new Date().getFullYear();
    
    const dayEvents = eventosPorDia[day] || [];
    
    calendarDays.push(
      <div
        key={day}
        className={`h-32 border border-gray-200 p-1 overflow-hidden ${
          isToday ? 'bg-blue-50 border-blue-300' : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
          {day}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((evento, index) => (
            <div
              key={evento.id}
              className={`text-xs p-1 rounded truncate cursor-pointer ${getTipoEventoColor(evento.tipo || '')}`}
              title={evento.titulo}
              onClick={() => {
                setSelectedEvento(evento);
                setEventoDialogOpen(true);
              }}
            >
              {evento.titulo}
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500">
              +{dayEvents.length - 3} mais
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {months[currentMonth]} {currentYear}
              </h2>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setEventoDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Grid do Calendário */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando calendário...</p>
            </div>
          ) : (
            <>
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 border-b">
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500 bg-gray-50">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Grid dos dias */}
              <div className="grid grid-cols-7">
                {calendarDays}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista de Eventos do Mês */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos de {months[currentMonth]} {currentYear}</CardTitle>
        </CardHeader>
        <CardContent>
          {eventosDoMes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhum evento cadastrado para este mês.
            </p>
          ) : (
            <div className="space-y-3">
              {eventosDoMes
                .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
                .map((evento) => (
                  <div key={evento.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{evento.titulo}</h4>
                        <Badge variant="outline" className={getTipoEventoColor(evento.tipo || '')}>
                          {evento.tipo || 'evento'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{evento.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(evento.data_inicio).toLocaleDateString('pt-BR')}
                        {evento.data_fim && evento.data_fim !== evento.data_inicio && 
                          ` - ${new Date(evento.data_fim).toLocaleDateString('pt-BR')}`
                        }
                        {evento.escola?.nome && ` • ${evento.escola.nome}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEvento(evento);
                          setEventoDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteEvento(evento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EventoCalendarioDialog
        open={eventoDialogOpen}
        onOpenChange={setEventoDialogOpen}
        evento={selectedEvento}
        onClose={() => {
          setSelectedEvento(null);
          setEventoDialogOpen(false);
        }}
      />
    </div>
  );
}