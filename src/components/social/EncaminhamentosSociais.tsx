import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, Send, History } from "lucide-react";
import { useEncaminhamentosSociais, useEncaminhamentoHistorico, STATUS_ENC_LABELS, DESTINO_LABELS, type EncaminhamentoSocial } from "@/hooks/useEncaminhamentosSociais";
import { useSocial } from "@/hooks/useSocial";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusColor: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  aberto: "outline", enviado: "secondary", em_atendimento: "secondary",
  concluido: "default", sem_retorno: "destructive", cancelado: "destructive",
};

export function EncaminhamentosSociais() {
  const [status, setStatus] = useState("todos");
  const [destino, setDestino] = useState("todos");
  const { encaminhamentos, isLoading, salvar, remover } = useEncaminhamentosSociais({ status, destino });
  const { unidades, fetchUnidades, familias, fetchFamilias } = useSocial();
  useEffect(() => { fetchUnidades(); fetchFamilias(); }, [fetchUnidades, fetchFamilias]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<EncaminhamentoSocial>>({});
  const [histFor, setHistFor] = useState<EncaminhamentoSocial | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const { historico } = useEncaminhamentoHistorico(histFor?.id);

  const openNew = () => { setForm({ status: "aberto", destino: "saude", data_encaminhamento: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const openEdit = (e: EncaminhamentoSocial) => { setForm(e); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos status</SelectItem>{Object.entries(STATUS_ENC_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={destino} onValueChange={setDestino}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos destinos</SelectItem>{Object.entries(DESTINO_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={openNew}><PlusCircle className="h-4 w-4 mr-2" />Novo Encaminhamento</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Protocolo</TableHead><TableHead>Data</TableHead><TableHead>Família</TableHead>
            <TableHead>Destino</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
            : (encaminhamentos || []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><Send className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhum encaminhamento.</TableCell></TableRow>
            : (encaminhamentos || []).map(e => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.protocolo}</TableCell>
                <TableCell>{new Date(e.data_encaminhamento).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{e.familia?.responsavel_nome || "—"}</TableCell>
                <TableCell>{DESTINO_LABELS[e.destino] || e.destino}</TableCell>
                <TableCell>
                  <Select value={e.status} onValueChange={(v) => salvar.mutate({ ...e, status: v })}>
                    <SelectTrigger className="h-8 w-[150px]"><Badge variant={statusColor[e.status] || "outline"}>{STATUS_ENC_LABELS[e.status]}</Badge></SelectTrigger>
                    <SelectContent>{Object.entries(STATUS_ENC_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setHistFor(e)}><History className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setRemoveId(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} Encaminhamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Família</Label>
              <Select value={form.familia_id || ""} onValueChange={(v) => setForm({ ...form, familia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel_nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Destino *</Label>
                <Select value={form.destino || "saude"} onValueChange={(v) => setForm({ ...form, destino: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(DESTINO_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Detalhe/órgão</Label><Input value={form.destino_detalhe || ""} onChange={(e) => setForm({ ...form, destino_detalhe: e.target.value })} /></div>
            </div>
            <div><Label>Motivo *</Label><Textarea rows={2} value={form.motivo || ""} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Data</Label><Input type="date" value={form.data_encaminhamento || ""} onChange={(e) => setForm({ ...form, data_encaminhamento: e.target.value })} /></div>
              <div><Label>Data retorno</Label><Input type="date" value={form.data_retorno || ""} onChange={(e) => setForm({ ...form, data_retorno: e.target.value })} /></div>
            </div>
            <div><Label>Unidade</Label>
              <Select value={form.unidade_id || ""} onValueChange={(v) => setForm({ ...form, unidade_id: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Retorno / observações</Label><Textarea rows={2} value={form.retorno || ""} onChange={(e) => setForm({ ...form, retorno: e.target.value })} /></div>
            <div><Label>Status</Label>
              <Select value={form.status || "aberto"} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_ENC_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={async () => { if (!form.motivo || !form.destino) return; await salvar.mutateAsync(form); setOpen(false); }}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!histFor} onOpenChange={(o) => !o && setHistFor(null)}>
        <DialogContent><DialogHeader><DialogTitle>Histórico — {histFor?.protocolo}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {(historico || []).map((h: any) => (
              <div key={h.id} className="border rounded p-2 text-sm">
                <div className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleString("pt-BR")}</div>
                <div>{h.status_anterior ? `${STATUS_ENC_LABELS[h.status_anterior]} → ` : "Criado como "}<strong>{STATUS_ENC_LABELS[h.status_novo]}</strong></div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover encaminhamento?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (removeId) remover.mutate(removeId, { onSuccess: () => setRemoveId(null) }); }}>Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
