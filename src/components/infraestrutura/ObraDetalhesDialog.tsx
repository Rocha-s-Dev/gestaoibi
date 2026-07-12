import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Upload, FileText, CalendarClock, ClipboardCheck, Image as ImageIcon, Ruler, History, FolderOpen } from "lucide-react";
import {
  Obra,
  useObraCronograma, useObraDiario, useObraMedicoes, useObraFiscalizacoes,
  useObraFotos, useObraHistorico, uploadObraFoto, getFotoSignedUrl,
} from "@/hooks/useObras";
import { useDocumentosInfraestrutura } from "@/hooks/useDocumentosInfraestrutura";

interface Props { open: boolean; onOpenChange: (o: boolean) => void; obra: Obra | null; }

const STATUS_ETAPA = [
  { v: "nao_iniciada", l: "Não iniciada", c: "bg-gray-100 text-gray-800" },
  { v: "em_andamento", l: "Em andamento", c: "bg-blue-100 text-blue-800" },
  { v: "concluida", l: "Concluída", c: "bg-green-100 text-green-800" },
  { v: "atrasada", l: "Atrasada", c: "bg-orange-100 text-orange-800" },
  { v: "cancelada", l: "Cancelada", c: "bg-red-100 text-red-800" },
];

const SIT_FISC = [
  { v: "conforme", l: "Conforme", c: "bg-green-100 text-green-800" },
  { v: "com_pendencias", l: "Com Pendências", c: "bg-yellow-100 text-yellow-800" },
  { v: "reprovada", l: "Reprovada", c: "bg-red-100 text-red-800" },
];

const CATEGORIAS_DOC = [
  "Projeto Arquitetônico","Projeto Estrutural","Memorial Descritivo",
  "ART","CREA","Licenças","Contratos","Aditivos","Cronogramas","Laudos","Outros",
];

export function ObraDetalhesDialog({ open, onOpenChange, obra }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> {obra?.nome}
            {obra?.numero_obra && <span className="text-sm text-muted-foreground">#{obra.numero_obra}</span>}
          </DialogTitle>
        </DialogHeader>

        {obra && (
          <Tabs defaultValue="cronograma">
            <TabsList className="grid grid-cols-7">
              <TabsTrigger value="cronograma"><CalendarClock className="h-4 w-4 mr-1" />Cronograma</TabsTrigger>
              <TabsTrigger value="diario"><FileText className="h-4 w-4 mr-1" />Diário</TabsTrigger>
              <TabsTrigger value="medicoes"><Ruler className="h-4 w-4 mr-1" />Medições</TabsTrigger>
              <TabsTrigger value="fiscalizacao"><ClipboardCheck className="h-4 w-4 mr-1" />Fiscalização</TabsTrigger>
              <TabsTrigger value="fotos"><ImageIcon className="h-4 w-4 mr-1" />Fotos</TabsTrigger>
              <TabsTrigger value="documentos"><Upload className="h-4 w-4 mr-1" />Documentos</TabsTrigger>
              <TabsTrigger value="historico"><History className="h-4 w-4 mr-1" />Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="cronograma" className="pt-4"><CronogramaPanel obraId={obra.id} /></TabsContent>
            <TabsContent value="diario" className="pt-4"><DiarioPanel obraId={obra.id} /></TabsContent>
            <TabsContent value="medicoes" className="pt-4"><MedicoesPanel obraId={obra.id} /></TabsContent>
            <TabsContent value="fiscalizacao" className="pt-4"><FiscalizacaoPanel obraId={obra.id} /></TabsContent>
            <TabsContent value="fotos" className="pt-4"><FotosPanel obraId={obra.id} /></TabsContent>
            <TabsContent value="documentos" className="pt-4"><DocumentosPanel obraId={obra.id} /></TabsContent>
            <TabsContent value="historico" className="pt-4"><HistoricoPanel obraId={obra.id} /></TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ------------- CRONOGRAMA ------------- */
function CronogramaPanel({ obraId }: { obraId: string }) {
  const { items, create, update, remove } = useObraCronograma(obraId);
  const [form, setForm] = useState<any>({ status: "nao_iniciada", percentual: 0 });
  const submit = async (e: React.FormEvent) => { e.preventDefault(); await create.mutateAsync(form); setForm({ status: "nao_iniciada", percentual: 0 }); };

  return (
    <div className="space-y-4">
      <Card><CardContent className="pt-4">
        <form onSubmit={submit} className="grid grid-cols-4 gap-3">
          <Input required placeholder="Nome da etapa *" value={form.nome ?? ""} onChange={e => setForm({ ...form, nome: e.target.value })} />
          <Input placeholder="Responsável" value={form.responsavel ?? ""} onChange={e => setForm({ ...form, responsavel: e.target.value })} />
          <Input type="date" value={form.data_inicio ?? ""} onChange={e => setForm({ ...form, data_inicio: e.target.value })} />
          <Input type="date" value={form.data_prevista ?? ""} onChange={e => setForm({ ...form, data_prevista: e.target.value })} />
          <Input type="number" min="0" max="100" placeholder="% executado" value={form.percentual} onChange={e => setForm({ ...form, percentual: Number(e.target.value) })} />
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_ETAPA.map(s => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Observações" value={form.observacoes ?? ""} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
          <Button type="submit"><Plus className="h-4 w-4 mr-1" />Adicionar etapa</Button>
        </form>
      </CardContent></Card>

      <Table>
        <TableHeader><TableRow>
          <TableHead>Etapa</TableHead><TableHead>Responsável</TableHead><TableHead>Início</TableHead>
          <TableHead>Previsto</TableHead><TableHead>%</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {items.map((it: any) => {
            const s = STATUS_ETAPA.find(x => x.v === it.status) ?? STATUS_ETAPA[0];
            return (
              <TableRow key={it.id}>
                <TableCell>{it.nome}</TableCell>
                <TableCell>{it.responsavel}</TableCell>
                <TableCell>{it.data_inicio && new Date(it.data_inicio).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>{it.data_prevista && new Date(it.data_prevista).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  <Input className="w-20" type="number" defaultValue={it.percentual} onBlur={e => update.mutate({ id: it.id, percentual: Number(e.target.value) })} />
                </TableCell>
                <TableCell>
                  <Select value={it.status} onValueChange={v => update.mutate({ id: it.id, status: v })}>
                    <SelectTrigger className="w-40"><SelectValue><Badge className={s.c}>{s.l}</Badge></SelectValue></SelectTrigger>
                    <SelectContent>{STATUS_ETAPA.map(x => <SelectItem key={x.v} value={x.v}>{x.l}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(it.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
              </TableRow>
            );
          })}
          {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhuma etapa cadastrada</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------- DIÁRIO ------------- */
function DiarioPanel({ obraId }: { obraId: string }) {
  const { items, create, remove } = useObraDiario(obraId);
  const [form, setForm] = useState<any>({ data: new Date().toISOString().split("T")[0] });
  const submit = async (e: React.FormEvent) => { e.preventDefault(); await create.mutateAsync(form); setForm({ data: new Date().toISOString().split("T")[0] }); };
  return (
    <div className="space-y-4">
      <Card><CardContent className="pt-4">
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          <div><Label>Data</Label><Input type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
          <div><Label>Clima</Label><Input value={form.clima ?? ""} onChange={e => setForm({ ...form, clima: e.target.value })} placeholder="Ensolarado / Chuvoso..." /></div>
          <div className="col-span-2"><Label>Equipe presente</Label><Textarea rows={2} value={form.equipe_presente ?? ""} onChange={e => setForm({ ...form, equipe_presente: e.target.value })} /></div>
          <div><Label>Máquinas</Label><Textarea rows={2} value={form.maquinas ?? ""} onChange={e => setForm({ ...form, maquinas: e.target.value })} /></div>
          <div><Label>Materiais</Label><Textarea rows={2} value={form.materiais ?? ""} onChange={e => setForm({ ...form, materiais: e.target.value })} /></div>
          <div className="col-span-2"><Label>Serviços executados</Label><Textarea rows={2} value={form.servicos_executados ?? ""} onChange={e => setForm({ ...form, servicos_executados: e.target.value })} /></div>
          <div className="col-span-2"><Label>Observações</Label><Textarea rows={2} value={form.observacoes ?? ""} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
          <div className="col-span-2"><Button type="submit"><Plus className="h-4 w-4 mr-1" />Registrar dia</Button></div>
        </form>
      </CardContent></Card>

      <div className="space-y-3">
        {items.map((d: any) => (
          <Card key={d.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{new Date(d.data).toLocaleDateString("pt-BR")} {d.clima && <span className="text-xs text-muted-foreground">— {d.clima}</span>}</div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(d.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {d.equipe_presente && <div><b>Equipe:</b> {d.equipe_presente}</div>}
                {d.maquinas && <div><b>Máquinas:</b> {d.maquinas}</div>}
                {d.materiais && <div><b>Materiais:</b> {d.materiais}</div>}
                {d.servicos_executados && <div><b>Serviços:</b> {d.servicos_executados}</div>}
                {d.observacoes && <div className="col-span-2 text-muted-foreground">{d.observacoes}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-center text-muted-foreground py-6">Nenhum registro no diário.</p>}
      </div>
    </div>
  );
}

/* ------------- MEDIÇÕES ------------- */
function MedicoesPanel({ obraId }: { obraId: string }) {
  const { items, create, remove } = useObraMedicoes(obraId);
  const { items: etapas } = useObraCronograma(obraId);
  const [form, setForm] = useState<any>({ numero: (items?.length ?? 0) + 1, data: new Date().toISOString().split("T")[0] });
  useEffect(() => { setForm((p: any) => ({ ...p, numero: (items?.length ?? 0) + 1 })); }, [items.length]);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); await create.mutateAsync({ ...form, valor_medido: Number(form.valor_medido || 0), percentual_executado: Number(form.percentual_executado || 0) }); };

  return (
    <div className="space-y-4">
      <Card><CardContent className="pt-4">
        <form onSubmit={submit} className="grid grid-cols-3 gap-3">
          <div><Label>Nº Medição</Label><Input type="number" required value={form.numero} onChange={e => setForm({ ...form, numero: Number(e.target.value) })} /></div>
          <div><Label>Data</Label><Input type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
          <div><Label>Etapa (opcional)</Label>
            <Select value={form.etapa_id ?? undefined} onValueChange={v => setForm({ ...form, etapa_id: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{etapas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>% Executado</Label><Input type="number" step="0.01" value={form.percentual_executado ?? ""} onChange={e => setForm({ ...form, percentual_executado: e.target.value })} /></div>
          <div><Label>Valor Medido (R$)</Label><Input type="number" step="0.01" value={form.valor_medido ?? ""} onChange={e => setForm({ ...form, valor_medido: e.target.value })} /></div>
          <div><Label>Engenheiro</Label><Input value={form.engenheiro_responsavel ?? ""} onChange={e => setForm({ ...form, engenheiro_responsavel: e.target.value })} /></div>
          <div className="col-span-2"><Label>Fiscal</Label><Input value={form.fiscal_responsavel ?? ""} onChange={e => setForm({ ...form, fiscal_responsavel: e.target.value })} /></div>
          <div className="col-span-3"><Label>Observações</Label><Textarea rows={2} value={form.observacoes ?? ""} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>
          <div><Button type="submit"><Plus className="h-4 w-4 mr-1" />Registrar</Button></div>
        </form>
      </CardContent></Card>

      <Table>
        <TableHeader><TableRow>
          <TableHead>Nº</TableHead><TableHead>Data</TableHead><TableHead>%</TableHead>
          <TableHead>Valor</TableHead><TableHead>Engenheiro</TableHead><TableHead>Fiscal</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {items.map((m: any) => (
            <TableRow key={m.id}>
              <TableCell>{m.numero}</TableCell>
              <TableCell>{new Date(m.data).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell>{m.percentual_executado}%</TableCell>
              <TableCell>{Number(m.valor_medido).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
              <TableCell>{m.engenheiro_responsavel}</TableCell>
              <TableCell>{m.fiscal_responsavel}</TableCell>
              <TableCell><Button variant="ghost" size="icon" onClick={() => remove.mutate(m.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Nenhuma medição registrada</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------- FISCALIZAÇÃO ------------- */
function FiscalizacaoPanel({ obraId }: { obraId: string }) {
  const { items, create, remove } = useObraFiscalizacoes(obraId);
  const [form, setForm] = useState<any>({ situacao: "conforme", data: new Date().toISOString().split("T")[0] });
  const submit = async (e: React.FormEvent) => { e.preventDefault(); await create.mutateAsync(form); setForm({ situacao: "conforme", data: new Date().toISOString().split("T")[0] }); };
  return (
    <div className="space-y-4">
      <Card><CardContent className="pt-4">
        <form onSubmit={submit} className="grid grid-cols-3 gap-3">
          <div><Label>Data</Label><Input type="date" required value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
          <div><Label>Fiscal</Label><Input value={form.fiscal ?? ""} onChange={e => setForm({ ...form, fiscal: e.target.value })} /></div>
          <div><Label>Situação</Label>
            <Select value={form.situacao} onValueChange={v => setForm({ ...form, situacao: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{SIT_FISC.map(s => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-3"><Label>Pendências</Label><Textarea rows={2} value={form.pendencias ?? ""} onChange={e => setForm({ ...form, pendencias: e.target.value })} /></div>
          <div className="col-span-3"><Label>Parecer técnico</Label><Textarea rows={3} value={form.parecer_tecnico ?? ""} onChange={e => setForm({ ...form, parecer_tecnico: e.target.value })} /></div>
          <div><Button type="submit"><Plus className="h-4 w-4 mr-1" />Registrar fiscalização</Button></div>
        </form>
      </CardContent></Card>

      <div className="space-y-3">
        {items.map((f: any) => {
          const s = SIT_FISC.find(x => x.v === f.situacao) ?? SIT_FISC[0];
          return (
            <Card key={f.id}><CardContent className="pt-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <Badge className={s.c}>{s.l}</Badge>
                  <span className="font-medium">{new Date(f.data).toLocaleDateString("pt-BR")}</span>
                  {f.fiscal && <span className="text-sm text-muted-foreground">por {f.fiscal}</span>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove.mutate(f.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
              {f.pendencias && <div className="text-sm"><b>Pendências:</b> {f.pendencias}</div>}
              {f.parecer_tecnico && <div className="text-sm mt-1"><b>Parecer:</b> {f.parecer_tecnico}</div>}
            </CardContent></Card>
          );
        })}
        {items.length === 0 && <p className="text-center text-muted-foreground py-6">Nenhuma fiscalização registrada.</p>}
      </div>
    </div>
  );
}

/* ------------- FOTOS ------------- */
function FotosPanel({ obraId }: { obraId: string }) {
  const { items, remove } = useObraFotos(obraId);
  const [uploading, setUploading] = useState(false);
  const [categoria, setCategoria] = useState("durante");
  const [legenda, setLegenda] = useState("");
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const out: Record<string, string> = {};
      for (const f of items as any[]) {
        try { out[f.id] = await getFotoSignedUrl(f.arquivo_path); } catch {}
      }
      setUrls(out);
    })();
  }, [items]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { await uploadObraFoto(obraId, file, { categoria, legenda }); setLegenda(""); }
    catch (err: any) { alert(err.message); }
    finally { setUploading(false); e.target.value = ""; }
  };

  const grouped: Record<string, any[]> = { antes: [], durante: [], depois: [] };
  (items as any[]).forEach(i => (grouped[i.categoria] ??= []).push(i));

  return (
    <div className="space-y-4">
      <Card><CardContent className="pt-4">
        <div className="grid grid-cols-4 gap-3 items-end">
          <div><Label>Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="antes">Antes</SelectItem>
                <SelectItem value="durante">Durante</SelectItem>
                <SelectItem value="depois">Depois</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Legenda</Label><Input value={legenda} onChange={e => setLegenda(e.target.value)} /></div>
          <div>
            <Label>Arquivo</Label>
            <Input type="file" accept="image/*" onChange={onUpload} disabled={uploading} />
          </div>
        </div>
      </CardContent></Card>

      {(["antes","durante","depois"] as const).map(cat => (
        <div key={cat}>
          <h4 className="font-medium capitalize mb-2">{cat}</h4>
          <div className="grid grid-cols-4 gap-3">
            {(grouped[cat] ?? []).map(f => (
              <Card key={f.id}><CardContent className="p-2">
                {urls[f.id] ? <img src={urls[f.id]} alt={f.legenda ?? ""} className="w-full h-32 object-cover rounded" /> : <div className="w-full h-32 bg-muted rounded" />}
                {f.legenda && <div className="text-xs mt-1 truncate">{f.legenda}</div>}
                <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => remove.mutate(f.id)}>
                  <Trash2 className="h-3 w-3 mr-1 text-red-500" />Remover
                </Button>
              </CardContent></Card>
            ))}
            {(grouped[cat] ?? []).length === 0 && <p className="text-xs text-muted-foreground col-span-4">Sem fotos.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------- DOCUMENTOS ------------- */
function DocumentosPanel({ obraId }: { obraId: string }) {
  const { documentos, uploadDocumento, downloadDocumento, deleteDocumento } = useDocumentosInfraestrutura("obra", obraId);
  const [tipo, setTipo] = useState<string>("Outros");
  const [titulo, setTitulo] = useState("");

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    await uploadDocumento.mutateAsync({ file, entidade: "obra", entidade_id: obraId, titulo: titulo || file.name, tipo });
    setTitulo(""); e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <Card><CardContent className="pt-4 grid grid-cols-4 gap-3 items-end">
        <div><Label>Categoria</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIAS_DOC.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2"><Label>Título</Label><Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Opcional" /></div>
        <div><Label>Arquivo</Label><Input type="file" onChange={onUpload} /></div>
      </CardContent></Card>

      <Table>
        <TableHeader><TableRow>
          <TableHead>Título</TableHead><TableHead>Categoria</TableHead><TableHead>Data</TableHead><TableHead></TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {documentos.map(d => (
            <TableRow key={d.id}>
              <TableCell>{d.titulo}</TableCell>
              <TableCell>{d.tipo}</TableCell>
              <TableCell>{new Date(d.created_at).toLocaleDateString("pt-BR")}</TableCell>
              <TableCell className="space-x-1">
                <Button variant="ghost" size="sm" onClick={() => downloadDocumento(d.arquivo_path)}>Baixar</Button>
                <Button variant="ghost" size="icon" onClick={() => deleteDocumento.mutate(d)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </TableCell>
            </TableRow>
          ))}
          {documentos.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">Nenhum documento anexado</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}

/* ------------- HISTÓRICO ------------- */
function HistoricoPanel({ obraId }: { obraId: string }) {
  const { data = [], isLoading } = useObraHistorico(obraId);
  if (isLoading) return <p className="text-center py-6 text-muted-foreground">Carregando...</p>;
  if (data.length === 0) return <p className="text-center py-6 text-muted-foreground">Sem eventos.</p>;
  return (
    <div className="relative pl-6 border-l space-y-4">
      {data.map((h: any) => (
        <div key={h.id} className="relative">
          <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-primary" />
          <div className="text-sm font-medium">{h.titulo}</div>
          {h.descricao && <div className="text-xs text-muted-foreground">{h.descricao}</div>}
          <div className="text-xs text-muted-foreground mt-1">{new Date(h.created_at).toLocaleString("pt-BR")}</div>
        </div>
      ))}
    </div>
  );
}
