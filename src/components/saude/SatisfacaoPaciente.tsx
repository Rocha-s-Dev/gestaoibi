import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, Users, Star, FileText, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const statusBadge: Record<string, string> = {
  ativa: "bg-green-100 text-green-800",
  finalizada: "bg-gray-100 text-gray-800",
  planejada: "bg-blue-100 text-blue-800",
};

export function SatisfacaoPaciente() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "", data_inicio: "", data_fim: "", unidade_id: "",
    categoria: "", status: "planejada", nota_media: "", total_respostas: "",
  });

  const { data: pesquisas = [], isLoading } = useQuery({
    queryKey: ["pesquisas_satisfacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pesquisas_satisfacao")
        .select("*, unidades_saude(nome)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_satisf"],
    queryFn: async () => {
      const { data } = await supabase.from("unidades_saude").select("id, nome").neq("status", "inativo").order("nome");
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const { error } = await supabase.from("pesquisas_satisfacao").insert(d); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pesquisas_satisfacao"] }); toast.success("Pesquisa criada"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao criar pesquisa"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...d }: any) => { const { error } = await supabase.from("pesquisas_satisfacao").update(d).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pesquisas_satisfacao"] }); toast.success("Pesquisa atualizada"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("pesquisas_satisfacao").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["pesquisas_satisfacao"] }); toast.success("Pesquisa removida"); },
    onError: () => toast.error("Erro ao remover"),
  });

  const openAdd = () => {
    setEditing(null);
    setFormData({ titulo: "", data_inicio: "", data_fim: "", unidade_id: "", categoria: "", status: "planejada", nota_media: "", total_respostas: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setFormData({
      titulo: p.titulo, data_inicio: p.data_inicio, data_fim: p.data_fim || "",
      unidade_id: p.unidade_id || "", categoria: p.categoria || "", status: p.status || "planejada",
      nota_media: p.nota_media != null ? String(p.nota_media) : "", total_respostas: p.total_respostas != null ? String(p.total_respostas) : "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      titulo: formData.titulo, data_inicio: formData.data_inicio,
      data_fim: formData.data_fim || null, unidade_id: formData.unidade_id || null,
      categoria: formData.categoria || null, status: formData.status,
      nota_media: formData.nota_media ? parseFloat(formData.nota_media) : null,
      total_respostas: formData.total_respostas ? parseInt(formData.total_respostas) : null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const ativas = pesquisas.filter((p: any) => p.status === "ativa").length;
  const totalRespostas = pesquisas.reduce((acc: number, p: any) => acc + (p.total_respostas || 0), 0);
  const notasValidas = pesquisas.filter((p: any) => p.nota_media != null);
  const mediaGeral = notasValidas.length > 0 ? (notasValidas.reduce((acc: number, p: any) => acc + p.nota_media, 0) / notasValidas.length).toFixed(1) : "—";
  const satisfacaoGeral = notasValidas.length > 0 ? Math.round((parseFloat(mediaGeral as string) / 5) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Pesquisas de Satisfação</h2>
          <p className="text-muted-foreground">Monitore a satisfação dos pacientes com os serviços de saúde</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Nova Pesquisa</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pesquisas Ativas</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{ativas}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Respostas</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalRespostas}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Nota Média Geral</CardTitle><Star className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{mediaGeral}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Satisfação Geral</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{satisfacaoGeral}%</div></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando pesquisas...</div>
      ) : (
        <Card>
          <CardHeader><CardTitle>Pesquisas de Satisfação</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pesquisas.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{p.titulo}</h3>
                      <Badge className={statusBadge[p.status] || statusBadge.planejada}>{p.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(p as any).unidades_saude?.nome || "Todas"} • {p.categoria || "Geral"}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{p.total_respostas || 0} respostas</span>
                      <span>Nota: {p.nota_media != null ? `${p.nota_media}/5.0` : "—"}</span>
                      <span>{new Date(p.data_inicio).toLocaleDateString("pt-BR")} {p.data_fim ? `- ${new Date(p.data_fim).toLocaleDateString("pt-BR")}` : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {p.nota_media != null && (
                      <div className="text-right mr-2">
                        <div className="text-lg font-semibold text-primary">{p.nota_media}/5.0</div>
                        <div className="text-xs text-muted-foreground">{Math.round((p.nota_media / 5) * 100)}%</div>
                      </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {pesquisas.length === 0 && <p className="text-center text-muted-foreground py-4">Nenhuma pesquisa cadastrada</p>}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Editar Pesquisa" : "Nova Pesquisa"}</DialogTitle><DialogDescription>{editing ? "Atualize a pesquisa." : "Configure uma nova pesquisa."}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Data Início</Label><Input type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Data Fim</Label><Input type="date" value={formData.data_fim} onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Unidade de Saúde</Label>
              <Select value={formData.unidade_id} onValueChange={(v) => setFormData({ ...formData, unidade_id: v })}><SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger><SelectContent>{unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Categoria</Label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Atendimento Geral">Atendimento Geral</SelectItem><SelectItem value="Atendimento Médico">Atendimento Médico</SelectItem><SelectItem value="Tempo de Espera">Tempo de Espera</SelectItem><SelectItem value="Infraestrutura">Infraestrutura</SelectItem><SelectItem value="Satisfação Geral">Satisfação Geral</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planejada">Planejada</SelectItem><SelectItem value="ativa">Ativa</SelectItem><SelectItem value="finalizada">Finalizada</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nota Média</Label><Input type="number" step="0.1" min="0" max="5" value={formData.nota_media} onChange={(e) => setFormData({ ...formData, nota_media: e.target.value })} /></div>
              <div className="space-y-2"><Label>Total Respostas</Label><Input type="number" min="0" value={formData.total_respostas} onChange={(e) => setFormData({ ...formData, total_respostas: e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? "Atualizar" : "Criar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover Pesquisa</AlertDialogTitle><AlertDialogDescription>Tem certeza?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}>Remover</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
