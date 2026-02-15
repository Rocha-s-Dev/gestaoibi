import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Handshake, Search } from "lucide-react";
import { useTurismoCultura } from "@/hooks/useTurismoCultura";

const TIPOS = [
  { value: "hotel", label: "Hotel" },
  { value: "pousada", label: "Pousada" },
  { value: "restaurante", label: "Restaurante" },
  { value: "guia", label: "Guia" },
  { value: "agencia", label: "Agência" },
  { value: "transporte", label: "Transporte" },
  { value: "comercio", label: "Comércio" },
];

export function ParceirosTurismoTab() {
  const { parceiros, loadingParceiros, createParceiro } = useTurismoCultura();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nome: "", tipo: "hotel" as any, descricao: "", cnpj: "", email: "", telefone: "",
    endereco: "", website: "", classificacao: "", capacidade: 0, convenio: false, desconto_percentual: 0,
  });

  const filtered = parceiros.filter((p: any) => p.nome?.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = () => {
    if (!form.nome) return;
    createParceiro.mutate(form, { onSuccess: () => { setOpen(false); setForm({ nome: "", tipo: "hotel", descricao: "", cnpj: "", email: "", telefone: "", endereco: "", website: "", classificacao: "", capacidade: 0, convenio: false, desconto_percentual: 0 }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5" />Parceiros de Turismo</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Parceiro</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Cadastrar Parceiro</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div><Label>Tipo *</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIPOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></div>
                <div><Label>Website</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
              </div>
              <div><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Classificação</Label><Input value={form.classificacao} onChange={e => setForm({ ...form, classificacao: e.target.value })} placeholder="Ex: 4 estrelas" /></div>
                <div><Label>Capacidade</Label><Input type="number" value={form.capacidade} onChange={e => setForm({ ...form, capacidade: Number(e.target.value) })} /></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.convenio} onCheckedChange={v => setForm({ ...form, convenio: v })} /><Label>Convênio</Label></div>
                {form.convenio && <div><Label>Desconto (%)</Label><Input type="number" value={form.desconto_percentual} onChange={e => setForm({ ...form, desconto_percentual: Number(e.target.value) })} /></div>}
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createParceiro.isPending}>Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar parceiros..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></div>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Contato</TableHead><TableHead>Convênio</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {loadingParceiros ? <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow> :
              filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum parceiro cadastrado</TableCell></TableRow> :
                filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell><Badge variant="outline">{TIPOS.find(t => t.value === p.tipo)?.label || p.tipo}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{p.telefone || p.email || "—"}</TableCell>
                    <TableCell>{p.convenio ? <Badge className="bg-green-100 text-green-800">{p.desconto_percentual}% desc.</Badge> : "—"}</TableCell>
                    <TableCell>{p.ativo !== false ? <Badge>Ativo</Badge> : <Badge variant="secondary">Inativo</Badge>}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
