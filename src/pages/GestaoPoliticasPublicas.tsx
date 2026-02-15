
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroPoliticas } from "@/components/governo/CadastroPoliticas";
import { AcompanhamentoPoliticas } from "@/components/governo/AcompanhamentoPoliticas";
import { MetasPoliticasPublicas } from "@/components/governo/MetasPoliticasPublicas";
import { EquipeSecretaria } from "@/components/shared/EquipeSecretaria";

export default function GestaoPoliticasPublicas() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Políticas Públicas</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de cadastro e acompanhamento de políticas públicas implementadas
          </p>
        </header>

        <Tabs defaultValue="cadastro">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="cadastro" className="text-sm p-3">
              Cadastro de Políticas
            </TabsTrigger>
            <TabsTrigger value="acompanhamento" className="text-sm p-3">
              Acompanhamento
            </TabsTrigger>
            <TabsTrigger value="metas" className="text-sm p-3">
              Metas
            </TabsTrigger>
            <TabsTrigger value="equipe" className="text-sm p-3">
              Equipe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastro de Políticas Públicas</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastroPoliticas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acompanhamento" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Acompanhamento de Políticas</CardTitle>
              </CardHeader>
              <CardContent>
                <AcompanhamentoPoliticas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Metas de Políticas Públicas</CardTitle>
              </CardHeader>
              <CardContent>
                <MetasPoliticasPublicas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipe" className="mt-6">
            <EquipeSecretaria titulo="Equipe - Governo" descricao="Assessores e técnicos da Secretaria Municipal de Governo" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
