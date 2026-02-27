import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Target, Clock, TrendingUp, AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const tipoColors: Record<string, string> = {
  cobertura_vacinal: "bg-blue-100 text-blue-800",
  tempo_espera: "bg-orange-100 text-orange-800",
};

const statusColors: Record<string, string> = {
  atingida: "bg-green-100 text-green-800",
  em_progresso: "bg-blue-100 text-blue-800",
  atrasada: "bg-yellow-100 text-yellow-800",
  critica: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  atingida: "Atingida", em_progresso: "Em Progresso", atrasada: "Atrasada", critica: "Crítica",
};

export function MetasSaudePublica() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "", tipo: "cobertura_vacinal", valor_meta: "", valor_atual: "",
    unidade_medida: "%", prazo: "", status: "em_progresso", responsavel: "", descricao: "",
  });

  const { data: metas = [], isLoading } = useQuery({
    queryKey: ["metas_saude"],
    queryFn: async () => {
      const { data, error } = await supabase.from("metas_saude").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => { const { error } = await supabase.from("metas_saude").insert(d); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["metas_saude"] }); toast.success("Meta criada"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao criar meta"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...d }: any) => { const { error } = await supabase.from("metas_saude").update(d).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["metas_saude"] }); toast.success("Meta atualizada"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("metas_saude").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["metas_saude"] }); toast.success("Meta removida"); },
    onError: () => toast.error("Erro ao remover"),
  });

  const filtered = metas.filter((m: any) => {
    const matchSearch = !searchTerm || m.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || m.responsavel?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFilter === "todos" || m.tipo === tipoFilter;
    const matchStatus = statusFilter === "todos" || m.status === statusFilter;
    return matchSearch && matchTipo && matchStatus;
  });

  const calcularProgresso = (atual: number | null, meta: number, tipo: string) => {
    if (!atual) return 0;
    if (tipo === "tempo_espera") return Math.max(0, Math.min(100, (meta / atual) * 100));
    return Math.max(0, Math.min(100, (atual / meta) * 100));
  };

  const openAdd = () => {
    setEditing(null);
    setFormData({ titulo: "", tipo: "cobertura_vacinal", valor_meta: "", valor_atual: "", unidade_medida: "%", prazo: "", status: "em_progresso", responsavel: "", descricao: "" });
    setDialogOpen(true);
  };

  const openEdit = (m: any) => {
    setEditing(m);
    setFormData({
      titulo: m.titulo, tipo: m.tipo, valor_meta: String(m.valor_meta), valor_atual: m.valor_atual ? String(m.valor_atual) : "",
      unidade_medida: m.unidade_medida, prazo: m.prazo || "", status: m.status || "em_progresso",
      responsavel: m.responsavel || "", descricao: m.descricao || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      titulo: formData.titulo, tipo: formData.tipo, valor_meta: parseFloat(formData.valor_meta),
      valor_atual: formData.valor_atual ? parseFloat(formData.valor_atual) : null,
      unidade_medida: formData.unidade_medida, prazo: formData.prazo || null,
      status: formData.status, responsavel: formData.responsavel || null, descricao: formData.descricao || null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const totalMetas = metas.length;
  const atingidas = metas.filter((m: any) => m.status === "atingida").length;
  const criticasCount = metas.filter((m: any) => m.status === "critica").length;
  const emProgresso = metas.filter((m: any) => m.status === "em_progresso").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input placeholder="Buscar metas..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos os Tipos</SelectItem><SelectItem value="cobertura_vacinal">Cobertura Vacinal</SelectItem><SelectItem value="tempo_espera">Tempo de Espera</SelectItem></SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="todos">Todos</SelectItem><SelectItem value="atingida">Atingida</SelectItem><SelectItem value="em_progresso">Em Progresso</SelectItem><SelectItem value="atrasada">Atrasada</SelectItem><SelectItem value="critica">Crítica</SelectItem></SelectContent>
          </Select>
        </div>
        <Button onClick={openAdd}><Plus size={20} className="mr-2" />Nova Meta</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total de Metas</p><p className="text-2xl font-bold">{totalMetas}</p></div><Target className="text-primary" size={24} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Atingidas</p><p className="text-2xl font-bold text-green-600">{atingidas}</p></div><TrendingUp className="text-green-500" size={24} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Críticas</p><p className="text-2xl font-bold text-destructive">{criticasCount}</p></div><AlertTriangle className="text-destructive" size={24} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Em Progresso</p><p className="text-2xl font-bold text-primary">{emProgresso}</p></div><Clock className="text-primary" size={24} /></div></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando metas...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((meta: any) => {
            const progresso = calcularProgresso(meta.valor_atual, meta.valor_meta, meta.tipo);
            return (
              <Card key={meta.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={tipoColors[meta.tipo] || ""}>{meta.tipo === "cobertura_vacinal" ? "Cobertura Vacinal" : "Tempo de Espera"}</Badge>
                        <Badge className={statusColors[meta.status] || ""}>{statusLabels[meta.status] || meta.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(meta)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(meta.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Valor Atual</p><p className="text-xl font-bold">{meta.valor_atual ?? "—"} {meta.valor_atual != null ? meta.unidade_medida : ""}</p></div>
                    <div><p className="text-sm text-muted-foreground">Meta</p><p className="text-xl font-bold text-primary">{meta.valor_meta} {meta.unidade_medida}</p></div>
                  </div>
                  <div><div className="flex justify-between items-center mb-2"><p className="text-sm text-muted-foreground">Progresso</p><p className="text-sm font-medium">{progresso.toFixed(1)}%</p></div><Progress value={progresso} className="h-2" /></div>
                  {meta.responsavel && <div><p className="text-sm text-muted-foreground">Responsável</p><p className="text-sm font-medium">{meta.responsavel}</p></div>}
                  {meta.prazo && <div><p className="text-sm text-muted-foreground">Prazo</p><p className="text-sm font-medium">{meta.prazo}</p></div>}
                  {meta.descricao && <div><p className="text-sm text-muted-foreground">Descrição</p><p className="text-sm">{meta.descricao}</p></div>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && <div className="text-center py-8"><p className="text-muted-foreground">Nenhuma meta encontrada</p></div>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editing ? "Editar Meta" : "Nova Meta"}</DialogTitle><DialogDescription>{editing ? "Atualize os dados da meta." : "Cadastre uma nova meta de saúde."}</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Tipo</Label><Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v, unidade_medida: v === "cobertura_vacinal" ? "%" : "dias" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="cobertura_vacinal">Cobertura Vacinal</SelectItem><SelectItem value="tempo_espera">Tempo de Espera</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="atingida">Atingida</SelectItem><SelectItem value="em_progresso">Em Progresso</SelectItem><SelectItem value="atrasada">Atrasada</SelectItem><SelectItem value="critica">Crítica</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Valor Meta</Label><Input type="number" step="0.1" value={formData.valor_meta} onChange={(e) => setFormData({ ...formData, valor_meta: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Valor Atual</Label><Input type="number" step="0.1" value={formData.valor_atual} onChange={(e) => setFormData({ ...formData, valor_atual: e.target.value })} /></div>
              <div className="space-y-2"><Label>Unidade</Label><Input value={formData.unidade_medida} onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Responsável</Label><Input value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} /></div>
              <div className="space-y-2"><Label>Prazo</Label><Input value={formData.prazo} onChange={(e) => setFormData({ ...formData, prazo: e.target.value })} placeholder="Dezembro 2025" /></div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} rows={2} /></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? "Atualizar" : "Salvar"}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Remover Meta</AlertDialogTitle><AlertDialogDescription>Tem certeza?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}>Remover</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
