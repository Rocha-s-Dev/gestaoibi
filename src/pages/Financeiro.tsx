
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { TransactionForm } from "@/components/financeiro/TransactionForm";
import { TransactionList } from "@/components/financeiro/TransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { DollarSign, ArrowUpCircle, ArrowDownCircle, PieChart } from "lucide-react";

export default function Financeiro() {
  const [activeTab, setActiveTab] = useState("receitas");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <header className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <PieChart className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira</h1>
          </div>
          <p className="text-muted-foreground">
            Gerenciamento de receitas e despesas da Secretaria Municipal de Administração e Finanças
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary-800 font-medium">Total Receitas</CardDescription>
              <CardTitle className="text-2xl text-primary-800 flex items-center">
                <ArrowUpCircle className="text-primary mr-2 h-5 w-5" />
                R$ 124.750,00
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-primary-700">+12% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-red-800 font-medium">Total Despesas</CardDescription>
              <CardTitle className="text-2xl text-red-800 flex items-center">
                <ArrowDownCircle className="text-red-600 mr-2 h-5 w-5" />
                R$ 98.320,00
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-700">-5% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-800 font-medium">Saldo Atual</CardDescription>
              <CardTitle className="text-2xl text-blue-800 flex items-center">
                <DollarSign className="text-blue-600 mr-2 h-5 w-5" />
                R$ 26.430,00
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-blue-700">Atualizado em 03/04/2025</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="receitas" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2 mb-6">
            <TabsTrigger value="receitas" className="text-sm">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Receitas
            </TabsTrigger>
            <TabsTrigger value="despesas" className="text-sm">
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Despesas
            </TabsTrigger>
          </TabsList>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-l-4 border-l-primary shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  {activeTab === "receitas" 
                    ? <ArrowUpCircle className="text-primary mr-2 h-5 w-5" /> 
                    : <ArrowDownCircle className="text-red-500 mr-2 h-5 w-5" />
                  }
                  Cadastrar {activeTab === "receitas" ? "Receita" : "Despesa"}
                </CardTitle>
                <CardDescription>
                  Preencha os dados para adicionar uma nova {activeTab === "receitas" ? "receita" : "despesa"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionForm 
                  transactionType={activeTab}
                  onTransactionAdded={handleTransactionAdded}
                />
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-primary shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  {activeTab === "receitas" 
                    ? <ArrowUpCircle className="text-primary mr-2 h-5 w-5" /> 
                    : <ArrowDownCircle className="text-red-500 mr-2 h-5 w-5" />
                  }
                  Últimas {activeTab === "receitas" ? "Receitas" : "Despesas"}
                </CardTitle>
                <CardDescription>
                  Histórico recente de {activeTab === "receitas" ? "receitas" : "despesas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList 
                  type={activeTab} 
                  refreshTrigger={refreshTrigger}
                />
              </CardContent>
            </Card>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
