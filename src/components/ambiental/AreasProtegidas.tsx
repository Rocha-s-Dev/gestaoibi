import { useState } from "react";
import { useAreasProtegidas } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const TIPOS = [
  { value: "parque_municipal", label: "Parque Municipal" },
  { value: "area_preservacao_permanente", label: "Área de Preservação Permanente" },
  { value: "reserva_ambiental", label: "Reserva Ambiental" },
  { value: "area_protecao_nascente", label: "Área de Proteção de Nascente" },
];

const STATUS_CONSERVACAO = ["bom", "regular", "degradado", "em_recuperacao"];

export function AreasProtegidas() {
  const { data, loading, add, update, remove } = useAreasProtegidas();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ nome: "", tipo: "parque_municipal", area_hectares: "", descricao_local: "", latitude: "", longitude: "", status_conservacao: "bom", orgao_responsavel: "" });

  const resetForm = () => { setForm({ nome: "", tipo: "parque_municipal", area_hectares: "", descricao_local: "", latitude: "", longitude: "", status_conservacao: "bom", orgao_responsavel: "" }); setEditing(null); };

  const openEdit = (item: any) => { setEditing(item); setForm({ nome: item.nome, tipo: item.tipo, area_hectares: item.area_hectares?.toString() || "", descricao_local: item.descricao_local || "", latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "", status_conservacao: item.status_conservacao || "bom", orgao_responsavel: item.orgao_responsavel || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.nome) return;
    const payload = { ...form, area_hectares: form.area_hectares ? parseFloat(form.area_hectares) : null, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => !search || d.nome?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar área..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[220px]" /></div>
        <Button onClick={() => { resetForm(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Nova Área</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Área (ha)</TableHead><TableHead>Conservação</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma área cadastrada</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell>{TIPOS.find(t => t.value === item.tipo)?.label || item.tipo}</TableCell>
                <TableCell>{item.area_hectares || "—"}</TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{item.status_conservacao?.replace("_", " ")}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Área" : "Nova Área Protegida"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Tipo</Label><Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Área (hectares)</Label><Input type="number" value={form.area_hectares} onChange={e => setForm({...form, area_hectares: e.target.value})} /></div>
            </div>
            <div><Label>Descrição do Local</Label><Textarea value={form.descricao_local} onChange={e => setForm({...form, descricao_local: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Latitude</Label><Input value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} /></div>
              <div><Label>Longitude</Label><Input value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Conservação</Label><Select value={form.status_conservacao} onValueChange={v => setForm({...form, status_conservacao: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_CONSERVACAO.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Órgão Responsável</Label><Input value={form.orgao_responsavel} onChange={e => setForm({...form, orgao_responsavel: e.target.value})} /></div>
            </div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
