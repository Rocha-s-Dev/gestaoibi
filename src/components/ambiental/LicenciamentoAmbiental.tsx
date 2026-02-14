import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, Edit, Eye, Plus } from "lucide-react";
import { useLicenciamentosAmbientais } from "@/hooks/useAmbiental";

const tiposLicenca = [
  { value: "previa", label: "Licença Prévia (LP)" },
  { value: "instalacao", label: "Licença de Instalação (LI)" },
  { value: "operacao", label: "Licença de Operação (LO)" },
  { value: "simplificada", label: "Licença Simplificada" },
  { value: "renovacao", label: "Renovação" },
];

const statusOptions = [
  { value: "analise", label: "Em Análise", color: "bg-yellow-500" },
  { value: "aprovado", label: "Aprovado", color: "bg-green-500" },
  { value: "reprovado", label: "Reprovado", color: "bg-red-500" },
  { value: "condicionado", label: "Condicionado", color: "bg-orange-500" },
  { value: "vencido", label: "Vencido", color: "bg-muted-foreground" },
  { value: "pendente_vistoria", label: "Pendente Vistoria", color: "bg-blue-500" },
];

export function LicenciamentoAmbiental() {
  const { licenciamentos, loading, addLicenciamento, updateLicenciamento } = useLicenciamentosAmbientais();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [showDialog, setShowDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [form, setForm] = useState({
    numero_processo: "",
    tipo_licenca: "previa",
    requerente_nome: "",
    requerente_cpf_cnpj: "",
    requerente_telefone: "",
    requerente_email: "",
    atividade: "",
    localizacao: "",
    area_total: "",
    descricao_empreendimento: "",
    status: "analise",
    data_entrada: new Date().toISOString().split("T")[0],
    data_validade: "",
    condicionantes: "",
    parecer_tecnico: "",
    tecnico_responsavel: "",
    observacoes: "",
  });

  const filtered = licenciamentos.filter((l) => {
    const matchSearch = l.requerente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.atividade?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFiltro === "todos" || l.status === statusFiltro;
    return matchSearch && matchStatus;
  });

  const handleAdd = () => {
    setCurrentItem(null);
    setForm({
      numero_processo: "", tipo_licenca: "previa", requerente_nome: "", requerente_cpf_cnpj: "",
      requerente_telefone: "", requerente_email: "", atividade: "", localizacao: "", area_total: "",
      descricao_empreendimento: "", status: "analise", data_entrada: new Date().toISOString().split("T")[0],
      data_validade: "", condicionantes: "", parecer_tecnico: "", tecnico_responsavel: "", observacoes: "",
    });
    setShowDialog(true);
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setForm({
      numero_processo: item.numero_processo || "",
      tipo_licenca: item.tipo_licenca || "previa",
      requerente_nome: item.requerente_nome || "",
      requerente_cpf_cnpj: item.requerente_cpf_cnpj || "",
      requerente_telefone: item.requerente_telefone || "",
      requerente_email: item.requerente_email || "",
      atividade: item.atividade || "",
      localizacao: item.localizacao || "",
      area_total: item.area_total?.toString() || "",
      descricao_empreendimento: item.descricao_empreendimento || "",
      status: item.status || "analise",
      data_entrada: item.data_entrada || "",
      data_validade: item.data_validade || "",
      condicionantes: item.condicionantes || "",
      parecer_tecnico: item.parecer_tecnico || "",
      tecnico_responsavel: item.tecnico_responsavel || "",
      observacoes: item.observacoes || "",
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      area_total: form.area_total ? parseFloat(form.area_total) : null,
      data_validade: form.data_validade || null,
    };
    if (currentItem) {
      await updateLicenciamento(currentItem.id, payload);
    } else {
      await addLicenciamento(payload);
    }
    setShowDialog(false);
  };

  const getStatusBadge = (status: string) => {
    const opt = statusOptions.find((s) => s.value === status);
    return <Badge className={`${opt?.color || "bg-muted"} hover:${opt?.color || "bg-muted"}`}>{opt?.label || status}</Badge>;
  };

  const getTipoLabel = (tipo: string) => tiposLicenca.find((t) => t.value === tipo)?.label || tipo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <h2 className="text-xl font-semibold">Licenciamento Ambiental</h2>
        <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Novo Licenciamento</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Pesquisar por requerente, processo ou atividade..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger><SelectValue placeholder="Filtrar por status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <FileCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Nenhum licenciamento encontrado</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lic) => (
            <Card key={lic.id} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-muted-foreground">{lic.numero_processo}</span>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(lic)}><Edit className="h-4 w-4" /></Button>
              </div>
              <h3 className="font-semibold">{lic.requerente_nome}</h3>
              <p className="text-sm text-muted-foreground mt-1">{lic.atividade}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="outline">{getTipoLabel(lic.tipo_licenca)}</Badge>
                {getStatusBadge(lic.status)}
              </div>
              {lic.data_validade && (
                <p className="text-xs text-muted-foreground mt-2">Validade: {new Date(lic.data_validade).toLocaleDateString("pt-BR")}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentItem ? "Editar Licenciamento" : "Novo Licenciamento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº Processo</Label>
                <Input value={form.numero_processo} onChange={(e) => setForm({ ...form, numero_processo: e.target.value })} placeholder="Automático se vazio" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Licença</Label>
                <Select value={form.tipo_licenca} onValueChange={(v) => setForm({ ...form, tipo_licenca: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposLicenca.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Requerente</Label>
                <Input value={form.requerente_nome} onChange={(e) => setForm({ ...form, requerente_nome: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>CPF/CNPJ</Label>
                <Input value={form.requerente_cpf_cnpj} onChange={(e) => setForm({ ...form, requerente_cpf_cnpj: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Atividade</Label>
              <Input value={form.atividade} onChange={(e) => setForm({ ...form, atividade: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localização</Label>
                <Input value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Área Total (m²)</Label>
                <Input type="number" value={form.area_total} onChange={(e) => setForm({ ...form, area_total: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição do Empreendimento</Label>
              <Textarea value={form.descricao_empreendimento} onChange={(e) => setForm({ ...form, descricao_empreendimento: e.target.value })} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Entrada</Label>
                <Input type="date" value={form.data_entrada} onChange={(e) => setForm({ ...form, data_entrada: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data Validade</Label>
                <Input type="date" value={form.data_validade} onChange={(e) => setForm({ ...form, data_validade: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Técnico Responsável</Label>
                <Input value={form.tecnico_responsavel} onChange={(e) => setForm({ ...form, tecnico_responsavel: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Condicionantes</Label>
              <Textarea value={form.condicionantes} onChange={(e) => setForm({ ...form, condicionantes: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Parecer Técnico</Label>
              <Textarea value={form.parecer_tecnico} onChange={(e) => setForm({ ...form, parecer_tecnico: e.target.value })} rows={2} />
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
