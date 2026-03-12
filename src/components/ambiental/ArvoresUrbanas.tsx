import { useState } from "react";
import { useArvoresUrbanas } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, TreePine } from "lucide-react";

const ESTADOS = ["saudavel", "doente", "morta", "risco_queda"];

export function ArvoresUrbanas() {
  const { data, loading, add, update, remove } = useArvoresUrbanas();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ especie: "", descricao_local: "", latitude: "", longitude: "", data_plantio: "", estado_atual: "saudavel", necessita_poda: false, observacoes: "" });

  const resetForm = () => { setForm({ especie: "", descricao_local: "", latitude: "", longitude: "", data_plantio: "", estado_atual: "saudavel", necessita_poda: false, observacoes: "" }); setEditing(null); };

  const openEdit = (item: any) => { setEditing(item); setForm({ especie: item.especie, descricao_local: item.descricao_local || "", latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "", data_plantio: item.data_plantio || "", estado_atual: item.estado_atual || "saudavel", necessita_poda: item.necessita_poda || false, observacoes: item.observacoes || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.especie) return;
    const payload = { ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null, data_plantio: form.data_plantio || null };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => !search || d.especie?.toLowerCase().includes(search.toLowerCase()) || d.descricao_local?.toLowerCase().includes(search.toLowerCase()));

  const estadoColor: Record<string, string> = { saudavel: "bg-green-100 text-green-800", doente: "bg-yellow-100 text-yellow-800", morta: "bg-muted text-muted-foreground", risco_queda: "bg-red-100 text-red-800" };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar espécie ou local..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[240px]" /></div>
        <Button onClick={() => { resetForm(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /><TreePine className="h-4 w-4 mr-1" />Nova Árvore</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Espécie</TableHead><TableHead>Local</TableHead><TableHead>Estado</TableHead><TableHead>Poda</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma árvore cadastrada</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.especie}</TableCell>
                <TableCell>{item.descricao_local || "—"}</TableCell>
                <TableCell><Badge className={estadoColor[item.estado_atual] || ""}>{item.estado_atual?.replace("_", " ")}</Badge></TableCell>
                <TableCell>{item.necessita_poda ? <Badge className="bg-orange-100 text-orange-800">Sim</Badge> : "Não"}</TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Árvore" : "Nova Árvore"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Espécie *</Label><Input value={form.especie} onChange={e => setForm({...form, especie: e.target.value})} /></div>
            <div><Label>Descrição do Local</Label><Input value={form.descricao_local} onChange={e => setForm({...form, descricao_local: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Latitude</Label><Input value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} /></div>
              <div><Label>Longitude</Label><Input value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Data de Plantio</Label><Input type="date" value={form.data_plantio} onChange={e => setForm({...form, data_plantio: e.target.value})} /></div>
              <div><Label>Estado Atual</Label><Select value={form.estado_atual} onValueChange={v => setForm({...form, estado_atual: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ESTADOS.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={form.necessita_poda} onCheckedChange={v => setForm({...form, necessita_poda: v})} /><Label>Necessita Poda</Label></div>
            <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
