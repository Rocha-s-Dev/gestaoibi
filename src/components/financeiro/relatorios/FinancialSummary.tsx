
import { useMemo } from "react";
import { CreditCard, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

type FinancialSummaryProps = {
  transactions: any[];
  loading: boolean;
};

export function FinancialSummary({ transactions, loading }: FinancialSummaryProps) {
  // Cálculo dos totais
  const { totalRevenue, totalExpense, balance } = useMemo(() => {
    if (loading || !transactions.length) {
      return { totalRevenue: 0, totalExpense: 0, balance: 0 };
    }
    
    const revenue = transactions
      .filter(t => t.type === "receita")
      .reduce((acc, t) => acc + Number(t.amount), 0);
      
    const expense = transactions
      .filter(t => t.type === "despesa")
      .reduce((acc, t) => acc + Number(t.amount), 0);
      
    return {
      totalRevenue: revenue,
      totalExpense: expense,
      balance: revenue - expense
    };
  }, [transactions, loading]);

  // Formatador de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 animate-pulse"
          >
            <div className="h-6 w-1/2 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-3/4 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Receitas</h3>
          <ArrowUpCircle className="h-4 w-4 text-green-600" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {transactions.filter(t => t.type === "receita").length} transações
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Despesas</h3>
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpense)}
          </div>
          <p className="text-xs text-muted-foreground">
            {transactions.filter(t => t.type === "despesa").length} transações
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">Saldo</h3>
          <CreditCard className={`h-4 w-4 ${balance >= 0 ? "text-green-600" : "text-red-600"}`} />
        </div>
        <div className="p-6 pt-0">
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(balance)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total de {transactions.length} transações
          </p>
        </div>
      </div>
    </div>
  );
}
