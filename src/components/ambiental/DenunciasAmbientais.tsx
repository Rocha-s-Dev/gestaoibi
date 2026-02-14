import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Plus, Edit } from "lucide-react";
import { useDenunciasAmbientais } from "@/hooks/useAmbiental";

const tiposDenuncia = [
  { value: "desmatamento", label: "Desmatamento" },
  { value: "poluicao", label: "Poluição" },
  { value: "queimada", label: "Queimada" },
  { value: "descarte_irregular", label: "Descarte Irregular" },
  { value: "invasao_area_protegida", label: "Invasão de Área Protegida" },
  { value: "maus_tratos_animal", label: "Maus-tratos Animal" },
  { value: "outro", label: "Outro" },
];

const statusOptions = [
  { value: "recebida", label: "Recebida", color: "bg-blue-500" },
  { value: "em_analise", label: "Em Análise", color: "bg-yellow-500" },
  { value: "em_fiscalizacao", label: "Em Fiscalização", color: "bg-orange-500" },
  { value: "procedente", label: "Procedente", color: "bg-green-500" },
  { value: "improcedente", label: "Improcedente", color: "bg-muted-foreground" },
  { value: "arquivada", label: "Arquivada", color: "bg-muted-foreground" },
  { value: "encaminhada", label: "Encaminhada", color: "bg-purple-500" },
];

const prioridadeOptions = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

export function DenunciasAmbientais() {
  const { denuncias, loading, addDenuncia, updateDenuncia } = useDenunciasAmbientais();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [form, setForm] = useState({
    protocolo: "",
    tipo: "outro",
    descricao: "",
    localizacao: "",
    denunciante_nome: "",
    denunciante_telefone: "",
    denunciante_anonimo: false,
    status: "recebida",
    prioridade: "media",
    data_denuncia: new Date().toISOString().split("T")[0],
    fiscal_responsavel: "",
    parecer: "",
    providencias: "",
  });

  const filtered = denuncias.filter((d) => {
    const matchSearch = d.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.protocolo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.localizacao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFiltro === "todos" || d.status === statusFiltro;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    setCurrentItem(null);
    setForm({
      protocolo: "", tipo: "outro", descricao: "", localizacao: "", denunciante_nome: "",
      denunciante_telefone: "", denunciante_anonimo: false, status: "recebida", prioridade: "media",
      data_denuncia: new Date().toISOString().split("T")[0], fiscal_responsavel: "", parecer: "", providencias: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setForm({
      protocolo: item.protocolo || "",
      tipo: item.tipo || "outro",
      descricao: item.descricao || "",
      localizacao: item.localizacao || "",
      denunciante_nome: item.denunciante_nome || "",
      denunciante_telefone: item.denunciante_telefone || "",
      denunciante_anonimo: item.denunciante_anonimo || false,
      status: item.status || "recebida",
      prioridade: item.prioridade || "media",
      data_denuncia: item.data_denuncia || "",
      fiscal_responsavel: item.fiscal_responsavel || "",
      parecer: item.parecer || "",
      providencias: item.providencias || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem) {
      await updateDenuncia(currentItem.id, form);
    } else {
      await addDenuncia(form);
    }
    setShowDialog(false);
  };

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find((s) => s.value === status);
    return <Badge className={`${opt?.color || "bg-muted"}`}>{opt?.label || status}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors: Record<string, string> = { baixa: "bg-green-500", media: "bg-yellow-500", alta: "bg-orange-500", urgente: "bg-red-500" };
    return <Badge className={colors[prioridade] || "bg-muted"}>{prioridadeOptions.find(p => p.value === prioridade)?.label || prioridade}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Denúncias e Fiscalização</h2>
        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Nova Denúncia</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Pesquisar por protocolo, descrição ou local..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Nenhuma denúncia encontrada</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((den) => (
            <Card key={den.id} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-muted-foreground">{den.protocolo}</span>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(den)}><Edit className="h-4 w-4" /></Button>
              </div>
              <p className="text-sm line-clamp-2">{den.descricao}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline">{tiposDenuncia.find(t => t.value === den.tipo)?.label || den.tipo}</Badge>
                {getStatusBadge(den.status)}
                {getPrioridadeBadge(den.prioridade)}
              </div>
              {den.localizacao && <p className="text-xs text-muted-foreground mt-2">📍 {den.localizacao}</p>}
              <p className="text-xs text-muted-foreground mt-1">{new Date(den.data_denuncia).toLocaleDateString("pt-BR")}</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentItem ? "Editar Denúncia" : "Nova Denúncia"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Protocolo</Label>
                <Input value={form.protocolo} onChange={(e) => setForm({ ...form, protocolo: e.target.value })} placeholder="Automático se vazio" />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposDenuncia.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} required />
            </div>
            <div className="space-y-2">
              <Label>Localização</Label>
              <Input value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Denunciante</Label>
                <Input value={form.denunciante_nome} onChange={(e) => setForm({ ...form, denunciante_nome: e.target.value })} disabled={form.denunciante_anonimo} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={form.denunciante_telefone} onChange={(e) => setForm({ ...form, denunciante_telefone: e.target.value })} disabled={form.denunciante_anonimo} />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="anonimo" checked={form.denunciante_anonimo} onCheckedChange={(v) => setForm({ ...form, denunciante_anonimo: !!v })} />
              <Label htmlFor="anonimo">Denúncia anônima</Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{prioridadeOptions.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.data_denuncia} onChange={(e) => setForm({ ...form, data_denuncia: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fiscal Responsável</Label>
              <Input value={form.fiscal_responsavel} onChange={(e) => setForm({ ...form, fiscal_responsavel: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Parecer</Label>
              <Textarea value={form.parecer} onChange={(e) => setForm({ ...form, parecer: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Providências</Label>
              <Textarea value={form.providencias} onChange={(e) => setForm({ ...form, providencias: e.target.value })} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button type="submit">{currentItem ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
