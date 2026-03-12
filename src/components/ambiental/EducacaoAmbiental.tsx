import { useState } from "react";
import { useEventosEducacaoAmbiental } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

export function EducacaoAmbiental() {
  const { data, loading, add, update, remove } = useEventosEducacaoAmbiental();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ nome_evento: "", local: "", publico_alvo: "", numero_participantes: "", data_evento: new Date().toISOString().split("T")[0], descricao: "", responsavel: "" });

  const resetForm = () => { setForm({ nome_evento: "", local: "", publico_alvo: "", numero_participantes: "", data_evento: new Date().toISOString().split("T")[0], descricao: "", responsavel: "" }); setEditing(null); };

  const openEdit = (item: any) => { setEditing(item); setForm({ nome_evento: item.nome_evento, local: item.local || "", publico_alvo: item.publico_alvo || "", numero_participantes: item.numero_participantes?.toString() || "", data_evento: item.data_evento, descricao: item.descricao || "", responsavel: item.responsavel || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.nome_evento) return;
    const payload = { ...form, numero_participantes: form.numero_participantes ? parseInt(form.numero_participantes) : 0 };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => !search || d.nome_evento?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar evento..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[220px]" /></div>
        <Button onClick={() => { resetForm(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Novo Evento</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Evento</TableHead><TableHead>Local</TableHead><TableHead>Público</TableHead><TableHead>Participantes</TableHead><TableHead>Data</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum evento</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome_evento}</TableCell>
                <TableCell>{item.local || "—"}</TableCell>
                <TableCell>{item.publico_alvo || "—"}</TableCell>
                <TableCell>{item.numero_participantes || 0}</TableCell>
                <TableCell>{format(new Date(item.data_evento), "dd/MM/yyyy")}</TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Evento" : "Novo Evento de Educação Ambiental"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome do Evento *</Label><Input value={form.nome_evento} onChange={e => setForm({...form, nome_evento: e.target.value})} /></div>
            <div><Label>Local</Label><Input value={form.local} onChange={e => setForm({...form, local: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Público Alvo</Label><Input value={form.publico_alvo} onChange={e => setForm({...form, publico_alvo: e.target.value})} /></div>
              <div><Label>Nº de Participantes</Label><Input type="number" value={form.numero_participantes} onChange={e => setForm({...form, numero_participantes: e.target.value})} /></div>
            </div>
            <div><Label>Data do Evento</Label><Input type="date" value={form.data_evento} onChange={e => setForm({...form, data_evento: e.target.value})} /></div>
            <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
            <div><Label>Responsável</Label><Input value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
