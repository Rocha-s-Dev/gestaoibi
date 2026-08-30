import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { STATUS_OS, useOrdensServico } from "@/hooks/useOrdensServico";
import { useServicosEquipes } from "@/hooks/useServicosEquipes";
import { useServicosEquipamentos } from "@/hooks/useServicosEquipamentos";
import { AlertTriangle } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5e9", "#64748b"];

export function DashboardServicos() {
  const { ordens } = useOrdensServico();
  const { equipes } = useServicosEquipes();
  const { equipamentos } = useServicosEquipamentos();
  const hoje = new Date().toISOString().slice(0, 10);

  const kpis = useMemo(() => {
    const abertas = ordens.filter(o => ["aberta", "designada", "em_execucao"].includes(o.status));
    const concluidas = ordens.filter(o => o.status === "concluida");
    const atrasadas = ordens.filter(o => o.data_prevista && o.data_prevista < hoje && !["concluida", "cancelada"].includes(o.status));
    const tempos = concluidas
      .filter(o => o.data_abertura && o.data_conclusao)
      .map(o => (new Date(o.data_conclusao!).getTime() - new Date(o.data_abertura!).getTime()) / 86400000);
    const media = tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : 0;
    const valor = ordens.reduce((a, o) => a + Number(o.valor_executado || 0), 0);
    return {
      total: ordens.length, abertas: abertas.length, concluidas: concluidas.length,
      atrasadas: atrasadas.length, tempoMedio: media, valor,
      equipesAtivas: equipes.filter(e => e.status === "ativa").length,
      equipamentosDisponiveis: equipamentos.filter(e => e.situacao === "disponivel").length,
    };
  }, [ordens, equipes, equipamentos, hoje]);

  const porStatus = useMemo(() => STATUS_OS.map(s => ({
    name: s.label, value: ordens.filter(o => o.status === s.value).length,
  })).filter(x => x.value > 0), [ordens]);

  const porBairro = useMemo(() => {
    const map = new Map<string, number>();
    ordens.forEach(o => { const k = o.bairro ?? "Não informado"; map.set(k, (map.get(k) ?? 0) + 1); });
    return [...map.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [ordens]);

  const porTipo = useMemo(() => {
    const map = new Map<string, number>();
    ordens.forEach(o => { const k = o.tipo_nome ?? "Não informado"; map.set(k, (map.get(k) ?? 0) + 1); });
    return [...map.entries()].map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [ordens]);

  const alertas = useMemo(() => {
    const list: { titulo: string; detalhe: string }[] = [];
    ordens.filter(o => o.data_prevista && o.data_prevista < hoje && !["concluida", "cancelada"].includes(o.status))
      .slice(0, 5).forEach(o => list.push({ titulo: `OS ${o.numero_os ?? ""} atrasada`, detalhe: `${o.tipo_nome ?? ""} · prazo ${new Date(o.data_prevista! + "T00:00:00").toLocaleDateString("pt-BR")}` }));
    equipamentos.filter(e => e.proxima_manutencao && e.proxima_manutencao < hoje)
      .slice(0, 5).forEach(e => list.push({ titulo: `Manutenção vencida: ${e.nome}`, detalhe: `Prevista para ${new Date(e.proxima_manutencao! + "T00:00:00").toLocaleDateString("pt-BR")}` }));
    ordens.filter(o => o.status === "aberta" && !o.equipe_id)
      .slice(0, 5).forEach(o => list.push({ titulo: `OS ${o.numero_os ?? ""} sem equipe designada`, detalhe: o.bairro ?? "" }));
    return list;
  }, [ordens, equipamentos, hoje]);

  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Ordens de serviço</div><div className="text-2xl font-bold">{kpis.total}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Em aberto</div><div className="text-2xl font-bold text-blue-600">{kpis.abertas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Concluídas</div><div className="text-2xl font-bold text-green-600">{kpis.concluidas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Atrasadas</div><div className="text-2xl font-bold text-destructive">{kpis.atrasadas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Tempo médio de atendimento</div><div className="text-2xl font-bold">{kpis.tempoMedio.toFixed(1)} dias</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Valor executado</div><div className="text-xl font-bold">{brl(kpis.valor)}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Equipes ativas</div><div className="text-2xl font-bold">{kpis.equipesAtivas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Equipamentos disponíveis</div><div className="text-2xl font-bold">{kpis.equipamentosDisponiveis}</div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">OS por situação</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {porStatus.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porStatus} dataKey="value" nameKey="name" outerRadius={100} label>
                    {porStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">OS por bairro</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {porBairro.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porBairro}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">OS por tipo de serviço</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {porTipo.length === 0 ? <p className="text-sm text-muted-foreground">Sem dados.</p> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porTipo} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" width={140} fontSize={11} /><Tooltip />
                  <Bar dataKey="total" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Alertas operacionais</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {alertas.length === 0 && <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>}
            {alertas.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-2 border-b pb-2 last:border-0">
                <div>
                  <div className="text-sm font-medium">{a.titulo}</div>
                  <div className="text-xs text-muted-foreground">{a.detalhe}</div>
                </div>
                <Badge variant="outline">Atenção</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
