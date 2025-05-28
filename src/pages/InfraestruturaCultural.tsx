
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EspacosCulturais } from "@/components/cultura/EspacosCulturais";
import { ReservasAgendamentos } from "@/components/cultura/ReservasAgendamentos";

export default function InfraestruturaCultural() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Infraestrutura Cultural</h1>
          <p className="text-muted-foreground mt-2">
            Gestão de espaços culturais e esportivos disponíveis para eventos
          </p>
        </header>

        <Tabs defaultValue="espacos">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="espacos" className="text-sm p-3">
              Espaços Culturais e Esportivos
            </TabsTrigger>
            <TabsTrigger value="reservas" className="text-sm p-3">
              Reservas e Agendamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="espacos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Espaços</CardTitle>
              </CardHeader>
              <CardContent>
                <EspacosCulturais />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Reservas e Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ReservasAgendamentos />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
