import { useEffect, useState } from "react";
import { PlusCircle, Search, FileEdit, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSocial, type UnidadeSocioassistencial } from "@/hooks/useSocial";

const tiposUnidade = ["CRAS", "CREAS", "Centro POP", "Abrigo"];

export function UnidadesCRAS() {
  const { unidades, fetchUnidades, saveUnidade, loading } = useSocial();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UnidadeSocioassistencial | null>(null);
  const [form, setForm] = useState({ nome: "", tipo: "CRAS", endereco: "", bairro: "", telefone: "", email: "", capacidade_atendimento: "", horario_funcionamento: "", status: "ativo" });

  useEffect(() => { fetchUnidades(); }, [fetchUnidades]);

  const filtered = unidades.filter(u =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.tipo.toLowerCase().includes(search.toLowerCase()) ||
    (u.bairro || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ nome: "", tipo: "CRAS", endereco: "", bairro: "", telefone: "", email: "", capacidade_atendimento: "", horario_funcionamento: "", status: "ativo" });
    setDialogOpen(true);
  };

  const openEdit = (u: UnidadeSocioassistencial) => {
    setEditing(u);
    setForm({
      nome: u.nome, tipo: u.tipo, endereco: u.endereco || "", bairro: u.bairro || "",
      telefone: u.telefone || "", email: u.email || "",
      capacidade_atendimento: u.capacidade_atendimento?.toString() || "",
      horario_funcionamento: u.horario_funcionamento || "", status: u.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    await saveUnidade({
      ...(editing ? { id: editing.id } : {}),
      nome: form.nome, tipo: form.tipo, endereco: form.endereco || null, bairro: form.bairro || null,
      telefone: form.telefone || null, email: form.email || null,
      capacidade_atendimento: form.capacidade_atendimento ? parseInt(form.capacidade_atendimento) : null,
      horario_funcionamento: form.horario_funcionamento || null, status: form.status,
    });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar unidade..." className="h-9 md:w-[300px]" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} size="sm" className="h-9"><PlusCircle className="h-4 w-4 mr-2" />Nova Unidade</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Bairro</TableHead>
              <TableHead className="hidden md:table-cell">Telefone</TableHead>
              <TableHead className="hidden md:table-cell">Capacidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhuma unidade encontrada
              </TableCell></TableRow>
            ) : filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell><Badge variant="outline">{u.tipo}</Badge></TableCell>
                <TableCell className="hidden md:table-cell">{u.bairro || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{u.telefone || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{u.capacidade_atendimento || "-"}</TableCell>
                <TableCell><Badge variant={u.status === "ativo" ? "default" : "secondary"}>{u.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><FileEdit className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>{editing ? "Editar Unidade" : "Nova Unidade"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tiposUnidade.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Capacidade</Label>
              <Input type="number" value={form.capacidade_atendimento} onChange={e => setForm({ ...form, capacidade_atendimento: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input placeholder="08:00 - 17:00" value={form.horario_funcionamento} onChange={e => setForm({ ...form, horario_funcionamento: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!form.nome}>{editing ? "Salvar" : "Cadastrar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
