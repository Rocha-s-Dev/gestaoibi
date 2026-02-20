import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useViagensTFD, useDestinosTFD, usePacientesTFD } from "@/hooks/useTFD";
import { Plus, MapPin, Users, Eye, Ambulance, Trash2 } from "lucide-react";
import { format } from "date-fns";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  solicitada: { label: "Solicitada", variant: "outline" },
  aprovada_saude: { label: "Aprovada", variant: "default" },
  veiculos_designados: { label: "Veículos Designados", variant: "default" },
  em_andamento: { label: "Em Andamento", variant: "secondary" },
  concluida: { label: "Concluída", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

export function SolicitacaoTFD() {
  const { viagens, isLoading, createViagem, updateViagem } = useViagensTFD();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState<string | null>(null);
  const [form, setForm] = useState({
    data_viagem: "",
    horario_saida: "",
    horario_retorno_previsto: "",
    observacoes: "",
    custo_estimado: 0,
    diarias_valor: 0,
  });

  const handleCreate = async () => {
    if (!form.data_viagem) return;
    await createViagem.mutateAsync({
      data_viagem: form.data_viagem,
      horario_saida: form.horario_saida || null,
      horario_retorno_previsto: form.horario_retorno_previsto || null,
      observacoes: form.observacoes || null,
      custo_estimado: form.custo_estimado,
      diarias_valor: form.diarias_valor,
    });
    setDialogOpen(false);
    setForm({ data_viagem: "", horario_saida: "", horario_retorno_previsto: "", observacoes: "", custo_estimado: 0, diarias_valor: 0 });
  };

  const handleAprovar = async (id: string) => {
    await updateViagem.mutateAsync({ id, status: "aprovada_saude" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Ambulance className="h-5 w-5" />
            Transporte Fora do Domicílio (TFD)
          </h3>
          <p className="text-sm text-muted-foreground">Solicite viagens para tratamentos de pacientes em outras cidades</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />Nova Solicitação
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
                <TableHead>Data Viagem</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Custo Est.</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center">Carregando...</TableCell></TableRow>
              ) : viagens.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhuma viagem TFD</TableCell></TableRow>
              ) : viagens.map((v) => {
                const st = statusMap[v.status] || statusMap.solicitada;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-sm">{v.protocolo}</TableCell>
                    <TableCell>{format(new Date(v.data_viagem), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{v.horario_saida || "—"}</TableCell>
                    <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                    <TableCell>R$ {Number(v.custo_estimado || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => { setViagemSelecionada(v.id); setDetalhesOpen(true); }}>
                          <Eye className="h-3 w-3 mr-1" />Detalhes
                        </Button>
                        {v.status === "solicitada" && (
                          <Button size="sm" onClick={() => handleAprovar(v.id)}>Aprovar</Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Nova Solicitação */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Solicitação TFD</DialogTitle>
            <DialogDescription>Preencha os dados da viagem médica</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data da Viagem *</Label>
                <Input type="date" value={form.data_viagem} onChange={(e) => setForm({ ...form, data_viagem: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Horário Saída</Label>
                <Input type="time" value={form.horario_saida} onChange={(e) => setForm({ ...form, horario_saida: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Retorno Previsto</Label>
                <Input type="time" value={form.horario_retorno_previsto} onChange={(e) => setForm({ ...form, horario_retorno_previsto: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Custo Estimado (R$)</Label>
                <Input type="number" step="0.01" value={form.custo_estimado} onChange={(e) => setForm({ ...form, custo_estimado: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Diárias (R$)</Label>
                <Input type="number" step="0.01" value={form.diarias_valor} onChange={(e) => setForm({ ...form, diarias_valor: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreate} disabled={createViagem.isPending}>Criar Solicitação</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detalhes da Viagem */}
      {viagemSelecionada && (
        <DetalhesTFDDialog 
          viagemId={viagemSelecionada} 
          open={detalhesOpen} 
          onOpenChange={(open) => { setDetalhesOpen(open); if (!open) setViagemSelecionada(null); }} 
        />
      )}
    </div>
  );
}

function DetalhesTFDDialog({ viagemId, open, onOpenChange }: { viagemId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { destinos, createDestino, deleteDestino } = useDestinosTFD(viagemId);
  const { pacientes, createPaciente, deletePaciente } = usePacientesTFD(viagemId);
  const [tab, setTab] = useState<"destinos" | "pacientes">("destinos");
  const [addDestino, setAddDestino] = useState(false);
  const [addPaciente, setAddPaciente] = useState(false);

  const [destinoForm, setDestinoForm] = useState({ cidade_destino: "", uf_destino: "SP", hospital_unidade: "", tipo_atendimento: "consulta" as string, endereco: "" });
  const [pacienteForm, setPacienteForm] = useState({ nome_paciente: "", cpf_paciente: "", cartao_sus: "", tipo_atendimento: "", especialidade: "", acompanhante_nome: "", acompanhante_cpf: "", destino_id: "", telefone: "", endereco: "", procedimento: "", local_atendimento: "", horario_atendimento: "" });

  const handleAddDestino = async () => {
    await createDestino.mutateAsync({ viagem_id: viagemId, ...destinoForm, ordem: destinos.length + 1 });
    setAddDestino(false);
    setDestinoForm({ cidade_destino: "", uf_destino: "SP", hospital_unidade: "", tipo_atendimento: "consulta", endereco: "" });
  };

  const handleAddPaciente = async () => {
    await createPaciente.mutateAsync({ viagem_id: viagemId, ...pacienteForm, destino_id: pacienteForm.destino_id || null, numero_ordem: pacientes.length + 1 });
    setAddPaciente(false);
    setPacienteForm({ nome_paciente: "", cpf_paciente: "", cartao_sus: "", tipo_atendimento: "", especialidade: "", acompanhante_nome: "", acompanhante_cpf: "", destino_id: "", telefone: "", endereco: "", procedimento: "", local_atendimento: "", horario_atendimento: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Viagem TFD</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button variant={tab === "destinos" ? "default" : "outline"} size="sm" onClick={() => setTab("destinos")}>
            <MapPin className="h-4 w-4 mr-1" />Destinos ({destinos.length})
          </Button>
          <Button variant={tab === "pacientes" ? "default" : "outline"} size="sm" onClick={() => setTab("pacientes")}>
            <Users className="h-4 w-4 mr-1" />Pacientes ({pacientes.length})
          </Button>
        </div>

        {tab === "destinos" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setAddDestino(!addDestino)}>
                <Plus className="h-3 w-3 mr-1" />Adicionar Destino
              </Button>
            </div>

            {addDestino && (
              <Card className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Cidade *</Label>
                    <Input value={destinoForm.cidade_destino} onChange={(e) => setDestinoForm({ ...destinoForm, cidade_destino: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">UF</Label>
                    <Input value={destinoForm.uf_destino} onChange={(e) => setDestinoForm({ ...destinoForm, uf_destino: e.target.value })} maxLength={2} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo Atendimento</Label>
                    <Select value={destinoForm.tipo_atendimento} onValueChange={(v) => setDestinoForm({ ...destinoForm, tipo_atendimento: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="exame">Exame</SelectItem>
                        <SelectItem value="cirurgia">Cirurgia</SelectItem>
                        <SelectItem value="tratamento">Tratamento</SelectItem>
                        <SelectItem value="retorno">Retorno</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Hospital/Unidade</Label>
                    <Input value={destinoForm.hospital_unidade} onChange={(e) => setDestinoForm({ ...destinoForm, hospital_unidade: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Endereço</Label>
                    <Input value={destinoForm.endereco} onChange={(e) => setDestinoForm({ ...destinoForm, endereco: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAddDestino(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleAddDestino} disabled={!destinoForm.cidade_destino}>Salvar</Button>
                </div>
              </Card>
            )}

            {destinos.map((d, i) => (
              <Card key={d.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{i + 1}º</Badge>
                    <div>
                      <p className="font-medium">{d.cidade_destino}/{d.uf_destino}</p>
                      <p className="text-sm text-muted-foreground">{d.hospital_unidade || "—"} • {d.tipo_atendimento || "—"}</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteDestino.mutate(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "pacientes" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setAddPaciente(!addPaciente)}>
                <Plus className="h-3 w-3 mr-1" />Adicionar Paciente
              </Button>
            </div>

            {addPaciente && (
              <Card className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Nome *</Label>
                    <Input value={pacienteForm.nome_paciente} onChange={(e) => setPacienteForm({ ...pacienteForm, nome_paciente: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Telefone</Label>
                    <Input value={pacienteForm.telefone} onChange={(e) => setPacienteForm({ ...pacienteForm, telefone: e.target.value })} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Endereço</Label>
                    <Input value={pacienteForm.endereco} onChange={(e) => setPacienteForm({ ...pacienteForm, endereco: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Procedimento</Label>
                    <Input value={pacienteForm.procedimento} onChange={(e) => setPacienteForm({ ...pacienteForm, procedimento: e.target.value })} placeholder="Ex: Consulta cardiologia" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Local</Label>
                    <Input value={pacienteForm.local_atendimento} onChange={(e) => setPacienteForm({ ...pacienteForm, local_atendimento: e.target.value })} placeholder="Hospital/Clínica" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Horário</Label>
                    <Input type="time" value={pacienteForm.horario_atendimento} onChange={(e) => setPacienteForm({ ...pacienteForm, horario_atendimento: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">CPF</Label>
                    <Input value={pacienteForm.cpf_paciente} onChange={(e) => setPacienteForm({ ...pacienteForm, cpf_paciente: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Cartão SUS</Label>
                    <Input value={pacienteForm.cartao_sus} onChange={(e) => setPacienteForm({ ...pacienteForm, cartao_sus: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Destino</Label>
                    <Select value={pacienteForm.destino_id} onValueChange={(v) => setPacienteForm({ ...pacienteForm, destino_id: v })}>
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
                    <Input value={pacienteForm.acompanhante_nome} onChange={(e) => setPacienteForm({ ...pacienteForm, acompanhante_nome: e.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">CPF Acompanhante</Label>
                    <Input value={pacienteForm.acompanhante_cpf} onChange={(e) => setPacienteForm({ ...pacienteForm, acompanhante_cpf: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setAddPaciente(false)}>Cancelar</Button>
                  <Button size="sm" onClick={handleAddPaciente} disabled={!pacienteForm.nome_paciente}>Salvar</Button>
                </div>
              </Card>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº</TableHead>
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
                {pacientes.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>{(p as any).numero_ordem || i + 1}</TableCell>
                    <TableCell className="font-medium">{p.nome_paciente}</TableCell>
                    <TableCell>{(p as any).telefone || "—"}</TableCell>
                    <TableCell>{(p as any).endereco || "—"}</TableCell>
                    <TableCell>{(p as any).procedimento || "—"}</TableCell>
                    <TableCell>{(p as any).local_atendimento || "—"}</TableCell>
                    <TableCell>{(p as any).horario_atendimento || "—"}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => deletePaciente.mutate(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
