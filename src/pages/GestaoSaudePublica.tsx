import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardSaude } from "@/components/saude/DashboardSaude";
import { CadastroPacientes } from "@/components/saude/CadastroPacientes";
import { AgendamentoConsultas } from "@/components/saude/AgendamentoConsultas";
import { ProntuarioEletronico } from "@/components/saude/ProntuarioEletronico";

export default function GestaoSaudePublica() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Saúde Pública</h1>
          <p className="text-muted-foreground mt-2">
            Sistema completo de gestão dos serviços de saúde pública municipal
          </p>
        </header>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="dashboard" className="text-sm p-3">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pacientes" className="text-sm p-3">
              Pacientes
            </TabsTrigger>
            <TabsTrigger value="agendamentos" className="text-sm p-3">
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="prontuarios" className="text-sm p-3">
              Prontuários
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardSaude />
          </TabsContent>

          <TabsContent value="pacientes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastroPacientes />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agendamentos" className="mt-6">
            <AgendamentoConsultas />
          </TabsContent>

          <TabsContent value="prontuarios" className="mt-6">
            <ProntuarioEletronico />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
