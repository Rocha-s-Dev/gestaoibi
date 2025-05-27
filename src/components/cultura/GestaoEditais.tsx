
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Edit, FileText, Calendar } from "lucide-react";
import { EditalDialog } from "./EditalDialog";

export interface Edital {
  id: string;
  numero: string;
  titulo: string;
  categoria: "cultural" | "esportivo";
  valor: number;
  dataPublicacao: string;
  dataInicioInscricoes: string;
  dataFimInscricoes: string;
  status: "rascunho" | "publicado" | "em-andamento" | "finalizado" | "cancelado";
  descricao: string;
  requisitos: string;
  anexos?: string[];
}

interface GestaoEditaisProps {
  refreshTrigger?: number;
  onEditalAdded?: () => void;
}

export function GestaoEditais({ refreshTrigger, onEditalAdded }: GestaoEditaisProps) {
  const [editais, setEditais] = useState<Edital[]>([
    {
      id: "1",
      numero: "001/2024",
      titulo: "Edital de Apoio à Cultura Local",
      categoria: "cultural",
      valor: 50000,
      dataPublicacao: "2024-01-15",
      dataInicioInscricoes: "2024-02-01",
      dataFimInscricoes: "2024-03-01",
      status: "publicado",
      descricao: "Edital para apoio a projetos culturais locais",
      requisitos: "Ser pessoa física ou jurídica do município"
    },
    {
      id: "2",
      numero: "002/2024",
      titulo: "Programa de Incentivo ao Esporte",
      categoria: "esportivo",
      valor: 30000,
      dataPublicacao: "2024-02-01",
      dataInicioInscricoes: "2024-02-15",
      dataFimInscricoes: "2024-03-15",
      status: "em-andamento",
      descricao: "Incentivo para projetos esportivos juvenis",
      requisitos: "Projetos voltados para jovens de 12 a 18 anos"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEdital, setSelectedEdital] = useState<Edital | null>(null);

  const filteredEditais = editais.filter(edital =>
    edital.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edital.numero.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEdital = (editalData: Omit<Edital, "id">) => {
    const newEdital: Edital = {
      ...editalData,
      id: Date.now().toString()
    };
    setEditais([...editais, newEdital]);
    onEditalAdded?.();
  };

  const handleEditEdital = (editalData: Edital) => {
    setEditais(editais.map(edital => 
      edital.id === editalData.id ? editalData : edital
    ));
    onEditalAdded?.();
  };

  const getStatusColor = (status: Edital["status"]) => {
    switch (status) {
      case "rascunho":
        return "bg-gray-100 text-gray-800";
      case "publicado":
        return "bg-blue-100 text-blue-800";
      case "em-andamento":
        return "bg-yellow-100 text-yellow-800";
      case "finalizado":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: Edital["status"]) => {
    switch (status) {
      case "rascunho":
        return "Rascunho";
      case "publicado":
        return "Publicado";
      case "em-andamento":
        return "Em Andamento";
      case "finalizado":
        return "Finalizado";
      case "cancelado":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getCategoriaColor = (categoria: Edital["categoria"]) => {
    return categoria === "cultural" 
      ? "bg-purple-100 text-purple-800" 
      : "bg-orange-100 text-orange-800";
  };

  const getCategoriaLabel = (categoria: Edital["categoria"]) => {
    return categoria === "cultural" ? "Cultural" : "Esportivo";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar editais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedEdital(null);
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Edital
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Valor (R$)</TableHead>
              <TableHead>Publicação</TableHead>
              <TableHead>Inscrições</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEditais.map((edital) => (
              <TableRow key={edital.id}>
                <TableCell className="font-medium">{edital.numero}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{edital.titulo}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {edital.descricao}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoriaColor(edital.categoria)}>
                    {getCategoriaLabel(edital.categoria)}
                  </Badge>
                </TableCell>
                <TableCell>{edital.valor.toLocaleString('pt-BR')}</TableCell>
                <TableCell>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(edital.dataPublicacao).toLocaleDateString('pt-BR')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(edital.dataInicioInscricoes).toLocaleDateString('pt-BR')}</div>
                    <div className="text-gray-500">até {new Date(edital.dataFimInscricoes).toLocaleDateString('pt-BR')}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(edital.status)}>
                    {getStatusLabel(edital.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedEdital(edital);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedEdital(edital);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredEditais.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum edital encontrado</p>
        </div>
      )}

      <EditalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        edital={selectedEdital}
        onSubmit={selectedEdital ? handleEditEdital : handleAddEdital}
      />
    </div>
  );
}
