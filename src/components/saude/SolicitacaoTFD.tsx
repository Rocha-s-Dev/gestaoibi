import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useViagensTFD, useDestinosTFD, usePacientesTFD } from "@/hooks/useTFD";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Ambulance, Trash2 } from "lucide-react";

export function SolicitacaoTFD() {
  const { viagens, isLoading: loadingViagens, createViagem, updateViagem } = useViagensTFD();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addPacienteOpen, setAddPacienteOpen] = useState(false);
  const [selectedViagemId, setSelectedViagemId] = useState<string>("");

  // Fetch ALL pacientes across all viagens
  const { data: allPacientes = [], isLoading: loadingPacientes } = useQuery({
    queryKey: ["all_pacientes_tfd"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pacientes_tfd")
        .select("*, viagens_tfd:viagem_id(protocolo, data_viagem, status)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const [viagemForm, setViagemForm] = useState({
    data_viagem: "",
    horario_saida: "",
    horario_retorno_previsto: "",
    observacoes: "",
    custo_estimado: 0,
    diarias_valor: 0,
  });

  const handleCreateViagem = async () => {
    if (!viagemForm.data_viagem) return;
    await createViagem.mutateAsync({
      data_viagem: viagemForm.data_viagem,
      horario_saida: viagemForm.horario_saida || null,
      horario_retorno_previsto: viagemForm.horario_retorno_previsto || null,
      observacoes: viagemForm.observacoes || null,
      custo_estimado: viagemForm.custo_estimado,
      diarias_valor: viagemForm.diarias_valor,
    });
    setDialogOpen(false);
    setViagemForm({ data_viagem: "", horario_saida: "", horario_retorno_previsto: "", observacoes: "", custo_estimado: 0, diarias_valor: 0 });
  };

  const isLoading = loadingViagens || loadingPacientes;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Ambulance className="h-5 w-5" />
            Transporte Fora do Domicílio (TFD)
          </h3>
          <p className="text-sm text-muted-foreground">Gerencie pacientes para viagens de tratamento em outras cidades</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />Nova Viagem
          </Button>
          <Button onClick={() => setAddPacienteOpen(true)} disabled={viagens.length === 0}>
            <Plus className="h-4 w-4 mr-2" />Adicionar Paciente
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Ordem</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Carregando...</TableCell></TableRow>
              ) : allPacientes.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">Nenhum paciente cadastrado. Crie uma viagem e adicione pacientes.</TableCell></TableRow>
              ) : allPacientes.map((p: any, i: number) => (
                <TableRow key={p.id}>
                  <TableCell>{p.numero_ordem || i + 1}</TableCell>
                  <TableCell className="font-medium">{p.nome_paciente}</TableCell>
                  <TableCell>{p.telefone || "—"}</TableCell>
                  <TableCell>{p.endereco || "—"}</TableCell>
                  <TableCell>{p.procedimento || "—"}</TableCell>
                  <TableCell>{p.local_atendimento || "—"}</TableCell>
                  <TableCell>{p.horario_atendimento || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {(p as any).viagens_tfd?.protocolo || "—"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Nova Viagem */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Viagem TFD</DialogTitle>
            <DialogDescription>Crie uma viagem para depois adicionar pacientes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data da Viagem *</Label>
                <Input type="date" value={viagemForm.data_viagem} onChange={(e) => setViagemForm({ ...viagemForm, data_viagem: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Horário Saída</Label>
                <Input type="time" value={viagemForm.horario_saida} onChange={(e) => setViagemForm({ ...viagemForm, horario_saida: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Retorno Previsto</Label>
                <Input type="time" value={viagemForm.horario_retorno_previsto} onChange={(e) => setViagemForm({ ...viagemForm, horario_retorno_previsto: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custo Estimado (R$)</Label>
                <Input type="number" step="0.01" value={viagemForm.custo_estimado} onChange={(e) => setViagemForm({ ...viagemForm, custo_estimado: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Diárias (R$)</Label>
                <Input type="number" step="0.01" value={viagemForm.diarias_valor} onChange={(e) => setViagemForm({ ...viagemForm, diarias_valor: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={viagemForm.observacoes} onChange={(e) => setViagemForm({ ...viagemForm, observacoes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateViagem} disabled={createViagem.isPending}>Criar Viagem</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Paciente */}
      <AddPacienteDialog
        open={addPacienteOpen}
        onOpenChange={setAddPacienteOpen}
        viagens={viagens}
      />
    </div>
  );
}

function AddPacienteDialog({ open, onOpenChange, viagens }: { open: boolean; onOpenChange: (o: boolean) => void; viagens: any[] }) {
  const [selectedViagemId, setSelectedViagemId] = useState("");
  const { createPaciente } = usePacientesTFD(selectedViagemId || undefined);
  const { destinos } = useDestinosTFD(selectedViagemId || undefined);

  const [form, setForm] = useState({
    nome_paciente: "", telefone: "", endereco: "", procedimento: "",
    local_atendimento: "", horario_atendimento: "", cpf_paciente: "",
    cartao_sus: "", destino_id: "", acompanhante_nome: "", acompanhante_cpf: "",
    tipo_atendimento: "", especialidade: "",
  });

  const handleSubmit = async () => {
    if (!selectedViagemId || !form.nome_paciente) return;
    await createPaciente.mutateAsync({
      viagem_id: selectedViagemId,
      ...form,
      destino_id: form.destino_id || null,
      numero_ordem: 0, // will be auto-set
    });
    onOpenChange(false);
    setForm({ nome_paciente: "", telefone: "", endereco: "", procedimento: "", local_atendimento: "", horario_atendimento: "", cpf_paciente: "", cartao_sus: "", destino_id: "", acompanhante_nome: "", acompanhante_cpf: "", tipo_atendimento: "", especialidade: "" });
    setSelectedViagemId("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Paciente à Viagem</DialogTitle>
          <DialogDescription>Preencha os dados do paciente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Viagem *</Label>
            <Select value={selectedViagemId} onValueChange={setSelectedViagemId}>
              <SelectTrigger><SelectValue placeholder="Selecione a viagem" /></SelectTrigger>
              <SelectContent>
                {viagens.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.protocolo} — {v.data_viagem}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Paciente *</Label>
              <Input value={form.nome_paciente} onChange={(e) => setForm({ ...form, nome_paciente: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Endereço</Label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Procedimento</Label>
              <Input value={form.procedimento} onChange={(e) => setForm({ ...form, procedimento: e.target.value })} placeholder="Ex: Consulta cardiologia" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Local</Label>
              <Input value={form.local_atendimento} onChange={(e) => setForm({ ...form, local_atendimento: e.target.value })} placeholder="Hospital/Clínica" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Horário</Label>
              <Input type="time" value={form.horario_atendimento} onChange={(e) => setForm({ ...form, horario_atendimento: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">CPF</Label>
              <Input value={form.cpf_paciente} onChange={(e) => setForm({ ...form, cpf_paciente: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cartão SUS</Label>
              <Input value={form.cartao_sus} onChange={(e) => setForm({ ...form, cartao_sus: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Destino</Label>
              <Select value={form.destino_id} onValueChange={(v) => setForm({ ...form, destino_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {destinos.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.cidade_destino} - {d.hospital_unidade || "N/A"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Acompanhante</Label>
              <Input value={form.acompanhante_nome} onChange={(e) => setForm({ ...form, acompanhante_nome: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">CPF Acompanhante</Label>
              <Input value={form.acompanhante_cpf} onChange={(e) => setForm({ ...form, acompanhante_cpf: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!selectedViagemId || !form.nome_paciente || createPaciente.isPending}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
