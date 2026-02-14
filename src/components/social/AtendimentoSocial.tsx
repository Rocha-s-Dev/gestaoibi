import { useEffect, useState } from "react";
import { PlusCircle, Search, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSocial, type AtendimentoSocial as AtendimentoType } from "@/hooks/useSocial";

const tiposAtendimento = [
  { value: "acolhida", label: "Acolhida" },
  { value: "acompanhamento", label: "Acompanhamento" },
  { value: "visita_domiciliar", label: "Visita Domiciliar" },
  { value: "encaminhamento", label: "Encaminhamento" },
  { value: "grupo", label: "Atividade em Grupo" },
];

export function AtendimentoSocialComponent() {
  const { atendimentos, fetchAtendimentos, saveAtendimento, familias, fetchFamilias, unidades, fetchUnidades, loading } = useSocial();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    familia_id: "", unidade_id: "", tipo_atendimento: "acolhida",
    demanda: "", providencias: "", encaminhamentos: "", observacoes: "", sigilo: false,
  });

  useEffect(() => { fetchAtendimentos(); fetchFamilias(); fetchUnidades(); }, [fetchAtendimentos, fetchFamilias, fetchUnidades]);

  const filtered = atendimentos.filter(a =>
    (a.familia?.responsavel_nome || "").toLowerCase().includes(search.toLowerCase()) ||
    a.tipo_atendimento.toLowerCase().includes(search.toLowerCase()) ||
    a.demanda.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    await saveAtendimento({
      familia_id: form.familia_id || null,
      unidade_id: form.unidade_id || null,
      tipo_atendimento: form.tipo_atendimento,
      demanda: form.demanda,
      providencias: form.providencias || null,
      encaminhamentos: form.encaminhamentos || null,
      observacoes: form.observacoes || null,
      sigilo: form.sigilo,
      status: "realizado",
    });
    setDialogOpen(false);
    setForm({ familia_id: "", unidade_id: "", tipo_atendimento: "acolhida", demanda: "", providencias: "", encaminhamentos: "", observacoes: "", sigilo: false });
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case "acolhida": return "default";
      case "encaminhamento": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar atendimento..." className="h-9 md:w-[300px]" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="h-9"><PlusCircle className="h-4 w-4 mr-2" />Novo Atendimento</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Família</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="hidden md:table-cell">Unidade</TableHead>
              <TableHead className="hidden lg:table-cell">Demanda</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhum atendimento encontrado
              </TableCell></TableRow>
            ) : filtered.map(a => (
              <TableRow key={a.id}>
                <TableCell>{new Date(a.data_atendimento).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="font-medium">{a.familia?.responsavel_nome || "Sem vínculo"}</TableCell>
                <TableCell><Badge variant={getBadgeVariant(a.tipo_atendimento)}>
                  {tiposAtendimento.find(t => t.value === a.tipo_atendimento)?.label || a.tipo_atendimento}
                </Badge></TableCell>
                <TableCell className="hidden md:table-cell">{a.unidade?.nome || "-"}</TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{a.demanda}</TableCell>
                <TableCell><Badge variant="outline">{a.status}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Novo Atendimento Social</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Família</Label>
              <Select value={form.familia_id} onValueChange={v => setForm({ ...form, familia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel_nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={form.unidade_id} onValueChange={v => setForm({ ...form, unidade_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome} ({u.tipo})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Tipo de Atendimento *</Label>
              <Select value={form.tipo_atendimento} onValueChange={v => setForm({ ...form, tipo_atendimento: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tiposAtendimento.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Demanda / Motivo *</Label>
              <Textarea value={form.demanda} onChange={e => setForm({ ...form, demanda: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Providências Tomadas</Label>
              <Textarea value={form.providencias} onChange={e => setForm({ ...form, providencias: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Encaminhamentos</Label>
              <Textarea value={form.encaminhamentos} onChange={e => setForm({ ...form, encaminhamentos: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!form.demanda || !form.tipo_atendimento}>Registrar Atendimento</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
