import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SatisfacaoPaciente } from "@/components/saude/SatisfacaoPaciente";
import { AcompanhamentoTratamentos } from "@/components/saude/AcompanhamentoTratamentos";
import { AgendamentoConsultas } from "@/components/saude/AgendamentoConsultas";
import { ProntuarioEletronico } from "@/components/saude/ProntuarioEletronico";

export default function AtendimentoPaciente() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Atendimento ao Paciente</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de gestão e monitoramento do atendimento aos pacientes
          </p>
        </header>

        <Tabs defaultValue="agendamentos">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="agendamentos" className="text-sm p-3">
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="prontuario" className="text-sm p-3">
              Prontuário Eletrônico
            </TabsTrigger>
            <TabsTrigger value="satisfacao" className="text-sm p-3">
              Satisfação
            </TabsTrigger>
            <TabsTrigger value="tratamentos" className="text-sm p-3">
              Tratamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendamentos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Agendamento de Consultas e Procedimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <AgendamentoConsultas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prontuario" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prontuário Eletrônico do Paciente (PEP)</CardTitle>
              </CardHeader>
              <CardContent>
                <ProntuarioEletronico />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="satisfacao" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Monitoramento da Satisfação do Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <SatisfacaoPaciente />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tratamentos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Acompanhamento de Tratamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <AcompanhamentoTratamentos />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
