import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Users, Route, AlertTriangle, LayoutDashboard, Ambulance, UsersRound } from "lucide-react";
import { GestaoFrota } from "@/components/transportes/GestaoFrota";
import { GestaoMotoristas } from "@/components/transportes/GestaoMotoristas";
import { TransportePublicoTab } from "@/components/transportes/TransportePublicoTab";
import { TransitoTab } from "@/components/transportes/TransitoTab";
import { DashboardTransportes } from "@/components/transportes/DashboardTransportes";
import { DesignacaoVeiculosTFD } from "@/components/transportes/DesignacaoVeiculosTFD";
import { EquipeSecretaria } from "@/components/shared/EquipeSecretaria";

export default function GestaoTransportes() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secretaria de Transportes e Trânsito</h1>
          <p className="text-muted-foreground">Gestão da frota municipal, motoristas, transporte público e mobilidade urbana</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="frota" className="flex items-center gap-2"><Car className="h-4 w-4" />Frota</TabsTrigger>
            <TabsTrigger value="motoristas" className="flex items-center gap-2"><Users className="h-4 w-4" />Motoristas</TabsTrigger>
            <TabsTrigger value="tfd" className="flex items-center gap-2"><Ambulance className="h-4 w-4" />TFD</TabsTrigger>
            <TabsTrigger value="transporte-publico" className="flex items-center gap-2"><Route className="h-4 w-4" />Transporte Público</TabsTrigger>
            <TabsTrigger value="transito" className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Trânsito</TabsTrigger>
            <TabsTrigger value="equipe" className="flex items-center gap-2"><UsersRound className="h-4 w-4" />Equipe</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><DashboardTransportes /></TabsContent>
          <TabsContent value="frota"><GestaoFrota /></TabsContent>
          <TabsContent value="motoristas"><GestaoMotoristas /></TabsContent>
          <TabsContent value="tfd"><DesignacaoVeiculosTFD /></TabsContent>
          <TabsContent value="transporte-publico"><TransportePublicoTab /></TabsContent>
          <TabsContent value="transito"><TransitoTab /></TabsContent>
          <TabsContent value="equipe"><EquipeSecretaria titulo="Equipe de Transportes e Trânsito" descricao="Gestão dos funcionários vinculados à Secretaria de Transportes e Trânsito" /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
