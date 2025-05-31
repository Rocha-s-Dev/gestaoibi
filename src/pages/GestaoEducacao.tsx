
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroEducacao } from "@/components/educacao/CadastroEducacao";
import { RelatoriosEducacao } from "@/components/educacao/RelatoriosEducacao";
import { PlanejamentoEducacao } from "@/components/educacao/PlanejamentoEducacao";

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

        <Tabs defaultValue="cadastro">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="cadastro" className="text-sm p-3">
              Cadastro e Gerenciamento
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-sm p-3">
              Relatórios de Desempenho
            </TabsTrigger>
            <TabsTrigger value="planejamento" className="text-sm p-3">
              Planejamento Estratégico
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="relatorios" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <RelatoriosEducacao />
              </CardContent>
            </Card>
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
