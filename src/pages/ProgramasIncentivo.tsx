
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GestaoEditais } from "@/components/cultura/GestaoEditais";
import { MetasIncentivo } from "@/components/cultura/MetasIncentivo";

export default function ProgramasIncentivo() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Programas de Incentivo</h1>
          <p className="text-muted-foreground mt-2">
            Gestão de editais e programas de incentivo à cultura e ao esporte
          </p>
        </header>

        <Tabs defaultValue="editais">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 h-auto">
            <TabsTrigger value="editais" className="text-sm p-3">
              Gestão de Editais
            </TabsTrigger>
            <TabsTrigger value="metas" className="text-sm p-3">
              Metas de Incentivo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editais" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Editais de Incentivo</CardTitle>
              </CardHeader>
              <CardContent>
                <GestaoEditais />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Metas de Incentivo</CardTitle>
              </CardHeader>
              <CardContent>
                <MetasIncentivo />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
