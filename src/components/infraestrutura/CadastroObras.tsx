
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Building, Calendar, DollarSign, User, MapPin } from "lucide-react";
import { ObraDialog } from "./ObraDialog";

export interface Obra {
  id: string;
  nome: string;
  descricao: string;
  local: string;
  responsavel: string;
  empresa: string;
  contato: string;
  dataInicio: string;
  previsaoTermino: string;
  orcamentoTotal: number;
  valorGasto: number;
  status: "planejamento" | "andamento" | "parada" | "concluida" | "cancelada";
  observacoes?: string;
  dataCriacao: string;
}

export function CadastroObras() {
  const [obras, setObras] = useState<Obra[]>([
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
      dataCriacao: "2024-02-15"
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
      dataCriacao: "2024-03-20"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);

  const filteredObras = obras.filter(obra =>
    obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.empresa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddObra = (obraData: Omit<Obra, "id">) => {
    const newObra: Obra = {
      ...obraData,
      id: Date.now().toString()
    };
    setObras([...obras, newObra]);
  };

  const handleEditObra = (obraData: Obra) => {
    setObras(obras.map(obra => 
      obra.id === obraData.id ? obraData : obra
    ));
  };

  const getStatusColor = (status: Obra["status"]) => {
    switch (status) {
      case "planejamento":
        return "bg-blue-100 text-blue-800";
      case "andamento":
        return "bg-green-100 text-green-800";
      case "parada":
        return "bg-yellow-100 text-yellow-800";
      case "concluida":
        return "bg-gray-100 text-gray-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Obra["status"]) => {
    switch (status) {
      case "planejamento":
        return "Planejamento";
      case "andamento":
        return "Em Andamento";
      case "parada":
        return "Parada";
      case "concluida":
        return "Concluída";
      case "cancelada":
        return "Cancelada";
      default:
        return "Desconhecido";
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgressPercentage = (valorGasto: number, orcamentoTotal: number) => {
    return Math.min((valorGasto / orcamentoTotal) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar obras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedObra(null);
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Obra
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Obra</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Responsável/Empresa</TableHead>
              <TableHead>Cronograma</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredObras.map((obra) => (
              <TableRow key={obra.id}>
                <TableCell>
                  <div>
                    <div className="font-medium flex items-center">
                      <Building className="h-4 w-4 mr-2" />
                      {obra.nome}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{obra.descricao}</div>
                    {obra.observacoes && (
                      <div className="text-xs text-blue-600 mt-1">{obra.observacoes}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    {obra.local}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center font-medium text-sm">
                      <User className="h-4 w-4 mr-1" />
                      {obra.responsavel}
                    </div>
                    <div className="text-xs text-gray-500">{obra.empresa}</div>
                    <div className="text-xs text-gray-500">{obra.contato}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(obra.dataInicio).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Previsão: {new Date(obra.previsaoTermino).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {formatCurrency(obra.orcamentoTotal)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Gasto: {formatCurrency(obra.valorGasto)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getProgressPercentage(obra.valorGasto, obra.orcamentoTotal).toFixed(1)}% utilizado
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(obra.status)}>
                    {getStatusLabel(obra.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedObra(obra);
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

      {filteredObras.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma obra encontrada</p>
        </div>
      )}

      <ObraDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        obra={selectedObra}
        onSubmit={selectedObra ? handleEditObra : handleAddObra}
      />
    </div>
  );
}
