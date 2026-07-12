import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Building, MapPin, Trash2, FolderOpen } from "lucide-react";
import { Obra, SITUACOES_OBRA, useObras } from "@/hooks/useObras";
import { ObraCompletaDialog } from "./ObraCompletaDialog";
import { ObraDetalhesDialog } from "./ObraDetalhesDialog";

export function GestaoObrasPublicas() {
  const { obras, isLoading, deleteObra } = useObras();
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [detOpen, setDetOpen] = useState(false);
  const [selected, setSelected] = useState<Obra | null>(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return obras.filter(o =>
      o.nome.toLowerCase().includes(s) ||
      (o.numero_obra ?? "").toLowerCase().includes(s) ||
      (o.empresa_executora ?? "").toLowerCase().includes(s) ||
      (o.bairro ?? "").toLowerCase().includes(s)
    );
  }, [obras, q]);

  const stats = useMemo(() => {
    const total = obras.length;
    const andamento = obras.filter(o => o.situacao === "andamento").length;
    const concluidas = obras.filter(o => o.situacao === "concluida").length;
    const contratado = obras.reduce((a, o) => a + Number(o.valor_contratado || 0), 0);
    return { total, andamento, concluidas, contratado };
  }, [obras]);

  const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Total</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Em andamento</div><div className="text-2xl font-bold text-green-600">{stats.andamento}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Concluídas</div><div className="text-2xl font-bold">{stats.concluidas}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Valor contratado</div><div className="text-xl font-bold">{brl(stats.contratado)}</div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar obra, empresa, bairro..." value={q} onChange={e => setQ(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setSelected(null); setEditOpen(true); }}><Plus className="h-4 w-4 mr-2" />Nova Obra</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Obra</TableHead><TableHead>Local</TableHead><TableHead>Empresa</TableHead>
            <TableHead>Valores</TableHead><TableHead>% Físico</TableHead><TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>}
            {!isLoading && filtered.map(o => {
              const s = SITUACOES_OBRA.find(x => x.value === o.situacao) ?? SITUACOES_OBRA[0];
              return (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-medium flex items-center"><Building className="h-4 w-4 mr-2" />{o.nome}</div>
                    {o.numero_obra && <div className="text-xs text-muted-foreground">Nº {o.numero_obra}</div>}
                    {o.categoria && <div className="text-xs text-muted-foreground">{o.categoria} · {o.tipo}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm flex items-center"><MapPin className="h-3 w-3 mr-1" />{o.bairro ?? "-"}</div>
                    <div className="text-xs text-muted-foreground">{o.endereco}</div>
                  </TableCell>
                  <TableCell className="text-sm">{o.empresa_executora ?? "-"}</TableCell>
                  <TableCell className="text-xs">
                    <div>Contr.: <b>{brl(Number(o.valor_contratado || 0))}</b></div>
                    <div className="text-muted-foreground">Exec.: {brl(Number(o.valor_executado || 0))}</div>
                  </TableCell>
                  <TableCell>{o.percentual_fisico ?? 0}%</TableCell>
                  <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" title="Detalhes" onClick={() => { setSelected(o); setDetOpen(true); }}><FolderOpen className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Editar" onClick={() => { setSelected(o); setEditOpen(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="Excluir" onClick={() => confirm("Excluir obra?") && deleteObra.mutate(o.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <Building className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />Nenhuma obra encontrada.
              </TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ObraCompletaDialog open={editOpen} onOpenChange={setEditOpen} obra={selected} />
      <ObraDetalhesDialog open={detOpen} onOpenChange={setDetOpen} obra={selected} />
    </div>
  );
}
