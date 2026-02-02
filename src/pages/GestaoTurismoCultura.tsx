import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Route, Handshake, BarChart3 } from "lucide-react";
import { useTurismoCultura } from "@/hooks/useTurismoCultura";

export default function GestaoTurismoCultura() {
  const [activeTab, setActiveTab] = useState("pontos");
  const { pontosTuristicos, roteiros, parceiros, indicadores } = useTurismoCultura();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turismo e Roteiros</h1>
          <p className="text-muted-foreground">Gestão de pontos turísticos, roteiros e parceiros do turismo municipal</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pontos Turísticos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pontosTuristicos.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Roteiros</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{roteiros.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Parceiros</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{parceiros.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Indicadores</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{indicadores.length}</div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pontos"><MapPin className="h-4 w-4 mr-1" />Pontos Turísticos</TabsTrigger>
            <TabsTrigger value="roteiros"><Route className="h-4 w-4 mr-1" />Roteiros</TabsTrigger>
            <TabsTrigger value="parceiros"><Handshake className="h-4 w-4 mr-1" />Parceiros</TabsTrigger>
            <TabsTrigger value="indicadores"><BarChart3 className="h-4 w-4 mr-1" />Indicadores</TabsTrigger>
          </TabsList>
          <TabsContent value="pontos"><Card><CardHeader><CardTitle>Pontos Turísticos</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{pontosTuristicos.length} pontos turísticos cadastrados.</p></CardContent></Card></TabsContent>
          <TabsContent value="roteiros"><Card><CardHeader><CardTitle>Roteiros Turísticos</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{roteiros.length} roteiros disponíveis.</p></CardContent></Card></TabsContent>
          <TabsContent value="parceiros"><Card><CardHeader><CardTitle>Parceiros de Turismo</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{parceiros.length} parceiros cadastrados.</p></CardContent></Card></TabsContent>
          <TabsContent value="indicadores"><Card><CardHeader><CardTitle>Indicadores de Visitação</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{indicadores.length} registros de visitação.</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
