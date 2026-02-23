import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEstoqueFarmaceutico } from "@/hooks/useEstoqueFarmaceutico";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, AlertTriangle, Package, ArrowUpDown, Pill } from "lucide-react";
import { format } from "date-fns";

export function EstoqueFarmaceutico() {
  const {
    medicamentos, lotes, movimentacoes, dispensacoes,
    loadingMedicamentos, alertasVencimento, alertasEstoqueBaixo,
    createMedicamento, createLote, createMovimentacao,
  } = useEstoqueFarmaceutico();

  const [medDialog, setMedDialog] = useState(false);
  const [loteDialog, setLoteDialog] = useState(false);
  const [movDialog, setMovDialog] = useState(false);

  const [medForm, setMedForm] = useState({ nome: "", principio_ativo: "", dosagem: "", apresentacao: "", codigo_interno: "", estoque_minimo: 10, unidade_medida: "comprimido" });
  const [loteForm, setLoteForm] = useState({ medicamento_id: "", numero_lote: "", data_validade: "", quantidade_inicial: 0, unidade_id: "", fornecedor: "" });
  const [movForm, setMovForm] = useState({ medicamento_id: "", lote_id: "", unidade_id: "", tipo: "entrada", quantidade: 0, motivo: "" });

  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_saude_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("unidades_saude").select("id, nome, tipo").neq("status", "inativo").order("nome");
      if (error) throw error;
      return data || [];
    },
  });

  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMedicamento.mutateAsync(medForm);
    setMedDialog(false);
    setMedForm({ nome: "", principio_ativo: "", dosagem: "", apresentacao: "", codigo_interno: "", estoque_minimo: 10, unidade_medida: "comprimido" });
  };

  const handleLoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLote.mutateAsync({ ...loteForm, quantidade_atual: loteForm.quantidade_inicial });
    setLoteDialog(false);
    setLoteForm({ medicamento_id: "", numero_lote: "", data_validade: "", quantidade_inicial: 0, unidade_id: "", fornecedor: "" });
  };

  const handleMovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMovimentacao.mutateAsync(movForm);
    setMovDialog(false);
    setMovForm({ medicamento_id: "", lote_id: "", unidade_id: "", tipo: "entrada", quantidade: 0, motivo: "" });
  };

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {(alertasVencimento.length > 0 || alertasEstoqueBaixo.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertasVencimento.length > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-700 dark:text-yellow-400">Próximos do Vencimento ({alertasVencimento.length})</span>
                </div>
                <ul className="text-sm space-y-1">
                  {alertasVencimento.slice(0, 5).map((l: any) => (
                    <li key={l.id}>{l.medicamentos?.nome} - Lote {l.numero_lote} - Validade: {format(new Date(l.data_validade), "dd/MM/yyyy")}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {alertasEstoqueBaixo.length > 0 && (
            <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/10">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-semibold text-red-700 dark:text-red-400">Estoque Baixo ({alertasEstoqueBaixo.length})</span>
                </div>
                <ul className="text-sm space-y-1">
                  {alertasEstoqueBaixo.slice(0, 5).map((m: any) => (
                    <li key={m.id}>{m.nome} - Mínimo: {m.estoque_minimo}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="medicamentos">
        <TabsList>
          <TabsTrigger value="medicamentos" className="flex items-center gap-1"><Pill className="h-3 w-3" />Medicamentos</TabsTrigger>
          <TabsTrigger value="lotes" className="flex items-center gap-1"><Package className="h-3 w-3" />Lotes</TabsTrigger>
          <TabsTrigger value="movimentacoes" className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" />Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="medicamentos" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setMedDialog(true)}><Plus className="h-4 w-4 mr-2" />Novo Medicamento</Button>
          </div>
          {loadingMedicamentos ? <p className="text-center py-8">Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Princípio Ativo</TableHead>
                  <TableHead>Dosagem</TableHead>
                  <TableHead>Apresentação</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Estoque Mín.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicamentos.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.nome}</TableCell>
                    <TableCell>{m.principio_ativo || "—"}</TableCell>
                    <TableCell>{m.dosagem || "—"}</TableCell>
                    <TableCell>{m.apresentacao || "—"}</TableCell>
                    <TableCell>{m.codigo_interno || "—"}</TableCell>
                    <TableCell>{m.estoque_minimo}</TableCell>
                    <TableCell><Badge variant={m.ativo ? "default" : "secondary"}>{m.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                  </TableRow>
                ))}
                {medicamentos.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum medicamento cadastrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="lotes" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setLoteDialog(true)}><Plus className="h-4 w-4 mr-2" />Novo Lote</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicamento</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Qtd. Atual</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Fornecedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotes.map((l: any) => {
                const vencido = new Date(l.data_validade) < new Date();
                return (
                  <TableRow key={l.id} className={vencido ? "bg-red-50 dark:bg-red-900/10" : ""}>
                    <TableCell className="font-medium">{l.medicamentos?.nome}</TableCell>
                    <TableCell>{l.numero_lote}</TableCell>
                    <TableCell>
                      <span className={vencido ? "text-destructive font-semibold" : ""}>
                        {format(new Date(l.data_validade), "dd/MM/yyyy")}
                      </span>
                    </TableCell>
                    <TableCell>{l.quantidade_atual}</TableCell>
                    <TableCell>{l.unidades_saude?.nome || "—"}</TableCell>
                    <TableCell>{l.fornecedor || "—"}</TableCell>
                  </TableRow>
                );
              })}
              {lotes.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum lote cadastrado</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="movimentacoes" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setMovDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Movimentação</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Medicamento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentacoes.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>{format(new Date(m.created_at), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>{m.medicamentos?.nome}</TableCell>
                  <TableCell>
                    <Badge variant={m.tipo === "entrada" ? "default" : m.tipo === "saida" ? "destructive" : "secondary"}>
                      {m.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>{m.quantidade}</TableCell>
                  <TableCell>{m.unidades_saude?.nome || "—"}</TableCell>
                  <TableCell>{m.motivo || "—"}</TableCell>
                </TableRow>
              ))}
              {movimentacoes.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma movimentação</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      {/* Dialog Medicamento */}
      <Dialog open={medDialog} onOpenChange={setMedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Medicamento</DialogTitle>
            <DialogDescription>Cadastre um novo medicamento no sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMedSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome <span className="text-destructive">*</span></Label>
              <Input value={medForm.nome} onChange={(e) => setMedForm({ ...medForm, nome: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Princípio Ativo</Label>
                <Input value={medForm.principio_ativo} onChange={(e) => setMedForm({ ...medForm, principio_ativo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Dosagem</Label>
                <Input value={medForm.dosagem} onChange={(e) => setMedForm({ ...medForm, dosagem: e.target.value })} placeholder="Ex: 500mg" />
              </div>
              <div className="space-y-2">
                <Label>Apresentação</Label>
                <Input value={medForm.apresentacao} onChange={(e) => setMedForm({ ...medForm, apresentacao: e.target.value })} placeholder="Ex: Caixa com 30 comp." />
              </div>
              <div className="space-y-2">
                <Label>Código Interno</Label>
                <Input value={medForm.codigo_interno} onChange={(e) => setMedForm({ ...medForm, codigo_interno: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estoque Mínimo</Label>
                <Input type="number" value={medForm.estoque_minimo} onChange={(e) => setMedForm({ ...medForm, estoque_minimo: parseInt(e.target.value) || 10 })} />
              </div>
              <div className="space-y-2">
                <Label>Unidade de Medida</Label>
                <Input value={medForm.unidade_medida} onChange={(e) => setMedForm({ ...medForm, unidade_medida: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMedDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMedicamento.isPending || !medForm.nome}>Cadastrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Lote */}
      <Dialog open={loteDialog} onOpenChange={setLoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lote</DialogTitle>
            <DialogDescription>Registre um novo lote de medicamento.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoteSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Medicamento <span className="text-destructive">*</span></Label>
              <Select value={loteForm.medicamento_id} onValueChange={(v) => setLoteForm({ ...loteForm, medicamento_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {medicamentos.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº Lote <span className="text-destructive">*</span></Label>
                <Input value={loteForm.numero_lote} onChange={(e) => setLoteForm({ ...loteForm, numero_lote: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Validade <span className="text-destructive">*</span></Label>
                <Input type="date" value={loteForm.data_validade} onChange={(e) => setLoteForm({ ...loteForm, data_validade: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Quantidade <span className="text-destructive">*</span></Label>
                <Input type="number" value={loteForm.quantidade_inicial} onChange={(e) => setLoteForm({ ...loteForm, quantidade_inicial: parseInt(e.target.value) || 0 })} required />
              </div>
              <div className="space-y-2">
                <Label>Unidade <span className="text-destructive">*</span></Label>
                <Select value={loteForm.unidade_id} onValueChange={(v) => setLoteForm({ ...loteForm, unidade_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fornecedor</Label>
              <Input value={loteForm.fornecedor} onChange={(e) => setLoteForm({ ...loteForm, fornecedor: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setLoteDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createLote.isPending || !loteForm.medicamento_id || !loteForm.numero_lote || !loteForm.unidade_id}>Cadastrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Movimentação */}
      <Dialog open={movDialog} onOpenChange={setMovDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>Registre entrada, saída ou ajuste de estoque.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo <span className="text-destructive">*</span></Label>
                <Select value={movForm.tipo} onValueChange={(v) => setMovForm({ ...movForm, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade <span className="text-destructive">*</span></Label>
                <Input type="number" value={movForm.quantidade} onChange={(e) => setMovForm({ ...movForm, quantidade: parseInt(e.target.value) || 0 })} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Medicamento <span className="text-destructive">*</span></Label>
              <Select value={movForm.medicamento_id} onValueChange={(v) => setMovForm({ ...movForm, medicamento_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {medicamentos.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade <span className="text-destructive">*</span></Label>
              <Select value={movForm.unidade_id} onValueChange={(v) => setMovForm({ ...movForm, unidade_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Input value={movForm.motivo} onChange={(e) => setMovForm({ ...movForm, motivo: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMovDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createMovimentacao.isPending || !movForm.medicamento_id || !movForm.unidade_id}>Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
