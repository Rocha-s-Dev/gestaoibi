import { useState } from "react";
import { useEmpreendimentosAmbientais } from "@/hooks/useAmbientalExpanded";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

const ATIVIDADES = ["mineração", "posto de combustível", "serraria", "agropecuária", "indústria", "construção civil", "outro"];
const NIVEIS = [
  { value: "baixo", label: "Baixo", color: "bg-green-100 text-green-800" },
  { value: "medio", label: "Médio", color: "bg-yellow-100 text-yellow-800" },
  { value: "alto", label: "Alto", color: "bg-red-100 text-red-800" },
];

export function EmpreendimentosAmbientais() {
  const { data, loading, add, update, remove } = useEmpreendimentosAmbientais();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterNivel, setFilterNivel] = useState("all");

  const [form, setForm] = useState({ nome: "", cpf_cnpj: "", atividade: "outro", nivel_impacto: "medio", endereco: "", latitude: "", longitude: "", responsavel_tecnico: "" });

  const resetForm = () => { setForm({ nome: "", cpf_cnpj: "", atividade: "outro", nivel_impacto: "medio", endereco: "", latitude: "", longitude: "", responsavel_tecnico: "" }); setEditing(null); };

  const openEdit = (item: any) => { setEditing(item); setForm({ nome: item.nome, cpf_cnpj: item.cpf_cnpj || "", atividade: item.atividade, nivel_impacto: item.nivel_impacto, endereco: item.endereco || "", latitude: item.latitude?.toString() || "", longitude: item.longitude?.toString() || "", responsavel_tecnico: item.responsavel_tecnico || "" }); setOpen(true); };

  const handleSave = async () => {
    if (!form.nome) return;
    const payload = { ...form, latitude: form.latitude ? parseFloat(form.latitude) : null, longitude: form.longitude ? parseFloat(form.longitude) : null };
    const ok = editing ? await update(editing.id, payload) : await add(payload);
    if (ok) { setOpen(false); resetForm(); }
  };

  const filtered = data.filter((d: any) => {
    if (search && !d.nome?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterNivel !== "all" && d.nivel_impacto !== filterNivel) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-end justify-between">
        <div className="flex gap-2">
          <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar empreendimento..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-[220px]" /></div>
          <Select value={filterNivel} onValueChange={setFilterNivel}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos níveis</SelectItem>{NIVEIS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent></Select>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }}><Plus className="h-4 w-4 mr-1" />Novo Empreendimento</Button>
      </div>

      {loading ? <p className="text-muted-foreground">Carregando...</p> : (
        <div className="rounded-md border"><Table><TableHeader><TableRow>
          <TableHead>Nome</TableHead><TableHead>Atividade</TableHead><TableHead>Impacto</TableHead><TableHead>Responsável Técnico</TableHead><TableHead>Ações</TableHead>
        </TableRow></TableHeader><TableBody>
          {filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum empreendimento</TableCell></TableRow> :
            filtered.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell className="capitalize">{item.atividade}</TableCell>
                <TableCell><Badge className={NIVEIS.find(n => n.value === item.nivel_impacto)?.color}>{NIVEIS.find(n => n.value === item.nivel_impacto)?.label}</Badge></TableCell>
                <TableCell>{item.responsavel_tecnico || "—"}</TableCell>
                <TableCell><div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>
              </TableRow>
            ))}
        </TableBody></Table></div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Empreendimento" : "Novo Empreendimento"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} /></div>
            <div><Label>CPF/CNPJ</Label><Input value={form.cpf_cnpj} onChange={e => setForm({...form, cpf_cnpj: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Atividade</Label><Select value={form.atividade} onValueChange={v => setForm({...form, atividade: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ATIVIDADES.map(a => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Nível de Impacto</Label><Select value={form.nivel_impacto} onValueChange={v => setForm({...form, nivel_impacto: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NIVEIS.map(n => <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Latitude</Label><Input value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} /></div>
              <div><Label>Longitude</Label><Input value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} /></div>
            </div>
            <div><Label>Responsável Técnico</Label><Input value={form.responsavel_tecnico} onChange={e => setForm({...form, responsavel_tecnico: e.target.value})} /></div>
            <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
