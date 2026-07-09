import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Pencil, Trash2, Package, Paperclip } from "lucide-react";
import { useBeneficiosContinuados, STATUS_BC_LABELS, PERIODICIDADE_LABELS, type BeneficioContinuado } from "@/hooks/useBeneficiosContinuados";
import { useSocial } from "@/hooks/useSocial";
import { DocumentosSociaisPanel } from "./DocumentosSociaisPanel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  ativo: "default", suspenso: "secondary", encerrado: "outline", cancelado: "destructive",
};

export function BeneficiosContinuados() {
  const [filtroSituacao, setFiltroSituacao] = useState("todos");
  const [filtroUnidade, setFiltroUnidade] = useState("todos");
  const { beneficios, isLoading, salvar, remover } = useBeneficiosContinuados({ situacao: filtroSituacao, unidadeId: filtroUnidade });
  const { unidades, fetchUnidades, familias, fetchFamilias, membros, fetchMembros } = useSocial();
  useEffect(() => { fetchUnidades(); fetchFamilias(); }, [fetchUnidades, fetchFamilias]);

  const [open, setOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState<BeneficioContinuado | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<BeneficioContinuado>>({});
  const [vinculo, setVinculo] = useState<"familia" | "membro">("familia");

  useEffect(() => { if (form.familia_id && vinculo === "membro") fetchMembros(form.familia_id); }, [form.familia_id, vinculo, fetchMembros]);

  const openNew = () => { setForm({ situacao: "ativo", periodicidade: "mensal", data_inicio: new Date().toISOString().slice(0, 10) }); setVinculo("familia"); setOpen(true); };
  const openEdit = (b: BeneficioContinuado) => { setForm(b); setVinculo(b.membro_id ? "membro" : "familia"); setOpen(true); };

  const handleSave = async () => {
    if (!form.programa || !form.beneficio || !form.familia_id) return;
    const payload = { ...form };
    if (vinculo === "familia") payload.membro_id = null;
    await salvar.mutateAsync(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Select value={filtroSituacao} onValueChange={setFiltroSituacao}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as situações</SelectItem>
              {Object.entries(STATUS_BC_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
            <SelectTrigger className="w-[220px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as unidades</SelectItem>
              {unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew} size="sm"><PlusCircle className="h-4 w-4 mr-2" />Novo Benefício</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Família</TableHead>
              <TableHead>Programa</TableHead>
              <TableHead>Benefício</TableHead>
              <TableHead className="hidden md:table-cell">Valor</TableHead>
              <TableHead className="hidden md:table-cell">Período</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : (beneficios || []).length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhum benefício continuado.</TableCell></TableRow>
            ) : (beneficios || []).map(b => (
              <TableRow key={b.id}>
                <TableCell className="font-medium">{b.familia?.responsavel_nome || "—"}</TableCell>
                <TableCell>{b.programa}</TableCell>
                <TableCell>{b.beneficio}</TableCell>
                <TableCell className="hidden md:table-cell">{b.valor > 0 ? b.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"}</TableCell>
                <TableCell className="hidden md:table-cell text-sm">{new Date(b.data_inicio).toLocaleDateString("pt-BR")}{b.data_fim ? " → " + new Date(b.data_fim).toLocaleDateString("pt-BR") : ""}</TableCell>
                <TableCell><Badge variant={statusColor[b.situacao] || "outline"}>{STATUS_BC_LABELS[b.situacao] || b.situacao}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setDocsOpen(b)}><Paperclip className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setRemoveId(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} Benefício Continuado</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Vínculo</Label>
              <RadioGroup value={vinculo} onValueChange={(v: any) => setVinculo(v)} className="flex gap-4 mt-1">
                <div className="flex items-center gap-2"><RadioGroupItem value="familia" id="v-f" /><Label htmlFor="v-f" className="font-normal">Família inteira</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="membro" id="v-m" /><Label htmlFor="v-m" className="font-normal">Membro específico</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label>Família *</Label>
              <Select value={form.familia_id || ""} onValueChange={(v) => setForm({ ...form, familia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel_nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {vinculo === "membro" && (
              <div>
                <Label>Membro</Label>
                <Select value={form.membro_id || ""} onValueChange={(v) => setForm({ ...form, membro_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{membros.map(m => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Programa *</Label><Input value={form.programa || ""} onChange={(e) => setForm({ ...form, programa: e.target.value })} /></div>
              <div><Label>Benefício *</Label><Input value={form.beneficio || ""} onChange={(e) => setForm({ ...form, beneficio: e.target.value })} /></div>
              <div><Label>Data início</Label><Input type="date" value={form.data_inicio || ""} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} /></div>
              <div><Label>Data fim</Label><Input type="date" value={form.data_fim || ""} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} /></div>
              <div><Label>Valor</Label><Input type="number" step="0.01" value={form.valor ?? 0} onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })} /></div>
              <div>
                <Label>Periodicidade</Label>
                <Select value={form.periodicidade || "mensal"} onValueChange={(v) => setForm({ ...form, periodicidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(PERIODICIDADE_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Situação</Label>
                <Select value={form.situacao || "ativo"} onValueChange={(v) => setForm({ ...form, situacao: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(STATUS_BC_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Unidade</Label>
                <Select value={form.unidade_id || ""} onValueChange={(v) => setForm({ ...form, unidade_id: v })}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>{unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2"><Label>Observações</Label><Textarea rows={3} value={form.observacoes || ""} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={salvar.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!docsOpen} onOpenChange={(o) => !o && setDocsOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Documentos — {docsOpen?.beneficio}</DialogTitle></DialogHeader>
          {docsOpen && <DocumentosSociaisPanel entidadeTipo="beneficio_continuado" entidadeId={docsOpen.id} familiaId={docsOpen.familia_id} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remover?</AlertDialogTitle><AlertDialogDescription>Considere alterar para "cancelado" ou "encerrado".</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (removeId) remover.mutate(removeId, { onSuccess: () => setRemoveId(null) }); }}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
