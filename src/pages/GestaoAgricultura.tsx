import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tractor, Users, CalendarCheck, Gift, Store, LayoutDashboard } from "lucide-react";
import { ProdutoresRurais } from "@/components/agricultura/ProdutoresRurais";
import { PropriedadesRurais } from "@/components/agricultura/PropriedadesRurais";
import { AssistenciaTecnica } from "@/components/agricultura/AssistenciaTecnica";
import { ProgramasIncentivo } from "@/components/agricultura/ProgramasIncentivoRural";
import { FeirasLivres } from "@/components/agricultura/FeirasLivres";
import { DashboardAgricultura } from "@/components/agricultura/DashboardAgricultura";
import { EquipeSecretaria } from "@/components/shared/EquipeSecretaria";

export default function GestaoAgricultura() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Secretaria de Agricultura, Pecuária e Abastecimento</h1>
          <p className="text-muted-foreground">Cadastro rural, assistência técnica, programas de incentivo e feiras livres</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" />Dashboard</TabsTrigger>
            <TabsTrigger value="produtores" className="flex items-center gap-2"><Users className="h-4 w-4" />Produtores</TabsTrigger>
            <TabsTrigger value="propriedades" className="flex items-center gap-2"><Tractor className="h-4 w-4" />Propriedades</TabsTrigger>
            <TabsTrigger value="assistencia" className="flex items-center gap-2"><CalendarCheck className="h-4 w-4" />Assistência</TabsTrigger>
            <TabsTrigger value="incentivos" className="flex items-center gap-2"><Gift className="h-4 w-4" />Incentivos</TabsTrigger>
            <TabsTrigger value="feiras" className="flex items-center gap-2"><Store className="h-4 w-4" />Feiras</TabsTrigger>
            <TabsTrigger value="equipe" className="flex items-center gap-2"><Users className="h-4 w-4" />Equipe</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><DashboardAgricultura /></TabsContent>
          <TabsContent value="produtores"><ProdutoresRurais /></TabsContent>
          <TabsContent value="propriedades"><PropriedadesRurais /></TabsContent>
          <TabsContent value="assistencia"><AssistenciaTecnica /></TabsContent>
          <TabsContent value="incentivos"><ProgramasIncentivo /></TabsContent>
          <TabsContent value="feiras"><FeirasLivres /></TabsContent>
          <TabsContent value="equipe"><EquipeSecretaria titulo="Equipe - Agricultura" descricao="Técnicos agrícolas, veterinários e extensionistas da secretaria" /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
