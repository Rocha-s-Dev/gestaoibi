import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SistemaChamadas } from "@/components/infraestrutura/SistemaChamadas";
import { MetasManutencao } from "@/components/infraestrutura/MetasManutencao";
import { IluminacaoPublica } from "@/components/infraestrutura/IluminacaoPublica";
import { OrdensServico } from "@/components/infraestrutura/servicos/OrdensServico";
import { EquipesOperacionais } from "@/components/infraestrutura/servicos/EquipesOperacionais";
import { EquipamentosOperacionais } from "@/components/infraestrutura/servicos/EquipamentosOperacionais";
import { MapaServicos } from "@/components/infraestrutura/servicos/MapaServicos";
import { DashboardServicos } from "@/components/infraestrutura/servicos/DashboardServicos";

export default function Manutencao() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Serviços Urbanos e Manutenção</h1>
          <p className="text-muted-foreground mt-2">
            Ordens de serviço, equipes operacionais, equipamentos, iluminação pública e acompanhamento de manutenções
          </p>
        </header>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto">
            <TabsTrigger value="dashboard" className="text-sm p-3">Dashboard</TabsTrigger>
            <TabsTrigger value="ordens" className="text-sm p-3">Ordens de Serviço</TabsTrigger>
            <TabsTrigger value="equipes" className="text-sm p-3">Equipes</TabsTrigger>
            <TabsTrigger value="equipamentos" className="text-sm p-3">Equipamentos</TabsTrigger>
            <TabsTrigger value="mapa" className="text-sm p-3">Mapa</TabsTrigger>
            <TabsTrigger value="chamadas" className="text-sm p-3">Chamadas</TabsTrigger>
            <TabsTrigger value="iluminacao" className="text-sm p-3">Iluminação</TabsTrigger>
            <TabsTrigger value="metas" className="text-sm p-3">Metas</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardServicos />
          </TabsContent>

          <TabsContent value="ordens" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Ordens de Serviço</CardTitle></CardHeader>
              <CardContent><OrdensServico /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipes" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Equipes Operacionais</CardTitle></CardHeader>
              <CardContent><EquipesOperacionais /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipamentos" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Máquinas e Equipamentos</CardTitle></CardHeader>
              <CardContent><EquipamentosOperacionais /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapa" className="mt-6">
            <MapaServicos />
          </TabsContent>

          <TabsContent value="chamadas" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Registro e Acompanhamento de Solicitações</CardTitle></CardHeader>
              <CardContent><SistemaChamadas /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="iluminacao" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Iluminação Pública</CardTitle></CardHeader>
              <CardContent><IluminacaoPublica /></CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader><CardTitle>Metas de Tempo de Resposta</CardTitle></CardHeader>
              <CardContent><MetasManutencao /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
