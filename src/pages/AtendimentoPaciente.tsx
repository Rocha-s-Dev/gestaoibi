
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SatisfacaoPaciente } from "@/components/saude/SatisfacaoPaciente";
import { AcompanhamentoTratamentos } from "@/components/saude/AcompanhamentoTratamentos";

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

        <Tabs defaultValue="satisfacao">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="satisfacao" className="text-sm p-3">
              Satisfação do Paciente
            </TabsTrigger>
            <TabsTrigger value="tratamentos" className="text-sm p-3">
              Acompanhamento de Tratamentos
            </TabsTrigger>
          </TabsList>

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
