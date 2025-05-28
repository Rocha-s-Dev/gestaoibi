
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CadastroObras } from "@/components/infraestrutura/CadastroObras";

export default function GestaoObras() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Obras</h1>
          <p className="text-muted-foreground mt-2">
            Controle e acompanhamento de obras públicas municipais
          </p>
        </header>

        <Tabs defaultValue="cadastro">
          <TabsList className="grid w-full grid-cols-1 h-auto">
            <TabsTrigger value="cadastro" className="text-sm p-3">
              Cadastro de Obras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro e Controle de Obras</CardTitle>
              </CardHeader>
              <CardContent>
                <CadastroObras />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
