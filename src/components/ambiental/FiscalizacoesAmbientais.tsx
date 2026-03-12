import { useState } from "react";
import { useFiscalizacoesAmbientais } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

const TIPOS = [
  { value: "denuncia", label: "Denúncia" },
  { value: "rotina", label: "Rotina" },
  { value: "licenciamento", label: "Licenciamento" },
  { value: "operacao_ambiental", label: "Operação Ambiental" },
];

const STATUS = [
  { value: "agendada", label: "Agendada" },
  { value: "realizada", label: "Realizada" },
  { value: "infracao_detectada", label: "Infração Detectada" },
  { value: "encerrada", label: "Encerrada" },
];

const statusColor: Record<string, string> = {
  agendada: "bg-blue-100 text-blue-800",
  realizada: "bg-green-100 text-green-800",
  infracao_detectada: "bg-red-100 text-red-800",
  encerrada: "bg-muted text-muted-foreground",
};

export function FiscalizacoesAmbientais() {
  const { data, loading, add, update, remove } = useFiscalizacoesAmbientais();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");

  const [form, setForm] = useState({
    tipo_fiscalizacao: "rotina", local: "", latitude: "", longitude: "",
    data_fiscalizacao: new Date().toISOString().split("T")[0],
    irregularidades_encontradas: "", acoes_tomadas: "", status: "agendada",
  });

  const resetForm = () => {
    setForm({ tipo_fiscalizacao: "rotina", local: "", latitude: "", longitude: "", data_fiscalizacao: new Date().toISOString().split("T")[0], irregularidades_encontradas: "", acoes_tomadas: "", status: "agendada" });
    setEditing(null);
  };

  const openNew = () => { resetForm(); setOpen(true); };
  const openEdit = (item: any) => {
    setEditing(item);
    setForm({ tipo_fiscalizacao: item.tipo_fiscalizacao, local: item.local, latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "", data_fiscalizacao: item.data_fiscalizacao, irregularidades_encontradas: item.irregularidades_encontradas || "", acoes_tomadas: item.acoes_tomadas || "", status: item.status });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.local) { return; }
    const payload = { ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => {
    if (search && !d.local?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    if (filterTipo !== "all" && d.tipo_fiscalizacao !== filterTipo) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar local..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[200px]" /></div>
          <Select value={filterTipo} onValueChange={setFilterTipo}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos status</SelectItem>{STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Nova Fiscalização</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Local</TableHead><TableHead>Tipo</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma fiscalização encontrada</TableCell></TableRow> :
                filtered.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.local}</TableCell>
                    <TableCell>{TIPOS.find(t => t.value === item.tipo_fiscalizacao)?.label || item.tipo_fiscalizacao}</TableCell>
                    <TableCell>{format(new Date(item.data_fiscalizacao), "dd/MM/yyyy")}</TableCell>
                    <TableCell><Badge className={statusColor[item.status] || ""}>{STATUS.find(s => s.value === item.status)?.label || item.status}</Badge></TableCell>
                    <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Fiscalização" : "Nova Fiscalização"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Local *</Label><Input value={form.local} onChange={e => setForm({...form, local: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Tipo</Label><Select value={form.tipo_fiscalizacao} onValueChange={v => setForm({...form, tipo_fiscalizacao: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Data</Label><Input type="date" value={form.data_fiscalizacao} onChange={e => setForm({...form, data_fiscalizacao: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Latitude</Label><Input value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} /></div>
              <div><Label>Longitude</Label><Input value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} /></div>
            </div>
            <div><Label>Irregularidades Encontradas</Label><Textarea value={form.irregularidades_encontradas} onChange={e => setForm({...form, irregularidades_encontradas: e.target.value})} /></div>
            <div><Label>Ações Tomadas</Label><Textarea value={form.acoes_tomadas} onChange={e => setForm({...form, acoes_tomadas: e.target.value})} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
