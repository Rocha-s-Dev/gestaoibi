import { Layout } from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Users } from "lucide-react";
import { CadastroObras } from "@/components/infraestrutura/CadastroObras";
import { AcompanhamentoObras } from "@/components/infraestrutura/AcompanhamentoObras";
import { MetasObras } from "@/components/infraestrutura/MetasObras";
import { DashboardInfraestrutura } from "@/components/infraestrutura/DashboardInfraestrutura";
import { EquipeSecretaria } from "@/components/shared/EquipeSecretaria";

export default function GestaoObras() {
  return (
    <Layout>
      <div className="space-y-6 p-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Obras</h1>
          <p className="text-muted-foreground mt-2">Controle e acompanhamento de obras públicas municipais</p>
        </header>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="dashboard" className="text-sm p-3"><LayoutDashboard className="h-4 w-4 mr-1" />Dashboard</TabsTrigger>
            <TabsTrigger value="cadastro" className="text-sm p-3">Cadastro de Obras</TabsTrigger>
            <TabsTrigger value="acompanhamento" className="text-sm p-3">Acompanhamento</TabsTrigger>
            <TabsTrigger value="metas" className="text-sm p-3">Metas</TabsTrigger>
            <TabsTrigger value="equipe" className="text-sm p-3"><Users className="h-4 w-4 mr-1" />Equipe</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6"><DashboardInfraestrutura /></TabsContent>
          <TabsContent value="cadastro" className="mt-6"><Card><CardHeader><CardTitle>Registro e Controle de Obras</CardTitle></CardHeader><CardContent><CadastroObras /></CardContent></Card></TabsContent>
          <TabsContent value="acompanhamento" className="mt-6"><Card><CardHeader><CardTitle>Monitoramento e Documentação</CardTitle></CardHeader><CardContent><AcompanhamentoObras /></CardContent></Card></TabsContent>
          <TabsContent value="metas" className="mt-6"><Card><CardHeader><CardTitle>Metas de Conclusão de Obras</CardTitle></CardHeader><CardContent><MetasObras /></CardContent></Card></TabsContent>
          <TabsContent value="equipe" className="mt-6"><EquipeSecretaria titulo="Equipe - Infraestrutura" descricao="Engenheiros, fiscais e técnicos da secretaria" /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
