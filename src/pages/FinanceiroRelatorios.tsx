
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FinancialGoals } from "@/components/financeiro/FinancialGoals";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend,
  ResponsiveContainer 
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

// Define chart data interface
type ChartData = {
  name: string;
  receitas: number;
  despesas: number;
  saldo: number;
};

export default function FinanceiroRelatorios() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: financialData = [], isLoading } = useQuery({
    queryKey: ["financialReports"],
    queryFn: async () => {
      // Fetch financial transactions
      const { data: transactions, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .order("transaction_date");
        
      if (error) throw error;
      
      // Process data by month for the chart
      const monthlyData: Record<string, ChartData> = {};
      const currentYear = new Date().getFullYear();
      
      // Initialize with empty months for the current year
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      months.forEach((month, index) => {
        monthlyData[month] = {
          name: month,
          receitas: 0,
          despesas: 0,
          saldo: 0,
        };
      });
      
      // Populate with actual data
      transactions.forEach(transaction => {
        const date = new Date(transaction.transaction_date);
        const year = date.getFullYear();
        
        // Only process current year data
        if (year === currentYear) {
          const monthIndex = date.getMonth();
          const monthName = months[monthIndex];
          
          if (!monthlyData[monthName]) {
            monthlyData[monthName] = {
              name: monthName,
              receitas: 0,
              despesas: 0,
              saldo: 0,
            };
          }
          
          if (transaction.type === 'receitas') {
            monthlyData[monthName].receitas += transaction.amount;
          } else {
            monthlyData[monthName].despesas += transaction.amount;
          }
        }
      });
      
      // Calculate balance for each month
      Object.keys(monthlyData).forEach(month => {
        monthlyData[month].saldo = 
          monthlyData[month].receitas - monthlyData[month].despesas;
      });
      
      // Convert to array and sort by month
      return months.map(month => monthlyData[month]);
    },
  });

  const handleExportPDF = () => {
    // This would be implemented with a PDF generation library
    alert("Funcionalidade de exportação para PDF será implementada em breve.");
  };
  
  const handleExportExcel = () => {
    // This would be implemented with an Excel generation library
    alert("Funcionalidade de exportação para Excel será implementada em breve.");
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Financeiros</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada das finanças com gráficos e metas
          </p>
        </header>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="goals">Metas Financeiras</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="overview">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Receitas vs Despesas (Ano Atual)</CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hidden md:flex"
                        onClick={handleExportPDF}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hidden md:flex"
                        onClick={handleExportExcel}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar Excel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px] w-full">
                      {isLoading ? (
                        <p className="flex items-center justify-center h-full">
                          Carregando dados financeiros...
                        </p>
                      ) : (
                        <ChartContainer 
                          config={{
                            receitas: { color: "#22c55e" },
                            despesas: { color: "#ef4444" },
                            saldo: { color: "#3b82f6" }
                          }}
                        >
                          <ComposedChart data={financialData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip
                              content={<ChartTooltipContent />}
                            />
                            <Legend />
                            <Bar 
                              dataKey="receitas" 
                              name="Receitas" 
                              fill="var(--color-receitas)"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                              dataKey="despesas" 
                              name="Despesas"
                              fill="var(--color-despesas)" 
                              radius={[4, 4, 0, 0]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="saldo" 
                              name="Saldo" 
                              stroke="var(--color-saldo)"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          </ComposedChart>
                        </ChartContainer>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Mobile Export Buttons */}
                <div className="flex space-x-2 md:hidden">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleExportPDF}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleExportExcel}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col space-y-2">
                        <span className="text-sm text-muted-foreground">Total de Receitas (Ano Atual)</span>
                        <span className="text-2xl font-bold text-green-600">
                          R$ {financialData
                            .reduce((sum, item) => sum + item.receitas, 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <span className="text-sm text-muted-foreground">Total de Despesas (Ano Atual)</span>
                        <span className="text-2xl font-bold text-red-600">
                          R$ {financialData
                            .reduce((sum, item) => sum + item.despesas, 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <span className="text-sm text-muted-foreground">Saldo (Ano Atual)</span>
                        <span className={`text-2xl font-bold ${
                          financialData.reduce((sum, item) => sum + item.saldo, 0) >= 0 
                            ? 'text-blue-600' 
                            : 'text-red-600'
                        }`}>
                          R$ {financialData
                            .reduce((sum, item) => sum + item.saldo, 0)
                            .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="goals">
              <FinancialGoals />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
