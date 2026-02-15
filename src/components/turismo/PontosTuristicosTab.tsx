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
import { Plus, MapPin, Search } from "lucide-react";
import { useTurismoCultura } from "@/hooks/useTurismoCultura";

const TIPOS = [
  { value: "natural", label: "Natural" },
  { value: "historico", label: "Histórico" },
  { value: "religioso", label: "Religioso" },
  { value: "cultural", label: "Cultural" },
  { value: "gastronomico", label: "Gastronômico" },
  { value: "ecoturismo", label: "Ecoturismo" },
  { value: "aventura", label: "Aventura" },
];

export function PontosTuristicosTab() {
  const { pontosTuristicos, loadingPontos, createPontoTuristico } = useTurismoCultura();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nome: "", tipo: "natural" as any, descricao: "", endereco: "",
    horario_funcionamento: "", contato_telefone: "", website: "",
    acessibilidade: false, gratuito: true, valor_entrada: 0,
  });

  const filtered = pontosTuristicos.filter((p: any) =>
    p.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.nome) return;
    createPontoTuristico.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({ nome: "", tipo: "natural", descricao: "", endereco: "", horario_funcionamento: "", contato_telefone: "", website: "", acessibilidade: false, gratuito: true, valor_entrada: 0 });
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" />Pontos Turísticos</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Ponto</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Cadastrar Ponto Turístico</DialogTitle></DialogHeader>
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
                <div><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} /></div>
                <div><Label>Horário</Label><Input value={form.horario_funcionamento} onChange={e => setForm({ ...form, horario_funcionamento: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Telefone</Label><Input value={form.contato_telefone} onChange={e => setForm({ ...form, contato_telefone: e.target.value })} /></div>
                <div><Label>Website</Label><Input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Switch checked={form.acessibilidade} onCheckedChange={v => setForm({ ...form, acessibilidade: v })} /><Label>Acessível</Label></div>
                <div className="flex items-center gap-2"><Switch checked={form.gratuito} onCheckedChange={v => setForm({ ...form, gratuito: v })} /><Label>Gratuito</Label></div>
                {!form.gratuito && <div><Label>Valor (R$)</Label><Input type="number" value={form.valor_entrada} onChange={e => setForm({ ...form, valor_entrada: Number(e.target.value) })} /></div>}
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={createPontoTuristico.isPending}>Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar pontos turísticos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></div>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Endereço</TableHead><TableHead>Acessível</TableHead><TableHead>Gratuito</TableHead></TableRow></TableHeader>
          <TableBody>
            {loadingPontos ? <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow> :
              filtered.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum ponto cadastrado</TableCell></TableRow> :
                filtered.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nome}</TableCell>
                    <TableCell><Badge variant="outline">{TIPOS.find(t => t.value === p.tipo)?.label || p.tipo}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{p.endereco || "—"}</TableCell>
                    <TableCell>{p.acessibilidade ? "✅" : "—"}</TableCell>
                    <TableCell>{p.gratuito ? "Sim" : `R$ ${p.valor_entrada?.toFixed(2)}`}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
