
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

type TransactionListProps = {
  type: string;
  refreshTrigger: number;
};

type Transaction = {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  category: {
    name: string;
  };
  department: {
    name: string;
  } | null;
};

export function TransactionList({ type, refreshTrigger }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(`
          id,
          description,
          amount,
          transaction_date,
          category:category_id(name),
          department:department_id(name)
        `)
        .eq("type", type)
        .order("transaction_date", { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("Erro ao buscar transações:", error);
        setLoading(false);
        return;
      }
      
      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [type, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <p>Carregando...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">
          Nenhuma {type === "receita" ? "receita" : "despesa"} registrada.
        </p>
      </div>
    );
  }

  // Formatar valor como moeda brasileira
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[400px]">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="border rounded-md p-3 shadow-sm hover:bg-gray-50"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium truncate">{transaction.description}</h4>
              <p className="text-sm text-muted-foreground">
                {transaction.category?.name}
                {transaction.department && ` • ${transaction.department.name}`}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${type === "receita" ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(transaction.transaction_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
