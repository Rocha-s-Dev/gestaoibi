
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BusinessRegistration } from "@/components/desenvolvimento/BusinessRegistration";
import { BusinessList } from "@/components/desenvolvimento/BusinessList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DesenvolvimentoEmpresas() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBusinessAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Empreendimentos</h1>
          <p className="text-muted-foreground mt-2">
            Registro e acompanhamento de empresas da Secretaria Municipal de Desenvolvimento Econômico e Meio Ambiente
          </p>
        </header>

        <Tabs defaultValue="cadastro">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="cadastro">Cadastro de Empresas</TabsTrigger>
            <TabsTrigger value="lista">Empresas Registradas</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Nova Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <BusinessRegistration onBusinessAdded={handleBusinessAdded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lista" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Empresas Registradas</CardTitle>
              </CardHeader>
              <CardContent>
                <BusinessList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
