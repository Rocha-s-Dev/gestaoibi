
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SistemaChamadas } from "@/components/infraestrutura/SistemaChamadas";
import { MetasManutencao } from "@/components/infraestrutura/MetasManutencao";

export default function Manutencao() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Manutenção</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de solicitações e acompanhamento de manutenções públicas
          </p>
        </header>

        <Tabs defaultValue="chamadas">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="chamadas" className="text-sm p-3">
              Sistema de Chamadas
            </TabsTrigger>
            <TabsTrigger value="metas" className="text-sm p-3">
              Metas de Manutenção
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chamadas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro e Acompanhamento de Solicitações</CardTitle>
              </CardHeader>
              <CardContent>
                <SistemaChamadas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Metas de Tempo de Resposta</CardTitle>
              </CardHeader>
              <CardContent>
                <MetasManutencao />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
