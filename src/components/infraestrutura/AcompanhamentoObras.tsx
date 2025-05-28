
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Camera, 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Building,
  MapPin,
  User,
  Eye
} from "lucide-react";
import { AcompanhamentoDialog } from "./AcompanhamentoDialog";
import type { Obra } from "./CadastroObras";

interface ProgressoObra extends Obra {
  progresso: number;
  ultimaAtualizacao: string;
  proximaVistoria: string;
  fotos: Array<{
    id: string;
    url: string;
    data: string;
    descricao: string;
  }>;
  relatorios: Array<{
    id: string;
    data: string;
    tipo: "vistoria" | "progresso" | "problema";
    titulo: string;
    descricao: string;
    autor: string;
  }>;
}

export function AcompanhamentoObras() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedObra, setSelectedObra] = useState<ProgressoObra | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dados mockados para demonstração
  const [obras] = useState<ProgressoObra[]>([
    {
      id: "1",
      nome: "Reforma da Escola Municipal João Silva",
      descricao: "Reforma completa do prédio escolar incluindo pintura, troca de pisos e reparos no telhado",
      local: "Rua das Flores, 123 - Centro",
      responsavel: "João Santos",
      empresa: "Construtora ABC Ltda",
      contato: "(11) 9999-1234",
      dataInicio: "2024-03-01",
      previsaoTermino: "2024-07-15",
      orcamentoTotal: 250000,
      valorGasto: 150000,
      status: "andamento",
      observacoes: "Obra dentro do cronograma previsto",
      dataCriacao: "2024-02-15",
      progresso: 60,
      ultimaAtualizacao: "2024-05-20",
      proximaVistoria: "2024-06-01",
      fotos: [
        {
          id: "1",
          url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400",
          data: "2024-05-20",
          descricao: "Fachada após pintura"
        },
        {
          id: "2", 
          url: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=400",
          data: "2024-05-15",
          descricao: "Área interna renovada"
        }
      ],
      relatorios: [
        {
          id: "1",
          data: "2024-05-20",
          tipo: "progresso",
          titulo: "Relatório Quinzenal - Maio",
          descricao: "Pintura externa concluída. Iniciando trabalhos internos.",
          autor: "João Santos"
        },
        {
          id: "2",
          data: "2024-05-10",
          tipo: "vistoria",
          titulo: "Vistoria Técnica",
          descricao: "Estrutura em boas condições. Progresso conforme cronograma.",
          autor: "Maria Silva - Engenheira"
        }
      ]
    },
    {
      id: "2",
      nome: "Construção de Praça no Bairro Novo",
      descricao: "Construção de nova praça com playground, quadra poliesportiva e área verde",
      local: "Avenida Principal, s/n - Bairro Novo",
      responsavel: "Maria Oliveira",
      empresa: "Urbanização XYZ",
      contato: "(11) 8888-5678",
      dataInicio: "2024-04-10",
      previsaoTermino: "2024-09-30",
      orcamentoTotal: 180000,
      valorGasto: 45000,
      status: "andamento",
      observacoes: "Aguardando liberação de área para início da quadra",
      dataCriacao: "2024-03-20",
      progresso: 25,
      ultimaAtualizacao: "2024-05-18",
      proximaVistoria: "2024-06-05",
      fotos: [
        {
          id: "3",
          url: "https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=400",
          data: "2024-05-18",
          descricao: "Início da terraplanagem"
        }
      ],
      relatorios: [
        {
          id: "3",
          data: "2024-05-18",
          tipo: "problema",
          titulo: "Atraso na Liberação",
          descricao: "Aguardando documentação para início da quadra poliesportiva.",
          autor: "Maria Oliveira"
        }
      ]
    }
  ]);

  const filteredObras = obras.filter(obra => {
    const matchesSearch = obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obra.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obra.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || obra.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Obra["status"]) => {
    switch (status) {
      case "planejamento": return "bg-blue-100 text-blue-800";
      case "andamento": return "bg-green-100 text-green-800";
      case "parada": return "bg-yellow-100 text-yellow-800";
      case "concluida": return "bg-gray-100 text-gray-800";
      case "cancelada": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progresso: number) => {
    if (progresso >= 80) return "bg-green-500";
    if (progresso >= 50) return "bg-blue-500";
    if (progresso >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar obras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="planejamento">Planejamento</option>
            <option value="andamento">Em Andamento</option>
            <option value="parada">Parada</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredObras.map((obra) => (
          <Card key={obra.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Building className="h-5 w-5 mr-2 text-gray-600" />
                    {obra.nome}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{obra.descricao}</p>
                </div>
                <Badge className={getStatusColor(obra.status)}>
                  {obra.status === "andamento" ? "Em Andamento" : 
                   obra.status === "planejamento" ? "Planejamento" :
                   obra.status === "parada" ? "Parada" :
                   obra.status === "concluida" ? "Concluída" : "Cancelada"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {obra.local}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2" />
                  {obra.responsavel} - {obra.empresa}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Previsão: {new Date(obra.previsaoTermino).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm font-bold">{obra.progresso}%</span>
                </div>
                <Progress value={obra.progresso} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Orçamento</p>
                  <p className="font-semibold">{formatCurrency(obra.orcamentoTotal)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Gasto</p>
                  <p className="font-semibold">{formatCurrency(obra.valorGasto)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex space-x-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <Camera className="h-3 w-3 mr-1" />
                    {obra.fotos.length}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <FileText className="h-3 w-3 mr-1" />
                    {obra.relatorios.length}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedObra(obra);
                    setDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Última atualização: {new Date(obra.ultimaAtualizacao).toLocaleDateString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredObras.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma obra encontrada</p>
        </div>
      )}

      <AcompanhamentoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        obra={selectedObra}
      />
    </div>
  );
}
