
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { FinancialGoalForm } from "@/components/financeiro/metas/FinancialGoalForm";
import { FinancialGoalsList } from "@/components/financeiro/metas/FinancialGoalsList";
import { FinancialGoalProgress } from "@/components/financeiro/metas/FinancialGoalProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function MetasFinanceiras() {
  const [refreshGoals, setRefreshGoals] = useState(0);

  const handleGoalAdded = () => {
    setRefreshGoals((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe metas de receitas e despesas para melhorar a gestão financeira
          </p>
        </header>

        <Separator />

        <FinancialGoalProgress />

        <Tabs defaultValue="metas" className="space-y-4">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="metas">Metas Financeiras</TabsTrigger>
            <TabsTrigger value="criar">Criar Nova Meta</TabsTrigger>
          </TabsList>

          <TabsContent value="metas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Metas Financeiras Ativas</CardTitle>
                <CardDescription>
                  Acompanhamento de receitas e despesas com base nas metas estabelecidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialGoalsList key={refreshGoals} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="criar">
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Meta Financeira</CardTitle>
                <CardDescription>
                  Defina metas de aumento de receitas ou limites de despesas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FinancialGoalForm onGoalAdded={handleGoalAdded} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
