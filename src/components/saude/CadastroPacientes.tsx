import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PacienteDialog } from "./PacienteDialog";
import { usePacientes, type Paciente } from "@/hooks/usePacientes";
import { UserPlus, Search, Users, Heart, AlertTriangle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

export function CadastroPacientes() {
  const { pacientes, isLoading, createPaciente, updatePaciente, deletePaciente } = usePacientes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPaciente, setEditPaciente] = useState<Paciente | null>(null);
  const [viewPaciente, setViewPaciente] = useState<Paciente | null>(null);
  const [search, setSearch] = useState("");

  const ativos = pacientes.filter(p => p.status !== "inativo");
  const filtered = ativos.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf?.includes(search) ||
    p.cartao_sus?.includes(search)
  );

  const handleCreate = (data: any) => {
    createPaciente.mutate(data, { onSuccess: () => setDialogOpen(false) });
  };

  const handleEdit = (data: any) => {
    updatePaciente.mutate(data, { onSuccess: () => { setEditPaciente(null); } });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{ativos.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Cartão SUS</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{ativos.filter(p => p.cartao_sus).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Alergias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{ativos.filter(p => p.alergias && p.alergias.length > 0).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crônicos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{ativos.filter(p => p.condicoes_cronicas && p.condicoes_cronicas.length > 0).length}</div></CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou Cartão SUS..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 w-80"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cartão SUS</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Condições</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(paciente => (
              <TableRow key={paciente.id}>
                <TableCell className="font-medium">{paciente.nome}</TableCell>
                <TableCell>{paciente.cpf || "—"}</TableCell>
                <TableCell>{paciente.cartao_sus || "—"}</TableCell>
                <TableCell>
                  {paciente.data_nascimento ? format(new Date(paciente.data_nascimento), "dd/MM/yyyy") : "—"}
                </TableCell>
                <TableCell>{paciente.telefone || "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {paciente.alergias?.map(a => (
                      <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                    ))}
                    {paciente.condicoes_cronicas?.map(c => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewPaciente(paciente)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditPaciente(paciente)}>Editar</Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deletePaciente.mutate(paciente.id)}>
                      Inativar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum paciente encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      {/* Create Dialog */}
      <PacienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createPaciente.isPending}
      />

      {/* Edit Dialog */}
      {editPaciente && (
        <PacienteDialog
          open={!!editPaciente}
          onOpenChange={() => setEditPaciente(null)}
          onSubmit={handleEdit}
          paciente={editPaciente}
          isPending={updatePaciente.isPending}
        />
      )}

      {/* View Dialog */}
      <Dialog open={!!viewPaciente} onOpenChange={() => setViewPaciente(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
          </DialogHeader>
          {viewPaciente && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><strong>Nome:</strong> {viewPaciente.nome}</div>
                <div><strong>CPF:</strong> {viewPaciente.cpf || "—"}</div>
                <div><strong>Cartão SUS:</strong> {viewPaciente.cartao_sus || "—"}</div>
                <div><strong>Sexo:</strong> {viewPaciente.sexo || "—"}</div>
                <div><strong>Nascimento:</strong> {viewPaciente.data_nascimento ? format(new Date(viewPaciente.data_nascimento), "dd/MM/yyyy") : "—"}</div>
                <div><strong>Tipo Sanguíneo:</strong> {viewPaciente.tipo_sanguineo || "—"}</div>
                <div><strong>Telefone:</strong> {viewPaciente.telefone || "—"}</div>
                <div><strong>Email:</strong> {viewPaciente.email || "—"}</div>
                <div className="col-span-2"><strong>Endereço:</strong> {viewPaciente.endereco || "—"}, {viewPaciente.bairro || "—"} - {viewPaciente.cidade || "—"}</div>
                <div><strong>Nome da Mãe:</strong> {viewPaciente.nome_mae || "—"}</div>
                <div><strong>Responsável:</strong> {viewPaciente.nome_responsavel || "—"}</div>
              </div>
              {viewPaciente.alergias && viewPaciente.alergias.length > 0 && (
                <div>
                  <strong>Alergias:</strong>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {viewPaciente.alergias.map(a => <Badge key={a} variant="destructive">{a}</Badge>)}
                  </div>
                </div>
              )}
              {viewPaciente.condicoes_cronicas && viewPaciente.condicoes_cronicas.length > 0 && (
                <div>
                  <strong>Condições Crônicas:</strong>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {viewPaciente.condicoes_cronicas.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                  </div>
                </div>
              )}
              {viewPaciente.medicamentos_uso_continuo && viewPaciente.medicamentos_uso_continuo.length > 0 && (
                <div>
                  <strong>Medicamentos de Uso Contínuo:</strong>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {viewPaciente.medicamentos_uso_continuo.map(m => <Badge key={m}>{m}</Badge>)}
                  </div>
                </div>
              )}
              {viewPaciente.observacoes && <div><strong>Observações:</strong> {viewPaciente.observacoes}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
