import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Route, Handshake, BarChart3, LayoutDashboard } from "lucide-react";
import { useTurismoCultura } from "@/hooks/useTurismoCultura";
import { PontosTuristicosTab } from "@/components/turismo/PontosTuristicosTab";
import { RoteirosTuristicosTab } from "@/components/turismo/RoteirosTuristicosTab";
import { ParceirosTurismoTab } from "@/components/turismo/ParceirosTurismoTab";
import { IndicadoresVisitacaoTab } from "@/components/turismo/IndicadoresVisitacaoTab";
import { DashboardTurismo } from "@/components/turismo/DashboardTurismo";

export default function GestaoTurismoCultura() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turismo e Roteiros</h1>
          <p className="text-muted-foreground">Gestão de pontos turísticos, roteiros e parceiros do turismo municipal</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard"><LayoutDashboard className="h-4 w-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="pontos"><MapPin className="h-4 w-4 mr-1" />Pontos</TabsTrigger>
            <TabsTrigger value="roteiros"><Route className="h-4 w-4 mr-1" />Roteiros</TabsTrigger>
            <TabsTrigger value="parceiros"><Handshake className="h-4 w-4 mr-1" />Parceiros</TabsTrigger>
            <TabsTrigger value="indicadores"><BarChart3 className="h-4 w-4 mr-1" />Indicadores</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><DashboardTurismo /></TabsContent>
          <TabsContent value="pontos"><PontosTuristicosTab /></TabsContent>
          <TabsContent value="roteiros"><RoteirosTuristicosTab /></TabsContent>
          <TabsContent value="parceiros"><ParceirosTurismoTab /></TabsContent>
          <TabsContent value="indicadores"><IndicadoresVisitacaoTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
