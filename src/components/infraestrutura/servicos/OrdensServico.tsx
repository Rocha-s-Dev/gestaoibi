import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, MapPin, FolderOpen, Wrench } from "lucide-react";
import { OrdemServico, PRIORIDADES_OS, STATUS_OS, useOrdensServico } from "@/hooks/useOrdensServico";
import { useServicosEquipes } from "@/hooks/useServicosEquipes";
import { OrdemServicoDialog } from "./OrdemServicoDialog";
import { OrdemServicoDetalhesDialog } from "./OrdemServicoDetalhesDialog";
import { ExportButtons } from "@/components/shared/ExportButtons";

export function OrdensServico() {
  const { ordens, isLoading, deleteOrdem } = useOrdensServico();
  const { equipes } = useServicosEquipes();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [prioridade, setPrioridade] = useState("all");
  const [editOpen, setEditOpen] = useState(false);
  const [detOpen, setDetOpen] = useState(false);
  const [selected, setSelected] = useState<OrdemServico | null>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return ordens.filter(o =>
      (status === "all" || o.status === status) &&
      (prioridade === "all" || o.prioridade === prioridade) &&
      ((o.numero_os ?? "").toLowerCase().includes(s) ||
        (o.tipo_nome ?? "").toLowerCase().includes(s) ||
        (o.bairro ?? "").toLowerCase().includes(s) ||
        (o.solicitante_nome ?? "").toLowerCase().includes(s) ||
        (o.descricao ?? "").toLowerCase().includes(s))
    );
  }, [ordens, q, status, prioridade]);

  const hoje = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total: ordens.length,
    abertas: ordens.filter(o => ["aberta", "designada", "em_execucao"].includes(o.status)).length,
    concluidas: ordens.filter(o => o.status === "concluida").length,
    atrasadas: ordens.filter(o => o.data_prevista && o.data_prevista < hoje && !["concluida", "cancelada"].includes(o.status)).length,
  }), [ordens, hoje]);

  const equipeNome = (id: string | null) => equipes.find(e => e.id === id)?.nome ?? "-";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Total de OS</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Em aberto</div><div className="text-2xl font-bold text-blue-600">{stats.abertas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Concluídas</div><div className="text-2xl font-bold text-green-600">{stats.concluidas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Atrasadas</div><div className="text-2xl font-bold text-destructive">{stats.atrasadas}</div></CardContent></Card>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Buscar OS, tipo, bairro..." value={q} onChange={e => setQ(e.target.value)} className="pl-10" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              {STATUS_OS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={prioridade} onValueChange={setPrioridade}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              {PRIORIDADES_OS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons
            title="Ordens de Serviço"
            filename="ordens-servico"
            data={filtered}
            columns={[
              { header: "Nº OS", key: "numero_os" },
              { header: "Tipo", key: "tipo_nome" },
              { header: "Bairro", key: "bairro" },
              { header: "Situação", key: "status" },
              { header: "Prioridade", key: "prioridade" },
              { header: "Prazo", key: "data_prevista" },
            ]}
          />
          <Button onClick={() => { setSelected(null); setEditOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova OS</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>OS / Tipo</TableHead><TableHead>Local</TableHead><TableHead>Equipe</TableHead>
            <TableHead>Prazo</TableHead><TableHead>Prioridade</TableHead><TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Nenhuma ordem de serviço encontrada.</TableCell></TableRow>
            )}
            {filtered.map(o => {
              const st = STATUS_OS.find(s => s.value === o.status) ?? STATUS_OS[0];
              const atrasada = o.data_prevista && o.data_prevista < hoje && !["concluida", "cancelada"].includes(o.status);
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-medium flex items-center"><Wrench className="h-4 w-4 mr-2" />{o.numero_os ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.tipo_nome ?? "-"}{o.categoria ? ` · ${o.categoria}` : ""}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center"><MapPin className="h-3 w-3 mr-1" />{o.bairro ?? "-"}</div>
                    <div className="text-xs text-muted-foreground">{o.endereco ?? ""}</div>
                  </TableCell>
                  <TableCell className="text-sm">{equipeNome(o.equipe_id)}</TableCell>
                  <TableCell className="text-sm">
                    {o.data_prevista ? new Date(o.data_prevista + "T00:00:00").toLocaleDateString("pt-BR") : "-"}
                    {atrasada && <div className="text-xs text-destructive">Atrasada</div>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{PRIORIDADES_OS.find(p => p.value === o.prioridade)?.label ?? o.prioridade}</Badge></TableCell>
                  <TableCell><Badge className={st.color}>{st.label}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(o); setDetOpen(true); }}><FolderOpen className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setSelected(o); setEditOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteOrdem.mutate(o.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrdemServicoDialog open={editOpen} onOpenChange={setEditOpen} ordem={selected} />
      <OrdemServicoDetalhesDialog open={detOpen} onOpenChange={setDetOpen} ordem={selected} />
    </div>
  );
}
