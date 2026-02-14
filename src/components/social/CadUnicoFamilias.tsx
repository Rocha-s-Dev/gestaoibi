import { useEffect, useState } from "react";
import { PlusCircle, Search, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSocial, type FamiliaCadunico } from "@/hooks/useSocial";

const situacoesMoradia = [
  { value: "propria", label: "Própria" },
  { value: "alugada", label: "Alugada" },
  { value: "cedida", label: "Cedida" },
  { value: "ocupacao", label: "Ocupação" },
];

const tiposConstrucao = [
  { value: "alvenaria", label: "Alvenaria" },
  { value: "madeira", label: "Madeira" },
  { value: "mista", label: "Mista" },
  { value: "outro", label: "Outro" },
];

export function CadUnicoFamilias() {
  const { familias, fetchFamilias, saveFamilia, unidades, fetchUnidades, loading } = useSocial();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState<FamiliaCadunico | null>(null);
  const [editing, setEditing] = useState<FamiliaCadunico | null>(null);
  const [form, setForm] = useState({
    responsavel_nome: "", responsavel_cpf: "", nis_responsavel: "", codigo_familiar: "",
    endereco: "", bairro: "", cep: "", telefone: "",
    renda_familiar: "", quantidade_membros: "1",
    situacao_moradia: "propria", tipo_construcao: "alvenaria",
    agua_encanada: false, esgoto_sanitario: false, energia_eletrica: true, coleta_lixo: true,
    observacoes: "", unidade_referencia_id: "",
  });

  useEffect(() => { fetchFamilias(); fetchUnidades(); }, [fetchFamilias, fetchUnidades]);

  const filtered = familias.filter(f =>
    f.responsavel_nome.toLowerCase().includes(search.toLowerCase()) ||
    (f.responsavel_cpf || "").includes(search) ||
    (f.nis_responsavel || "").includes(search) ||
    (f.bairro || "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ responsavel_nome: "", responsavel_cpf: "", nis_responsavel: "", codigo_familiar: "", endereco: "", bairro: "", cep: "", telefone: "", renda_familiar: "", quantidade_membros: "1", situacao_moradia: "propria", tipo_construcao: "alvenaria", agua_encanada: false, esgoto_sanitario: false, energia_eletrica: true, coleta_lixo: true, observacoes: "", unidade_referencia_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (f: FamiliaCadunico) => {
    setEditing(f);
    setForm({
      responsavel_nome: f.responsavel_nome, responsavel_cpf: f.responsavel_cpf || "",
      nis_responsavel: f.nis_responsavel || "", codigo_familiar: f.codigo_familiar || "",
      endereco: f.endereco || "", bairro: f.bairro || "", cep: f.cep || "", telefone: f.telefone || "",
      renda_familiar: f.renda_familiar?.toString() || "", quantidade_membros: f.quantidade_membros?.toString() || "1",
      situacao_moradia: f.situacao_moradia || "propria", tipo_construcao: f.tipo_construcao || "alvenaria",
      agua_encanada: f.agua_encanada, esgoto_sanitario: f.esgoto_sanitario,
      energia_eletrica: f.energia_eletrica, coleta_lixo: f.coleta_lixo,
      observacoes: f.observacoes || "", unidade_referencia_id: f.unidade_referencia_id || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const renda = parseFloat(form.renda_familiar) || 0;
    const membros = parseInt(form.quantidade_membros) || 1;
    await saveFamilia({
      ...(editing ? { id: editing.id } : {}),
      responsavel_nome: form.responsavel_nome,
      responsavel_cpf: form.responsavel_cpf || null,
      nis_responsavel: form.nis_responsavel || null,
      codigo_familiar: form.codigo_familiar || null,
      endereco: form.endereco || null, bairro: form.bairro || null,
      cep: form.cep || null, telefone: form.telefone || null,
      renda_familiar: renda, renda_per_capita: membros > 0 ? renda / membros : 0,
      quantidade_membros: membros,
      situacao_moradia: form.situacao_moradia, tipo_construcao: form.tipo_construcao,
      agua_encanada: form.agua_encanada, esgoto_sanitario: form.esgoto_sanitario,
      energia_eletrica: form.energia_eletrica, coleta_lixo: form.coleta_lixo,
      observacoes: form.observacoes || null,
      unidade_referencia_id: form.unidade_referencia_id || null,
    });
    setDialogOpen(false);
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome, CPF ou NIS..." className="h-9 md:w-[300px]" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} size="sm" className="h-9"><PlusCircle className="h-4 w-4 mr-2" />Nova Família</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Responsável</TableHead>
              <TableHead>NIS</TableHead>
              <TableHead className="hidden md:table-cell">Bairro</TableHead>
              <TableHead className="hidden md:table-cell">Membros</TableHead>
              <TableHead className="hidden lg:table-cell">Renda Per Capita</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />Nenhuma família cadastrada
              </TableCell></TableRow>
            ) : filtered.map(f => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.responsavel_nome}</TableCell>
                <TableCell>{f.nis_responsavel || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{f.bairro || "-"}</TableCell>
                <TableCell className="hidden md:table-cell">{f.quantidade_membros}</TableCell>
                <TableCell className="hidden lg:table-cell">{formatCurrency(f.renda_per_capita)}</TableCell>
                <TableCell><Badge variant={f.status === "ativo" ? "default" : "secondary"}>{f.status}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => setDetailDialog(f)}><Eye className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(f)}><span className="sr-only">Editar</span>✏️</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader><DialogTitle>Detalhes da Família</DialogTitle></DialogHeader>
          {detailDialog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium">Responsável:</span> {detailDialog.responsavel_nome}</div>
                <div><span className="font-medium">CPF:</span> {detailDialog.responsavel_cpf || "-"}</div>
                <div><span className="font-medium">NIS:</span> {detailDialog.nis_responsavel || "-"}</div>
                <div><span className="font-medium">Código Familiar:</span> {detailDialog.codigo_familiar || "-"}</div>
                <div><span className="font-medium">Endereço:</span> {detailDialog.endereco || "-"}</div>
                <div><span className="font-medium">Bairro:</span> {detailDialog.bairro || "-"}</div>
                <div><span className="font-medium">Membros:</span> {detailDialog.quantidade_membros}</div>
                <div><span className="font-medium">Renda Familiar:</span> {formatCurrency(detailDialog.renda_familiar)}</div>
                <div><span className="font-medium">Renda Per Capita:</span> {formatCurrency(detailDialog.renda_per_capita)}</div>
                <div><span className="font-medium">Moradia:</span> {detailDialog.situacao_moradia || "-"}</div>
              </div>
              <div className="flex gap-4 flex-wrap">
                <Badge variant={detailDialog.agua_encanada ? "default" : "destructive"}>Água {detailDialog.agua_encanada ? "✓" : "✗"}</Badge>
                <Badge variant={detailDialog.esgoto_sanitario ? "default" : "destructive"}>Esgoto {detailDialog.esgoto_sanitario ? "✓" : "✗"}</Badge>
                <Badge variant={detailDialog.energia_eletrica ? "default" : "destructive"}>Energia {detailDialog.energia_eletrica ? "✓" : "✗"}</Badge>
                <Badge variant={detailDialog.coleta_lixo ? "default" : "destructive"}>Coleta {detailDialog.coleta_lixo ? "✓" : "✗"}</Badge>
              </div>
              {detailDialog.programas_vinculados && detailDialog.programas_vinculados.length > 0 && (
                <div><span className="font-medium">Programas:</span> {detailDialog.programas_vinculados.join(", ")}</div>
              )}
              {detailDialog.observacoes && <div><span className="font-medium">Observações:</span> {detailDialog.observacoes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Editar Família" : "Nova Família - CadÚnico"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Responsável *</Label>
              <Input value={form.responsavel_nome} onChange={e => setForm({ ...form, responsavel_nome: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input placeholder="000.000.000-00" value={form.responsavel_cpf} onChange={e => setForm({ ...form, responsavel_cpf: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>NIS</Label>
              <Input value={form.nis_responsavel} onChange={e => setForm({ ...form, nis_responsavel: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Código Familiar</Label>
              <Input value={form.codigo_familiar} onChange={e => setForm({ ...form, codigo_familiar: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={e => setForm({ ...form, bairro: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input value={form.cep} onChange={e => setForm({ ...form, cep: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Renda Familiar (R$)</Label>
              <Input type="number" step="0.01" value={form.renda_familiar} onChange={e => setForm({ ...form, renda_familiar: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Qtd. Membros</Label>
              <Input type="number" min="1" value={form.quantidade_membros} onChange={e => setForm({ ...form, quantidade_membros: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Situação da Moradia</Label>
              <Select value={form.situacao_moradia} onValueChange={v => setForm({ ...form, situacao_moradia: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{situacoesMoradia.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo Construção</Label>
              <Select value={form.tipo_construcao} onValueChange={v => setForm({ ...form, tipo_construcao: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{tiposConstrucao.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade de Referência</Label>
              <Select value={form.unidade_referencia_id} onValueChange={v => setForm({ ...form, unidade_referencia_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox checked={form.agua_encanada} onCheckedChange={c => setForm({ ...form, agua_encanada: !!c })} />
                <Label className="font-normal">Água Encanada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={form.esgoto_sanitario} onCheckedChange={c => setForm({ ...form, esgoto_sanitario: !!c })} />
                <Label className="font-normal">Esgoto Sanitário</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={form.energia_eletrica} onCheckedChange={c => setForm({ ...form, energia_eletrica: !!c })} />
                <Label className="font-normal">Energia Elétrica</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox checked={form.coleta_lixo} onCheckedChange={c => setForm({ ...form, coleta_lixo: !!c })} />
                <Label className="font-normal">Coleta de Lixo</Label>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={!form.responsavel_nome}>{editing ? "Salvar" : "Cadastrar Família"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
