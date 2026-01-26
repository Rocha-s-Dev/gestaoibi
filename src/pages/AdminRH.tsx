import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/layout/Layout";
import { ServidoresManagement } from "@/components/admin/ServidoresManagement";
import { CargosPublicosManagement } from "@/components/admin/CargosPublicosManagement";
import { FuncoesAdministrativasManagement } from "@/components/admin/FuncoesAdministrativasManagement";
import { PapeisUsuarioManagement } from "@/components/admin/PapeisUsuarioManagement";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { Users, Briefcase, Award, Shield, Lock } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
            Gerencie servidores, cargos públicos, funções administrativas e permissões
          </p>
        </div>

        <PermissionGuard
          requiredRoles={["admin_municipal", "secretario"]}
          requireAny
          fallback={<AccessDenied />}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
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
              <TabsTrigger value="papeis" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Permissões</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="servidores" className="mt-6">
              <ServidoresManagement />
            </TabsContent>

            <TabsContent value="cargos" className="mt-6">
              <CargosPublicosManagement />
            </TabsContent>

            <TabsContent value="funcoes" className="mt-6">
              <FuncoesAdministrativasManagement />
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
