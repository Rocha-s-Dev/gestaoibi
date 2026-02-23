import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useExamesSaude } from "@/hooks/useExamesSaude";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, FileText } from "lucide-react";
import { format } from "date-fns";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  solicitado: { label: "Solicitado", variant: "secondary" },
  agendado: { label: "Agendado", variant: "default" },
  realizado: { label: "Realizado", variant: "outline" },
  cancelado: { label: "Cancelado", variant: "destructive" },
};

const TIPOS_EXAME = [
  "Hemograma", "Glicemia", "Colesterol", "Triglicerídeos", "Urina", "Raio-X",
  "Ultrassonografia", "Tomografia", "Ressonância", "ECG", "Ecocardiograma",
  "Mamografia", "Papanicolau", "PSA", "TSH/T4", "Outro",
];

export function ExamesSaudeModule() {
  const { exames, isLoading, create, update } = useExamesSaude();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [resultado, setResultado] = useState("");
  const [form, setForm] = useState({ paciente_id: "", medico_solicitante_id: "", unidade_id: "", tipo: "", justificativa: "" });

  const { data: pacientes = [] } = useQuery({
    queryKey: ["pacientes_select"],
    queryFn: async () => { const { data } = await supabase.from("pacientes").select("id, nome, cpf").order("nome").limit(500); return data || []; },
  });
  const { data: profissionais = [] } = useQuery({
    queryKey: ["profissionais_select"],
    queryFn: async () => { const { data } = await supabase.from("profissionais_saude").select("id, user_id, profiles:user_id(name)").eq("status", "ativo"); return (data || []).map((p: any) => ({ id: p.id, nome: p.profiles?.name || "—" })); },
  });
  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_saude_list"],
    queryFn: async () => { const { data } = await supabase.from("unidades_saude").select("id, nome").neq("status", "inativo").order("nome"); return data || []; },
  });

  const filtered = exames.filter((e: any) =>
    e.paciente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    e.tipo?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      paciente_id: form.paciente_id,
      medico_solicitante_id: form.medico_solicitante_id,
      unidade_id: form.unidade_id,
      tipo: form.tipo,
      justificativa: form.justificativa || undefined,
    });
    setDialogOpen(false);
    setForm({ paciente_id: "", medico_solicitante_id: "", unidade_id: "", tipo: "", justificativa: "" });
  };

  const handleResultado = async () => {
    if (!detailItem) return;
    await update.mutateAsync({ id: detailItem.id, status: "realizado", resultado, data_realizacao: new Date().toISOString().split("T")[0] });
    setDetailItem(null);
    setResultado("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente ou tipo de exame..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-72" />
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Solicitar Exame</Button>
      </div>

      {isLoading ? <div className="text-center py-8">Carregando...</div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Solicit.</TableHead>
              <TableHead>Data Realiz.</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ex: any) => (
              <TableRow key={ex.id}>
                <TableCell className="font-medium">{ex.paciente_nome}</TableCell>
                <TableCell>{ex.tipo}</TableCell>
                <TableCell>{ex.medico_nome}</TableCell>
                <TableCell>{ex.unidade_nome}</TableCell>
                <TableCell><Badge variant={STATUS_MAP[ex.status]?.variant || "secondary"}>{STATUS_MAP[ex.status]?.label || ex.status}</Badge></TableCell>
                <TableCell>{format(new Date(ex.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell>{ex.data_realizacao ? format(new Date(ex.data_realizacao), "dd/MM/yyyy") : "—"}</TableCell>
                <TableCell><Button variant="ghost" size="sm" onClick={() => { setDetailItem(ex); setResultado(ex.resultado || ""); }}><FileText className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhum exame encontrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Solicitar Exame</DialogTitle>
            <DialogDescription>Registre a solicitação de exame do paciente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={form.paciente_id} onValueChange={v => setForm({ ...form, paciente_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{pacientes.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Médico Solicitante *</Label>
                <Select value={form.medico_solicitante_id} onValueChange={v => setForm({ ...form, medico_solicitante_id: v })} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{profissionais.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Exame *</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{TIPOS_EXAME.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unidade *</Label>
              <Select value={form.unidade_id} onValueChange={v => setForm({ ...form, unidade_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Justificativa</Label>
              <Textarea value={form.justificativa} onChange={e => setForm({ ...form, justificativa: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={create.isPending || !form.paciente_id || !form.tipo || !form.unidade_id}>Solicitar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailItem} onOpenChange={open => { if (!open) setDetailItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exame — {detailItem?.paciente_nome}</DialogTitle>
            <DialogDescription>Tipo: {detailItem?.tipo} | Status: {detailItem?.status}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p><strong>Médico:</strong> {detailItem?.medico_nome}</p>
            <p><strong>Unidade:</strong> {detailItem?.unidade_nome}</p>
            {detailItem?.justificativa && <p><strong>Justificativa:</strong> {detailItem.justificativa}</p>}
            {detailItem?.status !== "realizado" && detailItem?.status !== "cancelado" && (
              <div className="space-y-2 pt-2">
                <Label>Resultado do Exame</Label>
                <Textarea value={resultado} onChange={e => setResultado(e.target.value)} placeholder="Descreva o resultado..." />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="destructive" onClick={async () => { await update.mutateAsync({ id: detailItem.id, status: "cancelado" }); setDetailItem(null); }}>Cancelar Exame</Button>
                  <Button size="sm" onClick={handleResultado} disabled={!resultado}>Registrar Resultado</Button>
                </div>
              </div>
            )}
            {detailItem?.resultado && <div className="bg-muted p-3 rounded-md"><strong>Resultado:</strong> {detailItem.resultado}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
