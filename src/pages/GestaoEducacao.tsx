
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroEducacao } from "@/components/educacao/CadastroEducacao";
import { RelatoriosEducacao } from "@/components/educacao/RelatoriosEducacao";
import { PlanejamentoEducacao } from "@/components/educacao/PlanejamentoEducacao";
import { SistemaAcademico } from "@/components/educacao/SistemaAcademico";
import { DashboardEducacional } from "@/components/educacao/DashboardEducacional";

export default function GestaoEducacao() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão Administrativa - Educação</h1>
          <p className="text-muted-foreground mt-2">
            Gestão de funcionários, escolas e planejamento educacional municipal
          </p>
        </header>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="dashboard" className="text-sm p-3">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cadastro" className="text-sm p-3">
              Cadastro
            </TabsTrigger>
            <TabsTrigger value="academico" className="text-sm p-3">
              Sistema Acadêmico
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-sm p-3">
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="planejamento" className="text-sm p-3">
              Planejamento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardEducacional />
          </TabsContent>

          <TabsContent value="cadastro" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro e Gerenciamento</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastroEducacao />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academico" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema Acadêmico</CardTitle>
              </CardHeader>
              <CardContent>
                <SistemaAcademico />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="relatorios" className="mt-6">
            <RelatoriosEducacao />
          </TabsContent>

          <TabsContent value="planejamento" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Planejamento Estratégico</CardTitle>
              </CardHeader>
              <CardContent>
                <PlanejamentoEducacao />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
