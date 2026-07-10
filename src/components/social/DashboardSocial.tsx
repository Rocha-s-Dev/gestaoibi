import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2, Users, ClipboardList, Home, AlertTriangle, HeartHandshake,
  FileText, Send, ShieldAlert, Wallet, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useSocial } from "@/hooks/useSocial";
import { useBeneficiosContinuados, STATUS_BC_LABELS } from "@/hooks/useBeneficiosContinuados";
import { usePAIF } from "@/hooks/usePAIF";
import { usePAEFI } from "@/hooks/usePAEFI";
import { useEncaminhamentosSociais, DESTINO_LABELS, STATUS_ENC_LABELS } from "@/hooks/useEncaminhamentosSociais";
import { useAlertasSociais } from "@/hooks/useAlertasSociais";
import { useVulnerabilidade, NIVEIS_VULNERABILIDADE } from "@/hooks/useVulnerabilidade";
import { usePlanosFamiliares } from "@/hooks/usePlanosFamiliares";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export function DashboardSocial() {
  const { unidades, fetchUnidades, familias, fetchFamilias, atendimentos, fetchAtendimentos, visitas, fetchVisitas } = useSocial();
  const { beneficios: bc } = useBeneficiosContinuados();
  const { itens: paif } = usePAIF();
  const { itens: paefi } = usePAEFI();
  const { encaminhamentos } = useEncaminhamentosSociais();
  const { alertas } = useAlertasSociais({ resolvido: false });
  const { avaliacoes: vuln } = useVulnerabilidade();
  const { planos } = usePlanosFamiliares();

  useEffect(() => {
    fetchUnidades(); fetchFamilias(); fetchAtendimentos(); fetchVisitas();
  }, [fetchUnidades, fetchFamilias, fetchAtendimentos, fetchVisitas]);

  const stats = [
    { label: "Unidades CRAS/CREAS", value: unidades.length, icon: Building2, color: "text-blue-600" },
    { label: "Famílias Cadastradas", value: familias.length, icon: Users, color: "text-green-600" },
    { label: "Atendimentos", value: atendimentos.length, icon: ClipboardList, color: "text-orange-600" },
    { label: "Visitas Domiciliares", value: visitas.length, icon: Home, color: "text-purple-600" },
    { label: "PAIF Ativos", value: (paif || []).filter((p: any) => p.situacao === "ativo").length, icon: HeartHandshake, color: "text-emerald-600" },
    { label: "PAEFI Ativos", value: (paefi || []).filter((p: any) => p.situacao === "ativo").length, icon: ShieldAlert, color: "text-red-600" },
    { label: "Benefícios Continuados", value: (bc || []).filter((b: any) => b.situacao === "ativo").length, icon: Wallet, color: "text-cyan-600" },
    { label: "Alertas Pendentes", value: (alertas || []).length, icon: AlertTriangle, color: "text-yellow-600" },
  ];

  const familiasExtremaPobreza = familias.filter(f => f.renda_per_capita <= 218).length;
  const familiasBaixaRenda = familias.filter(f => f.renda_per_capita > 218 && f.renda_per_capita <= 660).length;
  const semAgua = familias.filter(f => !f.agua_encanada).length;
  const semEsgoto = familias.filter(f => !f.esgoto_sanitario).length;

  const vulnPorNivel = Object.keys(NIVEIS_VULNERABILIDADE).map(k => ({
    name: NIVEIS_VULNERABILIDADE[k].label,
    value: (vuln || []).filter((v: any) => (v.nivel_manual || v.nivel_calculado) === k).length,
  }));

  const bcPorStatus = Object.keys(STATUS_BC_LABELS).map(k => ({
    name: STATUS_BC_LABELS[k],
    value: (bc || []).filter((b: any) => b.situacao === k).length,
  }));

  const encPorDestino = Object.keys(DESTINO_LABELS).map(k => ({
    name: DESTINO_LABELS[k],
    value: (encaminhamentos || []).filter((e: any) => e.destino === k).length,
  })).filter(d => d.value > 0);

  const encPorStatus = Object.keys(STATUS_ENC_LABELS).map(k => ({
    name: STATUS_ENC_LABELS[k],
    value: (encaminhamentos || []).filter((e: any) => e.status === k).length,
  })).filter(d => d.value > 0);

  const planosAtivos = (planos || []).filter((p: any) => p.status === "ativo").length;
  const planosConcluidos = (planos || []).filter((p: any) => p.status === "concluido").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Indicadores de Vulnerabilidade</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Extrema pobreza (≤ R$218/capita)</span><span className="font-semibold">{familiasExtremaPobreza}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Baixa renda (R$218 - R$660)</span><span className="font-semibold">{familiasBaixaRenda}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Sem água encanada</span><span className="font-semibold text-destructive">{semAgua}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Sem esgoto sanitário</span><span className="font-semibold text-destructive">{semEsgoto}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="text-sm text-muted-foreground">Avaliações registradas</span><span className="font-semibold">{(vuln || []).length}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4" />Níveis de Vulnerabilidade</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={vulnPorNivel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Wallet className="h-4 w-4" />Benefícios Continuados por Situação</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bcPorStatus.filter(d => d.value > 0)} dataKey="value" nameKey="name" outerRadius={80} label>
                  {bcPorStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Acompanhamentos Familiares</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">PAIF - Ativos</span><span className="font-semibold">{(paif || []).filter((p: any) => p.situacao === "ativo").length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">PAIF - Concluídos</span><span className="font-semibold">{(paif || []).filter((p: any) => p.situacao === "concluido").length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">PAEFI - Ativos</span><span className="font-semibold text-destructive">{(paefi || []).filter((p: any) => p.situacao === "ativo").length}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">PAEFI - Encerrados</span><span className="font-semibold">{(paefi || []).filter((p: any) => p.situacao !== "ativo").length}</span></div>
            <div className="flex justify-between border-t pt-2"><span className="text-sm text-muted-foreground">Planos Ativos</span><span className="font-semibold">{planosAtivos}</span></div>
            <div className="flex justify-between"><span className="text-sm text-muted-foreground">Planos Concluídos</span><span className="font-semibold">{planosConcluidos}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4" />Encaminhamentos por Destino</CardTitle></CardHeader>
          <CardContent>
            {encPorDestino.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum encaminhamento registrado.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={encPorDestino} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={110} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Encaminhamentos por Status</CardTitle></CardHeader>
          <CardContent>
            {encPorStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum encaminhamento registrado.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={encPorStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                    {encPorStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Unidades por Tipo</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {["CRAS", "CREAS", "Centro POP", "Abrigo"].map(tipo => (
            <div key={tipo} className="flex justify-between rounded-md border p-3">
              <span className="text-sm text-muted-foreground">{tipo}</span>
              <span className="font-semibold">{unidades.filter(u => u.tipo === tipo).length}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
