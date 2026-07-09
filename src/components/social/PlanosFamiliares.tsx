import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Pencil, Trash2, ClipboardCheck, ListPlus, Paperclip } from "lucide-react";
import { usePlanosFamiliares, usePlanoAcoes, usePlanoEvolucoes, STATUS_PLANO_LABELS, STATUS_ACAO_LABELS, type PlanoFamiliar } from "@/hooks/usePlanosFamiliares";
import { useSocial } from "@/hooks/useSocial";
import { DocumentosSociaisPanel } from "./DocumentosSociaisPanel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function PlanosFamiliares() {
  const [filtro, setFiltro] = useState("todos");
  const { planos, isLoading, salvar, remover } = usePlanosFamiliares({ situacao: filtro });
  const { unidades, fetchUnidades, familias, fetchFamilias } = useSocial();
  useEffect(() => { fetchUnidades(); fetchFamilias(); }, [fetchUnidades, fetchFamilias]);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<PlanoFamiliar>>({});
  const [detail, setDetail] = useState<PlanoFamiliar | null>(null);
  const [docsOpen, setDocsOpen] = useState<PlanoFamiliar | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const { acoes, salvar: salvarAcao, remover: removerAcao } = usePlanoAcoes(detail?.id);
  const { evolucoes, adicionar: addEv } = usePlanoEvolucoes(detail?.id);
  const [novaAcao, setNovaAcao] = useState<any>({ descricao: "", status: "pendente" });
  const [novaEv, setNovaEv] = useState("");

  const openNew = () => { setForm({ situacao: "em_elaboracao", data_inicio: new Date().toISOString().slice(0, 10) }); setOpen(true); };
  const openEdit = (p: PlanoFamiliar) => { setForm(p); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="todos">Todas situações</SelectItem>{Object.entries(STATUS_PLANO_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
        </Select>
        <Button size="sm" onClick={openNew}><PlusCircle className="h-4 w-4 mr-2" />Novo Plano</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Título</TableHead><TableHead>Família</TableHead><TableHead>Início</TableHead>
            <TableHead>Prazo</TableHead><TableHead>Situação</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
            : (planos || []).length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhum plano.</TableCell></TableRow>
            : (planos || []).map(p => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => setDetail(p)}>
                <TableCell className="font-medium">{p.titulo}</TableCell>
                <TableCell>{p.familia?.responsavel_nome || "—"}</TableCell>
                <TableCell>{new Date(p.data_inicio).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{p.data_prevista_fim ? new Date(p.data_prevista_fim).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell><Badge>{STATUS_PLANO_LABELS[p.situacao]}</Badge></TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" onClick={() => setDocsOpen(p)}><Paperclip className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setRemoveId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} Plano</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Título *</Label><Input value={form.titulo || ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
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
            <div><Label>Objetivos</Label><Textarea rows={2} value={form.objetivos || ""} onChange={(e) => setForm({ ...form, objetivos: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Início</Label><Input type="date" value={form.data_inicio || ""} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} /></div>
              <div><Label>Prazo</Label><Input type="date" value={form.data_prevista_fim || ""} onChange={(e) => setForm({ ...form, data_prevista_fim: e.target.value })} /></div>
            </div>
            <div><Label>Situação</Label>
              <Select value={form.situacao || "em_elaboracao"} onValueChange={(v) => setForm({ ...form, situacao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS_PLANO_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Resultados</Label><Textarea rows={2} value={form.resultados || ""} onChange={(e) => setForm({ ...form, resultados: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={async () => { if (!form.titulo || !form.familia_id) return; await salvar.mutateAsync(form); setOpen(false); }}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{detail?.titulo}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">{detail?.objetivos}</div>
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2 flex items-center gap-2"><ListPlus className="h-4 w-4" />Ações</h4>
              <div className="flex gap-2 mb-3">
                <Input placeholder="Descrição da ação" value={novaAcao.descricao} onChange={(e) => setNovaAcao({ ...novaAcao, descricao: e.target.value })} />
                <Input type="date" className="w-40" value={novaAcao.prazo || ""} onChange={(e) => setNovaAcao({ ...novaAcao, prazo: e.target.value })} />
                <Button onClick={async () => { if (!novaAcao.descricao.trim() || !detail) return; await salvarAcao.mutateAsync({ ...novaAcao, plano_id: detail.id }); setNovaAcao({ descricao: "", status: "pendente" }); }}>Adicionar</Button>
              </div>
              <div className="space-y-1">
                {(acoes || []).map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between border rounded p-2 text-sm">
                    <div className="flex-1"><div>{a.descricao}</div>{a.prazo && <div className="text-xs text-muted-foreground">Prazo: {new Date(a.prazo).toLocaleDateString("pt-BR")}</div>}</div>
                    <Select value={a.status} onValueChange={(v) => salvarAcao.mutate({ ...a, status: v })}>
                      <SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(STATUS_ACAO_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removerAcao.mutate(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3">
              <h4 className="font-medium mb-2">Evoluções</h4>
              <div className="flex gap-2 mb-3">
                <Textarea rows={2} placeholder="Nova evolução..." value={novaEv} onChange={(e) => setNovaEv(e.target.value)} />
                <Button onClick={async () => { if (!novaEv.trim() || !detail) return; await addEv.mutateAsync({ plano_id: detail.id, data: new Date().toISOString().slice(0, 10), descricao: novaEv }); setNovaEv(""); }}>Registrar</Button>
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
        <DialogContent><DialogHeader><DialogTitle>Documentos do plano</DialogTitle></DialogHeader>{docsOpen && <DocumentosSociaisPanel entidadeTipo="plano_familiar" entidadeId={docsOpen.id} familiaId={docsOpen.familia_id} />}</DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover plano?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (removeId) remover.mutate(removeId, { onSuccess: () => setRemoveId(null) }); }}>Confirmar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
