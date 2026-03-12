import { useState } from "react";
import { useResiduosSolidos } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

const TIPOS = [
  { value: "domiciliar", label: "Domiciliar" },
  { value: "reciclavel", label: "Reciclável" },
  { value: "entulho", label: "Entulho" },
  { value: "hospitalar", label: "Hospitalar" },
  { value: "industrial", label: "Industrial" },
];

export function ResiduosSolidos() {
  const { data, loading, add, update, remove } = useResiduosSolidos();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("all");

  const [form, setForm] = useState({ tipo_residuo: "domiciliar", origem: "", quantidade: "", destino: "", data_coleta: new Date().toISOString().split("T")[0], operador_responsavel: "" });

  const resetForm = () => { setForm({ tipo_residuo: "domiciliar", origem: "", quantidade: "", destino: "", data_coleta: new Date().toISOString().split("T")[0], operador_responsavel: "" }); setEditing(null); };

  const openEdit = (item: any) => { setEditing(item); setForm({ tipo_residuo: item.tipo_residuo, origem: item.origem || "", quantidade: item.quantidade?.toString() || "", destino: item.destino || "", data_coleta: item.data_coleta, operador_responsavel: item.operador_responsavel || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.tipo_residuo) return;
    const payload = { ...form, quantidade: form.quantidade ? parseFloat(form.quantidade) : null };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => {
    if (search && !d.origem?.toLowerCase().includes(search.toLowerCase()) && !d.destino?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTipo !== "all" && d.tipo_residuo !== filterTipo) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[200px]" /></div>
          <Select value={filterTipo} onValueChange={setFilterTipo}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos tipos</SelectItem>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Novo Registro</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Tipo</TableHead><TableHead>Origem</TableHead><TableHead>Quantidade</TableHead><TableHead>Destino</TableHead><TableHead>Data</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell><Badge variant="outline">{TIPOS.find(t => t.value === item.tipo_residuo)?.label}</Badge></TableCell>
                <TableCell>{item.origem || "—"}</TableCell>
                <TableCell>{item.quantidade || "—"}</TableCell>
                <TableCell>{item.destino || "—"}</TableCell>
                <TableCell>{format(new Date(item.data_coleta), "dd/MM/yyyy")}</TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Registro" : "Novo Registro de Resíduos"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Tipo de Resíduo</Label><Select value={form.tipo_residuo} onValueChange={v => setForm({...form, tipo_residuo: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Origem</Label><Input value={form.origem} onChange={e => setForm({...form, origem: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Quantidade (toneladas)</Label><Input type="number" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} /></div>
              <div><Label>Data da Coleta</Label><Input type="date" value={form.data_coleta} onChange={e => setForm({...form, data_coleta: e.target.value})} /></div>
            </div>
            <div><Label>Destino</Label><Input value={form.destino} onChange={e => setForm({...form, destino: e.target.value})} /></div>
            <div><Label>Operador Responsável</Label><Input value={form.operador_responsavel} onChange={e => setForm({...form, operador_responsavel: e.target.value})} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
