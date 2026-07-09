import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, Gauge } from "lucide-react";
import { useVulnerabilidade, NIVEIS_VULNERABILIDADE, type VulnerabilidadeAvaliacao } from "@/hooks/useVulnerabilidade";
import { useSocial } from "@/hooks/useSocial";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const CRITERIOS: { key: keyof VulnerabilidadeAvaliacao; label: string; max: number }[] = [
  { key: "criterio_renda", label: "Renda insuficiente", max: 5 },
  { key: "criterio_desemprego", label: "Desemprego", max: 3 },
  { key: "criterio_moradia", label: "Moradia inadequada", max: 4 },
  { key: "criterio_deficiencia", label: "Pessoa com deficiência", max: 3 },
  { key: "criterio_idoso", label: "Idoso na família", max: 2 },
  { key: "criterio_gestante", label: "Gestante", max: 2 },
  { key: "criterio_crianca", label: "Crianças", max: 3 },
  { key: "criterio_violencia", label: "Violência", max: 5 },
  { key: "criterio_abandono", label: "Abandono", max: 4 },
  { key: "criterio_dependencia_quimica", label: "Dependência química", max: 4 },
];

export function VulnerabilidadeAvaliacoes() {
  const { avaliacoes, isLoading, salvar, remover } = useVulnerabilidade();
  const { familias, fetchFamilias } = useSocial();
  useEffect(() => { fetchFamilias(); }, [fetchFamilias]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<VulnerabilidadeAvaliacao>>({});
  const [removeId, setRemoveId] = useState<string | null>(null);

  const openNew = () => {
    const initial: any = { data_avaliacao: new Date().toISOString().slice(0, 10) };
    CRITERIOS.forEach(c => (initial[c.key] = 0));
    setForm(initial); setOpen(true);
  };
  const openEdit = (v: VulnerabilidadeAvaliacao) => { setForm(v); setOpen(true); };

  const total = CRITERIOS.reduce((s, c) => s + (Number((form as any)[c.key]) || 0), 0);
  const nivelPreview = total >= 25 ? "muito_alta" : total >= 15 ? "alta" : total >= 7 ? "media" : "baixa";

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={openNew}><PlusCircle className="h-4 w-4 mr-2" />Nova Avaliação</Button></div>

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Data</TableHead><TableHead>Família</TableHead><TableHead>Pontuação</TableHead>
            <TableHead>Nível</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
            : (avaliacoes || []).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground"><Gauge className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhuma avaliação.</TableCell></TableRow>
            : (avaliacoes || []).map(a => {
              const nivel = a.nivel_manual || a.nivel_calculado;
              const info = NIVEIS_VULNERABILIDADE[nivel];
              return (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.data_avaliacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-medium">{a.familia?.responsavel_nome || "—"}</TableCell>
                  <TableCell>{a.pontuacao_total}</TableCell>
                  <TableCell><span className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${info?.color || ""}`}>{info?.label}</span></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setRemoveId(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Avaliação de Vulnerabilidade</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Família *</Label>
              <Select value={form.familia_id || ""} onValueChange={(v) => setForm({ ...form, familia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel_nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Data</Label><Input type="date" value={form.data_avaliacao || ""} onChange={(e) => setForm({ ...form, data_avaliacao: e.target.value })} /></div>
            <div className="border rounded p-3 space-y-2">
              <div className="text-sm font-medium">Critérios (0 = ausente)</div>
              <div className="grid grid-cols-2 gap-2">
                {CRITERIOS.map(c => (
                  <div key={c.key as string} className="flex items-center justify-between gap-2">
                    <Label className="text-sm">{c.label} <span className="text-xs text-muted-foreground">(0-{c.max})</span></Label>
                    <Input type="number" min={0} max={c.max} className="w-20" value={(form as any)[c.key] ?? 0} onChange={(e) => setForm({ ...form, [c.key]: Math.min(c.max, Math.max(0, parseInt(e.target.value) || 0)) } as any)} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm">Pontuação: <strong>{total}</strong></div>
                <div>Nível calculado: <Badge>{NIVEIS_VULNERABILIDADE[nivelPreview]?.label}</Badge></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nível manual (opcional)</Label>
                <Select value={form.nivel_manual || ""} onValueChange={(v) => setForm({ ...form, nivel_manual: v || null })}>
                  <SelectTrigger><SelectValue placeholder="Usar calculado" /></SelectTrigger>
                  <SelectContent>{Object.entries(NIVEIS_VULNERABILIDADE).map(([k, l]) => <SelectItem key={k} value={k}>{l.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Justificativa (obrigatória se manual)</Label><Input value={form.justificativa_manual || ""} onChange={(e) => setForm({ ...form, justificativa_manual: e.target.value })} /></div>
            </div>
            <div><Label>Observações</Label><Textarea rows={2} value={form.observacoes || ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={async () => { if (!form.familia_id) return; if (form.nivel_manual && !form.justificativa_manual) return; await salvar.mutateAsync(form); setOpen(false); }}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover avaliação?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (removeId) remover.mutate(removeId, { onSuccess: () => setRemoveId(null) }); }}>Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
