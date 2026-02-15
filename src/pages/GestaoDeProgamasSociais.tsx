import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BeneficiariosList } from "@/components/social/BeneficiariosList";
import { AcompanhamentoProgramas } from "@/components/social/AcompanhamentoProgramas";
import { MetasBeneficiarios } from "@/components/social/MetasBeneficiarios";
import { DashboardSocial } from "@/components/social/DashboardSocial";
import { UnidadesCRAS } from "@/components/social/UnidadesCRAS";
import { CadUnicoFamilias } from "@/components/social/CadUnicoFamilias";
import { AtendimentoSocialComponent } from "@/components/social/AtendimentoSocial";
import { VisitasDomiciliares } from "@/components/social/VisitasDomiciliares";
import { EquipeSecretaria } from "@/components/shared/EquipeSecretaria";

export default function GestaoDeProgramasSociais() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBeneficiarioAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Programas Sociais</h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento de programas e beneficiários da Secretaria Municipal de Desenvolvimento Social
          </p>
        </header>

        <Tabs defaultValue="dashboard">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="unidades">CRAS/CREAS</TabsTrigger>
            <TabsTrigger value="cadunico">CadÚnico</TabsTrigger>
            <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
            <TabsTrigger value="visitas">Visitas</TabsTrigger>
            <TabsTrigger value="beneficiarios">Beneficiários</TabsTrigger>
            <TabsTrigger value="acompanhamento">Programas</TabsTrigger>
            <TabsTrigger value="metas">Metas</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardSocial />
          </TabsContent>

          <TabsContent value="unidades" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Unidades Socioassistenciais (CRAS/CREAS)</CardTitle></CardHeader>
              <CardContent><UnidadesCRAS /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cadunico" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Cadastro Único - Famílias</CardTitle></CardHeader>
              <CardContent><CadUnicoFamilias /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atendimentos" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Atendimento Social</CardTitle></CardHeader>
              <CardContent><AtendimentoSocialComponent /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitas" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Visitas Domiciliares</CardTitle></CardHeader>
              <CardContent><VisitasDomiciliares /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="beneficiarios" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Cadastro de Beneficiários</CardTitle></CardHeader>
              <CardContent>
                <BeneficiariosList refreshTrigger={refreshTrigger} onBeneficiarioAdded={handleBeneficiarioAdded} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acompanhamento" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Acompanhamento de Programas</CardTitle></CardHeader>
              <CardContent><AcompanhamentoProgramas /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Metas de Beneficiários</CardTitle></CardHeader>
              <CardContent><MetasBeneficiarios /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipe" className="mt-6">
            <EquipeSecretaria titulo="Equipe - Desenvolvimento Social" descricao="Assistentes sociais, psicólogos e técnicos da secretaria" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
