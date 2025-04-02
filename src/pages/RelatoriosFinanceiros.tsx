
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ReportFilters } from "@/components/financeiro/relatorios/ReportFilters";
import { FinancialSummary } from "@/components/financeiro/relatorios/FinancialSummary";
import { RevenueExpenseChart } from "@/components/financeiro/relatorios/RevenueExpenseChart";
import { TransactionReportTable } from "@/components/financeiro/relatorios/TransactionReportTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function RelatoriosFinanceiros() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("graficos");
  
  // Estado inicial para os filtros - mês atual
  const [filters, setFilters] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    categoryId: "",
    departmentId: "",
    transactionType: "todos" // 'todos', 'receita', 'despesa'
  });

  // Buscar transações quando os filtros mudarem
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      
      let query = supabase
        .from("financial_transactions")
        .select(`
          id,
          description,
          amount,
          transaction_date,
          type,
          category:category_id(id, name),
          department:department_id(id, name)
        `)
        .gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'));
      
      // Adicionar filtro por categoria se selecionada
      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      
      // Adicionar filtro por departamento se selecionado
      if (filters.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      
      // Adicionar filtro por tipo se não for 'todos'
      if (filters.transactionType !== 'todos') {
        query = query.eq('type', filters.transactionType);
      }
      
      // Ordenar por data
      query = query.order('transaction_date', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erro ao buscar transações:", error);
        toast.error("Erro ao carregar dados financeiros");
        setLoading(false);
        return;
      }
      
      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [filters]);

  // Atualizar filtros
  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análise detalhada de receitas e despesas da Secretaria Municipal de Administração e Finanças
          </p>
        </header>

        <ReportFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />

        <FinancialSummary transactions={transactions} loading={loading} />

        <Tabs defaultValue="graficos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            <TabsTrigger value="tabela">Tabela</TabsTrigger>
          </TabsList>

          <TabsContent value="graficos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Receitas vs Despesas</CardTitle>
                <CardDescription>
                  Comparativo de receitas e despesas no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueExpenseChart 
                  transactions={transactions} 
                  startDate={filters.startDate} 
                  endDate={filters.endDate} 
                  loading={loading} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tabela">
            <Card>
              <CardHeader>
                <CardTitle>Transações Detalhadas</CardTitle>
                <CardDescription>
                  Lista detalhada de transações no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionReportTable 
                  transactions={transactions} 
                  loading={loading} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
