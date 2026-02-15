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
import { Plus, Route, Search } from "lucide-react";
import { useTurismoCultura } from "@/hooks/useTurismoCultura";

const DIFICULDADES = ["fácil", "moderada", "difícil"];
const TIPOS_ROTEIRO = ["cultural", "aventura", "gastronômico", "religioso", "ecológico", "histórico"];

export function RoteirosTuristicosTab() {
  const { roteiros, loadingRoteiros, createRoteiro } = useTurismoCultura();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    nome: "", tipo: "cultural", descricao: "", dificuldade: "fácil",
    duracao_horas: 2, distancia_km: 0, valor_medio: 0, melhor_epoca: "", recomendacoes: "", inclui: "",
  });

  const filtered = roteiros.filter((r: any) => r.nome?.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = () => {
    if (!form.nome) return;
    createRoteiro.mutate(form, { onSuccess: () => { setOpen(false); setForm({ nome: "", tipo: "cultural", descricao: "", dificuldade: "fácil", duracao_horas: 2, distancia_km: 0, valor_medio: 0, melhor_epoca: "", recomendacoes: "", inclui: "" }); } });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Roteiros Turísticos</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Roteiro</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Cadastrar Roteiro</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div><Label>Tipo *</Label>
                  <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIPOS_ROTEIRO.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>Dificuldade</Label>
                  <Select value={form.dificuldade} onValueChange={v => setForm({ ...form, dificuldade: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{DIFICULDADES.map(d => <SelectItem key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Duração (h)</Label><Input type="number" value={form.duracao_horas} onChange={e => setForm({ ...form, duracao_horas: Number(e.target.value) })} /></div>
                <div><Label>Distância (km)</Label><Input type="number" value={form.distancia_km} onChange={e => setForm({ ...form, distancia_km: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Valor Médio (R$)</Label><Input type="number" value={form.valor_medio} onChange={e => setForm({ ...form, valor_medio: Number(e.target.value) })} /></div>
                <div><Label>Melhor Época</Label><Input value={form.melhor_epoca} onChange={e => setForm({ ...form, melhor_epoca: e.target.value })} /></div>
              </div>
              <div><Label>O que inclui</Label><Textarea value={form.inclui} onChange={e => setForm({ ...form, inclui: e.target.value })} /></div>
              <div><Label>Recomendações</Label><Textarea value={form.recomendacoes} onChange={e => setForm({ ...form, recomendacoes: e.target.value })} /></div>
              <Button onClick={handleSubmit} className="w-full" disabled={createRoteiro.isPending}>Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar roteiros..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div></div>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Dificuldade</TableHead><TableHead>Duração</TableHead><TableHead>Distância</TableHead><TableHead>Valor</TableHead></TableRow></TableHeader>
          <TableBody>
            {loadingRoteiros ? <TableRow><TableCell colSpan={6} className="text-center">Carregando...</TableCell></TableRow> :
              filtered.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum roteiro cadastrado</TableCell></TableRow> :
                filtered.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.nome}</TableCell>
                    <TableCell><Badge variant="outline">{r.tipo}</Badge></TableCell>
                    <TableCell>{r.dificuldade || "—"}</TableCell>
                    <TableCell>{r.duracao_horas ? `${r.duracao_horas}h` : "—"}</TableCell>
                    <TableCell>{r.distancia_km ? `${r.distancia_km} km` : "—"}</TableCell>
                    <TableCell>{r.valor_medio ? `R$ ${r.valor_medio.toFixed(2)}` : "Gratuito"}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
