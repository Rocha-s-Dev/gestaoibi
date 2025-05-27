
import { useState } from "react";
import { Plus, Eye, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProjetoDialog } from "./ProjetoDialog";
import { DeleteProjetoDialog } from "./DeleteProjetoDialog";

// Tipo para o projeto
interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  objetivos: string;
  orcamento: number;
  dataInicio: string;
  dataFim: string;
  responsavel: string;
  categoria: "cultural" | "esportivo";
  status: "planejamento" | "em-andamento" | "concluido" | "cancelado";
}

// Dados simulados
const projetosData: Projeto[] = [
  {
    id: "1",
    nome: "Festival de Música da Cidade",
    descricao: "Festival anual de música com artistas locais e regionais",
    objetivos: "Promover a cultura musical local e atrair turistas",
    orcamento: 150000,
    dataInicio: "2024-06-15",
    dataFim: "2024-06-17",
    responsavel: "Maria Santos",
    categoria: "cultural",
    status: "planejamento"
  },
  {
    id: "2",
    nome: "Campeonato Municipal de Futebol",
    descricao: "Torneio de futebol entre equipes dos bairros",
    objetivos: "Incentivar a prática esportiva e integração social",
    orcamento: 80000,
    dataInicio: "2024-07-01",
    dataFim: "2024-08-31",
    responsavel: "João Silva",
    categoria: "esportivo",
    status: "em-andamento"
  },
  {
    id: "3",
    nome: "Oficinas de Arte para Crianças",
    descricao: "Programa de oficinas de pintura e artesanato",
    objetivos: "Desenvolver habilidades artísticas em crianças",
    orcamento: 45000,
    dataInicio: "2024-03-01",
    dataFim: "2024-11-30",
    responsavel: "Ana Oliveira",
    categoria: "cultural",
    status: "em-andamento"
  }
];

interface ProjetosListProps {
  refreshTrigger: number;
  onProjetoAdded: () => void;
}

export function ProjetosList({ refreshTrigger, onProjetoAdded }: ProjetosListProps) {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProjeto, setEditingProjeto] = useState<Projeto | null>(null);
  const [deletingProjeto, setDeleteingProjeto] = useState<Projeto | null>(null);

  const filteredProjetos = projetos.filter((projeto) =>
    projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projeto.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    projeto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProjeto = (projeto: Omit<Projeto, "id">) => {
    const newProjeto: Projeto = {
      ...projeto,
      id: (projetos.length + 1).toString(),
    };
    setProjetos([...projetos, newProjeto]);
    onProjetoAdded();
  };

  const handleEditProjeto = (projeto: Projeto) => {
    setProjetos(projetos.map((p) => (p.id === projeto.id ? projeto : p)));
    setEditingProjeto(null);
  };

  const handleDeleteProjeto = (id: string) => {
    setProjetos(projetos.filter((p) => p.id !== id));
    setDeleteingProjeto(null);
  };

  const getStatusBadge = (status: Projeto["status"]) => {
    const statusConfig = {
      planejamento: { label: "Planejamento", variant: "secondary" as const },
      "em-andamento": { label: "Em Andamento", variant: "default" as const },
      concluido: { label: "Concluído", variant: "outline" as const },
      cancelado: { label: "Cancelado", variant: "destructive" as const },
    };
    return statusConfig[status];
  };

  const getCategoryBadge = (categoria: Projeto["categoria"]) => {
    const categoryConfig = {
      cultural: { label: "Cultural", variant: "default" as const },
      esportivo: { label: "Esportivo", variant: "secondary" as const },
    };
    return categoryConfig[categoria];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[300px]"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Orçamento</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjetos.map((projeto) => {
              const statusConfig = getStatusBadge(projeto.status);
              const categoryConfig = getCategoryBadge(projeto.categoria);
              
              return (
                <TableRow key={projeto.id}>
                  <TableCell className="font-medium">{projeto.nome}</TableCell>
                  <TableCell>
                    <Badge variant={categoryConfig.variant}>
                      {categoryConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{projeto.responsavel}</TableCell>
                  <TableCell>R$ {projeto.orcamento.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(projeto.dataInicio).toLocaleDateString()} - {new Date(projeto.dataFim).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingProjeto(projeto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteingProjeto(projeto)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ProjetoDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddProjeto}
      />

      {editingProjeto && (
        <ProjetoDialog
          open={!!editingProjeto}
          onOpenChange={() => setEditingProjeto(null)}
          onSubmit={handleEditProjeto}
          projeto={editingProjeto}
        />
      )}

      {deletingProjeto && (
        <DeleteProjetoDialog
          open={!!deletingProjeto}
          onOpenChange={() => setDeleteingProjeto(null)}
          onConfirm={() => handleDeleteProjeto(deletingProjeto.id)}
          projetoNome={deletingProjeto.nome}
        />
      )}
    </div>
  );
}
