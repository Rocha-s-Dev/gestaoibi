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
import { MessageSquare, Plus, Edit } from "lucide-react";
import { useOuvidoria } from "@/hooks/useOuvidoriaIluminacao";

const tiposManifestacao = [
  { value: "reclamacao", label: "Reclamação" },
  { value: "sugestao", label: "Sugestão" },
  { value: "elogio", label: "Elogio" },
  { value: "denuncia", label: "Denúncia" },
  { value: "solicitacao", label: "Solicitação" },
  { value: "informacao", label: "Informação" },
];

const canais = [
  { value: "presencial", label: "Presencial" },
  { value: "telefone", label: "Telefone" },
  { value: "email", label: "E-mail" },
  { value: "site", label: "Site" },
  { value: "app", label: "Aplicativo" },
  { value: "carta", label: "Carta" },
];

const statusOptions = [
  { value: "recebida", label: "Recebida", color: "bg-blue-500" },
  { value: "em_analise", label: "Em Análise", color: "bg-yellow-500" },
  { value: "encaminhada", label: "Encaminhada", color: "bg-orange-500" },
  { value: "respondida", label: "Respondida", color: "bg-green-500" },
  { value: "concluida", label: "Concluída", color: "bg-green-700" },
  { value: "arquivada", label: "Arquivada", color: "bg-muted-foreground" },
  { value: "reaberta", label: "Reaberta", color: "bg-red-500" },
];

export function OuvidoriaMunicipal() {
  const { data: manifestacoes, loading, add, update } = useOuvidoria();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [tipoFiltro, setTipoFiltro] = useState("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [form, setForm] = useState({
    protocolo: "", tipo: "reclamacao", canal: "presencial", assunto: "", descricao: "",
    manifestante_nome: "", manifestante_cpf: "", manifestante_telefone: "", manifestante_email: "",
    manifestante_anonimo: false, status: "recebida", prioridade: "normal", resposta: "", observacoes_internas: "",
  });

  const filtered = manifestacoes.filter((m) => {
    const matchSearch = m.assunto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.protocolo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFiltro === "todos" || m.status === statusFiltro;
    const matchTipo = tipoFiltro === "todos" || m.tipo === tipoFiltro;
    return matchSearch && matchStatus && matchTipo;
  });

  const handleAdd = () => {
    setCurrentItem(null);
    setForm({
      protocolo: "", tipo: "reclamacao", canal: "presencial", assunto: "", descricao: "",
      manifestante_nome: "", manifestante_cpf: "", manifestante_telefone: "", manifestante_email: "",
      manifestante_anonimo: false, status: "recebida", prioridade: "normal", resposta: "", observacoes_internas: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setForm({
      protocolo: item.protocolo || "", tipo: item.tipo || "reclamacao", canal: item.canal || "presencial",
      assunto: item.assunto || "", descricao: item.descricao || "",
      manifestante_nome: item.manifestante_nome || "", manifestante_cpf: item.manifestante_cpf || "",
      manifestante_telefone: item.manifestante_telefone || "", manifestante_email: item.manifestante_email || "",
      manifestante_anonimo: item.manifestante_anonimo || false, status: item.status || "recebida",
      prioridade: item.prioridade || "normal", resposta: item.resposta || "", observacoes_internas: item.observacoes_internas || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentItem) { await update(currentItem.id, form); }
    else { await add(form); }
    setShowDialog(false);
  };

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find((s) => s.value === status);
    return <Badge className={opt?.color || "bg-muted"}>{opt?.label || status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Ouvidoria Municipal</h2>
        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Nova Manifestação</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input placeholder="Pesquisar por protocolo, assunto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposManifestacao.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Nenhuma manifestação encontrada</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <Card key={m.id} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-muted-foreground">{m.protocolo}</span>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}><Edit className="h-4 w-4" /></Button>
              </div>
              <h3 className="font-semibold">{m.assunto}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.descricao}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="outline">{tiposManifestacao.find(t => t.value === m.tipo)?.label}</Badge>
                {getStatusBadge(m.status)}
                <Badge variant="secondary">{canais.find(c => c.value === m.canal)?.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{new Date(m.data_abertura).toLocaleDateString("pt-BR")}</p>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentItem ? "Editar Manifestação" : "Nova Manifestação"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Protocolo</Label>
                <Input value={form.protocolo} onChange={(e) => setForm({ ...form, protocolo: e.target.value })} placeholder="Automático" />
              </div>
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={form.canal} onValueChange={(v) => setForm({ ...form, canal: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{canais.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposManifestacao.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input value={form.assunto} onChange={(e) => setForm({ ...form, assunto: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={3} required />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="anonimo" checked={form.manifestante_anonimo} onCheckedChange={(v) => setForm({ ...form, manifestante_anonimo: !!v })} />
              <Label htmlFor="anonimo">Manifestante anônimo</Label>
            </div>
            {!form.manifestante_anonimo && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.manifestante_nome} onChange={(e) => setForm({ ...form, manifestante_nome: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input value={form.manifestante_cpf} onChange={(e) => setForm({ ...form, manifestante_cpf: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={form.manifestante_telefone} onChange={(e) => setForm({ ...form, manifestante_telefone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={form.manifestante_email} onChange={(e) => setForm({ ...form, manifestante_email: e.target.value })} />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resposta</Label>
              <Textarea value={form.resposta} onChange={(e) => setForm({ ...form, resposta: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Observações Internas</Label>
              <Textarea value={form.observacoes_internas} onChange={(e) => setForm({ ...form, observacoes_internas: e.target.value })} rows={2} />
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
