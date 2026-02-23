import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useEncaminhamentos } from "@/hooks/useEncaminhamentos";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pendente: "secondary",
  regulado: "default",
  agendado: "default",
  realizado: "outline",
  cancelado: "destructive",
};

const PRIORIDADE_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  baixa: "outline",
  media: "secondary",
  alta: "default",
  urgente: "destructive",
};

export function EncaminhamentosSaude() {
  const { encaminhamentos, isLoading, create, update } = useEncaminhamentos();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);
  const [form, setForm] = useState({ paciente_id: "", medico_solicitante_id: "", unidade_origem_id: "", especialidade: "", justificativa: "", prioridade: "media", unidade_destino_id: "" });

  const { data: pacientes = [] } = useQuery({
    queryKey: ["pacientes_select"],
    queryFn: async () => { const { data } = await supabase.from("pacientes").select("id, nome, cpf").order("nome").limit(500); return data || []; },
  });
  const { data: profissionais = [] } = useQuery({
    queryKey: ["profissionais_select"],
    queryFn: async () => { const { data } = await supabase.from("profissionais_saude").select("id, user_id, profiles:user_id(name)").eq("status", "ativo").order("created_at"); return (data || []).map((p: any) => ({ id: p.id, nome: p.profiles?.name || "—" })); },
  });
  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_saude_list"],
    queryFn: async () => { const { data } = await supabase.from("unidades_saude").select("id, nome, tipo").neq("status", "inativo").order("nome"); return data || []; },
  });

  const filtered = encaminhamentos.filter((e: any) =>
    e.paciente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    e.especialidade?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      paciente_id: form.paciente_id,
      medico_solicitante_id: form.medico_solicitante_id,
      unidade_origem_id: form.unidade_origem_id,
      especialidade: form.especialidade,
      justificativa: form.justificativa,
      prioridade: form.prioridade,
      unidade_destino_id: form.unidade_destino_id || undefined,
    });
    setDialogOpen(false);
    setForm({ paciente_id: "", medico_solicitante_id: "", unidade_origem_id: "", especialidade: "", justificativa: "", prioridade: "media", unidade_destino_id: "" });
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: any = { id, status };
    if (status === "regulado") updates.data_regulacao = new Date().toISOString();
    if (status === "agendado") updates.data_agendamento = new Date().toISOString();
    await update.mutateAsync(updates);
    setDetailItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar paciente ou especialidade..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-72" />
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Novo Encaminhamento</Button>
      </div>

      {isLoading ? <div className="text-center py-8">Carregando...</div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Unidade Origem</TableHead>
              <TableHead>Unidade Destino</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((enc: any) => (
              <TableRow key={enc.id}>
                <TableCell className="font-medium">{enc.paciente_nome}</TableCell>
                <TableCell>{enc.especialidade}</TableCell>
                <TableCell><Badge variant={PRIORIDADE_COLORS[enc.prioridade] || "secondary"}>{enc.prioridade}</Badge></TableCell>
                <TableCell>{enc.unidade_origem_nome}</TableCell>
                <TableCell>{enc.unidade_destino_nome}</TableCell>
                <TableCell>{enc.medico_nome}</TableCell>
                <TableCell><Badge variant={STATUS_COLORS[enc.status] || "secondary"}>{enc.status}</Badge></TableCell>
                <TableCell>{format(new Date(enc.created_at), "dd/MM/yyyy")}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => setDetailItem(enc)}>
                    <ArrowRightLeft className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Nenhum encaminhamento encontrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      )}

      {/* Dialog novo encaminhamento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Encaminhamento</DialogTitle>
            <DialogDescription>Registre a solicitação de encaminhamento do paciente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={form.paciente_id} onValueChange={v => setForm({ ...form, paciente_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{pacientes.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome} — {p.cpf || "sem CPF"}</SelectItem>)}</SelectContent>
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
                <Label>Especialidade *</Label>
                <Input value={form.especialidade} onChange={e => setForm({ ...form, especialidade: e.target.value })} placeholder="Ex: Cardiologia" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unidade Origem *</Label>
                <Select value={form.unidade_origem_id} onValueChange={v => setForm({ ...form, unidade_origem_id: v })} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade Destino</Label>
                <Select value={form.unidade_destino_id} onValueChange={v => setForm({ ...form, unidade_destino_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>{unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={v => setForm({ ...form, prioridade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Justificativa *</Label>
              <Textarea value={form.justificativa} onChange={e => setForm({ ...form, justificativa: e.target.value })} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={create.isPending || !form.paciente_id || !form.medico_solicitante_id || !form.unidade_origem_id || !form.especialidade}>Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog detalhes / alterar status */}
      <Dialog open={!!detailItem} onOpenChange={open => { if (!open) setDetailItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encaminhamento — {detailItem?.paciente_nome}</DialogTitle>
            <DialogDescription>Especialidade: {detailItem?.especialidade} | Prioridade: {detailItem?.prioridade}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p><strong>Justificativa:</strong> {detailItem?.justificativa}</p>
            <p><strong>Médico:</strong> {detailItem?.medico_nome}</p>
            <p><strong>Origem:</strong> {detailItem?.unidade_origem_nome} → <strong>Destino:</strong> {detailItem?.unidade_destino_nome}</p>
            <p><strong>Status atual:</strong> <Badge variant={STATUS_COLORS[detailItem?.status] || "secondary"}>{detailItem?.status}</Badge></p>
            {detailItem?.observacoes && <p><strong>Obs:</strong> {detailItem.observacoes}</p>}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            {detailItem?.status === "pendente" && <Button size="sm" onClick={() => handleStatusChange(detailItem.id, "regulado")}>Regular</Button>}
            {detailItem?.status === "regulado" && <Button size="sm" onClick={() => handleStatusChange(detailItem.id, "agendado")}>Agendar</Button>}
            {detailItem?.status === "agendado" && <Button size="sm" onClick={() => handleStatusChange(detailItem.id, "realizado")}>Concluir</Button>}
            {["pendente", "regulado", "agendado"].includes(detailItem?.status) && <Button size="sm" variant="destructive" onClick={() => handleStatusChange(detailItem.id, "cancelado")}>Cancelar</Button>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
