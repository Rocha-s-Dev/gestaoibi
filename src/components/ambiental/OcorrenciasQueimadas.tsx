import { useState } from "react";
import { useOcorrenciasQueimadas } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Flame } from "lucide-react";
import { format } from "date-fns";

const STATUS = [
  { value: "registrada", label: "Registrada", color: "bg-yellow-100 text-yellow-800" },
  { value: "em_investigacao", label: "Em Investigação", color: "bg-orange-100 text-orange-800" },
  { value: "resolvida", label: "Resolvida", color: "bg-green-100 text-green-800" },
];

export function OcorrenciasQueimadas() {
  const { data, loading, add, update, remove } = useOcorrenciasQueimadas();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({ local: "", latitude: "", longitude: "", data_ocorrencia: new Date().toISOString().split("T")[0], area_afetada_hectares: "", possivel_responsavel: "", acoes_realizadas: "", status: "registrada" });

  const resetForm = () => { setForm({ local: "", latitude: "", longitude: "", data_ocorrencia: new Date().toISOString().split("T")[0], area_afetada_hectares: "", possivel_responsavel: "", acoes_realizadas: "", status: "registrada" }); setEditing(null); };

  const openEdit = (item: any) => { setEditing(item); setForm({ local: item.local, latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "", data_ocorrencia: item.data_ocorrencia, area_afetada_hectares: item.area_afetada_hectares?.toString() || "", possivel_responsavel: item.possivel_responsavel || "", acoes_realizadas: item.acoes_realizadas || "", status: item.status }); setOpen(true); };

  const handleSave = async () => {
    if (!form.local) return;
    const payload = { ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null, area_afetada_hectares: form.area_afetada_hectares ? parseFloat(form.area_afetada_hectares) : null };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => {
    if (search && !d.local?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar local..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[200px]" /></div>
          <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos status</SelectItem>{STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /><Flame className="h-4 w-4 mr-1" />Nova Ocorrência</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Local</TableHead><TableHead>Data</TableHead><TableHead>Área (ha)</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma ocorrência</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.local}</TableCell>
                <TableCell>{format(new Date(item.data_ocorrencia), "dd/MM/yyyy")}</TableCell>
                <TableCell>{item.area_afetada_hectares || "—"}</TableCell>
                <TableCell><Badge className={STATUS.find(s => s.value === item.status)?.color}>{STATUS.find(s => s.value === item.status)?.label}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Ocorrência" : "Nova Ocorrência de Queimada"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Local *</Label><Input value={form.local} onChange={e => setForm({...form, local: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Data</Label><Input type="date" value={form.data_ocorrencia} onChange={e => setForm({...form, data_ocorrencia: e.target.value})} /></div>
              <div><Label>Área Afetada (ha)</Label><Input type="number" value={form.area_afetada_hectares} onChange={e => setForm({...form, area_afetada_hectares: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Latitude</Label><Input value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} /></div>
              <div><Label>Longitude</Label><Input value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} /></div>
            </div>
            <div><Label>Possível Responsável</Label><Input value={form.possivel_responsavel} onChange={e => setForm({...form, possivel_responsavel: e.target.value})} /></div>
            <div><Label>Ações Realizadas</Label><Textarea value={form.acoes_realizadas} onChange={e => setForm({...form, acoes_realizadas: e.target.value})} /></div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
