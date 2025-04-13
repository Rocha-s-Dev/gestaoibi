
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeneficiariosList } from "@/components/social/BeneficiariosList";
import { AcompanhamentoProgramas } from "@/components/social/AcompanhamentoProgramas";
import { MetasBeneficiarios } from "@/components/social/MetasBeneficiarios";

export default function GestaoDeProgramasSociais() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBeneficiarioAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Programas Sociais</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento de programas e beneficiários da Secretaria Municipal de Desenvolvimento Social
          </p>
        </header>

        <Tabs defaultValue="beneficiarios">
          <TabsList className="grid w-full md:w-[800px] grid-cols-3">
            <TabsTrigger value="beneficiarios">Cadastro de Beneficiários</TabsTrigger>
            <TabsTrigger value="acompanhamento">Acompanhamento de Programas</TabsTrigger>
            <TabsTrigger value="metas">Metas de Beneficiários</TabsTrigger>
          </TabsList>

          <TabsContent value="beneficiarios" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Beneficiários</CardTitle>
              </CardHeader>
              <CardContent>
                <BeneficiariosList refreshTrigger={refreshTrigger} onBeneficiarioAdded={handleBeneficiarioAdded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acompanhamento" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Acompanhamento de Programas</CardTitle>
              </CardHeader>
              <CardContent>
                <AcompanhamentoProgramas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Metas de Beneficiários</CardTitle>
              </CardHeader>
              <CardContent>
                <MetasBeneficiarios />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
