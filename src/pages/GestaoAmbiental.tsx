import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProgramasSustentabilidade } from "@/components/ambiental/ProgramasSustentabilidade";
import { MetasAmbientais } from "@/components/ambiental/MetasAmbientais";
import { LicenciamentoAmbiental } from "@/components/ambiental/LicenciamentoAmbiental";
import { DenunciasAmbientais } from "@/components/ambiental/DenunciasAmbientais";

export default function GestaoAmbiental() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

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
          <TabsList className="grid w-full md:w-[800px] grid-cols-4">
            <TabsTrigger value="programas">Programas</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="licenciamento">Licenciamento</TabsTrigger>
            <TabsTrigger value="denuncias">Denúncias</TabsTrigger>
          </TabsList>

          <TabsContent value="programas" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Programas de Sustentabilidade</CardTitle></CardHeader>
              <CardContent>
                <ProgramasSustentabilidade refreshTrigger={refreshTrigger} onProgramaAdded={handleRefresh} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Metas Ambientais</CardTitle></CardHeader>
              <CardContent>
                <MetasAmbientais refreshTrigger={refreshTrigger} onMetaAdded={handleRefresh} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenciamento" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Licenciamento Ambiental</CardTitle></CardHeader>
              <CardContent>
                <LicenciamentoAmbiental />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="denuncias" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Denúncias e Fiscalização Ambiental</CardTitle></CardHeader>
              <CardContent>
                <DenunciasAmbientais />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
