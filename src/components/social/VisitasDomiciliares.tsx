import { useEffect, useState } from "react";
import { PlusCircle, Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSocial } from "@/hooks/useSocial";

export function VisitasDomiciliares() {
  const { visitas, fetchVisitas, saveVisita, familias, fetchFamilias, unidades, fetchUnidades, loading } = useSocial();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    familia_id: "", unidade_id: "", data_visita: new Date().toISOString().split("T")[0],
    hora_inicio: "", hora_fim: "", objetivo: "", relato: "", situacao_encontrada: "",
    providencias: "", proxima_visita: "", status: "agendada",
  });

  useEffect(() => { fetchVisitas(); fetchFamilias(); fetchUnidades(); }, [fetchVisitas, fetchFamilias, fetchUnidades]);

  const filtered = visitas.filter(v =>
    (v.familia?.responsavel_nome || "").toLowerCase().includes(search.toLowerCase()) ||
    v.objetivo.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    await saveVisita({
      familia_id: form.familia_id,
      unidade_id: form.unidade_id || null,
      data_visita: form.data_visita,
      hora_inicio: form.hora_inicio || null,
      hora_fim: form.hora_fim || null,
      objetivo: form.objetivo,
      relato: form.relato || null,
      situacao_encontrada: form.situacao_encontrada || null,
      providencias: form.providencias || null,
      proxima_visita: form.proxima_visita || null,
      status: form.status,
    });
    setDialogOpen(false);
    setForm({ familia_id: "", unidade_id: "", data_visita: new Date().toISOString().split("T")[0], hora_inicio: "", hora_fim: "", objetivo: "", relato: "", situacao_encontrada: "", providencias: "", proxima_visita: "", status: "agendada" });
  };

  const statusColor = (s: string) => {
    switch (s) {
      case "realizada": return "default";
      case "agendada": return "secondary";
      case "cancelada": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar visita..." className="h-9 md:w-[300px]" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="h-9"><PlusCircle className="h-4 w-4 mr-2" />Nova Visita</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Família</TableHead>
              <TableHead className="hidden md:table-cell">Objetivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Próxima Visita</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                <Home className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhuma visita registrada
              </TableCell></TableRow>
            ) : filtered.map(v => (
              <TableRow key={v.id}>
                <TableCell>{new Date(v.data_visita).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="font-medium">{v.familia?.responsavel_nome || "-"}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate">{v.objetivo}</TableCell>
                <TableCell><Badge variant={statusColor(v.status)}>{v.status}</Badge></TableCell>
                <TableCell className="hidden md:table-cell">{v.proxima_visita ? new Date(v.proxima_visita).toLocaleDateString("pt-BR") : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Visita Domiciliar</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Família *</Label>
              <Select value={form.familia_id} onValueChange={v => setForm({ ...form, familia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{familias.map(f => <SelectItem key={f.id} value={f.id}>{f.responsavel_nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={form.unidade_id} onValueChange={v => setForm({ ...form, unidade_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data da Visita *</Label>
              <Input type="date" value={form.data_visita} onChange={e => setForm({ ...form, data_visita: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="reagendada">Reagendada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hora Início</Label>
              <Input type="time" value={form.hora_inicio} onChange={e => setForm({ ...form, hora_inicio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Hora Fim</Label>
              <Input type="time" value={form.hora_fim} onChange={e => setForm({ ...form, hora_fim: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Objetivo *</Label>
              <Textarea value={form.objetivo} onChange={e => setForm({ ...form, objetivo: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Relato / Situação Encontrada</Label>
              <Textarea value={form.relato} onChange={e => setForm({ ...form, relato: e.target.value })} rows={3} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Providências</Label>
              <Textarea value={form.providencias} onChange={e => setForm({ ...form, providencias: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Próxima Visita</Label>
              <Input type="date" value={form.proxima_visita} onChange={e => setForm({ ...form, proxima_visita: e.target.value })} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!form.familia_id || !form.objetivo}>Registrar Visita</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
