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
import { useVacinacao } from "@/hooks/useVacinacao";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Syringe, Target } from "lucide-react";
import { format } from "date-fns";

export function VacinacaoModule() {
  const {
    registrosVacinas, campanhas, nomesVacinas,
    loadingRegistros, loadingCampanhas,
    createRegistroVacina, createCampanha,
  } = useVacinacao();

  const [aplicacaoDialog, setAplicacaoDialog] = useState(false);
  const [campanhaDialog, setCampanhaDialog] = useState(false);

  const [aplicForm, setAplicForm] = useState({
    paciente_id: "", nome_vacina: "", lote: "", dose: "",
    profissional_id: "", unidade_id: "",
    data_aplicacao: new Date().toISOString().split("T")[0],
    observacoes: "", local_aplicacao: "", data_proxima_dose: "",
  });
  const [campForm, setCampForm] = useState({ nome: "", publico_alvo: "", data_inicio: "", data_fim: "", meta_cobertura: 0 });

  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades_saude_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("unidades_saude").select("id, nome, tipo").neq("status", "inativo").order("nome");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: pacientes = [] } = useQuery({
    queryKey: ["pacientes_list_vacina"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pacientes").select("id, nome, cpf").order("nome").limit(500);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: profissionais = [] } = useQuery({
    queryKey: ["profissionais_vacina"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profissionais_saude")
        .select("id, cargo, profiles:user_id(name)")
        .eq("status", "ativo")
        .in("cargo", ["enfermeiro", "tecnico_enfermagem"]);
      if (error) throw error;
      return data || [];
    },
  });

  const handleAplicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRegistroVacina.mutateAsync({
      paciente_id: aplicForm.paciente_id,
      nome_vacina: aplicForm.nome_vacina,
      lote: aplicForm.lote || undefined,
      dose: aplicForm.dose || undefined,
      profissional_id: aplicForm.profissional_id || undefined,
      unidade_id: aplicForm.unidade_id || undefined,
      data_aplicacao: aplicForm.data_aplicacao,
      observacoes: aplicForm.observacoes || undefined,
      local_aplicacao: aplicForm.local_aplicacao || undefined,
      data_proxima_dose: aplicForm.data_proxima_dose || undefined,
    });
    setAplicacaoDialog(false);
    setAplicForm({
      paciente_id: "", nome_vacina: "", lote: "", dose: "",
      profissional_id: "", unidade_id: "",
      data_aplicacao: new Date().toISOString().split("T")[0],
      observacoes: "", local_aplicacao: "", data_proxima_dose: "",
    });
  };

  const handleCampSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCampanha.mutateAsync({
      nome: campForm.nome,
      publico_alvo: campForm.publico_alvo || undefined,
      data_inicio: campForm.data_inicio,
      data_fim: campForm.data_fim || undefined,
      meta_cobertura: campForm.meta_cobertura || undefined,
    });
    setCampanhaDialog(false);
    setCampForm({ nome: "", publico_alvo: "", data_inicio: "", data_fim: "", meta_cobertura: 0 });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="registros">
        <TabsList>
          <TabsTrigger value="registros" className="flex items-center gap-1"><Syringe className="h-3 w-3" />Registros</TabsTrigger>
          <TabsTrigger value="campanhas" className="flex items-center gap-1"><Target className="h-3 w-3" />Campanhas</TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setAplicacaoDialog(true)}><Plus className="h-4 w-4 mr-2" />Registrar Vacinação</Button>
          </div>
          {loadingRegistros ? <p className="text-center py-8">Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Vacina</TableHead>
                  <TableHead>Dose</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Unidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrosVacinas.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{format(new Date(r.data_aplicacao), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="font-medium">{r.pacientes?.nome}</TableCell>
                    <TableCell>{r.nome_vacina}</TableCell>
                    <TableCell>{r.dose ? <Badge variant="outline">{r.dose}</Badge> : "—"}</TableCell>
                    <TableCell>{r.lote || "—"}</TableCell>
                    <TableCell>{r.unidades_saude?.nome || "—"}</TableCell>
                  </TableRow>
                ))}
                {registrosVacinas.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="campanhas" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setCampanhaDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Campanha</Button>
          </div>
          {loadingCampanhas ? <p className="text-center py-8">Carregando...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campanhas.map((c: any) => (
                <Card key={c.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {c.nome}
                      <Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativa" : "Encerrada"}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p><strong>Público-alvo:</strong> {c.publico_alvo || "—"}</p>
                    <p><strong>Período:</strong> {format(new Date(c.data_inicio), "dd/MM/yyyy")} {c.data_fim ? `até ${format(new Date(c.data_fim), "dd/MM/yyyy")}` : ""}</p>
                    {c.meta_cobertura && <p><strong>Meta:</strong> {c.meta_cobertura}%</p>}
                  </CardContent>
                </Card>
              ))}
              {campanhas.length === 0 && <p className="text-center text-muted-foreground col-span-2 py-8">Nenhuma campanha cadastrada</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Aplicação */}
      <Dialog open={aplicacaoDialog} onOpenChange={setAplicacaoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar Vacinação</DialogTitle>
            <DialogDescription>Registre a aplicação de uma vacina ao paciente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAplicSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente <span className="text-destructive">*</span></Label>
              <Select value={aplicForm.paciente_id} onValueChange={(v) => setAplicForm({ ...aplicForm, paciente_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {pacientes.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.nome} {p.cpf ? `(${p.cpf})` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vacina <span className="text-destructive">*</span></Label>
                <Input
                  value={aplicForm.nome_vacina}
                  onChange={(e) => setAplicForm({ ...aplicForm, nome_vacina: e.target.value })}
                  placeholder="Ex: BCG, Hepatite B"
                  list="vacinas-list"
                  required
                />
                <datalist id="vacinas-list">
                  {nomesVacinas.map((n: string) => <option key={n} value={n} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Dose</Label>
                <Input value={aplicForm.dose} onChange={(e) => setAplicForm({ ...aplicForm, dose: e.target.value })} placeholder="Ex: 1ª dose" />
              </div>
              <div className="space-y-2">
                <Label>Lote</Label>
                <Input value={aplicForm.lote} onChange={(e) => setAplicForm({ ...aplicForm, lote: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Data <span className="text-destructive">*</span></Label>
                <Input type="date" value={aplicForm.data_aplicacao} onChange={(e) => setAplicForm({ ...aplicForm, data_aplicacao: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Local de Aplicação</Label>
                <Input value={aplicForm.local_aplicacao} onChange={(e) => setAplicForm({ ...aplicForm, local_aplicacao: e.target.value })} placeholder="Ex: Braço D" />
              </div>
              <div className="space-y-2">
                <Label>Próxima Dose</Label>
                <Input type="date" value={aplicForm.data_proxima_dose} onChange={(e) => setAplicForm({ ...aplicForm, data_proxima_dose: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profissional Aplicador</Label>
              <Select value={aplicForm.profissional_id} onValueChange={(v) => setAplicForm({ ...aplicForm, profissional_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {profissionais.map((p: any) => <SelectItem key={p.id} value={p.id}>{(p.profiles as any)?.name || "Profissional"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={aplicForm.unidade_id} onValueChange={(v) => setAplicForm({ ...aplicForm, unidade_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAplicacaoDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createRegistroVacina.isPending || !aplicForm.paciente_id || !aplicForm.nome_vacina}>Registrar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Campanha */}
      <Dialog open={campanhaDialog} onOpenChange={setCampanhaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Campanha</DialogTitle>
            <DialogDescription>Crie uma campanha de vacinação.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCampSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome <span className="text-destructive">*</span></Label>
              <Input value={campForm.nome} onChange={(e) => setCampForm({ ...campForm, nome: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Público-alvo</Label>
                <Input value={campForm.publico_alvo} onChange={(e) => setCampForm({ ...campForm, publico_alvo: e.target.value })} placeholder="Ex: Idosos 60+" />
              </div>
              <div className="space-y-2">
                <Label>Meta (%)</Label>
                <Input type="number" min="0" max="100" value={campForm.meta_cobertura} onChange={(e) => setCampForm({ ...campForm, meta_cobertura: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Início <span className="text-destructive">*</span></Label>
                <Input type="date" value={campForm.data_inicio} onChange={(e) => setCampForm({ ...campForm, data_inicio: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Fim</Label>
                <Input type="date" value={campForm.data_fim} onChange={(e) => setCampForm({ ...campForm, data_fim: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCampanhaDialog(false)}>Cancelar</Button>
              <Button type="submit" disabled={createCampanha.isPending || !campForm.nome || !campForm.data_inicio}>Criar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
