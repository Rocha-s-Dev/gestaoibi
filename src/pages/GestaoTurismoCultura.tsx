import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Palette, Calendar, MapPin, Route, Handshake } from "lucide-react";
import { useTurismoCultura } from "@/hooks/useTurismoCultura";

export default function GestaoTurismoCultura() {
  const [activeTab, setActiveTab] = useState("equipamentos");
  const { equipamentos, agentes, projetos, eventos, pontosTuristicos, roteiros, parceiros } = useTurismoCultura();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secretaria de Turismo, Cultura e Eventos</h1>
          <p className="text-muted-foreground">Gestão cultural, eventos oficiais e turismo municipal</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Equipamentos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{equipamentos.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Eventos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{eventos.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pontos Turísticos</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{pontosTuristicos.length}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Parceiros</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{parceiros.length}</div></CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="equipamentos"><Building2 className="h-4 w-4 mr-1" />Equipamentos</TabsTrigger>
            <TabsTrigger value="agentes"><Users className="h-4 w-4 mr-1" />Agentes</TabsTrigger>
            <TabsTrigger value="projetos"><Palette className="h-4 w-4 mr-1" />Projetos</TabsTrigger>
            <TabsTrigger value="eventos"><Calendar className="h-4 w-4 mr-1" />Eventos</TabsTrigger>
            <TabsTrigger value="pontos"><MapPin className="h-4 w-4 mr-1" />Pontos</TabsTrigger>
            <TabsTrigger value="roteiros"><Route className="h-4 w-4 mr-1" />Roteiros</TabsTrigger>
            <TabsTrigger value="parceiros"><Handshake className="h-4 w-4 mr-1" />Parceiros</TabsTrigger>
          </TabsList>
          <TabsContent value="equipamentos"><Card><CardHeader><CardTitle>Equipamentos Culturais</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Gerencie teatros, museus, bibliotecas e centros culturais.</p></CardContent></Card></TabsContent>
          <TabsContent value="agentes"><Card><CardHeader><CardTitle>Agentes Culturais</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{agentes.length} agentes cadastrados.</p></CardContent></Card></TabsContent>
          <TabsContent value="projetos"><Card><CardHeader><CardTitle>Projetos Culturais</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{projetos.length} projetos em andamento.</p></CardContent></Card></TabsContent>
          <TabsContent value="eventos"><Card><CardHeader><CardTitle>Eventos Municipais</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{eventos.length} eventos cadastrados.</p></CardContent></Card></TabsContent>
          <TabsContent value="pontos"><Card><CardHeader><CardTitle>Pontos Turísticos</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{pontosTuristicos.length} pontos turísticos.</p></CardContent></Card></TabsContent>
          <TabsContent value="roteiros"><Card><CardHeader><CardTitle>Roteiros Turísticos</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{roteiros.length} roteiros disponíveis.</p></CardContent></Card></TabsContent>
          <TabsContent value="parceiros"><Card><CardHeader><CardTitle>Parceiros de Turismo</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{parceiros.length} parceiros cadastrados.</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
