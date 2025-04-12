
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Target, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EconomicGoalDialog } from "./EconomicGoalDialog";
import { DeleteEconomicGoalDialog } from "./DeleteEconomicGoalDialog";

// Mock data for economic development goals
const MOCK_GOALS = [
  {
    id: "1",
    title: "Criação de Empregos",
    category: "Emprego",
    currentValue: 200,
    targetValue: 500,
    percentageIncrease: 20,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    status: "Em andamento",
    description: "Criação de novos postos de trabalho na indústria local",
  },
  {
    id: "2",
    title: "Aumento de Empresas",
    category: "Empresas",
    currentValue: 45,
    targetValue: 60,
    percentageIncrease: 33,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    status: "Em andamento",
    description: "Aumento no registro de novas empresas no município",
  },
  {
    id: "3",
    title: "Atração de Investimentos",
    category: "Investimento",
    currentValue: 2500000,
    targetValue: 5000000,
    percentageIncrease: 100,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    status: "Atrasado",
    description: "Captação de novos investimentos para a região",
  },
];

interface EconomicGoalsListProps {
  refreshTrigger?: number;
  onGoalAdded: () => void;
}

export function EconomicGoalsList({ refreshTrigger, onGoalAdded }: EconomicGoalsListProps) {
  const [goals, setGoals] = useState(MOCK_GOALS);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGoal, setEditingGoal] = useState<typeof MOCK_GOALS[0] | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<typeof MOCK_GOALS[0] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredGoals = goals.filter(
    (goal) =>
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (goal: typeof MOCK_GOALS[0]) => {
    setEditingGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (goal: typeof MOCK_GOALS[0]) => {
    setGoalToDelete(goal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id));
    setIsDeleteDialogOpen(false);
  };

  const handleAddGoal = (newGoal: Omit<typeof MOCK_GOALS[0], "id">) => {
    const goalWithId = {
      ...newGoal,
      id: `${goals.length + 1}`,
    };
    setGoals([...goals, goalWithId]);
    setIsAddDialogOpen(false);
    onGoalAdded();
  };

  const handleUpdateGoal = (updatedGoal: typeof MOCK_GOALS[0]) => {
    setGoals(
      goals.map((goal) =>
        goal.id === updatedGoal.id ? updatedGoal : goal
      )
    );
    setIsEditDialogOpen(false);
  };

  const formatValue = (value: number, category: string) => {
    if (category === "Investimento") {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return value;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Buscar por título, categoria ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="ml-4">
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="text-center py-10">
          <Target className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Nenhuma meta encontrada</h3>
          <p className="text-sm text-muted-foreground">
            Tente ajustar sua busca ou cadastre uma nova meta.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden lg:table-cell">Atual/Meta</TableHead>
                <TableHead className="hidden lg:table-cell">Aumento (%)</TableHead>
                <TableHead className="hidden xl:table-cell">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGoals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell className="font-medium">
                    {goal.title}
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      {goal.category} • {goal.status}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{goal.category}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatValue(goal.currentValue, goal.category)} / {formatValue(goal.targetValue, goal.category)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {goal.percentageIncrease}%
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Badge 
                      variant={goal.status === "Em andamento" ? "default" : 
                              goal.status === "Concluído" ? "secondary" : 
                              "outline"}
                    >
                      {goal.status}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleEdit(goal)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(goal)}>
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

      <EconomicGoalDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddGoal}
        isEditing={false}
      />

      <EconomicGoalDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateGoal}
        defaultValues={editingGoal || undefined}
        isEditing={true}
      />

      <DeleteEconomicGoalDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => goalToDelete && confirmDelete(goalToDelete.id)}
        goalTitle={goalToDelete?.title || ""}
      />
    </div>
  );
}
