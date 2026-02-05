import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Building2, 
  AlertTriangle, 
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertCircle,
  Scale,
  Wrench
} from "lucide-react";
import { useDashboardEstrategico, useAlertasExecutivos } from "@/hooks/useGabinetePrefeito";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function DashboardEstrategico() {
  const { kpis, isLoading } = useDashboardEstrategico();
  const { alertas } = useAlertasExecutivos();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const variants: Record<string, { variant: "destructive" | "secondary" | "outline"; label: string }> = {
      critico: { variant: "destructive", label: "Crítico" },
      alto: { variant: "destructive", label: "Alto" },
      medio: { variant: "secondary", label: "Médio" },
      baixo: { variant: "outline", label: "Baixo" },
    };
    const config = variants[prioridade] || variants.baixo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, React.ReactNode> = {
      financeiro: <DollarSign className="h-4 w-4" />,
      juridico: <Scale className="h-4 w-4" />,
      operacional: <Wrench className="h-4 w-4" />,
      urgente: <AlertCircle className="h-4 w-4" />,
    };
    return icons[tipo] || <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metas do Plano de Governo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Metas do Plano de Governo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.metas.total || 0}</div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                {kpis?.metas.concluidas || 0} concluídas
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <Clock className="h-3 w-3" />
                {kpis?.metas.emAndamento || 0} em andamento
              </span>
            </div>
            {(kpis?.metas.atrasadas || 0) > 0 && (
              <Badge variant="destructive" className="mt-2">
                {kpis?.metas.atrasadas} atrasadas
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Obras Prioritárias */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Obras Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.obras.total || 0}</div>
            <div className="mt-2">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Execução média</span>
                <span>{(kpis?.obras.mediaExecucao || 0).toFixed(1)}%</span>
              </div>
              <Progress value={kpis?.obras.mediaExecucao || 0} className="h-2" />
            </div>
            {(kpis?.obras.paralisadas || 0) > 0 && (
              <Badge variant="destructive" className="mt-2">
                {kpis?.obras.paralisadas} paralisadas
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Execução Orçamentária */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Execução Orçamentária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis?.obras.valorExecutado || 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              de {formatCurrency(kpis?.obras.valorTotal || 0)} previsto
            </p>
            <div className="mt-2">
              <Progress 
                value={kpis?.obras.valorTotal ? (kpis.obras.valorExecutado / kpis.obras.valorTotal) * 100 : 0} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Atos Administrativos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Atos Administrativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.atos.total || 0}</div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                {kpis?.atos.publicados || 0} publicados
              </span>
            </div>
            {(kpis?.atos.pendentes || 0) > 0 && (
              <Badge variant="secondary" className="mt-2">
                {kpis?.atos.pendentes} pendentes
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Painel de Alertas Críticos
              </CardTitle>
              <CardDescription>
                Alertas que requerem atenção imediata
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="destructive">{kpis?.alertas.criticos || 0} críticos</Badge>
              <Badge variant="secondary">{kpis?.alertas.altos || 0} altos</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {alertas && alertas.length > 0 ? (
            <div className="space-y-3">
              {alertas.slice(0, 5).map((alerta) => (
                <div 
                  key={alerta.id} 
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${
                    alerta.prioridade === "critico" ? "bg-destructive/10 text-destructive" :
                    alerta.prioridade === "alto" ? "bg-orange-100 text-orange-600" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {getTipoIcon(alerta.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{alerta.titulo}</h4>
                      {getPrioridadeBadge(alerta.prioridade)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {alerta.descricao}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>{alerta.categoria}</span>
                      {alerta.secretaria && (
                        <span>• {(alerta.secretaria as { sigla?: string })?.sigla || "N/A"}</span>
                      )}
                      <span>• {format(new Date(alerta.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>Nenhum alerta ativo no momento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo por Área */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.alertas.financeiros || 0}</div>
            <p className="text-sm text-muted-foreground">ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Alertas Jurídicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.alertas.juridicos || 0}</div>
            <p className="text-sm text-muted-foreground">ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Alertas Operacionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis?.alertas.operacionais || 0}</div>
            <p className="text-sm text-muted-foreground">ativos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
