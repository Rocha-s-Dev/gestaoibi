import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AddFinancialGoalDialog } from "./AddFinancialGoalDialog";
import { EditFinancialGoalDialog } from "./EditFinancialGoalDialog";
import { DeleteFinancialGoalDialog } from "./DeleteFinancialGoalDialog";
import { Pencil, Trash2, Check } from "lucide-react";

export function FinancialGoals() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteGoal, setDeleteGoal] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: financialGoals, isLoading } = useQuery({
    queryKey: ["financialGoals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase
        .from("financial_goals")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
      toast({ 
        title: "Status atualizado",
        description: "O status da meta financeira foi atualizado com sucesso."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status da meta financeira.",
        variant: "destructive"
      });
      console.error(error);
    }
  });

  const handleStatusChange = (id: string, status: string) => {
    toggleStatusMutation.mutate({ id, status });
  };

  const handleGoalAdded = () => {
    queryClient.invalidateQueries({ queryKey: ["financialGoals"] });
  };

  const handleEditGoal = (goal: any) => {
    setEditGoal(goal);
    setIsEditDialogOpen(true);
  };

  const handleDeleteGoal = (goal: any) => {
    setDeleteGoal(goal);
    setIsDeleteDialogOpen(true);
  };

  const renderGoalProgress = (goal: any) => {
    if (goal.type === "expense") {
      const percentage = goal.current_value ? (goal.current_value / goal.target_value) * 100 : 0;
      const isOverBudget = percentage > 100;
      const isNearThreshold = percentage >= goal.alert_threshold && percentage <= 100;
      
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              R$ {goal.current_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
              {' / '} 
              R$ {goal.target_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-medium ${isOverBudget ? 'text-red-500' : ''}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(percentage, 100)} 
            className={`${isOverBudget ? 'bg-red-200' : isNearThreshold ? 'bg-amber-200' : ''}`}
          />
          {isOverBudget && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
              <AlertTriangle size={16} />
              <span>Limite de gastos excedido!</span>
            </div>
          )}
          {isNearThreshold && !isOverBudget && goal.enable_alerts && (
            <div className="flex items-center gap-2 text-amber-500 text-sm mt-2">
              <AlertTriangle size={16} />
              <span>Próximo ao limite de gastos!</span>
            </div>
          )}
        </div>
      );
    } else {
      const percentage = goal.current_value ? (goal.current_value / goal.target_value) * 100 : 0;
      const isExceeded = percentage > 100;
      
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              R$ {goal.current_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
              {' / '} 
              R$ {goal.target_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-medium ${isExceeded ? 'text-green-500' : ''}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(percentage, 100)} 
            className={`${isExceeded ? 'bg-green-200' : ''}`}
          />
          {isExceeded && (
            <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
              <Check size={16} />
              <span>Meta de receita superada!</span>
            </div>
          )}
        </div>
      );
    }
  };

  if (isLoading) {
    return <div>Carregando metas financeiras...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Metas Financeiras</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Nova Meta Financeira
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {financialGoals?.map((goal) => (
          <Card key={goal.id} className={`${goal.status === 'inactive' ? 'opacity-70' : ''}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {goal.description}
                    <Badge variant={goal.type === "revenue" ? "default" : "secondary"}>
                      {goal.type === "revenue" ? "Receita" : "Despesa"}
                    </Badge>
                    <Badge variant={goal.status === "active" ? "outline" : "destructive"} 
                      className="ml-2">
                      {goal.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditGoal(goal)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteGoal(goal)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                {goal.type === "revenue" 
                  ? `Meta de aumento de ${goal.percentage_increase}% na receita` 
                  : `Limite máximo de despesas`}
              </div>
              {renderGoalProgress(goal)}
            </CardContent>
          </Card>
        ))}
      </div>

      <AddFinancialGoalDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGoalAdded={handleGoalAdded}
      />
      
      {editGoal && (
        <EditFinancialGoalDialog 
          goal={editGoal}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onGoalUpdated={handleGoalAdded}
        />
      )}

      {deleteGoal && (
        <DeleteFinancialGoalDialog 
          goal={deleteGoal}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onGoalDeleted={handleGoalAdded}
        />
      )}
    </div>
  );
}
