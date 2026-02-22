import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useProgramasFederaisSaude } from "@/hooks/useProgramasFederaisSaude";
import { Plus, Edit, BarChart3 } from "lucide-react";

const TIPOS_PROGRAMA = ["ESF", "NASF", "Vigilância", "Imunização", "Saúde Mental", "Saúde Bucal", "SAMU", "Outro"];

export function ProgramasFederaisModule() {
  const { programas, indicadores, isLoading, createPrograma, updatePrograma, createIndicador, updateIndicador } = useProgramasFederaisSaude();
  const [progDialog, setProgDialog] = useState(false);
  const [indDialog, setIndDialog] = useState(false);
  const [editProg, setEditProg] = useState<any>(null);
  const [progForm, setProgForm] = useState({ nome: "", tipo: "ESF", descricao: "", meta_anual: 0 });
  const [indForm, setIndForm] = useState({ programa_id: "", nome: "", meta: 0, valor_atual: 0, unidade_medida: "", competencia: "" });

  const handleProgSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editProg) {
      await updatePrograma.mutateAsync({ id: editProg.id, ...progForm });
    } else {
      await createPrograma.mutateAsync(progForm);
    }
    setProgDialog(false);
    setEditProg(null);
    setProgForm({ nome: "", tipo: "ESF", descricao: "", meta_anual: 0 });
  };

  const handleIndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createIndicador.mutateAsync(indForm);
    setIndDialog(false);
    setIndForm({ programa_id: "", nome: "", meta: 0, valor_atual: 0, unidade_medida: "", competencia: "" });
  };

  return (
    <Tabs defaultValue="programas">
      <TabsList>
        <TabsTrigger value="programas">Programas</TabsTrigger>
        <TabsTrigger value="indicadores">Indicadores de Produção</TabsTrigger>
      </TabsList>

      <TabsContent value="programas" className="space-y-4 mt-4">
        <div className="flex justify-end">
          <Button onClick={() => { setEditProg(null); setProgForm({ nome: "", tipo: "ESF", descricao: "", meta_anual: 0 }); setProgDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />Novo Programa
          </Button>
        </div>
        {isLoading ? <div className="text-center py-8">Carregando...</div> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programas.map((p: any) => (
              <div key={p.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{p.nome}</h3>
                    <Badge variant="outline" className="mt-1">{p.tipo}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={p.ativo ? "default" : "secondary"}>{p.ativo ? "Ativo" : "Inativo"}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditProg(p);
                      setProgForm({ nome: p.nome, tipo: p.tipo, descricao: p.descricao || "", meta_anual: p.meta_anual || 0 });
                      setProgDialog(true);
                    }}><Edit className="h-4 w-4" /></Button>
                  </div>
                </div>
                {p.descricao && <p className="text-sm text-muted-foreground">{p.descricao}</p>}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Execução</span>
                    <span>{p.percentual_execucao || 0}%</span>
                  </div>
                  <Progress value={p.percentual_execucao || 0} />
                </div>
                {p.meta_anual > 0 && <p className="text-xs text-muted-foreground">Meta anual: {p.meta_anual?.toLocaleString("pt-BR")}</p>}
              </div>
            ))}
            {programas.length === 0 && <p className="text-muted-foreground col-span-full text-center py-8">Nenhum programa cadastrado</p>}
          </div>
        )}
      </TabsContent>

      <TabsContent value="indicadores" className="space-y-4 mt-4">
        <div className="flex justify-end">
          <Button onClick={() => setIndDialog(true)}><Plus className="h-4 w-4 mr-2" />Novo Indicador</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programa</TableHead>
              <TableHead>Indicador</TableHead>
              <TableHead>Competência</TableHead>
              <TableHead>Meta</TableHead>
              <TableHead>Realizado</TableHead>
              <TableHead>% Atingido</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indicadores.map((ind: any) => {
              const pct = ind.meta ? Math.round((ind.valor_atual / ind.meta) * 100) : 0;
              return (
                <TableRow key={ind.id}>
                  <TableCell>{ind.programa_nome}</TableCell>
                  <TableCell className="font-medium">{ind.nome}</TableCell>
                  <TableCell>{ind.competencia || "—"}</TableCell>
                  <TableCell>{ind.meta?.toLocaleString("pt-BR") || "—"} {ind.unidade_medida}</TableCell>
                  <TableCell>{ind.valor_atual?.toLocaleString("pt-BR") || 0} {ind.unidade_medida}</TableCell>
                  <TableCell>
                    <Badge variant={pct >= 100 ? "default" : pct >= 70 ? "secondary" : "destructive"}>{pct}%</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {indicadores.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum indicador registrado</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TabsContent>

      {/* Dialog programa */}
      <Dialog open={progDialog} onOpenChange={setProgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProg ? "Editar Programa" : "Novo Programa"}</DialogTitle>
            <DialogDescription>Cadastre ou edite um programa federal de saúde.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProgSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Nome *</Label><Input value={progForm.nome} onChange={e => setProgForm({ ...progForm, nome: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={progForm.tipo} onValueChange={v => setProgForm({ ...progForm, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TIPOS_PROGRAMA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Meta Anual</Label><Input type="number" value={progForm.meta_anual} onChange={e => setProgForm({ ...progForm, meta_anual: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea value={progForm.descricao} onChange={e => setProgForm({ ...progForm, descricao: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setProgDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createPrograma.isPending || updatePrograma.isPending || !progForm.nome}>Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog indicador */}
      <Dialog open={indDialog} onOpenChange={setIndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Indicador</DialogTitle>
            <DialogDescription>Registre um indicador de produção para um programa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIndSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Programa *</Label>
              <Select value={indForm.programa_id} onValueChange={v => setIndForm({ ...indForm, programa_id: v })} required>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{programas.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Nome do Indicador *</Label><Input value={indForm.nome} onChange={e => setIndForm({ ...indForm, nome: e.target.value })} required /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Meta</Label><Input type="number" value={indForm.meta} onChange={e => setIndForm({ ...indForm, meta: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Realizado</Label><Input type="number" value={indForm.valor_atual} onChange={e => setIndForm({ ...indForm, valor_atual: Number(e.target.value) })} /></div>
              <div className="space-y-2"><Label>Unidade</Label><Input value={indForm.unidade_medida} onChange={e => setIndForm({ ...indForm, unidade_medida: e.target.value })} placeholder="Ex: consultas" /></div>
            </div>
            <div className="space-y-2"><Label>Competência</Label><Input value={indForm.competencia} onChange={e => setIndForm({ ...indForm, competencia: e.target.value })} placeholder="Ex: 2026-02" /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIndDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createIndicador.isPending || !indForm.programa_id || !indForm.nome}>Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
