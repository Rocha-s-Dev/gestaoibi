
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { TransactionForm } from "@/components/financeiro/TransactionForm";
import { TransactionList } from "@/components/financeiro/TransactionList";
import { ContractManagement } from "@/components/financeiro/contracts/ContractManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CalendarClock, ShoppingCart, FileText, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupplierRegistration } from "@/components/financeiro/compras/SupplierRegistration";

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
          <TabsList className="grid w-full md:w-[600px] grid-cols-4">
            <TabsTrigger value="receitas">Receitas</TabsTrigger>
            <TabsTrigger value="despesas">Despesas</TabsTrigger>
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="compras">Compras e Licitações</TabsTrigger>
          </TabsList>

          {activeTab !== "contratos" && activeTab !== "compras" ? (
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
          ) : activeTab === "contratos" ? (
            <div className="mt-6">
              <div className="mb-4">
                <Button variant="outline" asChild>
                  <Link to="/contratos/pagamentos" className="flex items-center">
                    <CalendarClock className="mr-2 h-4 w-4" /> 
                    Ver Acompanhamento de Pagamentos
                  </Link>
                </Button>
              </div>
              <ContractManagement />
            </div>
          ) : (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" asChild>
                  <Link to="/compras/licitacoes" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" /> 
                    Gerenciar Licitações
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/financeiro" className="flex items-center">
                    <Building className="mr-2 h-4 w-4" /> 
                    Cadastro de Fornecedores
                  </Link>
                </Button>
              </div>
              <SupplierRegistration />
            </div>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
