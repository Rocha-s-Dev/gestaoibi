import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Plus, Edit, Wrench } from "lucide-react";
import { usePontosIluminacao, useSolicitacoesIluminacao } from "@/hooks/useOuvidoriaIluminacao";

const tiposLuminaria = [
  { value: "led", label: "LED" },
  { value: "vapor_sodio", label: "Vapor de Sódio" },
  { value: "vapor_mercurio", label: "Vapor de Mercúrio" },
  { value: "fluorescente", label: "Fluorescente" },
  { value: "outro", label: "Outro" },
];

const estadosPonto = [
  { value: "funcionando", label: "Funcionando", color: "bg-green-500" },
  { value: "com_defeito", label: "Com Defeito", color: "bg-yellow-500" },
  { value: "apagada", label: "Apagada", color: "bg-red-500" },
  { value: "vandalizada", label: "Vandalizada", color: "bg-orange-500" },
  { value: "em_manutencao", label: "Em Manutenção", color: "bg-blue-500" },
];

const tiposProblema = [
  { value: "apagada", label: "Apagada" },
  { value: "piscando", label: "Piscando" },
  { value: "vandalizada", label: "Vandalizada" },
  { value: "acesa_dia", label: "Acesa durante o dia" },
  { value: "poste_inclinado", label: "Poste inclinado" },
  { value: "fiacao_exposta", label: "Fiação exposta" },
  { value: "outro", label: "Outro" },
];

const statusSolicitacao = [
  { value: "aberta", label: "Aberta", color: "bg-blue-500" },
  { value: "em_analise", label: "Em Análise", color: "bg-yellow-500" },
  { value: "em_campo", label: "Em Campo", color: "bg-orange-500" },
  { value: "concluida", label: "Concluída", color: "bg-green-500" },
  { value: "cancelada", label: "Cancelada", color: "bg-muted-foreground" },
];

export function IluminacaoPublica() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="pontos">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pontos">Pontos de Iluminação</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações de Reparo</TabsTrigger>
        </TabsList>
        <TabsContent value="pontos" className="mt-4"><PontosTab /></TabsContent>
        <TabsContent value="solicitacoes" className="mt-4"><SolicitacoesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function PontosTab() {
  const { data: pontos, loading, add, update } = usePontosIluminacao();
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [form, setForm] = useState({
    codigo: "", logradouro: "", numero: "", bairro: "", referencia: "",
    tipo_luminaria: "led", potencia_watts: "", altura_poste: "",
    estado: "funcionando", data_instalacao: "", observacoes: "",
  });

  const filtered = pontos.filter((p) => {
    const matchSearch = p.logradouro?.toLowerCase().includes(search.toLowerCase()) ||
      p.codigo?.toLowerCase().includes(search.toLowerCase()) ||
      p.bairro?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = estadoFiltro === "todos" || p.estado === estadoFiltro;
    return matchSearch && matchEstado;
  });

  const handleAdd = () => {
    setCurrent(null);
    setForm({ codigo: "", logradouro: "", numero: "", bairro: "", referencia: "",
      tipo_luminaria: "led", potencia_watts: "", altura_poste: "",
      estado: "funcionando", data_instalacao: "", observacoes: "" });
    setShowDialog(true);
  };

  const handleEdit = (item: any) => {
    setCurrent(item);
    setForm({
      codigo: item.codigo || "", logradouro: item.logradouro || "", numero: item.numero || "",
      bairro: item.bairro || "", referencia: item.referencia || "",
      tipo_luminaria: item.tipo_luminaria || "led",
      potencia_watts: item.potencia_watts?.toString() || "",
      altura_poste: item.altura_poste?.toString() || "",
      estado: item.estado || "funcionando",
      data_instalacao: item.data_instalacao || "", observacoes: item.observacoes || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      potencia_watts: form.potencia_watts ? parseInt(form.potencia_watts) : null,
      altura_poste: form.altura_poste ? parseFloat(form.altura_poste) : null,
      data_instalacao: form.data_instalacao || null,
    };
    if (current) await update(current.id, payload);
    else await add(payload);
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Pontos de Iluminação</h2>
        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Novo Ponto</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Pesquisar por logradouro, código ou bairro..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
          <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {estadosPonto.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? <div className="text-center py-10 text-muted-foreground">Carregando...</div> : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Nenhum ponto encontrado</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="p-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-mono text-muted-foreground">{p.codigo}</span>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="h-4 w-4" /></Button>
              </div>
              <h3 className="font-semibold">{p.logradouro}{p.numero ? `, ${p.numero}` : ""}</h3>
              {p.bairro && <p className="text-sm text-muted-foreground">{p.bairro}</p>}
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">{tiposLuminaria.find(t => t.value === p.tipo_luminaria)?.label}</Badge>
                <Badge className={estadosPonto.find(e => e.value === p.estado)?.color}>{estadosPonto.find(e => e.value === p.estado)?.label}</Badge>
              </div>
              {p.potencia_watts && <p className="text-xs text-muted-foreground mt-2">{p.potencia_watts}W</p>}
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Editar Ponto" : "Novo Ponto"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Código</Label><Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Tipo</Label>
                <Select value={form.tipo_luminaria} onValueChange={(v) => setForm({ ...form, tipo_luminaria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposLuminaria.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Logradouro</Label><Input value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} required /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Número</Label><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></div>
              <div className="space-y-2"><Label>Bairro</Label><Input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} /></div>
              <div className="space-y-2"><Label>Estado</Label>
                <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{estadosPonto.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Potência (W)</Label><Input type="number" value={form.potencia_watts} onChange={(e) => setForm({ ...form, potencia_watts: e.target.value })} /></div>
              <div className="space-y-2"><Label>Altura Poste (m)</Label><Input type="number" step="0.01" value={form.altura_poste} onChange={(e) => setForm({ ...form, altura_poste: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Data Instalação</Label><Input type="date" value={form.data_instalacao} onChange={(e) => setForm({ ...form, data_instalacao: e.target.value })} /></div>
            <div className="space-y-2"><Label>Observações</Label><Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button type="submit">{current ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SolicitacoesTab() {
  const { data: solicitacoes, loading, add, update } = useSolicitacoesIluminacao();
  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [current, setCurrent] = useState<any>(null);
  const [form, setForm] = useState({
    protocolo: "", tipo_problema: "apagada", descricao: "", solicitante_nome: "",
    solicitante_telefone: "", logradouro: "", referencia: "", status: "aberta",
    prioridade: "normal", equipe_responsavel: "", material_utilizado: "",
    custo_reparo: "", observacoes: "",
  });

  const filtered = solicitacoes.filter((s) => {
    const matchSearch = s.protocolo?.toLowerCase().includes(search.toLowerCase()) ||
      s.logradouro?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFiltro === "todos" || s.status === statusFiltro;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    setCurrent(null);
    setForm({ protocolo: "", tipo_problema: "apagada", descricao: "", solicitante_nome: "",
      solicitante_telefone: "", logradouro: "", referencia: "", status: "aberta",
      prioridade: "normal", equipe_responsavel: "", material_utilizado: "", custo_reparo: "", observacoes: "" });
    setShowDialog(true);
  };

  const handleEdit = (item: any) => {
    setCurrent(item);
    setForm({
      protocolo: item.protocolo || "", tipo_problema: item.tipo_problema || "apagada",
      descricao: item.descricao || "", solicitante_nome: item.solicitante_nome || "",
      solicitante_telefone: item.solicitante_telefone || "", logradouro: item.logradouro || "",
      referencia: item.referencia || "", status: item.status || "aberta",
      prioridade: item.prioridade || "normal", equipe_responsavel: item.equipe_responsavel || "",
      material_utilizado: item.material_utilizado || "",
      custo_reparo: item.custo_reparo?.toString() || "", observacoes: item.observacoes || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, custo_reparo: form.custo_reparo ? parseFloat(form.custo_reparo) : null };
    if (current) await update(current.id, payload);
    else await add(payload);
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Solicitações de Reparo</h2>
        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Nova Solicitação</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Pesquisar..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {statusSolicitacao.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {loading ? <div className="text-center py-10 text-muted-foreground">Carregando...</div> : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Nenhuma solicitação encontrada</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card key={s.id} className="p-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-mono text-muted-foreground">{s.protocolo}</span>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Edit className="h-4 w-4" /></Button>
              </div>
              <p className="text-sm">{s.logradouro}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline">{tiposProblema.find(t => t.value === s.tipo_problema)?.label}</Badge>
                <Badge className={statusSolicitacao.find(st => st.value === s.status)?.color}>{statusSolicitacao.find(st => st.value === s.status)?.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{new Date(s.data_abertura).toLocaleDateString("pt-BR")}</p>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Editar Solicitação" : "Nova Solicitação"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Protocolo</Label><Input value={form.protocolo} onChange={(e) => setForm({ ...form, protocolo: e.target.value })} placeholder="Automático" /></div>
              <div className="space-y-2"><Label>Tipo Problema</Label>
                <Select value={form.tipo_problema} onValueChange={(v) => setForm({ ...form, tipo_problema: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposProblema.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Logradouro</Label><Input value={form.logradouro} onChange={(e) => setForm({ ...form, logradouro: e.target.value })} /></div>
            <div className="space-y-2"><Label>Referência</Label><Input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Solicitante</Label><Input value={form.solicitante_nome} onChange={(e) => setForm({ ...form, solicitante_nome: e.target.value })} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={form.solicitante_telefone} onChange={(e) => setForm({ ...form, solicitante_telefone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusSolicitacao.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Prioridade</Label>
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
            <div className="space-y-2"><Label>Equipe Responsável</Label><Input value={form.equipe_responsavel} onChange={(e) => setForm({ ...form, equipe_responsavel: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Material Utilizado</Label><Input value={form.material_utilizado} onChange={(e) => setForm({ ...form, material_utilizado: e.target.value })} /></div>
              <div className="space-y-2"><Label>Custo (R$)</Label><Input type="number" step="0.01" value={form.custo_reparo} onChange={(e) => setForm({ ...form, custo_reparo: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button type="submit">{current ? "Salvar" : "Registrar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
