import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeftRight, Plus, Loader2, Check, X, CheckCheck, Search } from "lucide-react";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { MovimentacaoPatrimonioDialog } from "./MovimentacaoPatrimonioDialog";
import {
  STATUS_MOVIMENTACAO_LABELS,
  TIPO_MOVIMENTACAO_LABELS,
  useMovimentacoesPatrimonio,
} from "@/hooks/usePatrimonio";

const statusVariant = (s: string) =>
  s === "recusada" || s === "cancelada" ? "destructive" : s === "pendente" ? "secondary" : "default";

export function MovimentacoesPatrimonio() {
  const { movimentacoes, isLoading, atualizarStatus, concluirMovimentacao } = useMovimentacoesPatrimonio();
  const [showDialog, setShowDialog] = useState(false);
  const [busca, setBusca] = useState("");
  const [fStatus, setFStatus] = useState("all");
  const [fTipo, setFTipo] = useState("all");

  const filtradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return movimentacoes.filter((m) => {
      if (fStatus !== "all" && m.status !== fStatus) return false;
      if (fTipo !== "all" && m.tipo_movimentacao !== fTipo) return false;
      if (t) {
        const alvo = [m.bens_patrimoniais?.numero_tombamento, m.bens_patrimoniais?.descricao, m.motivo]
          .filter(Boolean).join(" ").toLowerCase();
        if (!alvo.includes(t)) return false;
      }
      return true;
    });
  }, [movimentacoes, busca, fStatus, fTipo]);

  const exportColumns = [
    { header: "Tombamento", key: "tombamento" },
    { header: "Bem", key: "bem" },
    { header: "Tipo", key: "tipo_label" },
    { header: "Data", key: "data_movimentacao" },
    { header: "Situação", key: "status_label" },
    { header: "Motivo", key: "motivo" },
  ];

  const exportData = filtradas.map((m) => ({
    tombamento: m.bens_patrimoniais?.numero_tombamento || "—",
    bem: m.bens_patrimoniais?.descricao || "—",
    tipo_label: TIPO_MOVIMENTACAO_LABELS[m.tipo_movimentacao],
    data_movimentacao: m.data_movimentacao,
    status_label: STATUS_MOVIMENTACAO_LABELS[m.status],
    motivo: m.motivo || "—",
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5" /> Movimentações Patrimoniais</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Transferências, trocas de responsável e mudanças de localização, com aprovação e histórico completo.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButtons title="Movimentações Patrimoniais" columns={exportColumns} data={exportData} filename="movimentacoes-patrimoniais" />
            <Button onClick={() => setShowDialog(true)}><Plus className="h-4 w-4 mr-1" /> Nova Movimentação</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar bem ou motivo..." value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={fTipo} onValueChange={setFTipo}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(TIPO_MOVIMENTACAO_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger><SelectValue placeholder="Situação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as situações</SelectItem>
                {Object.entries(STATUS_MOVIMENTACAO_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bem</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtradas.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma movimentação registrada.</TableCell></TableRow>
                  ) : filtradas.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="font-mono text-xs">{m.bens_patrimoniais?.numero_tombamento || "—"}</div>
                        <div className="text-sm truncate max-w-[200px]">{m.bens_patrimoniais?.descricao || "—"}</div>
                      </TableCell>
                      <TableCell>{TIPO_MOVIMENTACAO_LABELS[m.tipo_movimentacao]}</TableCell>
                      <TableCell>{new Date(m.data_movimentacao).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{m.motivo || "—"}</TableCell>
                      <TableCell><Badge variant={statusVariant(m.status) as any}>{STATUS_MOVIMENTACAO_LABELS[m.status]}</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        {m.status === "pendente" && (
                          <>
                            <Button size="icon" variant="ghost" title="Aprovar" onClick={() => atualizarStatus.mutate({ id: m.id, status: "aprovada" })}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" title="Recusar" onClick={() => atualizarStatus.mutate({ id: m.id, status: "recusada" })}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {m.status === "aprovada" && (
                          <Button size="sm" variant="outline" onClick={() => concluirMovimentacao.mutate(m)} disabled={concluirMovimentacao.isPending}>
                            <CheckCheck className="h-4 w-4 mr-1" /> Concluir
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MovimentacaoPatrimonioDialog open={showDialog} onOpenChange={setShowDialog} />
    </div>
  );
}
