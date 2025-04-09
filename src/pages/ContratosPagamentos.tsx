
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PaymentTracking } from "@/components/financeiro/contracts/PaymentTracking";
import { ContractGoals } from "@/components/financeiro/contracts/ContractGoals";

export default function ContratosPagamentos() {
  const [activeTab, setActiveTab] = useState("pagamentos");

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Acompanhamento de Contratos</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhamento de pagamentos de contratos e metas de gestão
          </p>
        </header>

        <Tabs defaultValue="pagamentos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="metas">Metas de Contratos</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="pagamentos">
              <PaymentTracking />
            </TabsContent>
            
            <TabsContent value="metas">
              <ContractGoals />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
