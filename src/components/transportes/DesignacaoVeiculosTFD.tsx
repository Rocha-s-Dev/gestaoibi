import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useViagensTFD, useVeiculosTFD, usePacientesTFD, useDestinosTFD } from "@/hooks/useTFD";
import { useFrotaMunicipal } from "@/hooks/useFrotaMunicipal";
import { useMotoristas } from "@/hooks/useMotoristas";
import { Ambulance, Car, Eye, Plus, Trash2, Users, CheckCircle, MapPin } from "lucide-react";
import { format } from "date-fns";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  solicitada: { label: "Aguardando Aprovação", variant: "outline" },
  aprovada_saude: { label: "Aguardando Veículos", variant: "secondary" },
  veiculos_designados: { label: "Veículos Designados", variant: "default" },
  em_andamento: { label: "Em Andamento", variant: "default" },
  concluida: { label: "Concluída", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
};

export function DesignacaoVeiculosTFD() {
  const { viagens, isLoading, updateViagem } = useViagensTFD();
  const [selectedViagem, setSelectedViagem] = useState<string | null>(null);
  const [designarOpen, setDesignarOpen] = useState(false);

  // Filter viagens that need transport action
  const viagensParaDesignar = viagens.filter(v => ["aprovada_saude", "veiculos_designados", "em_andamento"].includes(v.status));
  const viagensConcluidas = viagens.filter(v => v.status === "concluida");

  const handleIniciarViagem = async (id: string) => {
    await updateViagem.mutateAsync({ id, status: "em_andamento" });
  };

  const handleConcluir = async (id: string) => {
    await updateViagem.mutateAsync({ id, status: "concluida", data_retorno_real: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Ambulance className="h-5 w-5" />
          TFD — Designação de Veículos
        </h3>
        <p className="text-sm text-muted-foreground">Gerencie veículos e motoristas para viagens de pacientes</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>
              ) : viagensParaDesignar.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhuma viagem pendente de designação</TableCell></TableRow>
              ) : viagensParaDesignar.map((v) => {
                const st = statusMap[v.status] || statusMap.solicitada;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-mono text-sm">{v.protocolo}</TableCell>
                    <TableCell>{format(new Date(v.data_viagem), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{v.horario_saida || "—"}</TableCell>
                    <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedViagem(v.id); setDesignarOpen(true); }}>
                          <Car className="h-3 w-3 mr-1" />Designar
                        </Button>
                        {v.status === "veiculos_designados" && (
                          <Button size="sm" onClick={() => handleIniciarViagem(v.id)}>Iniciar</Button>
                        )}
                        {v.status === "em_andamento" && (
                          <Button size="sm" variant="secondary" onClick={() => handleConcluir(v.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />Concluir
                          </Button>
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

      {selectedViagem && (
        <DesignarVeiculosDialog
          viagemId={selectedViagem}
          open={designarOpen}
          onOpenChange={(open) => { setDesignarOpen(open); if (!open) setSelectedViagem(null); }}
        />
      )}
    </div>
  );
}

function DesignarVeiculosDialog({ viagemId, open, onOpenChange }: { viagemId: string; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { veiculos, createVeiculo, deleteVeiculo } = useVeiculosTFD(viagemId);
  const { pacientes } = usePacientesTFD(viagemId);
  const { destinos } = useDestinosTFD(viagemId);
  const { veiculos: frota } = useFrotaMunicipal();
  const { motoristas } = useMotoristas();
  const { updateViagem } = useViagensTFD();
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ veiculo_id: "", motorista_id: "", capacidade_pacientes: 4 });

  const veiculosDisponiveis = (frota || []).filter((v: any) => v.status === "disponivel");

  const handleAdd = async () => {
    await createVeiculo.mutateAsync({ viagem_id: viagemId, ...form });
    // Update viagem status
    await updateViagem.mutateAsync({ id: viagemId, status: "veiculos_designados" });
    setAddOpen(false);
    setForm({ veiculo_id: "", motorista_id: "", capacidade_pacientes: 4 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Designação de Veículos</DialogTitle>
          <DialogDescription>
            {destinos.length} destino(s) • {pacientes.length} paciente(s)
          </DialogDescription>
        </DialogHeader>

        {/* Resumo destinos */}
        <div className="flex flex-wrap gap-2 mb-2">
          {destinos.map((d) => (
            <Badge key={d.id} variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />{d.cidade_destino}/{d.uf_destino}
            </Badge>
          ))}
        </div>

        {/* Resumo pacientes */}
        <div className="text-sm text-muted-foreground mb-4">
          <Users className="h-4 w-4 inline mr-1" />
          Pacientes: {pacientes.map(p => p.nome_paciente).join(", ") || "Nenhum"}
          {pacientes.some(p => p.acompanhante_nome) && (
            <span className="ml-2">(+ acompanhantes)</span>
          )}
        </div>

        {/* Veículos designados */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Veículos ({veiculos.length})</h4>
            <Button size="sm" onClick={() => setAddOpen(!addOpen)}>
              <Plus className="h-3 w-3 mr-1" />Adicionar Veículo
            </Button>
          </div>

          {addOpen && (
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Veículo *</Label>
                  <Select value={form.veiculo_id} onValueChange={(v) => setForm({ ...form, veiculo_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {veiculosDisponiveis.map((v: any) => (
                        <SelectItem key={v.id} value={v.id}>{v.placa} - {v.modelo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Motorista *</Label>
                  <Select value={form.motorista_id} onValueChange={(v) => setForm({ ...form, motorista_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {(motoristas || []).filter((m: any) => m.status === "ativo").map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>{m.profile_nome || m.id}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Capacidade Pacientes</Label>
                  <Input type="number" min={1} value={form.capacidade_pacientes} onChange={(e) => setForm({ ...form, capacidade_pacientes: parseInt(e.target.value) || 4 })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleAdd} disabled={!form.veiculo_id || !form.motorista_id}>Designar</Button>
              </div>
            </Card>
          )}

          {veiculos.map((v) => (
            <Card key={v.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {(v as any).veiculos_frota?.placa || "—"} — {(v as any).veiculos_frota?.modelo || ""} {(v as any).veiculos_frota?.marca || ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Capacidade: {v.capacidade_pacientes} pacientes
                  </p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => deleteVeiculo.mutate(v.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
