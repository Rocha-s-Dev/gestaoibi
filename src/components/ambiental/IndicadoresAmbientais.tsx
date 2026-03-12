import { useState } from "react";
import { useIndicadoresAmbientais } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

export function IndicadoresAmbientais() {
  const { data, loading, add, update, remove } = useIndicadoresAmbientais();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({ nome_indicador: "", valor: "", unidade: "", data_medicao: new Date().toISOString().split("T")[0], local: "", observacoes: "" });

  const resetForm = () => { setForm({ nome_indicador: "", valor: "", unidade: "", data_medicao: new Date().toISOString().split("T")[0], local: "", observacoes: "" }); setEditing(null); };

  const openEdit = (item: any) => { setEditing(item); setForm({ nome_indicador: item.nome_indicador, valor: item.valor?.toString() || "", unidade: item.unidade || "", data_medicao: item.data_medicao, local: item.local || "", observacoes: item.observacoes || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.nome_indicador || !form.valor) return;
    const payload = { ...form, valor: parseFloat(form.valor) };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => !search || d.nome_indicador?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar indicador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[220px]" /></div>
        <Button onClick={() => { resetForm(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Nova Medição</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Indicador</TableHead><TableHead>Valor</TableHead><TableHead>Unidade</TableHead><TableHead>Local</TableHead><TableHead>Data</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum indicador</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome_indicador}</TableCell>
                <TableCell>{item.valor}</TableCell>
                <TableCell>{item.unidade || "—"}</TableCell>
                <TableCell>{item.local || "—"}</TableCell>
                <TableCell>{format(new Date(item.data_medicao), "dd/MM/yyyy")}</TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Medição" : "Nova Medição Ambiental"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome do Indicador *</Label><Input placeholder="Ex: Qualidade da Água" value={form.nome_indicador} onChange={e => setForm({...form, nome_indicador: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Valor *</Label><Input type="number" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} /></div>
              <div><Label>Unidade</Label><Input placeholder="mg/L, %, etc" value={form.unidade} onChange={e => setForm({...form, unidade: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Data da Medição</Label><Input type="date" value={form.data_medicao} onChange={e => setForm({...form, data_medicao: e.target.value})} /></div>
              <div><Label>Local</Label><Input value={form.local} onChange={e => setForm({...form, local: e.target.value})} /></div>
            </div>
            <div><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
