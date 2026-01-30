import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { ServidoresManagement } from "@/components/admin/ServidoresManagement";
import { CargosPublicosManagement } from "@/components/admin/CargosPublicosManagement";
import { FuncoesAdministrativasManagement } from "@/components/admin/FuncoesAdministrativasManagement";
import { PapeisUsuarioManagement } from "@/components/admin/PapeisUsuarioManagement";
import { FolhaPagamentoManagement } from "@/components/rh/FolhaPagamentoManagement";
import { PontoFrequenciaManagement } from "@/components/rh/PontoFrequenciaManagement";
import { FeriasLicencasManagement } from "@/components/rh/FeriasLicencasManagement";
import { ProcessosTrabalhistasManagement } from "@/components/rh/ProcessosTrabalhistasManagement";
import { RelatoriosLegaisManagement } from "@/components/rh/RelatoriosLegaisManagement";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { 
  Users, Briefcase, Award, Shield, Lock, 
  Banknote, Clock, Palmtree, Gavel, FileSpreadsheet 
} from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

function AccessDenied() {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-destructive" />
          <CardTitle>Acesso Negado</CardTitle>
        </div>
        <CardDescription>
          Você não tem permissão para acessar esta área. Entre em contato com o administrador do sistema.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function AdminRH() {
  const [activeTab, setActiveTab] = useState("servidores");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestão de RH e Permissões</h1>
          <p className="text-muted-foreground">
            Módulo completo de Recursos Humanos: servidores, folha, frequência, férias e relatórios legais
          </p>
        </div>

        <PermissionGuard
          requiredRoles={["admin_municipal", "secretario"]}
          requireAny
          fallback={<AccessDenied />}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-max">
                <TabsTrigger value="servidores" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Servidores</span>
                </TabsTrigger>
                <TabsTrigger value="cargos" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Cargos</span>
                </TabsTrigger>
                <TabsTrigger value="funcoes" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Funções</span>
                </TabsTrigger>
                <TabsTrigger value="folha" className="flex items-center gap-2">
                  <Banknote className="h-4 w-4" />
                  <span className="hidden sm:inline">Folha</span>
                </TabsTrigger>
                <TabsTrigger value="ponto" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Frequência</span>
                </TabsTrigger>
                <TabsTrigger value="ferias" className="flex items-center gap-2">
                  <Palmtree className="h-4 w-4" />
                  <span className="hidden sm:inline">Férias</span>
                </TabsTrigger>
                <TabsTrigger value="processos" className="flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  <span className="hidden sm:inline">Processos</span>
                </TabsTrigger>
                <TabsTrigger value="relatorios" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="hidden sm:inline">Relatórios</span>
                </TabsTrigger>
                <TabsTrigger value="papeis" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Permissões</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <TabsContent value="servidores" className="mt-6">
              <ServidoresManagement />
            </TabsContent>

            <TabsContent value="cargos" className="mt-6">
              <CargosPublicosManagement />
            </TabsContent>

            <TabsContent value="funcoes" className="mt-6">
              <FuncoesAdministrativasManagement />
            </TabsContent>

            <TabsContent value="folha" className="mt-6">
              <FolhaPagamentoManagement />
            </TabsContent>

            <TabsContent value="ponto" className="mt-6">
              <PontoFrequenciaManagement />
            </TabsContent>

            <TabsContent value="ferias" className="mt-6">
              <FeriasLicencasManagement />
            </TabsContent>

            <TabsContent value="processos" className="mt-6">
              <ProcessosTrabalhistasManagement />
            </TabsContent>

            <TabsContent value="relatorios" className="mt-6">
              <RelatoriosLegaisManagement />
            </TabsContent>

            <TabsContent value="papeis" className="mt-6">
              <PapeisUsuarioManagement />
            </TabsContent>
          </Tabs>
        </PermissionGuard>
      </div>
    </Layout>
  );
}
