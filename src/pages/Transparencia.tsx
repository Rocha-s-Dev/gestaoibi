
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicacaoRelatorios } from "@/components/governo/PublicacaoRelatorios";
import { PortalTransparencia } from "@/components/governo/PortalTransparencia";

export default function Transparencia() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Transparência</h1>
          <p className="text-muted-foreground mt-2">
            Portal de transparência e publicação de relatórios governamentais
          </p>
        </header>

        <Tabs defaultValue="relatorios">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="relatorios" className="text-sm p-3">
              Publicação de Relatórios
            </TabsTrigger>
            <TabsTrigger value="portal" className="text-sm p-3">
              Portal da Transparência
            </TabsTrigger>
          </TabsList>

          <TabsContent value="relatorios" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Publicação de Relatórios</CardTitle>
              </CardHeader>
              <CardContent>
                <PublicacaoRelatorios />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Portal da Transparência</CardTitle>
              </CardHeader>
              <CardContent>
                <PortalTransparencia />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
