import { 
  Users, Building2, Target, Construction, AlertTriangle, Bell, 
  TrendingUp, DollarSign, ClipboardList, UserCheck, Briefcase,
  LayoutDashboard, FileText, Heart, GraduationCap, Truck
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardSecretaria } from "@/components/shared/DashboardSecretaria";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/contexts/AuthContext";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { session } = useAuth();
  const { loading: ctxLoading } = useSecretariaContext();
  const dashboard = useDashboardData();

  if (ctxLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const municipioNome = dashboard.municipio?.nome || "Município";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {greeting}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Painel de gestão — {municipioNome}
          {dashboard.municipio?.uf ? ` / ${dashboard.municipio.uf}` : ""}
        </p>
      </div>

      {/* Executivo: Prefeito / Admin */}
      {dashboard.isExecutivo && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Servidores Ativos"
              value={dashboard.totalServidores}
              icon={<Users className="h-6 w-6" />}
              description={dashboard.servidoresPendentes > 0 ? `${dashboard.servidoresPendentes} pendentes` : "Todos regularizados"}
            />
            <DashboardCard
              title="Secretarias"
              value={dashboard.totalSecretarias}
              icon={<Building2 className="h-6 w-6" />}
              description="Secretarias ativas"
            />
            <DashboardCard
              title="Obras em Andamento"
              value={dashboard.obrasAndamento}
              icon={<Construction className="h-6 w-6" />}
              description="Obras prioritárias"
            />
            <DashboardCard
              title="Progresso das Metas"
              value={`${dashboard.progressoMedioMetas}%`}
              icon={<Target className="h-6 w-6" />}
              description={`${dashboard.metasGoverno.length} metas registradas`}
            />
          </div>

          {/* Gráficos */}
          {dashboard.metasPorStatus.length > 0 && (
            <DashboardSecretaria
              stats={[]}
              pieData={dashboard.metasPorStatus}
              pieTitle="Metas por Status"
            />
          )}

          {/* Alertas Executivos */}
          {dashboard.alertasPendentes.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-base">Alertas Pendentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboard.alertasPendentes.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0">
                    <Badge variant={a.prioridade === "critica" ? "destructive" : "secondary"} className="mt-0.5 shrink-0">
                      {a.prioridade}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{a.titulo}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.descricao}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Ações Rápidas - Executivo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/gabinete-prefeito">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <LayoutDashboard className="h-4 w-4" /> Gabinete
                  </Button>
                </Link>
                <Link to="/gestao-obras">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Construction className="h-4 w-4" /> Obras
                  </Button>
                </Link>
                <Link to="/financeiro">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <DollarSign className="h-4 w-4" /> Financeiro
                  </Button>
                </Link>
                <Link to="/admin-rh">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Users className="h-4 w-4" /> RH
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Gestor RH */}
      {dashboard.isGestorRH && !dashboard.isExecutivo && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Servidores Ativos"
              value={dashboard.totalServidores}
              icon={<Users className="h-6 w-6" />}
              description="Total no sistema"
            />
            <DashboardCard
              title="Pendentes de Regularização"
              value={dashboard.servidoresPendentes}
              icon={<UserCheck className="h-6 w-6" />}
              description="Aguardando aprovação"
            />
            <DashboardCard
              title="Folhas do Mês"
              value={dashboard.folhaMes.count}
              icon={<ClipboardList className="h-6 w-6" />}
              description={`R$ ${dashboard.folhaMes.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            />
            <DashboardCard
              title="Folha Líquida"
              value={`R$ ${(dashboard.folhaMes.total / 1000).toFixed(0)}k`}
              icon={<DollarSign className="h-6 w-6" />}
              description="Valor total líquido"
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/admin-rh">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Users className="h-4 w-4" /> Servidores
                  </Button>
                </Link>
                <Link to="/metas">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Target className="h-4 w-4" /> Metas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Servidor / Secretário - visão setorial */}
      {!dashboard.isExecutivo && !dashboard.isGestorRH && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboard.secretariaAtiva ? (
              <DashboardCard
                title="Secretaria Ativa"
                value={dashboard.secretariaAtiva.sigla}
                icon={<Building2 className="h-6 w-6" />}
                description={dashboard.secretariaAtiva.nome}
              />
            ) : (
              <DashboardCard
                title="Secretaria"
                value="—"
                icon={<Building2 className="h-6 w-6" />}
                description="Nenhuma secretaria vinculada"
              />
            )}
            <DashboardCard
              title="Notificações"
              value={dashboard.notificacoesRecentes.filter(n => !n.read).length}
              icon={<Bell className="h-6 w-6" />}
              description="Não lidas"
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/metas">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Target className="h-4 w-4" /> Metas
                  </Button>
                </Link>
                <Link to="/mensagens">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <FileText className="h-4 w-4" /> Mensagens
                  </Button>
                </Link>
                <Link to="/notificacoes">
                  <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                    <Bell className="h-4 w-4" /> Notificações
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Atividade Recente — todos os perfis */}
      {dashboard.notificacoesRecentes.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.notificacoesRecentes.map((n) => (
              <div key={n.id} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${n.read ? "bg-muted" : "bg-primary"}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(n.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
