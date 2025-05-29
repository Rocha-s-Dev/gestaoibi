
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroUnidadesSaude } from "@/components/saude/CadastroUnidadesSaude";

export default function GestaoSaudePublica() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Saúde Pública</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de gestão e acompanhamento dos serviços de saúde pública
          </p>
        </header>

        <Tabs defaultValue="unidades">
          <TabsList className="grid w-full grid-cols-1 h-auto">
            <TabsTrigger value="unidades" className="text-sm p-3">
              Cadastro de Unidades de Saúde
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unidades" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Unidades e Serviços de Saúde</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastroUnidadesSaude />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
