
import { useMemo } from "react";
import { format, eachMonthOfInterval, eachDayOfInterval, isWithinInterval, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

type RevenueExpenseChartProps = {
  transactions: any[];
  startDate: Date;
  endDate: Date;
  loading: boolean;
};

export function RevenueExpenseChart({ 
  transactions, 
  startDate, 
  endDate, 
  loading 
}: RevenueExpenseChartProps) {
  // Gerar dados para o gráfico com base no intervalo de datas
  const chartData = useMemo(() => {
    if (loading || !transactions.length) {
      return [];
    }

    const diff = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    
    // Decidir intervalo baseado na diferença de dias
    if (diffDays <= 31) {
      // Para períodos menores que um mês, agrupar por dia
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      return days.map(day => {
        const dayTransactions = transactions.filter(t => {
          const date = new Date(t.transaction_date);
          return date.getDate() === day.getDate() && 
                 date.getMonth() === day.getMonth() && 
                 date.getFullYear() === day.getFullYear();
        });
        
        const revenues = dayTransactions
          .filter(t => t.type === "receita")
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const expenses = dayTransactions
          .filter(t => t.type === "despesa")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          date: format(day, "dd/MM"),
          receitas: revenues,
          despesas: expenses,
          saldo: revenues - expenses
        };
      });
    } else {
      // Para períodos maiores, agrupar por mês
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      
      return months.map(month => {
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.transaction_date);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        });
        
        const revenues = monthTransactions
          .filter(t => t.type === "receita")
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const expenses = monthTransactions
          .filter(t => t.type === "despesa")
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          date: format(month, "MMM/yy", { locale: ptBR }),
          receitas: revenues,
          despesas: expenses,
          saldo: revenues - expenses
        };
      });
    }
  }, [transactions, startDate, endDate, loading]);

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-md">
        <p className="text-muted-foreground">Nenhuma transação encontrada no período selecionado</p>
      </div>
    );
  }

  const chartConfig = {
    receitas: {
      label: "Receitas",
      color: "#22c55e"
    },
    despesas: {
      label: "Despesas",
      color: "#ef4444"
    },
    saldo: {
      label: "Saldo",
      color: "#3b82f6"
    }
  };

  // Formatador de moeda para o tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="w-full">
      <ChartContainer config={chartConfig} className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis 
              tickFormatter={(value) => 
                new Intl.NumberFormat('pt-BR', {
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value)
              } 
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <p className="text-sm font-medium">{entry.name}</p>
                            <p className="text-sm">
                              {formatCurrency(Number(entry.value))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="receitas" fill={chartConfig.receitas.color} name="Receitas" />
            <Bar dataKey="despesas" fill={chartConfig.despesas.color} name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
