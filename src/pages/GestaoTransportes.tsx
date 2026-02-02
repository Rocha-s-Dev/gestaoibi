import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Users, Route, AlertTriangle } from "lucide-react";
import { GestaoFrota } from "@/components/transportes/GestaoFrota";
import { GestaoMotoristas } from "@/components/transportes/GestaoMotoristas";
import { TransportePublicoTab } from "@/components/transportes/TransportePublicoTab";
import { TransitoTab } from "@/components/transportes/TransitoTab";

export default function GestaoTransportes() {
  const [activeTab, setActiveTab] = useState("frota");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secretaria de Transportes e Trânsito</h1>
          <p className="text-muted-foreground">Gestão da frota municipal, motoristas, transporte público e mobilidade urbana</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="frota" className="flex items-center gap-2"><Car className="h-4 w-4" />Frota</TabsTrigger>
            <TabsTrigger value="motoristas" className="flex items-center gap-2"><Users className="h-4 w-4" />Motoristas</TabsTrigger>
            <TabsTrigger value="transporte-publico" className="flex items-center gap-2"><Route className="h-4 w-4" />Transporte Público</TabsTrigger>
            <TabsTrigger value="transito" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Trânsito</TabsTrigger>
          </TabsList>
          <TabsContent value="frota"><GestaoFrota /></TabsContent>
          <TabsContent value="motoristas"><GestaoMotoristas /></TabsContent>
          <TabsContent value="transporte-publico"><TransportePublicoTab /></TabsContent>
          <TabsContent value="transito"><TransitoTab /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
