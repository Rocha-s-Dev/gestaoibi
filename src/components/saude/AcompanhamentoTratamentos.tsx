import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Activity, Users, Calendar, TrendingUp, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusMap: Record<string, { className: string; label: string }> = {
  em_andamento: { className: "bg-blue-100 text-blue-800", label: "Em Andamento" },
  concluido: { className: "bg-green-100 text-green-800", label: "Concluído" },
  suspenso: { className: "bg-yellow-100 text-yellow-800", label: "Suspenso" },
  cancelado: { className: "bg-red-100 text-red-800", label: "Cancelado" },
};

export function AcompanhamentoTratamentos() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    paciente_id: "", nome_tratamento: "", profissional_id: "",
    data_inicio: "", data_prevista_fim: "", status: "em_andamento",
    progresso: 0, medicamentos: "", observacoes: "", cid: "",
  });

  const { data: tratamentos = [], isLoading } = useQuery({
    queryKey: ["tratamentos_saude"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tratamentos")
        .select("*, pacientes(nome, cpf), profissionais_saude(id, profissionais_saude_profile_id_fkey:profiles(name))")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: pacientes = [] } = useQuery({
    queryKey: ["pacientes_list_trat"],
    queryFn: async () => {
      const { data } = await supabase.from("pacientes").select("id, nome, cpf").order("nome").limit(200);
      return data || [];
    },
  });

  const { data: profissionais = [] } = useQuery({
    queryKey: ["profissionais_list_trat"],
    queryFn: async () => {
      const { data } = await supabase.from("profissionais_saude").select("id, profissionais_saude_profile_id_fkey:profiles(name)").eq("status", "ativo").order("created_at");
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const { error } = await supabase.from("tratamentos").insert(d); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tratamentos_saude"] }); toast.success("Tratamento registrado"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao registrar"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...d }: any) => { const { error } = await supabase.from("tratamentos").update(d).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tratamentos_saude"] }); toast.success("Tratamento atualizado"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("tratamentos").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["tratamentos_saude"] }); toast.success("Tratamento removido"); },
    onError: () => toast.error("Erro ao remover"),
  });

  const openAdd = () => {
    setEditing(null);
    setFormData({ paciente_id: "", nome_tratamento: "", profissional_id: "", data_inicio: "", data_prevista_fim: "", status: "em_andamento", progresso: 0, medicamentos: "", observacoes: "", cid: "" });
    setDialogOpen(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    const meds = Array.isArray(t.medicamentos) ? t.medicamentos.join(", ") : "";
    setFormData({
      paciente_id: t.paciente_id, nome_tratamento: t.nome_tratamento, profissional_id: t.profissional_id || "",
      data_inicio: t.data_inicio, data_prevista_fim: t.data_prevista_fim || "", status: t.status || "em_andamento",
      progresso: t.progresso || 0, medicamentos: meds, observacoes: t.observacoes || "", cid: t.cid || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const meds = formData.medicamentos ? formData.medicamentos.split(",").map(m => m.trim()).filter(Boolean) : [];
    const payload = {
      paciente_id: formData.paciente_id, nome_tratamento: formData.nome_tratamento,
      profissional_id: formData.profissional_id || null, data_inicio: formData.data_inicio,
      data_prevista_fim: formData.data_prevista_fim || null, status: formData.status,
      progresso: formData.progresso, medicamentos: meds, observacoes: formData.observacoes || null,
      cid: formData.cid || null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const ativos = tratamentos.filter((t: any) => t.status === "em_andamento").length;
  const concluidos = tratamentos.filter((t: any) => t.status === "concluido").length;
  const totalPacientes = new Set(tratamentos.map((t: any) => t.paciente_id)).size;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Acompanhamento de Tratamentos</h2>
          <p className="text-muted-foreground">Registro e monitoramento de tratamentos em andamento</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Novo Tratamento</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tratamentos Ativos</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{ativos}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pacientes</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalPacientes}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Concluídos</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{concluidos}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{tratamentos.length > 0 ? Math.round((concluidos / tratamentos.length) * 100) : 0}%</div></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando tratamentos...</div>
      ) : (
        <Card>
          <CardHeader><CardTitle>Tratamentos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tratamentos.map((t: any) => {
                const st = statusMap[t.status] || statusMap.em_andamento;
                const pacNome = t.pacientes?.nome || "—";
                const pacCpf = t.pacientes?.cpf || "";
                const profNome = (t.profissionais_saude as any)?.profissionais_saude_profile_id_fkey?.name || "—";
                const meds = Array.isArray(t.medicamentos) ? t.medicamentos : [];
                return (
                  <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{pacNome}</h3>
                        <Badge className={st.className}>{st.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground"><strong>Tratamento:</strong> {t.nome_tratamento}</p>
                      <p className="text-sm text-muted-foreground"><strong>Profissional:</strong> {profNome} {pacCpf && <>• <strong>CPF:</strong> {pacCpf}</>}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Início: {new Date(t.data_inicio).toLocaleDateString("pt-BR")}</span>
                        {t.data_prevista_fim && <span>Previsão: {new Date(t.data_prevista_fim).toLocaleDateString("pt-BR")}</span>}
                      </div>
                      {meds.length > 0 && <p className="text-sm text-muted-foreground"><strong>Medicamentos:</strong> {meds.join(", ")}</p>}
                      {t.observacoes && <p className="text-sm text-muted-foreground"><strong>Obs:</strong> {t.observacoes}</p>}
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">{t.progresso || 0}%</div>
                        <div className="text-xs text-muted-foreground">Progresso</div>
                      </div>
                      <Progress value={t.progresso || 0} className="w-24 h-2" />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {tratamentos.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhum tratamento cadastrado</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Tratamento" : "Novo Tratamento"}</DialogTitle><DialogDescription>{editing ? "Atualize o tratamento." : "Registre um novo tratamento."}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Paciente</Label>
              <Select value={formData.paciente_id} onValueChange={(v) => setFormData({ ...formData, paciente_id: v })}><SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger><SelectContent>{pacientes.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome} {p.cpf ? `(${p.cpf})` : ""}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Nome do Tratamento</Label><Input value={formData.nome_tratamento} onChange={(e) => setFormData({ ...formData, nome_tratamento: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Profissional Responsável</Label>
              <Select value={formData.profissional_id} onValueChange={(v) => setFormData({ ...formData, profissional_id: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{profissionais.map((p: any) => <SelectItem key={p.id} value={p.id}>{(p as any).profissionais_saude_profile_id_fkey?.name || p.id}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Data Início</Label><Input type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Previsão Fim</Label><Input type="date" value={formData.data_prevista_fim} onChange={(e) => setFormData({ ...formData, data_prevista_fim: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="em_andamento">Em Andamento</SelectItem><SelectItem value="concluido">Concluído</SelectItem><SelectItem value="suspenso">Suspenso</SelectItem><SelectItem value="cancelado">Cancelado</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Progresso (%)</Label><Input type="number" min="0" max="100" value={formData.progresso} onChange={(e) => setFormData({ ...formData, progresso: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>CID</Label><Input value={formData.cid} onChange={(e) => setFormData({ ...formData, cid: e.target.value })} placeholder="Ex: I10" /></div>
            </div>
            <div className="space-y-2"><Label>Medicamentos (vírgula)</Label><Textarea value={formData.medicamentos} onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })} rows={2} /></div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={2} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? "Atualizar" : "Registrar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover Tratamento</AlertDialogTitle><AlertDialogDescription>Tem certeza?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}>Remover</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
