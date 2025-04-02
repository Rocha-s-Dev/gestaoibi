
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FinancialGoal = {
  id: string;
  type: "revenue" | "expense";
  description: string;
  target_value: number;
  percentage_increase: number;
  current_value: number;
};

export function FinancialGoalProgress() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("financial_goals")
        .select("id, type, description, target_value, percentage_increase, current_value")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);
      
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

  // Formatar números para o gráfico
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Preparar dados para o gráfico
  const chartData = goals.map(goal => ({
    name: goal.description.length > 20 
      ? goal.description.substring(0, 20) + "..." 
      : goal.description,
    atual: goal.current_value,
    meta: goal.target_value,
    tipo: goal.type
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso das Metas</CardTitle>
          <CardDescription>
            Carregando dados...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!goals.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso das Metas</CardTitle>
          <CardDescription>
            Nenhuma meta financeira ativa encontrada.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso das Metas Financeiras</CardTitle>
        <CardDescription>
          Comparativo entre os valores atuais e as metas estabelecidas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatCurrency} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))} 
                labelFormatter={(label) => goals.find(g => g.description.startsWith(label.split('...')[0]))?.description || label}
              />
              <Legend />
              <Bar 
                dataKey="atual" 
                name="Valor Atual" 
                fill="#22c55e" 
                barSize={20}
              />
              <Bar 
                dataKey="meta" 
                name="Meta/Limite" 
                fill="#3b82f6" 
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
