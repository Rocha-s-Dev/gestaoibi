import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useProntuarios } from "@/hooks/useProntuarios";
import { usePacientes } from "@/hooks/usePacientes";
import { useProfissionaisSaude } from "@/hooks/useProfissionaisSaude";
import { FileText, Search, Plus, ClipboardList, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Json } from "@/integrations/supabase/types";

export function ProntuarioEletronico() {
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");
  const { prontuarios, isLoading, createProntuario } = useProntuarios(selectedPacienteId || undefined);
  const { pacientes } = usePacientes();
  const { profissionais } = useProfissionaisSaude();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewProntuario, setViewProntuario] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    paciente_id: "",
    tipo_atendimento: "consulta",
    queixa_principal: "",
    historia_doenca_atual: "",
    hipotese_diagnostica: "",
    cid_principal: "",
    conduta: "",
    observacoes: "",
    pressao_arterial: "",
    temperatura: "",
    frequencia_cardiaca: "",
    frequencia_respiratoria: "",
    saturacao: "",
    peso: "",
    altura: "",
  });

  const filtered = prontuarios.filter(p =>
    !search || p.paciente?.nome?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const sinaisVitais: Json = {
      pressao_arterial: form.pressao_arterial || null,
      temperatura: form.temperatura || null,
      frequencia_cardiaca: form.frequencia_cardiaca || null,
      frequencia_respiratoria: form.frequencia_respiratoria || null,
      saturacao: form.saturacao || null,
      peso: form.peso || null,
      altura: form.altura || null,
    };

    createProntuario.mutate(
      {
        paciente_id: form.paciente_id || selectedPacienteId,
        tipo_atendimento: form.tipo_atendimento,
        queixa_principal: form.queixa_principal || null,
        historia_doenca_atual: form.historia_doenca_atual || null,
        hipotese_diagnostica: form.hipotese_diagnostica || null,
        cid_principal: form.cid_principal || null,
        conduta: form.conduta || null,
        observacoes: form.observacoes || null,
        sinais_vitais: sinaisVitais,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({
            paciente_id: "", tipo_atendimento: "consulta", queixa_principal: "",
            historia_doenca_atual: "", hipotese_diagnostica: "", cid_principal: "",
            conduta: "", observacoes: "", pressao_arterial: "", temperatura: "",
            frequencia_cardiaca: "", frequencia_respiratoria: "", saturacao: "",
            peso: "", altura: "",
          });
        },
      }
    );
  };

  const getSinaisVitais = (sv: Json | null) => {
    if (!sv || typeof sv !== "object" || Array.isArray(sv)) return null;
    return sv as Record<string, string | null>;
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Prontuários</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{prontuarios.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Cadastrados</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pacientes.filter(p => p.status !== "inativo").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos Hoje</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prontuarios.filter(p => new Date(p.data_atendimento).toDateString() === new Date().toDateString()).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient selector + search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 items-center">
          <Select value={selectedPacienteId} onValueChange={setSelectedPacienteId}>
            <SelectTrigger className="w-80"><SelectValue placeholder="Filtrar por paciente..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os pacientes</SelectItem>
              {pacientes.filter(p => p.status !== "inativo").map(p => (
                <SelectItem key={p.id} value={p.id}>{p.nome} {p.cartao_sus ? `- SUS: ${p.cartao_sus}` : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedPacienteId && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 w-48" />
            </div>
          )}
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Atendimento
        </Button>
      </div>

      {/* Prontuarios list */}
      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Queixa Principal</TableHead>
              <TableHead>CID</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>{format(new Date(p.data_atendimento), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                <TableCell className="font-medium">{p.paciente?.nome || "—"}</TableCell>
                <TableCell><Badge variant="secondary" className="capitalize">{p.tipo_atendimento}</Badge></TableCell>
                <TableCell className="max-w-[200px] truncate">{p.queixa_principal || "—"}</TableCell>
                <TableCell>{p.cid_principal || "—"}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => setViewProntuario(p)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {selectedPacienteId ? "Nenhum prontuário para este paciente" : "Selecione um paciente ou busque por nome"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* New Prontuario Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Atendimento - Prontuário Eletrônico</DialogTitle>
            <DialogDescription>Registre o atendimento clínico do paciente.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Paciente *</Label>
                <Select value={form.paciente_id || selectedPacienteId} onValueChange={v => setForm({ ...form, paciente_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {pacientes.filter(p => p.status !== "inativo").map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Atendimento *</Label>
                <Select value={form.tipo_atendimento} onValueChange={v => setForm({ ...form, tipo_atendimento: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consulta">Consulta</SelectItem>
                    <SelectItem value="retorno">Retorno</SelectItem>
                    <SelectItem value="urgencia">Urgência</SelectItem>
                    <SelectItem value="procedimento">Procedimento</SelectItem>
                    <SelectItem value="acolhimento">Acolhimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>CID Principal</Label>
                <Input value={form.cid_principal} onChange={e => setForm({ ...form, cid_principal: e.target.value })} placeholder="Ex: J06.9" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Queixa Principal</Label>
              <Textarea value={form.queixa_principal} onChange={e => setForm({ ...form, queixa_principal: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>História da Doença Atual (HDA)</Label>
              <Textarea value={form.historia_doenca_atual} onChange={e => setForm({ ...form, historia_doenca_atual: e.target.value })} />
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="sinais">
                <AccordionTrigger>Sinais Vitais</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">PA (mmHg)</Label>
                      <Input value={form.pressao_arterial} onChange={e => setForm({ ...form, pressao_arterial: e.target.value })} placeholder="120/80" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Temp (°C)</Label>
                      <Input value={form.temperatura} onChange={e => setForm({ ...form, temperatura: e.target.value })} placeholder="36.5" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">FC (bpm)</Label>
                      <Input value={form.frequencia_cardiaca} onChange={e => setForm({ ...form, frequencia_cardiaca: e.target.value })} placeholder="80" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">FR (irpm)</Label>
                      <Input value={form.frequencia_respiratoria} onChange={e => setForm({ ...form, frequencia_respiratoria: e.target.value })} placeholder="18" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SpO₂ (%)</Label>
                      <Input value={form.saturacao} onChange={e => setForm({ ...form, saturacao: e.target.value })} placeholder="98" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Peso (kg)</Label>
                      <Input value={form.peso} onChange={e => setForm({ ...form, peso: e.target.value })} placeholder="70" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2">
              <Label>Hipótese Diagnóstica</Label>
              <Textarea value={form.hipotese_diagnostica} onChange={e => setForm({ ...form, hipotese_diagnostica: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Conduta</Label>
              <Textarea value={form.conduta} onChange={e => setForm({ ...form, conduta: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createProntuario.isPending || !(form.paciente_id || selectedPacienteId)}>
                Registrar Atendimento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Prontuario Dialog */}
      <Dialog open={!!viewProntuario} onOpenChange={() => setViewProntuario(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prontuário - {viewProntuario?.paciente?.nome}</DialogTitle>
          </DialogHeader>
          {viewProntuario && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Data:</strong> {format(new Date(viewProntuario.data_atendimento), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>
                <div><strong>Tipo:</strong> <Badge variant="secondary" className="capitalize">{viewProntuario.tipo_atendimento}</Badge></div>
                <div><strong>CID:</strong> {viewProntuario.cid_principal || "—"}</div>
                <div><strong>Unidade:</strong> {viewProntuario.unidade?.nome || "—"}</div>
              </div>
              {viewProntuario.queixa_principal && <div><strong>Queixa Principal:</strong><p className="mt-1">{viewProntuario.queixa_principal}</p></div>}
              {viewProntuario.historia_doenca_atual && <div><strong>HDA:</strong><p className="mt-1">{viewProntuario.historia_doenca_atual}</p></div>}
              {viewProntuario.sinais_vitais && (
                <div>
                  <strong>Sinais Vitais:</strong>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {Object.entries(getSinaisVitais(viewProntuario.sinais_vitais) || {}).map(([k, v]) =>
                      v ? <Badge key={k} variant="outline">{k.replace(/_/g, " ")}: {v}</Badge> : null
                    )}
                  </div>
                </div>
              )}
              {viewProntuario.hipotese_diagnostica && <div><strong>Hipótese Diagnóstica:</strong><p className="mt-1">{viewProntuario.hipotese_diagnostica}</p></div>}
              {viewProntuario.conduta && <div><strong>Conduta:</strong><p className="mt-1">{viewProntuario.conduta}</p></div>}
              {viewProntuario.observacoes && <div><strong>Observações:</strong><p className="mt-1">{viewProntuario.observacoes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
