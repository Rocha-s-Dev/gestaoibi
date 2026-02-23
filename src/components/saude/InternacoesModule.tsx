import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useInternacoes } from "@/hooks/useInternacoes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Bed, Edit } from "lucide-react";
import { format } from "date-fns";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  internado: { label: "Internado", variant: "default" },
  alta: { label: "Alta", variant: "outline" },
  transferido: { label: "Transferido", variant: "secondary" },
  obito: { label: "Óbito", variant: "destructive" },
};

export function InternacoesModule() {
  const { internacoes, isLoading, create, update } = useInternacoes();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ paciente_id: "", medico_responsavel_id: "", unidade_id: "", motivo_internacao: "", leito: "" });
  const [altaForm, setAltaForm] = useState({ motivo_alta: "", evolucao: "" });

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

  const filtered = internacoes.filter((i: any) =>
    i.paciente_nome?.toLowerCase().includes(search.toLowerCase()) ||
    i.motivo_internacao?.toLowerCase().includes(search.toLowerCase())
  );

  const internadosCount = internacoes.filter((i: any) => i.status === "internado").length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({
      paciente_id: form.paciente_id,
      medico_responsavel_id: form.medico_responsavel_id,
      unidade_id: form.unidade_id,
      motivo_internacao: form.motivo_internacao,
      leito: form.leito || undefined,
    });
    setDialogOpen(false);
    setForm({ paciente_id: "", medico_responsavel_id: "", unidade_id: "", motivo_internacao: "", leito: "" });
  };

  const handleAlta = async () => {
    if (!editItem) return;
    await update.mutateAsync({
      id: editItem.id,
      status: "alta",
      data_alta: new Date().toISOString().split("T")[0],
      motivo_alta: altaForm.motivo_alta,
      evolucao: altaForm.evolucao,
    });
    setEditItem(null);
    setAltaForm({ motivo_alta: "", evolucao: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-72" />
          </div>
          <Badge variant="default" className="text-sm"><Bed className="h-3 w-3 mr-1" />{internadosCount} internados</Badge>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Nova Internação</Button>
      </div>

      {isLoading ? <div className="text-center py-8">Carregando...</div> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Paciente</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Leito</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Alta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((int: any) => (
              <TableRow key={int.id}>
                <TableCell className="font-medium">{int.paciente_nome}</TableCell>
                <TableCell className="max-w-[200px] truncate">{int.motivo_internacao}</TableCell>
                <TableCell>{int.leito || "—"}</TableCell>
                <TableCell>{int.medico_nome}</TableCell>
                <TableCell>{int.unidade_nome}</TableCell>
                <TableCell>{format(new Date(int.data_entrada), "dd/MM/yyyy")}</TableCell>
                <TableCell>{int.data_alta ? format(new Date(int.data_alta), "dd/MM/yyyy") : "—"}</TableCell>
                <TableCell><Badge variant={STATUS_MAP[int.status]?.variant || "secondary"}>{STATUS_MAP[int.status]?.label || int.status}</Badge></TableCell>
                <TableCell>
                  {int.status === "internado" && (
                    <Button variant="ghost" size="sm" onClick={() => { setEditItem(int); setAltaForm({ motivo_alta: "", evolucao: int.evolucao || "" }); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">Nenhuma internação encontrada</TableCell></TableRow>}
          </TableBody>
        </Table>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Internação</DialogTitle>
            <DialogDescription>Registre a internação do paciente.</DialogDescription>
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
                <Label>Médico Responsável *</Label>
                <Select value={form.medico_responsavel_id} onValueChange={v => setForm({ ...form, medico_responsavel_id: v })} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{profissionais.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade *</Label>
                <Select value={form.unidade_id} onValueChange={v => setForm({ ...form, unidade_id: v })} required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Leito</Label>
                <Input value={form.leito} onChange={e => setForm({ ...form, leito: e.target.value })} placeholder="Ex: Ala B - Leito 12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo da Internação *</Label>
              <Textarea value={form.motivo_internacao} onChange={e => setForm({ ...form, motivo_internacao: e.target.value })} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={create.isPending || !form.paciente_id || !form.medico_responsavel_id || !form.unidade_id}>Internar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editItem} onOpenChange={open => { if (!open) setEditItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerenciar Internação — {editItem?.paciente_nome}</DialogTitle>
            <DialogDescription>Leito: {editItem?.leito || "—"} | Médico: {editItem?.medico_nome}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Evolução Clínica</Label>
              <Textarea value={altaForm.evolucao} onChange={e => setAltaForm({ ...altaForm, evolucao: e.target.value })} placeholder="Descreva a evolução..." />
              <Button size="sm" variant="outline" onClick={async () => { await update.mutateAsync({ id: editItem.id, evolucao: altaForm.evolucao }); }}>Salvar Evolução</Button>
            </div>
            <div className="border-t pt-4 space-y-2">
              <Label>Alta Hospitalar</Label>
              <Input placeholder="Motivo da alta" value={altaForm.motivo_alta} onChange={e => setAltaForm({ ...altaForm, motivo_alta: e.target.value })} />
              <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={handleAlta} disabled={!altaForm.motivo_alta}>Dar Alta</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
