
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramasSustentabilidade } from "@/components/ambiental/ProgramasSustentabilidade";

export default function GestaoAmbiental() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleProgramaAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão Ambiental</h1>
          <p className="text-muted-foreground mt-2">
            Registro e acompanhamento de iniciativas ambientais da Secretaria Municipal de Desenvolvimento Econômico e Meio Ambiente
          </p>
        </header>

        <Tabs defaultValue="programas">
          <TabsList className="grid w-full md:w-[800px] grid-cols-1">
            <TabsTrigger value="programas">Programas de Sustentabilidade</TabsTrigger>
          </TabsList>

          <TabsContent value="programas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Programas de Sustentabilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgramasSustentabilidade refreshTrigger={refreshTrigger} onProgramaAdded={handleProgramaAdded} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
