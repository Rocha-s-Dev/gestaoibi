import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Bell, CheckCircle, Eye, Filter, RefreshCw, Search, Settings } from "lucide-react";
import { useAlertasEducacionais } from "@/hooks/useAlertasEducacionais";
import { AlertaItem } from "./AlertaItem";
import { ConfiguracaoAlertasDialog } from "./ConfiguracaoAlertasDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function AlertasEducacionais() {
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroNivel, setFiltroNivel] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("nao_resolvidos");
  const [busca, setBusca] = useState("");
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { alertas, loading, gerarAlertas, resolverAlerta } = useAlertasEducacionais();

  const alertasFiltrados = alertas?.filter((alerta) => {
    if (filtroTipo !== "todos" && alerta.tipo !== filtroTipo) return false;
    if (filtroNivel !== "todos" && alerta.nivel !== filtroNivel) return false;
    if (filtroStatus === "nao_resolvidos" && alerta.resolvido) return false;
    if (filtroStatus === "resolvidos" && !alerta.resolvido) return false;
    if (busca && !alerta.aluno?.nome?.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }) || [];

  const estatisticas = {
    total: alertas?.filter(a => !a.resolvido).length || 0,
    criticos: alertas?.filter(a => a.nivel === "critical" && !a.resolvido).length || 0,
    avisos: alertas?.filter(a => a.nivel === "warning" && !a.resolvido).length || 0,
    info: alertas?.filter(a => a.nivel === "info" && !a.resolvido).length || 0,
  };

  const handleGerarAlertas = async () => {
    setIsGenerating(true);
    await gerarAlertas();
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">Alertas não resolvidos</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{estatisticas.criticos}</div>
            <p className="text-xs text-muted-foreground">Atenção imediata</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
            <Eye className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{estatisticas.avisos}</div>
            <p className="text-xs text-muted-foreground">Acompanhamento</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Informativos</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{estatisticas.info}</div>
            <p className="text-xs text-muted-foreground">Para conhecimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertas de Alunos
              </CardTitle>
              <CardDescription>
                Monitoramento de alunos em situação de risco acadêmico
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfigDialogOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configurar
              </Button>
              <Button
                size="sm"
                onClick={handleGerarAlertas}
                disabled={isGenerating}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Gerar Alertas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do aluno..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="faltas_excessivas">Faltas Excessivas</SelectItem>
                  <SelectItem value="nota_baixa">Nota Baixa</SelectItem>
                  <SelectItem value="risco_reprovacao">Risco de Reprovação</SelectItem>
                  <SelectItem value="evasao">Risco de Evasão</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroNivel} onValueChange={setFiltroNivel}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os níveis</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="warning">Aviso</SelectItem>
                  <SelectItem value="info">Informativo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="nao_resolvidos">Não resolvidos</SelectItem>
                  <SelectItem value="resolvidos">Resolvidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lista de Alertas */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : alertasFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
              <h3 className="text-lg font-medium">Nenhum alerta encontrado</h3>
              <p className="text-sm text-muted-foreground">
                {filtroStatus === "nao_resolvidos"
                  ? "Todos os alertas foram resolvidos!"
                  : "Não há alertas com os filtros selecionados."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alertasFiltrados.map((alerta) => (
                <AlertaItem
                  key={alerta.id}
                  alerta={alerta}
                  onResolver={() => resolverAlerta(alerta.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfiguracaoAlertasDialog
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
      />
    </div>
  );
}
