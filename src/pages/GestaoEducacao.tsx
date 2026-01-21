import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroEducacao } from "@/components/educacao/CadastroEducacao";
import { RelatoriosEducacao } from "@/components/educacao/RelatoriosEducacao";
import { PlanejamentoEducacao } from "@/components/educacao/PlanejamentoEducacao";
import { SistemaAcademico } from "@/components/educacao/SistemaAcademico";
import { DashboardEducacional } from "@/components/educacao/DashboardEducacional";
import { AlertasEducacionais } from "@/components/educacao/AlertasEducacionais";
import { GestaoTransporte } from "@/components/educacao/GestaoTransporte";
import { GestaoMerenda } from "@/components/educacao/GestaoMerenda";
import { GestaoSolicitacoesMatricula } from "@/components/educacao/GestaoSolicitacoesMatricula";

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
          <TabsList className="grid w-full grid-cols-5 md:grid-cols-9 h-auto gap-1">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm p-2 md:p-3">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="matriculas" className="text-xs md:text-sm p-2 md:p-3">
              Matrículas
            </TabsTrigger>
            <TabsTrigger value="cadastro" className="text-xs md:text-sm p-2 md:p-3">
              Cadastro
            </TabsTrigger>
            <TabsTrigger value="academico" className="text-xs md:text-sm p-2 md:p-3">
              Acadêmico
            </TabsTrigger>
            <TabsTrigger value="alertas" className="text-xs md:text-sm p-2 md:p-3">
              Alertas
            </TabsTrigger>
            <TabsTrigger value="transporte" className="text-xs md:text-sm p-2 md:p-3">
              Transporte
            </TabsTrigger>
            <TabsTrigger value="merenda" className="text-xs md:text-sm p-2 md:p-3">
              Merenda
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs md:text-sm p-2 md:p-3">
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="planejamento" className="text-xs md:text-sm p-2 md:p-3">
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

          <TabsContent value="alertas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas Educacionais</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertasEducacionais />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transporte" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Transporte Escolar</CardTitle>
              </CardHeader>
              <CardContent>
                <GestaoTransporte />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="merenda" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Merenda Escolar</CardTitle>
              </CardHeader>
              <CardContent>
                <GestaoMerenda />
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
