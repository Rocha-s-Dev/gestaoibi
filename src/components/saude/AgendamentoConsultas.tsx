import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAgendamentosSaude } from "@/hooks/useAgendamentosSaude";
import { usePacientes } from "@/hooks/usePacientes";
import { useProfissionaisSaude } from "@/hooks/useProfissionaisSaude";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarPlus, Search, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function AgendamentoConsultas() {
  const { agendamentos, isLoading, createAgendamento, updateAgendamento, cancelAgendamento } = useAgendamentosSaude();
  const { pacientes } = usePacientes();
  const { profissionais } = useProfissionaisSaude();
  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_saude_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("unidades_saude").select("id, nome").neq("status", "inativo").order("nome");
      if (error) throw error;
      return data as { id: string; nome: string }[];
    },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelMotivo, setCancelMotivo] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const [form, setForm] = useState({
    paciente_id: "",
    unidade_id: "",
    profissional_id: "",
    data_hora: "",
    tipo: "consulta",
    especialidade: "",
    prioridade: "normal",
    observacoes: "",
  });

  const filtered = agendamentos.filter(a => {
    const matchSearch = a.paciente?.nome?.toLowerCase().includes(search.toLowerCase()) || !search;
    const matchStatus = statusFilter === "todos" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const hoje = agendamentos.filter(a => {
    const d = new Date(a.data_hora);
    const now = new Date();
    return d.toDateString() === now.toDateString() && a.status !== "cancelado";
  });

  const pendentes = agendamentos.filter(a => a.status === "agendado");
  const confirmados = agendamentos.filter(a => a.status === "confirmado");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAgendamento.mutate(
      {
        ...form,
        profissional_id: form.profissional_id || null,
        status: "agendado",
      },
      { onSuccess: () => { setDialogOpen(false); resetForm(); } }
    );
  };

  const resetForm = () => setForm({ paciente_id: "", unidade_id: "", profissional_id: "", data_hora: "", tipo: "consulta", especialidade: "", prioridade: "normal", observacoes: "" });

  const handleConfirm = (id: string) => {
    updateAgendamento.mutate({ id, status: "confirmado" });
  };

  const handleRealize = (id: string) => {
    updateAgendamento.mutate({ id, status: "realizado" });
  };

  const handleCancelConfirm = () => {
    if (cancelId && cancelMotivo) {
      cancelAgendamento.mutate({ id: cancelId, motivo: cancelMotivo }, {
        onSuccess: () => { setCancelDialogOpen(false); setCancelId(null); setCancelMotivo(""); }
      });
    }
  };

  const statusColor: Record<string, string> = {
    agendado: "secondary",
    confirmado: "default",
    realizado: "default",
    cancelado: "destructive",
    falta: "destructive",
  };


  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{hoje.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendentes.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{confirmados.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{agendamentos.length}</div></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-64" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="realizado">Realizado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <CalendarPlus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(ag => (
              <TableRow key={ag.id}>
                <TableCell className="font-medium">{ag.paciente?.nome || "—"}</TableCell>
                <TableCell>{format(new Date(ag.data_hora), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                <TableCell className="capitalize">{ag.tipo}</TableCell>
                <TableCell>{ag.especialidade || "—"}</TableCell>
                <TableCell>{ag.unidade?.nome || "—"}</TableCell>
                <TableCell>
                  <Badge variant={ag.prioridade === "urgente" ? "destructive" : "secondary"}>
                    {ag.prioridade || "normal"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusColor[ag.status || "agendado"] as any}>
                    {ag.status || "agendado"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {ag.status === "agendado" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleConfirm(ag.id)}>
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setCancelId(ag.id); setCancelDialogOpen(true); }}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                    {ag.status === "confirmado" && (
                      <Button size="sm" variant="ghost" onClick={() => handleRealize(ag.id)}>Realizar</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum agendamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* New Agendamento Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription>Preencha os dados para agendar uma consulta ou procedimento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente *</Label>
              <Select value={form.paciente_id} onValueChange={v => setForm({ ...form, paciente_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                <SelectContent>
                  {pacientes.filter(p => p.status !== "inativo").map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.nome} {p.cartao_sus ? `- SUS: ${p.cartao_sus}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade de Saúde *</Label>
              <Select value={form.unidade_id} onValueChange={v => setForm({ ...form, unidade_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                <SelectContent>
                  {unidades.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data e Hora *</Label>
                <Input type="datetime-local" value={form.data_hora} onChange={e => setForm({ ...form, data_hora: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="exame">Exame</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                    <SelectItem value="vacinacao">Vacinação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Input value={form.especialidade} onChange={e => setForm({ ...form, especialidade: e.target.value })} placeholder="Ex: Clínica Geral" />
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={v => setForm({ ...form, prioridade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="prioritario">Prioritário</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Select value={form.profissional_id} onValueChange={v => setForm({ ...form, profissional_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione (opcional)" /></SelectTrigger>
                <SelectContent>
                  {profissionais.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.profile_nome} - {p.especialidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createAgendamento.isPending || !form.paciente_id || !form.data_hora || !form.unidade_id}>Agendar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>Informe o motivo do cancelamento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea value={cancelMotivo} onChange={e => setCancelMotivo(e.target.value)} placeholder="Motivo do cancelamento..." />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
              <Button variant="destructive" onClick={handleCancelConfirm} disabled={!cancelMotivo}>Confirmar Cancelamento</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
