import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { DashboardAlmoxarifado } from "@/components/almoxarifado/DashboardAlmoxarifado";
import { MateriaisAlmoxarifado } from "@/components/almoxarifado/MateriaisAlmoxarifado";
import { ConfiguracoesAlmoxarifado } from "@/components/almoxarifado/ConfiguracoesAlmoxarifado";
import { Warehouse } from "lucide-react";

export default function Almoxarifado() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Warehouse className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Almoxarifado Central</h1>
            <p className="text-sm text-muted-foreground">
              Cadastro de materiais de consumo, categorias, unidades de medida e localizações.
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Painel</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6"><DashboardAlmoxarifado /></TabsContent>
          <TabsContent value="materiais" className="mt-6"><MateriaisAlmoxarifado /></TabsContent>
          <TabsContent value="config" className="mt-6"><ConfiguracoesAlmoxarifado /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
