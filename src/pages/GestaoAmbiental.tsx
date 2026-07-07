import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users, Search, Shield, Building2, TreePine, Flame, Recycle, GraduationCap, BarChart3, MapPin } from "lucide-react";
import { ProgramasSustentabilidade } from "@/components/ambiental/ProgramasSustentabilidade";
import { MetasAmbientais } from "@/components/ambiental/MetasAmbientais";
import { LicenciamentoAmbiental } from "@/components/ambiental/LicenciamentoAmbiental";
import { DenunciasAmbientais } from "@/components/ambiental/DenunciasAmbientais";
import { DashboardAmbiental } from "@/components/ambiental/DashboardAmbiental";
import { EquipeAmbiental } from "@/components/ambiental/EquipeAmbiental";
import { FiscalizacoesAmbientais } from "@/components/ambiental/FiscalizacoesAmbientais";
import { AutosInfracaoAmbiental } from "@/components/ambiental/AutosInfracaoAmbiental";
import { EmpreendimentosAmbientais } from "@/components/ambiental/EmpreendimentosAmbientais";
import { AreasProtegidas } from "@/components/ambiental/AreasProtegidas";
import { OcorrenciasQueimadas } from "@/components/ambiental/OcorrenciasQueimadas";
import { ResiduosSolidos } from "@/components/ambiental/ResiduosSolidos";
import { ArvoresUrbanas } from "@/components/ambiental/ArvoresUrbanas";
import { EducacaoAmbiental } from "@/components/ambiental/EducacaoAmbiental";
import { IndicadoresAmbientais } from "@/components/ambiental/IndicadoresAmbientais";
import { MapaAmbiental } from "@/components/ambiental/MapaAmbiental";

export default function GestaoAmbiental() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão Ambiental</h1>
          <p className="text-muted-foreground mt-2">
            Sistema completo de gestão ambiental da Secretaria Municipal de Meio Ambiente
          </p>
        </header>

        <Tabs defaultValue="dashboard">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard"><LayoutDashboard className="h-4 w-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="programas">Programas</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="licenciamento">Licenciamento</TabsTrigger>
            <TabsTrigger value="denuncias">Denúncias</TabsTrigger>
            <TabsTrigger value="fiscalizacoes"><Search className="h-4 w-4 mr-1" />Fiscalizações</TabsTrigger>
            <TabsTrigger value="infracoes"><Shield className="h-4 w-4 mr-1" />Infrações</TabsTrigger>
            <TabsTrigger value="empreendimentos"><Building2 className="h-4 w-4 mr-1" />Empreendimentos</TabsTrigger>
            <TabsTrigger value="areas"><TreePine className="h-4 w-4 mr-1" />Áreas Protegidas</TabsTrigger>
            <TabsTrigger value="queimadas"><Flame className="h-4 w-4 mr-1" />Queimadas</TabsTrigger>
            <TabsTrigger value="residuos"><Recycle className="h-4 w-4 mr-1" />Resíduos</TabsTrigger>
            <TabsTrigger value="arborizacao"><TreePine className="h-4 w-4 mr-1" />Arborização</TabsTrigger>
            <TabsTrigger value="educacao"><GraduationCap className="h-4 w-4 mr-1" />Educação Amb.</TabsTrigger>
            <TabsTrigger value="indicadores"><BarChart3 className="h-4 w-4 mr-1" />Indicadores</TabsTrigger>
            <TabsTrigger value="mapa"><MapPin className="h-4 w-4 mr-1" />Mapa</TabsTrigger>
            <TabsTrigger value="equipe"><Users className="h-4 w-4 mr-1" />Equipe</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6"><DashboardAmbiental /></TabsContent>

          <TabsContent value="programas" className="mt-6">
            <Card><CardHeader><CardTitle>Programas de Sustentabilidade</CardTitle></CardHeader>
              <CardContent><ProgramasSustentabilidade refreshTrigger={refreshTrigger} onProgramaAdded={handleRefresh} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card><CardHeader><CardTitle>Metas Ambientais</CardTitle></CardHeader>
              <CardContent><MetasAmbientais refreshTrigger={refreshTrigger} onMetaAdded={handleRefresh} /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenciamento" className="mt-6">
            <Card><CardHeader><CardTitle>Licenciamento Ambiental</CardTitle></CardHeader>
              <CardContent><LicenciamentoAmbiental /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="denuncias" className="mt-6">
            <Card><CardHeader><CardTitle>Denúncias e Fiscalização Ambiental</CardTitle></CardHeader>
              <CardContent><DenunciasAmbientais /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fiscalizacoes" className="mt-6">
            <Card><CardHeader><CardTitle>Fiscalizações Ambientais</CardTitle></CardHeader>
              <CardContent><FiscalizacoesAmbientais /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="infracoes" className="mt-6">
            <Card><CardHeader><CardTitle>Autos de Infração Ambiental</CardTitle></CardHeader>
              <CardContent><AutosInfracaoAmbiental /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="empreendimentos" className="mt-6">
            <Card><CardHeader><CardTitle>Cadastro de Empreendimentos</CardTitle></CardHeader>
              <CardContent><EmpreendimentosAmbientais /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="areas" className="mt-6">
            <Card><CardHeader><CardTitle>Áreas Ambientais Protegidas</CardTitle></CardHeader>
              <CardContent><AreasProtegidas /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queimadas" className="mt-6">
            <Card><CardHeader><CardTitle>Controle de Queimadas</CardTitle></CardHeader>
              <CardContent><OcorrenciasQueimadas /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="residuos" className="mt-6">
            <Card><CardHeader><CardTitle>Gestão de Resíduos Sólidos</CardTitle></CardHeader>
              <CardContent><ResiduosSolidos /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arborizacao" className="mt-6">
            <Card><CardHeader><CardTitle>Arborização Urbana</CardTitle></CardHeader>
              <CardContent><ArvoresUrbanas /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="educacao" className="mt-6">
            <Card><CardHeader><CardTitle>Educação Ambiental</CardTitle></CardHeader>
              <CardContent><EducacaoAmbiental /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="indicadores" className="mt-6">
            <Card><CardHeader><CardTitle>Monitoramento Ambiental</CardTitle></CardHeader>
              <CardContent><IndicadoresAmbientais /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapa" className="mt-6">
            <MapaAmbiental />
          </TabsContent>

          <TabsContent value="equipe" className="mt-6">
            <EquipeSecretaria titulo="Equipe - Meio Ambiente" descricao="Fiscais ambientais, biólogos e técnicos da secretaria" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
