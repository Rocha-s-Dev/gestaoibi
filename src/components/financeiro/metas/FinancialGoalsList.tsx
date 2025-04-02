
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

type FinancialGoal = {
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
  updated_at: string;
};

export function FinancialGoalsList() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("financial_goals")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar metas financeiras:", error);
        setLoading(false);
        return;
      }
      
      setGoals(data as FinancialGoal[]);
      setLoading(false);
    };

    fetchGoals();
  }, []);

  // Formatador de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calcular a porcentagem de progresso
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100); // Limitar a 100%
  };

  // Verificar se deve mostrar alerta
  const shouldShowAlert = (goal: FinancialGoal) => {
    if (!goal.enable_alerts) return false;
    
    const progress = calculateProgress(goal.current_value, goal.target_value);
    
    return goal.type === "revenue" 
      ? progress < goal.alert_threshold // Alerta para receita abaixo do threshold
      : progress > goal.alert_threshold; // Alerta para despesa acima do threshold
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">Carregando metas financeiras...</p>
      </div>
    );
  }

  if (!goals.length) {
    return (
      <div className="py-4 text-center">
        <p className="text-muted-foreground">Nenhuma meta financeira encontrada.</p>
        <p className="text-sm mt-2">Use a aba "Criar Nova Meta" para estabelecer metas de receita ou limites de despesa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {goals.map((goal) => (
        <div 
          key={goal.id} 
          className="border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {goal.type === "revenue" ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <h3 className="font-semibold">
                {goal.type === "revenue" ? "Meta de Receita" : "Limite de Despesa"}
              </h3>
              {goal.status === "active" && shouldShowAlert(goal) && (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              {goal.status === "completed" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {goal.status === "failed" && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="text-right">
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  goal.status === "active" ? "bg-blue-100 text-blue-800" :
                  goal.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}
              >
                {goal.status === "active" ? "Em andamento" : 
                 goal.status === "completed" ? "Concluída" : "Não atingida"}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Atual:</span>
                <span className={goal.type === "revenue" ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(goal.current_value)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{goal.type === "revenue" ? "Meta:" : "Limite:"}</span>
                <span className="font-medium">
                  {formatCurrency(goal.target_value)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{goal.type === "revenue" ? "Aumento Desejado:" : "Proporção do Orçamento:"}</span>
                <span>{goal.percentage_increase}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Alerta em:</span>
                <span>
                  {goal.enable_alerts ? `${goal.alert_threshold}%` : "Desativado"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>
                {Math.round(calculateProgress(goal.current_value, goal.target_value))}%
              </span>
            </div>
            <Progress 
              value={calculateProgress(goal.current_value, goal.target_value)} 
              className={`h-2 ${
                goal.type === "revenue" ? "bg-green-100" : "bg-red-100"
              }`}
              indicatorClassName={
                goal.type === "revenue" 
                  ? "bg-green-500" 
                  : shouldShowAlert(goal) && goal.status === "active"
                    ? "bg-red-500"
                    : "bg-amber-500"
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
