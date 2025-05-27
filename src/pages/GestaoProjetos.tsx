
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjetosList } from "@/components/cultura/ProjetosList";
import { CalendarioEventos } from "@/components/cultura/CalendarioEventos";

export default function GestaoProjetos() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProjetoAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Projetos e Eventos</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento de projetos culturais e esportivos da Secretaria Municipal de Cultura, Esporte e Lazer
          </p>
        </header>

        <Tabs defaultValue="projetos">
          <TabsList className="grid w-full md:w-[800px] grid-cols-2">
            <TabsTrigger value="projetos">Cadastro e Acompanhamento de Projetos</TabsTrigger>
            <TabsTrigger value="calendario">Calendário de Eventos</TabsTrigger>
          </TabsList>

          <TabsContent value="projetos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Projetos Culturais e Esportivos</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjetosList refreshTrigger={refreshTrigger} onProjetoAdded={handleProjetoAdded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario" className="mt-6">
            <CalendarioEventos />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
