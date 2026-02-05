import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  LayoutDashboard, 
  Calendar, 
  Target, 
  Building2, 
  FileText, 
  Megaphone, 
  FileBarChart,
  AlertTriangle,
  Shield
} from "lucide-react";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { DashboardEstrategico } from "@/components/gabinete/DashboardEstrategico";
import { AgendaGovernamental } from "@/components/gabinete/AgendaGovernamental";
import { MetasPlanoGoverno } from "@/components/gabinete/MetasPlanoGoverno";
import { ObrasPrioritarias } from "@/components/gabinete/ObrasPrioritarias";
import { AtosAdministrativos } from "@/components/gabinete/AtosAdministrativos";
import { ComunicacaoInstitucional } from "@/components/gabinete/ComunicacaoInstitucional";
import { RelatoriosExecutivos } from "@/components/gabinete/RelatoriosExecutivos";

export default function GabinetePrefeito() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <PermissionGuard
      requiredRoles={["admin_municipal", "prefeito", "vice_prefeito", "assessor_gabinete"]}
      requireAny
      fallback={
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md">
              <CardHeader className="text-center">
                <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
                <CardTitle>Acesso Restrito</CardTitle>
                <CardDescription>
                  Este módulo é exclusivo para o Gabinete do Prefeito. 
                  Você não possui permissão para acessar esta área.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </Layout>
      }
    >
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Gabinete do Prefeito</h1>
                <p className="text-muted-foreground">
                  Centro de Comando Executivo Municipal
                </p>
              </div>
            </div>
            <Badge variant="outline" className="px-3 py-1.5 text-sm border-amber-500 text-amber-600">
              <Shield className="h-4 w-4 mr-2" />
              Acesso Restrito
            </Badge>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-7 gap-2 h-auto p-1 bg-muted/50">
              <TabsTrigger 
                value="dashboard" 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="agenda" 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Agenda</span>
              </TabsTrigger>
              <TabsTrigger 
                value="metas" 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
              >
                <Target className="h-5 w-5" />
                <span className="text-xs">Metas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="obras" 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
              >
                <Building2 className="h-5 w-5" />
                <span className="text-xs">Obras</span>
              </TabsTrigger>
              <TabsTrigger 
                value="atos" 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs">Atos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="comunicacao" 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
              >
                <Megaphone className="h-5 w-5" />
                <span className="text-xs">Comunicação</span>
              </TabsTrigger>
              <TabsTrigger 
                value="relatorios" 
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-background"
              >
                <FileBarChart className="h-5 w-5" />
                <span className="text-xs">Relatórios</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardEstrategico />
            </TabsContent>

            <TabsContent value="agenda" className="space-y-6">
              <AgendaGovernamental />
            </TabsContent>

            <TabsContent value="metas" className="space-y-6">
              <MetasPlanoGoverno />
            </TabsContent>

            <TabsContent value="obras" className="space-y-6">
              <ObrasPrioritarias />
            </TabsContent>

            <TabsContent value="atos" className="space-y-6">
              <AtosAdministrativos />
            </TabsContent>

            <TabsContent value="comunicacao" className="space-y-6">
              <ComunicacaoInstitucional />
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-6">
              <RelatoriosExecutivos />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </PermissionGuard>
  );
}
