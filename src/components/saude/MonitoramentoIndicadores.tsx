import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, TrendingUp, TrendingDown, AlertTriangle, Calendar, Monitor, Edit, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const categoriaColors: Record<string, string> = {
  morbidade: "bg-orange-100 text-orange-800",
  mortalidade: "bg-red-100 text-red-800",
  vacinacao: "bg-blue-100 text-blue-800",
  outros: "bg-gray-100 text-gray-800",
};

const statusColors: Record<string, string> = {
  critico: "bg-red-100 text-red-800",
  atencao: "bg-yellow-100 text-yellow-800",
  normal: "bg-green-100 text-green-800",
  excelente: "bg-emerald-100 text-emerald-800",
};

const tendenciaIcons: Record<string, any> = {
  alta: TrendingUp,
  baixa: TrendingDown,
  estavel: Monitor,
};

const chartConfig = {
  valor: { label: "Valor", color: "hsl(var(--chart-1))" },
};

export function MonitoramentoIndicadores() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: "", categoria: "morbidade", valor: "", unidade_medida: "", periodo: "",
    meta: "", tendencia: "estavel", status: "normal", observacoes: "",
  });

  const { data: indicadores = [], isLoading } = useQuery({
    queryKey: ["indicadores_saude"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("indicadores_saude")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (d: any) => {
      const { error } = await supabase.from("indicadores_saude").insert(d);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["indicadores_saude"] }); toast.success("Indicador criado"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao criar indicador"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...d }: any) => {
      const { error } = await supabase.from("indicadores_saude").update(d).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["indicadores_saude"] }); toast.success("Indicador atualizado"); setDialogOpen(false); },
    onError: () => toast.error("Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("indicadores_saude").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["indicadores_saude"] }); toast.success("Indicador removido"); },
    onError: () => toast.error("Erro ao remover"),
  });

  const filtered = indicadores.filter((i: any) => {
    const matchSearch = !searchTerm || i.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || i.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoriaFilter === "todos" || i.categoria === categoriaFilter;
    const matchStatus = statusFilter === "todos" || i.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const openAdd = () => {
    setEditing(null);
    setFormData({ nome: "", categoria: "morbidade", valor: "", unidade_medida: "", periodo: "", meta: "", tendencia: "estavel", status: "normal", observacoes: "" });
    setDialogOpen(true);
  };

  const openEdit = (ind: any) => {
    setEditing(ind);
    setFormData({
      nome: ind.nome, categoria: ind.categoria, valor: String(ind.valor), unidade_medida: ind.unidade_medida,
      periodo: ind.periodo, meta: ind.meta ? String(ind.meta) : "", tendencia: ind.tendencia || "estavel",
      status: ind.status || "normal", observacoes: ind.observacoes || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: formData.nome, categoria: formData.categoria, valor: parseFloat(formData.valor),
      unidade_medida: formData.unidade_medida, periodo: formData.periodo,
      meta: formData.meta ? parseFloat(formData.meta) : null, tendencia: formData.tendencia,
      status: formData.status, observacoes: formData.observacoes || null,
    };
    if (editing) updateMutation.mutate({ id: editing.id, ...payload });
    else createMutation.mutate(payload);
  };

  const totalIndicadores = indicadores.length;
  const criticos = indicadores.filter((i: any) => i.status === "critico").length;
  const metasAtingidas = indicadores.filter((i: any) => i.meta && i.valor >= i.meta).length;
  const tendenciaAlta = indicadores.filter((i: any) => i.tendencia === "alta").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input placeholder="Buscar indicadores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as Categorias</SelectItem>
              <SelectItem value="morbidade">Morbidade</SelectItem>
              <SelectItem value="mortalidade">Mortalidade</SelectItem>
              <SelectItem value="vacinacao">Vacinação</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="critico">Crítico</SelectItem>
              <SelectItem value="atencao">Atenção</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="excelente">Excelente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAdd}><Plus size={20} className="mr-2" />Novo Indicador</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total de Indicadores</p><p className="text-2xl font-bold">{totalIndicadores}</p></div><Monitor className="text-primary" size={24} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Status Crítico</p><p className="text-2xl font-bold text-destructive">{criticos}</p></div><AlertTriangle className="text-destructive" size={24} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Metas Atingidas</p><p className="text-2xl font-bold text-green-600">{metasAtingidas}</p></div><TrendingUp className="text-green-500" size={24} /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tendência de Alta</p><p className="text-2xl font-bold text-primary">{tendenciaAlta}</p></div><TrendingUp className="text-primary" size={24} /></div></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando indicadores...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((indicador: any) => {
            const TendenciaIcon = tendenciaIcons[indicador.tendencia] || Monitor;
            return (
              <Card key={indicador.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{indicador.nome}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={categoriaColors[indicador.categoria] || categoriaColors.outros}>{indicador.categoria}</Badge>
                        <Badge className={statusColors[indicador.status] || statusColors.normal}>{indicador.status}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <TendenciaIcon size={20} className={indicador.tendencia === "alta" ? "text-destructive" : indicador.tendencia === "baixa" ? "text-green-500" : "text-muted-foreground"} />
                      <Button variant="ghost" size="icon" onClick={() => openEdit(indicador)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(indicador.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-muted-foreground">Valor Atual</p><p className="text-xl font-bold">{indicador.valor} {indicador.unidade_medida}</p></div>
                    <div><p className="text-sm text-muted-foreground">Meta</p><p className="text-xl font-bold text-primary">{indicador.meta ?? "—"} {indicador.meta ? indicador.unidade_medida : ""}</p></div>
                  </div>
                  {indicador.observacoes && <p className="text-sm text-muted-foreground">{indicador.observacoes}</p>}
                  <div className="pt-2 border-t"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar size={16} /><span>Período: {indicador.periodo}</span></div></div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filtered.length === 0 && <div className="text-center py-8"><p className="text-muted-foreground">Nenhum indicador encontrado</p></div>}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Indicador" : "Novo Indicador"}</DialogTitle>
            <DialogDescription>{editing ? "Atualize os dados do indicador." : "Cadastre um novo indicador de saúde."}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Nome</Label><Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Categoria</Label>
                <Select value={formData.categoria} onValueChange={(v) => setFormData({ ...formData, categoria: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="morbidade">Morbidade</SelectItem><SelectItem value="mortalidade">Mortalidade</SelectItem><SelectItem value="vacinacao">Vacinação</SelectItem><SelectItem value="outros">Outros</SelectItem></SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="critico">Crítico</SelectItem><SelectItem value="atencao">Atenção</SelectItem><SelectItem value="normal">Normal</SelectItem><SelectItem value="excelente">Excelente</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Valor</Label><Input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Meta</Label><Input type="number" step="0.01" value={formData.meta} onChange={(e) => setFormData({ ...formData, meta: e.target.value })} /></div>
              <div className="space-y-2"><Label>Unidade</Label><Input value={formData.unidade_medida} onChange={(e) => setFormData({ ...formData, unidade_medida: e.target.value })} placeholder="%" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Período</Label><Input value={formData.periodo} onChange={(e) => setFormData({ ...formData, periodo: e.target.value })} placeholder="2024" required /></div>
              <div className="space-y-2"><Label>Tendência</Label>
                <Select value={formData.tendencia} onValueChange={(v) => setFormData({ ...formData, tendencia: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="alta">Alta</SelectItem><SelectItem value="baixa">Baixa</SelectItem><SelectItem value="estavel">Estável</SelectItem></SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? "Atualizar" : "Salvar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remover Indicador</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja remover este indicador?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}>Remover</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
