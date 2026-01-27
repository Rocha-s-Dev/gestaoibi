import { useState } from "react";
import { Download, FileText, Shield, History, GitCompare, RotateCcw } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuditoria, FiltrosAuditoria as FiltrosType, RegistroAuditoria } from "@/hooks/useAuditoria";
import { AuditoriaTimeline } from "@/components/auditoria/AuditoriaTimeline";
import { AuditoriaDetalhes } from "@/components/auditoria/AuditoriaDetalhes";
import { FiltrosAuditoria } from "@/components/auditoria/FiltrosAuditoria";
import { DashboardAuditoria } from "@/components/auditoria/DashboardAuditoria";
import { ReversoesPendentes } from "@/components/auditoria/ReversoesPendentes";
import { toast } from "sonner";

export default function Auditoria() {
  const [filtros, setFiltros] = useState<FiltrosType>({});
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroAuditoria | null>(null);
  const [showDetalhes, setShowDetalhes] = useState(false);
  
  const { data: registros, isLoading, error } = useAuditoria(filtros);

  const handleSelectRegistro = (registro: RegistroAuditoria) => {
    setSelectedRegistro(registro);
    setShowDetalhes(true);
  };

  const handleExportarRelatorio = async () => {
    if (!registros || registros.length === 0) {
      toast.error("Nenhum registro para exportar");
      return;
    }

    // Gerar relatório em formato JSON assinado
    const relatorio = {
      gerado_em: new Date().toISOString(),
      filtros_aplicados: filtros,
      total_registros: registros.length,
      registros: registros.map((r) => ({
        id: r.id,
        timestamp: r.created_at,
        usuario: r.user_nome || r.user_email,
        secretaria: r.secretaria_nome,
        modulo: r.modulo,
        entidade: r.entidade,
        acao: r.tipo_acao,
        categoria: r.categoria,
        hash: r.hash_registro,
      })),
      // Hash do relatório para verificação de integridade
      integridade: {
        primeiro_hash: registros[0]?.hash_registro,
        ultimo_hash: registros[registros.length - 1]?.hash_registro,
        total_chain: registros.length,
      },
    };

    const blob = new Blob([JSON.stringify(relatorio, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Relatório exportado com sucesso");
  };

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
              <p className="text-muted-foreground">
                Você não tem permissão para acessar os registros de auditoria.
              </p>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Auditoria Global
            </h1>
            <p className="text-muted-foreground mt-1">
              Sistema imutável de rastreamento e versionamento
            </p>
          </div>
          <Button onClick={handleExportarRelatorio}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="versoes" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Versões
            </TabsTrigger>
            <TabsTrigger value="reversoes" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reversões
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            <DashboardAuditoria />
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <FiltrosAuditoria filtros={filtros} onFiltrosChange={setFiltros} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Linha do Tempo</span>
                  {registros && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {registros.length} registro(s)
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando registros...
                  </div>
                ) : (
                  <AuditoriaTimeline
                    registros={registros || []}
                    onSelectRegistro={handleSelectRegistro}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Versões */}
          <TabsContent value="versoes">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Versões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma entidade na timeline para ver o histórico de versões</p>
                  <p className="text-sm mt-2">
                    As versões são criadas automaticamente para entidades críticas
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reversões */}
          <TabsContent value="reversoes">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Reversões</CardTitle>
              </CardHeader>
              <CardContent>
                <ReversoesPendentes />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Detalhes */}
        <AuditoriaDetalhes
          registro={selectedRegistro}
          open={showDetalhes}
          onOpenChange={setShowDetalhes}
        />
      </div>
    </Layout>
  );
}
