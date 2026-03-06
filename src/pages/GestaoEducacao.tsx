import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroEducacao } from "@/components/educacao/CadastroEducacao";
import { RelatoriosEducacao } from "@/components/educacao/RelatoriosEducacao";
import { PlanejamentoEducacao } from "@/components/educacao/PlanejamentoEducacao";
import { DashboardEducacional } from "@/components/educacao/DashboardEducacional";
import { AlertasEducacionais } from "@/components/educacao/AlertasEducacionais";
import { GestaoTransporte } from "@/components/educacao/GestaoTransporte";
import { GestaoMerenda } from "@/components/educacao/GestaoMerenda";
import { GestaoSolicitacoesMatricula } from "@/components/educacao/GestaoSolicitacoesMatricula";
import { GestaoTransferencias } from "@/components/educacao/GestaoTransferencias";
import { HistoricoEscolarView } from "@/components/educacao/HistoricoEscolarView";
import { GestaoNotasAvancada } from "@/components/educacao/GestaoNotasAvancada";
import { GestaoFaltas } from "@/components/educacao/GestaoFaltas";
import { IndicadoresEducacionais } from "@/components/educacao/IndicadoresEducacionais";
import { AdminPapeisEducacionais } from "@/components/educacao/AdminPapeisEducacionais";
import { EquipeEducacao } from "@/components/educacao/EquipeEducacao";

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
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="text-xs md:text-sm p-2">Dashboard</TabsTrigger>
            <TabsTrigger value="matriculas" className="text-xs md:text-sm p-2">Matrículas</TabsTrigger>
            <TabsTrigger value="transferencias" className="text-xs md:text-sm p-2">Transferências</TabsTrigger>
            <TabsTrigger value="historico" className="text-xs md:text-sm p-2">Histórico</TabsTrigger>
            <TabsTrigger value="notas" className="text-xs md:text-sm p-2">Notas</TabsTrigger>
            <TabsTrigger value="faltas" className="text-xs md:text-sm p-2">Faltas</TabsTrigger>
            <TabsTrigger value="cadastro" className="text-xs md:text-sm p-2">Cadastro</TabsTrigger>
            <TabsTrigger value="alertas" className="text-xs md:text-sm p-2">Alertas</TabsTrigger>
            <TabsTrigger value="transporte" className="text-xs md:text-sm p-2">Transporte</TabsTrigger>
            <TabsTrigger value="merenda" className="text-xs md:text-sm p-2">Merenda</TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs md:text-sm p-2">Relatórios</TabsTrigger>
            <TabsTrigger value="planejamento" className="text-xs md:text-sm p-2">Planejamento</TabsTrigger>
            <TabsTrigger value="equipe" className="text-xs md:text-sm p-2">Equipe</TabsTrigger>
            <TabsTrigger value="indicadores" className="text-xs md:text-sm p-2">Indicadores</TabsTrigger>
            <TabsTrigger value="papeis" className="text-xs md:text-sm p-2">Papéis</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardEducacional />
          </TabsContent>




          <TabsContent value="matriculas" className="mt-6">
            <GestaoSolicitacoesMatricula />
          </TabsContent>

          <TabsContent value="transferencias" className="mt-6">
            <GestaoTransferencias />
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            <HistoricoEscolarView />
          </TabsContent>

          <TabsContent value="notas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <GestaoNotasAvancada />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faltas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Faltas</CardTitle>
              </CardHeader>
              <CardContent>
                <GestaoFaltas />
              </CardContent>
            </Card>
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

          <TabsContent value="indicadores" className="mt-6">
            <IndicadoresEducacionais />
          </TabsContent>

          <TabsContent value="papeis" className="mt-6">
            <AdminPapeisEducacionais />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
