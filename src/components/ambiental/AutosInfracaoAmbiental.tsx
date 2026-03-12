import { useState } from "react";
import { useAutosInfracaoAmbiental } from "@/hooks/useAmbientalExpanded";
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

const STATUS = [
  { value: "emitido", label: "Emitido" },
  { value: "em_recurso", label: "Em Recurso" },
  { value: "pago", label: "Pago" },
  { value: "cancelado", label: "Cancelado" },
];

const statusColor: Record<string, string> = {
  emitido: "bg-yellow-100 text-yellow-800",
  em_recurso: "bg-orange-100 text-orange-800",
  pago: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export function AutosInfracaoAmbiental() {
  const { data, loading, add, update, remove } = useAutosInfracaoAmbiental();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({
    numero_auto: "", nome_infrator: "", cpf_cnpj: "", descricao: "",
    valor_multa: "", data_emissao: new Date().toISOString().split("T")[0], status: "emitido",
  });

  const resetForm = () => { setForm({ numero_auto: "", nome_infrator: "", cpf_cnpj: "", descricao: "", valor_multa: "", data_emissao: new Date().toISOString().split("T")[0], status: "emitido" }); setEditing(null); };

  const openNew = () => { resetForm(); setForm(f => ({ ...f, numero_auto: `AIA-${new Date().getFullYear()}-${String(data.length + 1).padStart(5, "0")}` })); setOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ numero_auto: item.numero_auto, nome_infrator: item.nome_infrator, cpf_cnpj: item.cpf_cnpj || "", descricao: item.descricao, valor_multa: item.valor_multa?.toString() || "", data_emissao: item.data_emissao, status: item.status }); setOpen(true); };

  const handleSave = async () => {
    if (!form.nome_infrator || !form.descricao) return;
    const payload = { ...form, valor_multa: form.valor_multa ? parseFloat(form.valor_multa) : 0 };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => {
    if (search && !d.nome_infrator?.toLowerCase().includes(search.toLowerCase()) && !d.numero_auto?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar infrator ou nº..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[220px]" /></div>
          <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos status</SelectItem>{STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Auto</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Nº Auto</TableHead><TableHead>Infrator</TableHead><TableHead>Valor Multa</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum auto encontrado</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.numero_auto}</TableCell>
                <TableCell>{item.nome_infrator}</TableCell>
                <TableCell>R$ {(item.valor_multa || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{format(new Date(item.data_emissao), "dd/MM/yyyy")}</TableCell>
                <TableCell><Badge className={statusColor[item.status] || ""}>{STATUS.find(s => s.value === item.status)?.label}</Badge></TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Auto de Infração" : "Novo Auto de Infração"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nº do Auto</Label><Input value={form.numero_auto} readOnly className="bg-muted" /></div>
            <div><Label>Nome do Infrator *</Label><Input value={form.nome_infrator} onChange={e => setForm({...form, nome_infrator: e.target.value})} /></div>
            <div><Label>CPF/CNPJ</Label><Input value={form.cpf_cnpj} onChange={e => setForm({...form, cpf_cnpj: e.target.value})} /></div>
            <div><Label>Descrição *</Label><Textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Valor da Multa (R$)</Label><Input type="number" value={form.valor_multa} onChange={e => setForm({...form, valor_multa: e.target.value})} /></div>
              <div><Label>Data Emissão</Label><Input type="date" value={form.data_emissao} onChange={e => setForm({...form, data_emissao: e.target.value})} /></div>
            </div>
            <div><Label>Status</Label><Select value={form.status} onValueChange={v => setForm({...form, status: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
