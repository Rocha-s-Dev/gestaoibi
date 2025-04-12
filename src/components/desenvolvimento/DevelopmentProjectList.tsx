
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, LineChart, PlusCircle } from "lucide-react";
import { ProjectDialog } from "./ProjectDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { Badge } from "@/components/ui/badge";

// Mock data for development projects
const MOCK_PROJECTS = [
  {
    id: "1",
    name: "Distrito Industrial Sustentável",
    category: "Infraestrutura",
    budget: 1500000,
    startDate: "2023-07-15",
    endDate: "2025-12-31",
    status: "Em andamento",
    partners: ["Prefeitura", "SEBRAE", "Associação Comercial"],
    description: "Construção de um distrito industrial com enfoque em práticas sustentáveis e energia renovável.",
  },
  {
    id: "2",
    name: "Capacitação de Empreendedores",
    category: "Formação",
    budget: 350000,
    startDate: "2023-09-01",
    endDate: "2024-08-31",
    status: "Em andamento",
    partners: ["SENAC", "SEBRAE"],
    description: "Programa de formação para micro e pequenos empreendedores locais.",
  },
  {
    id: "3",
    name: "Feira de Negócios Municipal",
    category: "Evento",
    budget: 120000,
    startDate: "2024-05-10",
    endDate: "2024-05-14",
    status: "Planejado",
    partners: ["Associação Comercial", "CDL"],
    description: "Feira anual para promoção do comércio e serviços locais.",
  },
];

interface DevelopmentProjectListProps {
  refreshTrigger?: number;
  onProjectAdded: () => void;
}

export function DevelopmentProjectList({ refreshTrigger, onProjectAdded }: DevelopmentProjectListProps) {
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProject, setEditingProject] = useState<typeof MOCK_PROJECTS[0] | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<typeof MOCK_PROJECTS[0] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (project: typeof MOCK_PROJECTS[0]) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (project: typeof MOCK_PROJECTS[0]) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setProjects(projects.filter((project) => project.id !== id));
    setIsDeleteDialogOpen(false);
  };

  const handleAddProject = (newProject: Omit<typeof MOCK_PROJECTS[0], "id">) => {
    const projectWithId = {
      ...newProject,
      id: `${projects.length + 1}`,
    };
    setProjects([...projects, projectWithId]);
    setIsAddDialogOpen(false);
    onProjectAdded();
  };

  const handleUpdateProject = (updatedProject: typeof MOCK_PROJECTS[0]) => {
    setProjects(
      projects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Buscar por nome, categoria ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="ml-4">
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-10">
          <LineChart className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Nenhum projeto encontrado</h3>
          <p className="text-sm text-muted-foreground">
            Tente ajustar sua busca ou cadastre um novo projeto.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Projeto</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Orçamento</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="hidden xl:table-cell">Parceiros</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    {project.name}
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      {project.category} • {project.status}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{project.category}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.budget)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge 
                      variant={project.status === "Em andamento" ? "default" : 
                              project.status === "Concluído" ? "success" : 
                              "secondary"}
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {project.partners.slice(0, 2).map((partner) => (
                        <Badge key={partner} variant="outline" className="text-xs">
                          {partner}
                        </Badge>
                      ))}
                      {project.partners.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.partners.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(project)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProjectDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddProject}
        isEditing={false}
      />

      <ProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateProject}
        defaultValues={editingProject || undefined}
        isEditing={true}
      />

      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => projectToDelete && confirmDelete(projectToDelete.id)}
        projectName={projectToDelete?.name || ""}
      />
    </div>
  );
}
