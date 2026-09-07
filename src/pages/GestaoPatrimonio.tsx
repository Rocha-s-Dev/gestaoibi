import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { DashboardPatrimonio } from "@/components/patrimonio/DashboardPatrimonio";
import { BensPatrimoniais } from "@/components/patrimonio/BensPatrimoniais";
import { MovimentacoesPatrimonio } from "@/components/patrimonio/MovimentacoesPatrimonio";
import { EquipePatrimonio } from "@/components/patrimonio/EquipePatrimonio";
import { Boxes } from "lucide-react";

export default function GestaoPatrimonio() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Boxes className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Patrimônio Municipal</h1>
            <p className="text-sm text-muted-foreground">
              Núcleo de bens patrimoniais, movimentações, responsabilidade e equipe.
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="dashboard">Painel</TabsTrigger>
            <TabsTrigger value="bens">Bens Patrimoniais</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6"><DashboardPatrimonio /></TabsContent>
          <TabsContent value="bens" className="mt-6"><BensPatrimoniais /></TabsContent>
          <TabsContent value="movimentacoes" className="mt-6"><MovimentacoesPatrimonio /></TabsContent>
          <TabsContent value="equipe" className="mt-6"><EquipePatrimonio /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
