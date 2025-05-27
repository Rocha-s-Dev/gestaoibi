
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjetosList } from "@/components/cultura/ProjetosList";
import { CalendarioEventos } from "@/components/cultura/CalendarioEventos";
import { MetasProjetos } from "@/components/cultura/MetasProjetos";

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
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
            <TabsTrigger value="projetos" className="text-xs sm:text-sm p-2 sm:p-3">
              Cadastro e Acompanhamento
            </TabsTrigger>
            <TabsTrigger value="calendario" className="text-xs sm:text-sm p-2 sm:p-3">
              Calendário de Eventos
            </TabsTrigger>
            <TabsTrigger value="metas" className="text-xs sm:text-sm p-2 sm:p-3">
              Metas de Projetos
            </TabsTrigger>
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

          <TabsContent value="metas" className="mt-6">
            <MetasProjetos />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
