
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Calendar, Clock, MapPin, User } from "lucide-react";
import { ReservaDialog } from "./ReservaDialog";

export interface Reserva {
  id: string;
  espacoId: string;
  espacoNome: string;
  evento: string;
  responsavel: string;
  contato: string;
  dataInicio: string;
  dataFim: string;
  horaInicio: string;
  horaFim: string;
  status: "confirmada" | "pendente" | "cancelada";
  observacoes?: string;
  dataCriacao: string;
}

export function ReservasAgendamentos() {
  const [reservas, setReservas] = useState<Reserva[]>([
    {
      id: "1",
      espacoId: "1",
      espacoNome: "Teatro Municipal",
      evento: "Espetáculo de Dança Contemporânea",
      responsavel: "Ana Santos",
      contato: "(11) 9999-1234",
      dataInicio: "2024-06-15",
      dataFim: "2024-06-15",
      horaInicio: "19:00",
      horaFim: "22:00",
      status: "confirmada",
      observacoes: "Necessário sistema de som adicional",
      dataCriacao: "2024-05-20"
    },
    {
      id: "2",
      espacoId: "2", 
      espacoNome: "Ginásio Poliesportivo",
      evento: "Torneio de Futsal Municipal",
      responsavel: "Carlos Lima",
      contato: "(11) 8888-5678",
      dataInicio: "2024-06-20",
      dataFim: "2024-06-22",
      horaInicio: "08:00",
      horaFim: "18:00",
      status: "pendente",
      observacoes: "Evento de 3 dias com múltiplas partidas",
      dataCriacao: "2024-05-25"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);

  const filteredReservas = reservas.filter(reserva =>
    reserva.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reserva.espacoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reserva.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddReserva = (reservaData: Omit<Reserva, "id">) => {
    const newReserva: Reserva = {
      ...reservaData,
      id: Date.now().toString()
    };
    setReservas([...reservas, newReserva]);
  };

  const handleEditReserva = (reservaData: Reserva) => {
    setReservas(reservas.map(reserva => 
      reserva.id === reservaData.id ? reservaData : reserva
    ));
  };

  const getStatusColor = (status: Reserva["status"]) => {
    switch (status) {
      case "confirmada":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Reserva["status"]) => {
    switch (status) {
      case "confirmada":
        return "Confirmada";
      case "pendente":
        return "Pendente";
      case "cancelada":
        return "Cancelada";
      default:
        return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar reservas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedReserva(null);
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Espaço</TableHead>
              <TableHead>Data/Horário</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservas.map((reserva) => (
              <TableRow key={reserva.id}>
                <TableCell>
                  <div className="font-medium">{reserva.evento}</div>
                  {reserva.observacoes && (
                    <div className="text-xs text-gray-500 mt-1">{reserva.observacoes}</div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {reserva.espacoNome}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(reserva.dataInicio).toLocaleDateString('pt-BR')}
                      {reserva.dataInicio !== reserva.dataFim && (
                        <span> - {new Date(reserva.dataFim).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {reserva.horaInicio} - {reserva.horaFim}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="flex items-center font-medium text-sm">
                      <User className="h-4 w-4 mr-1" />
                      {reserva.responsavel}
                    </div>
                    <div className="text-xs text-gray-500">{reserva.contato}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(reserva.status)}>
                    {getStatusLabel(reserva.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedReserva(reserva);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredReservas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma reserva encontrada</p>
        </div>
      )}

      <ReservaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reserva={selectedReserva}
        onSubmit={selectedReserva ? handleEditReserva : handleAddReserva}
      />
    </div>
  );
}
