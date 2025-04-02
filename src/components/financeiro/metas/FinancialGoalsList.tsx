
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, AlertTriangle, CheckCircle2, BellRing, BellOff, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FinancialGoal {
  id: string;
  type: "revenue" | "expense";
  description: string;
  target_value: number;
  percentage_increase: number;
  current_value: number;
  status: "active" | "completed" | "failed";
  enable_alerts: boolean;
  alert_threshold: number;
  created_at: string;
}

export function FinancialGoalsList() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Simulando alguns valores atuais para demonstração
      // Em uma implementação completa, estes valores viriam de cálculos baseados em transações reais
      const goalsWithProgress = data.map(goal => ({
        ...goal,
        current_value: goal.type === "revenue" 
          ? (goal.target_value * (Math.random() * 0.8 + 0.2)) // 20% a 100% da meta para receitas
          : (goal.target_value * (Math.random() * 1.2 + 0.4))  // 40% a 160% da meta para despesas
      }));
      
      setGoals(goalsWithProgress);
    } catch (error) {
      console.error("Erro ao buscar metas financeiras:", error);
      toast.error("Erro ao carregar metas financeiras");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    setDeleteLoading(id);
    
    try {
      const { error } = await supabase
        .from("financial_goals")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Meta financeira excluída com sucesso");
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (error) {
      console.error("Erro ao excluir meta financeira:", error);
      toast.error("Erro ao excluir meta financeira");
    } finally {
      setDeleteLoading(null);
    }
  };

  const calculateProgress = (goal: FinancialGoal) => {
    if (goal.type === "revenue") {
      const targetWithIncrease = goal.target_value * (1 + goal.percentage_increase / 100);
      return Math.min(100, (goal.current_value / targetWithIncrease) * 100);
    } else {
      // Para despesas, queremos mostrar quanto do limite já foi consumido
      return Math.min(100, (goal.current_value / goal.target_value) * 100);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const shouldShowAlert = (goal: FinancialGoal) => {
    if (!goal.enable_alerts) return false;
    
    const progress = calculateProgress(goal);
    
    if (goal.type === "revenue") {
      return progress < goal.alert_threshold;
    } else {
      return progress > goal.alert_threshold;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p className="text-muted-foreground">Carregando metas financeiras...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <p className="text-muted-foreground">Nenhuma meta financeira cadastrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const progress = calculateProgress(goal);
        const showAlert = shouldShowAlert(goal);

        return (
          <Card key={goal.id} className={showAlert ? "border-yellow-500" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {goal.type === "revenue" ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                  <CardTitle className="text-lg">
                    {goal.description}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {goal.enable_alerts ? (
                    <BellRing className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Meta Financeira</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteGoal(goal.id)}
                          disabled={deleteLoading === goal.id}
                        >
                          {deleteLoading === goal.id ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Criada em {format(new Date(goal.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {showAlert && (
                  <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 p-2 rounded-md">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">
                      {goal.type === "revenue"
                        ? "Meta de receita abaixo do esperado para o período"
                        : "Despesas se aproximando do limite máximo estabelecido"}
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  {goal.type === "revenue" ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          Meta: aumento de {goal.percentage_increase}%
                        </span>
                        <span className="text-sm font-medium">
                          {progress.toFixed(1)}% alcançado
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Valor atual: {formatCurrency(goal.current_value)}</span>
                        <span>
                          Meta: {formatCurrency(goal.target_value * (1 + goal.percentage_increase / 100))}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          Limite máximo: {formatCurrency(goal.target_value)}
                        </span>
                        <span className={`text-sm font-medium ${progress > 100 ? "text-red-600" : ""}`}>
                          {progress.toFixed(1)}% utilizado
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className={`h-2 ${
                          progress > 100 
                            ? "bg-red-200 [&>div]:bg-red-600" 
                            : progress > goal.alert_threshold 
                              ? "bg-yellow-200 [&>div]:bg-yellow-600" 
                              : ""
                        }`} 
                      />
                      <div className="flex justify-between text-sm">
                        <span>Despesa atual: {formatCurrency(goal.current_value)}</span>
                        <span className={progress > 100 ? "text-red-600 font-medium" : ""}>
                          {progress > 100 
                            ? `Excedido em ${formatCurrency(goal.current_value - goal.target_value)}` 
                            : `Restante: ${formatCurrency(goal.target_value - goal.current_value)}`}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
