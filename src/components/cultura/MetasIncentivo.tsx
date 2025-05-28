
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Target, TrendingUp, Calendar } from "lucide-react";
import { MetaIncentivoDialog } from "./MetaIncentivoDialog";
import { Progress } from "@/components/ui/progress";

export interface MetaIncentivo {
  id: string;
  titulo: string;
  categoria: "cultural" | "esportivo" | "ambos";
  tipoMeta: "captacao-recursos" | "numero-projetos" | "beneficiarios";
  valorMeta: number;
  valorAtual: number;
  percentualMeta: number;
  percentualAtual: number;
  anoMeta: number;
  status: "em-andamento" | "concluida" | "nao-iniciada" | "cancelada";
  descricao: string;
  dataInicio: string;
  dataFim: string;
}

export function MetasIncentivo() {
  const [metas, setMetas] = useState<MetaIncentivo[]>([
    {
      id: "1",
      titulo: "Captação de Recursos Culturais 2024",
      categoria: "cultural",
      tipoMeta: "captacao-recursos",
      valorMeta: 500000,
      valorAtual: 320000,
      percentualMeta: 20,
      percentualAtual: 64,
      anoMeta: 2024,
      status: "em-andamento",
      descricao: "Meta para aumentar a captação de recursos para projetos culturais em 20% em relação ao ano anterior",
      dataInicio: "2024-01-01",
      dataFim: "2024-12-31"
    },
    {
      id: "2",
      titulo: "Captação de Recursos Esportivos 2024",
      categoria: "esportivo",
      tipoMeta: "captacao-recursos",
      valorMeta: 300000,
      valorAtual: 180000,
      percentualMeta: 15,
      percentualAtual: 60,
      anoMeta: 2024,
      status: "em-andamento",
      descricao: "Meta para aumentar a captação de recursos para projetos esportivos em 15% em relação ao ano anterior",
      dataInicio: "2024-01-01",
      dataFim: "2024-12-31"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<MetaIncentivo | null>(null);

  const filteredMetas = metas.filter(meta =>
    meta.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMeta = (metaData: Omit<MetaIncentivo, "id">) => {
    const newMeta: MetaIncentivo = {
      ...metaData,
      id: Date.now().toString()
    };
    setMetas([...metas, newMeta]);
  };

  const handleEditMeta = (metaData: MetaIncentivo) => {
    setMetas(metas.map(meta => 
      meta.id === metaData.id ? metaData : meta
    ));
  };

  const getStatusColor = (status: MetaIncentivo["status"]) => {
    switch (status) {
      case "nao-iniciada":
        return "bg-gray-100 text-gray-800";
      case "em-andamento":
        return "bg-blue-100 text-blue-800";
      case "concluida":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: MetaIncentivo["status"]) => {
    switch (status) {
      case "nao-iniciada":
        return "Não Iniciada";
      case "em-andamento":
        return "Em Andamento";
      case "concluida":
        return "Concluída";
      case "cancelada":
        return "Cancelada";
      default:
        return status;
    }
  };

  const getCategoriaColor = (categoria: MetaIncentivo["categoria"]) => {
    switch (categoria) {
      case "cultural":
        return "bg-purple-100 text-purple-800";
      case "esportivo":
        return "bg-orange-100 text-orange-800";
      case "ambos":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoriaLabel = (categoria: MetaIncentivo["categoria"]) => {
    switch (categoria) {
      case "cultural":
        return "Cultural";
      case "esportivo":
        return "Esportivo";
      case "ambos":
        return "Ambos";
      default:
        return categoria;
    }
  };

  const getProgressColor = (percentual: number) => {
    if (percentual >= 80) return "bg-green-500";
    if (percentual >= 60) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar metas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          onClick={() => {
            setSelectedMeta(null);
            setDialogOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meta</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Progresso</TableHead>
              <TableHead>Valor Atual</TableHead>
              <TableHead>Valor Meta</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMetas.map((meta) => (
              <TableRow key={meta.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{meta.titulo}</div>
                    <div className="text-sm text-gray-500 truncate max-w-[200px]">
                      {meta.descricao}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoriaColor(meta.categoria)}>
                    {getCategoriaLabel(meta.categoria)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{meta.percentualAtual}%</span>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <Progress 
                      value={meta.percentualAtual} 
                      className="h-2"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    R$ {meta.valorAtual.toLocaleString('pt-BR')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    R$ {meta.valorMeta.toLocaleString('pt-BR')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {meta.anoMeta}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(meta.status)}>
                    {getStatusLabel(meta.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedMeta(meta);
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

      {filteredMetas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma meta encontrada</p>
        </div>
      )}

      <MetaIncentivoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        meta={selectedMeta}
        onSubmit={selectedMeta ? handleEditMeta : handleAddMeta}
      />
    </div>
  );
}
