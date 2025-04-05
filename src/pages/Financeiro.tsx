
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { TransactionForm } from "@/components/financeiro/TransactionForm";
import { TransactionList } from "@/components/financeiro/TransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Financeiro() {
  const [activeTab, setActiveTab] = useState("receitas");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento de receitas e despesas da Secretaria Municipal de Administração e Finanças
          </p>
        </header>

        <Tabs defaultValue="receitas" onValueChange={setActiveTab}>
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
          </TabsList>

          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Cadastrar {activeTab === "receitas" ? "Receita" : "Despesa"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm 
                  transactionType={activeTab}
                  onTransactionAdded={handleTransactionAdded}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  Últimas {activeTab === "receitas" ? "Receitas" : "Despesas"}
                </CardTitle>
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
