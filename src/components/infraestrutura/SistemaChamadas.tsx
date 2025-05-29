
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Filter,
  Lightbulb,
  Construction,
  Zap,
  Droplets
} from "lucide-react";
import { ChamadaDialog } from "./ChamadaDialog";

export type StatusChamada = "aberta" | "em_andamento" | "concluida" | "cancelada";
export type TipoChamada = "iluminacao" | "pavimentacao" | "sinalizacao" | "agua_esgoto" | "limpeza" | "outro";

export interface Chamada {
  id: string;
  protocolo: string;
  tipo: TipoChamada;
  titulo: string;
  descricao: string;
  endereco: string;
  bairro: string;
  solicitante: string;
  telefone?: string;
  email?: string;
  status: StatusChamada;
  prioridade: "baixa" | "media" | "alta" | "urgente";
  dataAbertura: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  responsavel?: string;
  observacoes?: string;
}

export function SistemaChamadas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  const [selectedChamada, setSelectedChamada] = useState<Chamada | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dados mockados para demonstração
  const [chamadas] = useState<Chamada[]>([
    {
      id: "1",
      protocolo: "MAN-2024-001",
      tipo: "iluminacao",
      titulo: "Poste de iluminação queimado",
      descricao: "Poste de iluminação pública na esquina está sem funcionamento há 3 dias",
      endereco: "Rua das Flores, 123",
      bairro: "Centro",
      solicitante: "Maria Silva",
      telefone: "(11) 99999-9999",
      email: "maria@email.com",
      status: "aberta",
      prioridade: "alta",
      dataAbertura: "2024-01-15",
      dataPrevisao: "2024-01-20"
    },
    {
      id: "2",
      protocolo: "MAN-2024-002",
      tipo: "pavimentacao",
      titulo: "Buraco na pista",
      descricao: "Buraco grande na Avenida Principal causando transtornos ao trânsito",
      endereco: "Avenida Principal, 456",
      bairro: "Vila Nova",
      solicitante: "João Santos",
      telefone: "(11) 88888-8888",
      status: "em_andamento",
      prioridade: "urgente",
      dataAbertura: "2024-01-10",
      dataPrevisao: "2024-01-18",
      responsavel: "Equipe de Pavimentação A"
    },
    {
      id: "3",
      protocolo: "MAN-2024-003",
      tipo: "limpeza",
      titulo: "Entulho na calçada",
      descricao: "Acúmulo de entulho bloqueando passagem de pedestres",
      endereco: "Rua da Paz, 789",
      bairro: "Jardim América",
      solicitante: "Ana Costa",
      status: "concluida",
      prioridade: "media",
      dataAbertura: "2024-01-05",
      dataConclusao: "2024-01-12",
      responsavel: "Equipe de Limpeza B"
    }
  ]);

  const filteredChamadas = chamadas.filter(chamada => {
    const matchesSearch = chamada.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chamada.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chamada.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chamada.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || chamada.status === filterStatus;
    const matchesTipo = filterTipo === "all" || chamada.tipo === filterTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusColor = (status: StatusChamada) => {
    switch (status) {
      case "aberta": return "bg-blue-100 text-blue-800";
      case "em_andamento": return "bg-yellow-100 text-yellow-800";
      case "concluida": return "bg-green-100 text-green-800";
      case "cancelada": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "baixa": return "bg-gray-100 text-gray-800";
      case "media": return "bg-blue-100 text-blue-800";
      case "alta": return "bg-orange-100 text-orange-800";
      case "urgente": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoIcon = (tipo: TipoChamada) => {
    switch (tipo) {
      case "iluminacao": return <Lightbulb className="h-4 w-4" />;
      case "pavimentacao": return <Construction className="h-4 w-4" />;
      case "sinalizacao": return <AlertTriangle className="h-4 w-4" />;
      case "agua_esgoto": return <Droplets className="h-4 w-4" />;
      case "limpeza": return <Zap className="h-4 w-4" />;
      default: return <Phone className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: TipoChamada) => {
    switch (tipo) {
      case "iluminacao": return "Iluminação";
      case "pavimentacao": return "Pavimentação";
      case "sinalizacao": return "Sinalização";
      case "agua_esgoto": return "Água/Esgoto";
      case "limpeza": return "Limpeza";
      default: return "Outro";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar chamadas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="aberta">Aberta</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <select 
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos os Tipos</option>
              <option value="iluminacao">Iluminação</option>
              <option value="pavimentacao">Pavimentação</option>
              <option value="sinalizacao">Sinalização</option>
              <option value="agua_esgoto">Água/Esgoto</option>
              <option value="limpeza">Limpeza</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Chamada
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Abertas</p>
                <p className="text-2xl font-bold">
                  {chamadas.filter(c => c.status === "aberta").length}
                </p>
              </div>
              <Phone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold">
                  {chamadas.filter(c => c.status === "em_andamento").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Concluídas</p>
                <p className="text-2xl font-bold">
                  {chamadas.filter(c => c.status === "concluida").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold">
                  {chamadas.filter(c => c.prioridade === "urgente").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Chamadas */}
      <div className="grid grid-cols-1 gap-4">
        {filteredChamadas.map((chamada) => (
          <Card key={chamada.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getTipoIcon(chamada.tipo)}
                    <h3 className="text-lg font-semibold">{chamada.titulo}</h3>
                    <Badge className={getStatusColor(chamada.status)}>
                      {chamada.status === "aberta" ? "Aberta" : 
                       chamada.status === "em_andamento" ? "Em Andamento" : 
                       chamada.status === "concluida" ? "Concluída" : "Cancelada"}
                    </Badge>
                    <Badge className={getPrioridadeColor(chamada.prioridade)}>
                      {chamada.prioridade.charAt(0).toUpperCase() + chamada.prioridade.slice(1)}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{chamada.descricao}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <strong>Protocolo:</strong> {chamada.protocolo}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {chamada.endereco}, {chamada.bairro}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {chamada.solicitante}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <strong>Abertura:</strong> {new Date(chamada.dataAbertura).toLocaleDateString('pt-BR')}
                    </div>
                    {chamada.dataPrevisao && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <strong>Previsão:</strong> {new Date(chamada.dataPrevisao).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {chamada.responsavel && (
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <strong>Responsável:</strong> {chamada.responsavel}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <Filter className="h-3 w-3 mr-1" />
                      {getTipoLabel(chamada.tipo)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedChamada(chamada);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChamadas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma chamada encontrada</p>
        </div>
      )}

      <ChamadaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        chamada={selectedChamada}
        onChamadaCreated={() => {
          // Aqui seria implementada a lógica de atualização da lista
          console.log("Chamada criada/atualizada");
        }}
      />
    </div>
  );
}
