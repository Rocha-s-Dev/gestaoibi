import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Wallet, ArrowLeftRight, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  ESTADO_CONSERVACAO_LABELS,
  STATUS_BEM_LABELS,
  useMovimentacoesPatrimonio,
  usePatrimonio,
} from "@/hooks/usePatrimonio";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2, var(--muted-foreground)))", "hsl(var(--destructive))", "hsl(var(--secondary))", "hsl(var(--accent))"];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function DashboardPatrimonio() {
  const { bens, isLoading } = usePatrimonio();
  const { movimentacoes } = useMovimentacoesPatrimonio();

  const kpis = useMemo(() => {
    const ativos = bens.filter((b) => b.status !== "baixado");
    const valorTotal = ativos.reduce((s, b) => s + Number(b.valor_atual ?? b.valor_aquisicao ?? 0), 0);
    return {
      total: bens.length,
      ativos: ativos.length,
      baixados: bens.filter((b) => b.status === "baixado").length,
      valorTotal,
      semResponsavel: ativos.filter((b) => !b.responsavel_id).length,
      inserviveis: ativos.filter((b) => b.estado_conservacao === "inservivel" || b.estado_conservacao === "ruim").length,
      movPendentes: movimentacoes.filter((m) => m.status === "pendente").length,
    };
  }, [bens, movimentacoes]);

  const porSecretaria = useMemo(() => {
    const map = new Map<string, { nome: string; quantidade: number; valor: number }>();
    bens.filter((b) => b.status !== "baixado").forEach((b) => {
      const nome = b.secretarias?.sigla || b.secretarias?.nome || "Sem secretaria";
      const cur = map.get(nome) || { nome, quantidade: 0, valor: 0 };
      cur.quantidade += 1;
      cur.valor += Number(b.valor_atual ?? b.valor_aquisicao ?? 0);
      map.set(nome, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.quantidade - a.quantidade).slice(0, 10);
  }, [bens]);

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    bens.filter((b) => b.status !== "baixado").forEach((b) => {
      const nome = b.bens_categorias?.nome || b.categoria || "Sem categoria";
      map.set(nome, (map.get(nome) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [bens]);

  const porConservacao = useMemo(() => {
    const map = new Map<string, number>();
    bens.filter((b) => b.status !== "baixado").forEach((b) => {
      const label = ESTADO_CONSERVACAO_LABELS[b.estado_conservacao] || "—";
      map.set(label, (map.get(label) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [bens]);

  if (isLoading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Package className="h-4 w-4" /> Bens Cadastrados</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.total}</p>
            <p className="text-xs text-muted-foreground">{kpis.ativos} em uso · {kpis.baixados} baixados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Wallet className="h-4 w-4" /> Valor Patrimonial</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{brl(kpis.valorTotal)}</p>
            <p className="text-xs text-muted-foreground">Soma dos bens não baixados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><ArrowLeftRight className="h-4 w-4" /> Movimentações Pendentes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.movPendentes}</p>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Pontos de Atenção</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kpis.semResponsavel + kpis.inserviveis}</p>
            <p className="text-xs text-muted-foreground">{kpis.semResponsavel} sem responsável · {kpis.inserviveis} em estado ruim</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Bens por Secretaria</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {porSecretaria.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum bem cadastrado ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porSecretaria}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="nome" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Bens por Categoria</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {porCategoria.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum bem cadastrado ainda.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porCategoria} dataKey="value" nameKey="name" outerRadius={90} label>
                    {porCategoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Estado de Conservação</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {porConservacao.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados.</p>
          ) : porConservacao.map((c) => (
            <Badge key={c.name} variant="outline" className="text-sm">{c.name}: {c.value}</Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Situação dos Bens</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.entries(STATUS_BEM_LABELS).map(([status, label]) => {
            const qtd = bens.filter((b) => b.status === status).length;
            if (!qtd) return null;
            return <Badge key={status} variant="secondary" className="text-sm">{label}: {qtd}</Badge>;
          })}
          {bens.length === 0 && <p className="text-sm text-muted-foreground">Sem dados.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
