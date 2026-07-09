import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, ClipboardList, ListPlus, Paperclip } from "lucide-react";
import { usePAIF, usePAIFEvolucoes, STATUS_PAIF_LABELS, type PaifAcompanhamento } from "@/hooks/usePAIF";
import { useSocial } from "@/hooks/useSocial";
import { DocumentosSociaisPanel } from "./DocumentosSociaisPanel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function PAIFModule() {
  const [filtro, setFiltro] = useState("todos");
  const { itens, isLoading, salvar, remover } = usePAIF({ situacao: filtro });
  const { unidades, fetchUnidades, familias, fetchFamilias } = useSocial();
  useEffect(() => { fetchUnidades(); fetchFamilias(); }, [fetchUnidades, fetchFamilias]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<PaifAcompanhamento>>({});
  const [detail, setDetail] = useState<PaifAcompanhamento | null>(null);
  const [docsOpen, setDocsOpen] = useState<PaifAcompanhamento | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const { evolucoes, adicionar } = usePAIFEvolucoes(detail?.id);
  const [novaEv, setNovaEv] = useState("");

  const openNew = () => { setForm({ situacao: "ativo", data_inicio: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const openEdit = (p: PaifAcompanhamento) => { setForm(p); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas situações</SelectItem>
            {Object.entries(STATUS_PAIF_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={openNew}><PlusCircle className="h-4 w-4 mr-2" />Novo PAIF</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Família</TableHead><TableHead>Unidade</TableHead>
            <TableHead>Início</TableHead><TableHead>Situação</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={5} className="text-center py-8">Carregando...</TableCell></TableRow>
            : (itens || []).length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground"><ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhum PAIF.</TableCell></TableRow>
            : (itens || []).map(i => (
              <TableRow key={i.id} className="cursor-pointer" onClick={() => setDetail(i)}>
                <TableCell className="font-medium">{i.familia?.responsavel_nome || "—"}</TableCell>
                <TableCell>{i.unidade?.nome || "—"}</TableCell>
                <TableCell>{new Date(i.data_inicio).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell><Badge variant={i.situacao === "ativo" ? "default" : "secondary"}>{STATUS_PAIF_LABELS[i.situacao]}</Badge></TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => setDocsOpen(i)}><Paperclip className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setRemoveId(i.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} PAIF</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Família *</Label>
              <Select value={form.familia_id || ""} onValueChange={(v) => setForm({ ...form, familia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel_nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Unidade</Label>
              <Select value={form.unidade_id || ""} onValueChange={(v) => setForm({ ...form, unidade_id: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Data início</Label><Input type="date" value={form.data_inicio || ""} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} /></div>
              <div><Label>Data encerramento</Label><Input type="date" value={form.data_encerramento || ""} onChange={(e) => setForm({ ...form, data_encerramento: e.target.value })} /></div>
            </div>
            <div><Label>Objetivos</Label><Textarea rows={3} value={form.objetivos || ""} onChange={(e) => setForm({ ...form, objetivos: e.target.value })} /></div>
            <div><Label>Situação</Label>
              <Select value={form.situacao || "ativo"} onValueChange={(v) => setForm({ ...form, situacao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_PAIF_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={async () => { if (!form.familia_id) return; await salvar.mutateAsync(form); setOpen(false); }}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>PAIF — {detail?.familia?.responsavel_nome}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{detail?.objetivos || "Sem objetivos registrados."}</div>
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 flex items-center gap-2"><ListPlus className="h-4 w-4" />Evoluções</h4>
              <div className="flex gap-2 mb-3">
                <Textarea rows={2} placeholder="Nova evolução..." value={novaEv} onChange={(e) => setNovaEv(e.target.value)} />
                <Button onClick={async () => { if (!novaEv.trim() || !detail) return; await adicionar.mutateAsync({ paif_id: detail.id, data: new Date().toISOString().slice(0, 10), descricao: novaEv }); setNovaEv(""); }}>Adicionar</Button>
              </div>
              <div className="space-y-2">
                {(evolucoes || []).map((e: any) => (
                  <div key={e.id} className="border rounded p-2 text-sm">
                    <div className="text-xs text-muted-foreground">{new Date(e.data).toLocaleDateString("pt-BR")}</div>
                    <div>{e.descricao}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!docsOpen} onOpenChange={(o) => !o && setDocsOpen(null)}>
        <DialogContent><DialogHeader><DialogTitle>Documentos PAIF</DialogTitle></DialogHeader>{docsOpen && <DocumentosSociaisPanel entidadeTipo="paif" entidadeId={docsOpen.id} familiaId={docsOpen.familia_id} />}</DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover PAIF?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (removeId) remover.mutate(removeId, { onSuccess: () => setRemoveId(null) }); }}>Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
