import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import {
  ServicoEquipamento, SITUACOES_EQUIPAMENTO, TIPOS_EQUIPAMENTO, useServicosEquipamentos,
} from "@/hooks/useServicosEquipamentos";

const emptyForm = {
  nome: "", tipo: "retroescavadeira", patrimonio: "", situacao: "disponivel",
  horimetro: "", quilometragem: "", ultima_manutencao: "", proxima_manutencao: "",
  localizacao: "", observacoes: "",
};

export function EquipamentosOperacionais() {
  const { equipamentos, isLoading, createEquipamento, updateEquipamento, deleteEquipamento } = useServicosEquipamentos();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ServicoEquipamento | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return equipamentos.filter(e =>
      e.nome.toLowerCase().includes(s) || (e.patrimonio ?? "").toLowerCase().includes(s) || (e.tipo ?? "").toLowerCase().includes(s)
    );
  }, [equipamentos, q]);

  const hoje = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total: equipamentos.length,
    disponiveis: equipamentos.filter(e => e.situacao === "disponivel").length,
    manutencao: equipamentos.filter(e => e.situacao === "manutencao").length,
    revisaoVencida: equipamentos.filter(e => e.proxima_manutencao && e.proxima_manutencao < hoje).length,
  }), [equipamentos, hoje]);

  const num = (v: any) => (v === "" ? null : Number(v));
  const str = (v: any) => (v === "" ? null : v);

  const submit = async () => {
    const payload = {
      nome: form.nome, tipo: form.tipo, patrimonio: str(form.patrimonio), situacao: form.situacao,
      horimetro: num(form.horimetro), quilometragem: num(form.quilometragem),
      ultima_manutencao: str(form.ultima_manutencao), proxima_manutencao: str(form.proxima_manutencao),
      localizacao: str(form.localizacao), observacoes: str(form.observacoes),
    };
    if (editing) await updateEquipamento.mutateAsync({ id: editing.id, ...payload });
    else await createEquipamento.mutateAsync(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Total</div><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Disponíveis</div><div className="text-2xl font-bold text-green-600">{stats.disponiveis}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Em manutenção</div><div className="text-2xl font-bold text-amber-600">{stats.manutencao}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-xs text-muted-foreground">Revisão vencida</div><div className="text-2xl font-bold text-destructive">{stats.revisaoVencida}</div></CardContent></Card>
      </div>

      <div className="flex justify-between items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar equipamento, patrimônio..." value={q} onChange={e => setQ(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}><Plus className="h-4 w-4 mr-2" />Novo Equipamento</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Equipamento</TableHead><TableHead>Patrimônio</TableHead><TableHead>Horímetro / Km</TableHead>
            <TableHead>Próxima manutenção</TableHead><TableHead>Situação</TableHead><TableHead className="text-right">Ações</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>}
            {!isLoading && filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Nenhum equipamento cadastrado.</TableCell></TableRow>}
            {filtered.map(e => {
              const sit = SITUACOES_EQUIPAMENTO.find(s => s.value === e.situacao) ?? SITUACOES_EQUIPAMENTO[0];
              const vencida = e.proxima_manutencao && e.proxima_manutencao < hoje;
              return (
                <TableRow key={e.id}>
                  <TableCell>
                    <div className="font-medium">{e.nome}</div>
                    <div className="text-xs text-muted-foreground">{TIPOS_EQUIPAMENTO.find(t => t.value === e.tipo)?.label ?? e.tipo}</div>
                  </TableCell>
                  <TableCell className="text-sm">{e.patrimonio ?? "-"}</TableCell>
                  <TableCell className="text-sm">{e.horimetro ?? "-"} h · {e.quilometragem ?? "-"} km</TableCell>
                  <TableCell className="text-sm">
                    {e.proxima_manutencao ? new Date(e.proxima_manutencao + "T00:00:00").toLocaleDateString("pt-BR") : "-"}
                    {vencida && <div className="text-xs text-destructive">Vencida</div>}
                  </TableCell>
                  <TableCell><Badge className={sit.color}>{sit.label}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditing(e);
                      setForm({
                        nome: e.nome, tipo: e.tipo ?? "outro", patrimonio: e.patrimonio ?? "", situacao: e.situacao,
                        horimetro: e.horimetro ?? "", quilometragem: e.quilometragem ?? "",
                        ultima_manutencao: e.ultima_manutencao ?? "", proxima_manutencao: e.proxima_manutencao ?? "",
                        localizacao: e.localizacao ?? "", observacoes: e.observacoes ?? "",
                      });
                      setOpen(true);
                    }}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteEquipamento.mutate(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Editar equipamento" : "Novo equipamento"}</DialogTitle></DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS_EQUIPAMENTO.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Patrimônio</Label><Input value={form.patrimonio} onChange={e => setForm({ ...form, patrimonio: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Situação</Label>
              <Select value={form.situacao} onValueChange={v => setForm({ ...form, situacao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SITUACOES_EQUIPAMENTO.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Horímetro</Label><Input type="number" step="0.1" value={form.horimetro} onChange={e => setForm({ ...form, horimetro: e.target.value })} /></div>
            <div className="space-y-1"><Label>Quilometragem</Label><Input type="number" step="0.1" value={form.quilometragem} onChange={e => setForm({ ...form, quilometragem: e.target.value })} /></div>
            <div className="space-y-1"><Label>Última manutenção</Label><Input type="date" value={form.ultima_manutencao} onChange={e => setForm({ ...form, ultima_manutencao: e.target.value })} /></div>
            <div className="space-y-1"><Label>Próxima manutenção</Label><Input type="date" value={form.proxima_manutencao} onChange={e => setForm({ ...form, proxima_manutencao: e.target.value })} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Localização</Label><Input value={form.localizacao} onChange={e => setForm({ ...form, localizacao: e.target.value })} /></div>
            <div className="space-y-1 md:col-span-2"><Label>Observações</Label><Textarea rows={2} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={!form.nome}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
