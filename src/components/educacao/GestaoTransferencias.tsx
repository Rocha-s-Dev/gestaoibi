import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRightLeft, 
  Plus, 
  Check, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Eye 
} from "lucide-react";
import { TransferenciaDialog } from "./TransferenciaDialog";
import { TransferenciaDetalhesDialog } from "./TransferenciaDetalhesDialog";
import { useTransferencias, Transferencia, StatusTransferencia } from "@/hooks/useHistoricoTransferencias";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig: Record<StatusTransferencia, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  solicitada: { label: "Solicitada", variant: "outline", icon: Clock },
  em_analise: { label: "Em Análise", variant: "secondary", icon: AlertCircle },
  aprovada: { label: "Aprovada", variant: "default", icon: Check },
  rejeitada: { label: "Rejeitada", variant: "destructive", icon: X },
  cancelada: { label: "Cancelada", variant: "outline", icon: X },
  concluida: { label: "Concluída", variant: "default", icon: CheckCircle2 },
};

const tipoLabels = {
  interna_turma: "Mudança de Turma",
  interna_escola: "Mudança de Escola",
  externa_entrada: "Entrada na Rede",
  externa_saida: "Saída da Rede",
};

export function GestaoTransferencias() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesDialog, setDetalhesDialog] = useState<Transferencia | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>("todas");

  const { 
    transferencias, 
    loading, 
    aprovarTransferencia, 
    rejeitarTransferencia, 
    concluirTransferencia,
    cancelarTransferencia 
  } = useTransferencias();

  const transferenciasFiltradas = filtroStatus === "todas" 
    ? transferencias 
    : transferencias.filter(t => t.status === filtroStatus);

  const contadores = {
    solicitadas: transferencias.filter(t => t.status === "solicitada").length,
    emAnalise: transferencias.filter(t => t.status === "em_analise").length,
    aprovadas: transferencias.filter(t => t.status === "aprovada").length,
    concluidas: transferencias.filter(t => t.status === "concluida").length,
  };

  const handleAprovar = async (id: string) => {
    try {
      await aprovarTransferencia(id);
      toast.success("Transferência aprovada!");
    } catch {
      toast.error("Erro ao aprovar transferência");
    }
  };

  const handleRejeitar = async (id: string) => {
    const motivo = prompt("Motivo da rejeição:");
    if (motivo) {
      try {
        await rejeitarTransferencia(id, motivo);
        toast.success("Transferência rejeitada");
      } catch {
        toast.error("Erro ao rejeitar transferência");
      }
    }
  };

  const handleConcluir = async (id: string) => {
    try {
      await concluirTransferencia(id);
      toast.success("Transferência concluída! Dados do aluno atualizados.");
    } catch {
      toast.error("Erro ao concluir transferência");
    }
  };

  return (
    <div className="space-y-6">
      {/* Contadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFiltroStatus("solicitada")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Solicitadas</p>
                <p className="text-2xl font-bold text-yellow-600">{contadores.solicitadas}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFiltroStatus("em_analise")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Análise</p>
                <p className="text-2xl font-bold text-blue-600">{contadores.emAnalise}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFiltroStatus("aprovada")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{contadores.aprovadas}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFiltroStatus("concluida")}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-primary">{contadores.concluidas}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Transferências */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Transferências Escolares
              </CardTitle>
              <CardDescription>
                Gerencie solicitações de transferência de alunos
              </CardDescription>
            </div>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Transferência
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filtroStatus} onValueChange={setFiltroStatus}>
            <TabsList className="mb-4">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="solicitada">Solicitadas</TabsTrigger>
              <TabsTrigger value="aprovada">Aprovadas</TabsTrigger>
              <TabsTrigger value="concluida">Concluídas</TabsTrigger>
            </TabsList>

            <TabsContent value={filtroStatus}>
              {loading ? (
                <div className="text-center py-8">Carregando...</div>
              ) : transferenciasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma transferência encontrada
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Aluno</th>
                        <th className="text-left p-3">Tipo</th>
                        <th className="text-left p-3">Origem → Destino</th>
                        <th className="text-left p-3">Data</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transferenciasFiltradas.map((t) => {
                        const StatusIcon = statusConfig[t.status]?.icon || Clock;
                        return (
                          <tr key={t.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div>
                                <p className="font-medium">{t.aluno?.nome}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t.aluno?.numero_matricula}
                                </p>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary">
                                {tipoLabels[t.tipo]}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="text-sm">
                                <span>{t.escola_origem?.nome || t.escola_externa_origem || "-"}</span>
                                <span className="mx-2">→</span>
                                <span>{t.escola_destino?.nome || t.escola_externa_destino || "-"}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              {format(new Date(t.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
                            </td>
                            <td className="p-3">
                              <Badge variant={statusConfig[t.status]?.variant || "outline"}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig[t.status]?.label || t.status}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setDetalhesDialog(t)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                
                                {t.status === "solicitada" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600"
                                      onClick={() => handleAprovar(t.id)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600"
                                      onClick={() => handleRejeitar(t.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                
                                {t.status === "aprovada" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleConcluir(t.id)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Concluir
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <TransferenciaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      {detalhesDialog && (
        <TransferenciaDetalhesDialog
          open={!!detalhesDialog}
          onOpenChange={() => setDetalhesDialog(null)}
          transferencia={detalhesDialog}
        />
      )}
    </div>
  );
}
