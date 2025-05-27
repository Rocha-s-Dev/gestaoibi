
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GestaoEditais } from "@/components/cultura/GestaoEditais";

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
          <TabsList className="grid w-full grid-cols-1 h-auto">
            <TabsTrigger value="editais" className="text-sm p-3">
              Gestão de Editais
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
        </Tabs>
      </div>
    </Layout>
  );
}
