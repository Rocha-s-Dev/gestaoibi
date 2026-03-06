import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, Search, Building2 } from "lucide-react";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { useEquipeEducacao, CARGOS_APOIO_EDUCACAO, TURNOS, NovoMembroEquipe, EquipeEducacaoMembro } from "@/hooks/useEquipeEducacao";
import { useEscolas } from "@/hooks/useEscolas";

export function EquipeEducacao() {
  const { membros, isLoading, adicionarMembro, atualizarMembro, removerMembro } = useEquipeEducacao();
  const { escolas } = useEscolas();

  const [vincularOpen, setVincularOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editando, setEditando] = useState<EquipeEducacaoMembro | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filtroEscola, setFiltroEscola] = useState("todas");
  const [filtroCargo, setFiltroCargo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const [selectedUser, setSelectedUser] = useState<UsuarioRH | null>(null);
  const [formData, setFormData] = useState({
    cargo: "",
    escola_id: "" as string,
    turno: "matutino",
    data_inicio: new Date().toISOString().split("T")[0],
    status: "ativo",
  });

  const resetForm = () => {
    setSelectedUser(null);
    setEditando(null);
    setFormData({ cargo: "", escola_id: "", turno: "matutino", data_inicio: new Date().toISOString().split("T")[0], status: "ativo" });
  };

  const handleUserSelected = (usuario: UsuarioRH) => {
    setSelectedUser(usuario);
    setVincularOpen(false);
    setFormOpen(true);
  };

  const handleEdit = (membro: EquipeEducacaoMembro) => {
    setEditando(membro);
    setFormData({
      cargo: membro.cargo,
      escola_id: membro.escola_id || "",
      turno: membro.turno,
      data_inicio: membro.data_inicio,
      status: membro.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (editando) {
      atualizarMembro.mutate({
        id: editando.id,
        cargo: formData.cargo,
        escola_id: formData.escola_id || null,
        turno: formData.turno,
        data_inicio: formData.data_inicio,
        status: formData.status,
      });
    } else if (selectedUser) {
      adicionarMembro.mutate({
        usuario_id: selectedUser.user_id,
        cargo: formData.cargo,
        escola_id: formData.escola_id || null,
        turno: formData.turno,
        data_inicio: formData.data_inicio,
        status: formData.status,
      });
    }
    setFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      removerMembro.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const membrosFiltrados = membros.filter((m) => {
    if (filtroEscola === "secretaria" && m.escola_id !== null) return false;
    if (filtroEscola !== "todas" && filtroEscola !== "secretaria" && m.escola_id !== filtroEscola) return false;
    if (filtroCargo !== "todos" && m.cargo !== filtroCargo) return false;
    if (filtroStatus !== "todos" && m.status !== filtroStatus) return false;
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "ativo": return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "afastado": return <Badge className="bg-yellow-100 text-yellow-800">Afastado</Badge>;
      case "desligado": return <Badge variant="destructive">Desligado</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const turnoLabel = (turno: string) => TURNOS.find(t => t.value === turno)?.label || turno;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Equipe de Apoio da Educação</CardTitle>
          </div>
          <Button onClick={() => { resetForm(); setVincularOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar membro da equipe
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1">
              <Label className="text-xs">Escola</Label>
              <Select value={filtroEscola} onValueChange={setFiltroEscola}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="secretaria">Secretaria de Educação</SelectItem>
                  {escolas.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cargo</Label>
              <Select value={filtroCargo} onValueChange={setFiltroCargo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {CARGOS_APOIO_EDUCACAO.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                  <SelectItem value="desligado">Desligado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : membrosFiltrados.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum membro encontrado.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Funcionário</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Escola / Lotação</TableHead>
                    <TableHead>Turno</TableHead>
                    <TableHead>Data Início</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membrosFiltrados.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{m.profiles?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{m.profiles?.cpf || "—"}</TableCell>
                      <TableCell>{m.cargo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{m.escolas?.nome || "Secretaria de Educação"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{turnoLabel(m.turno)}</TableCell>
                      <TableCell className="text-sm">{new Date(m.data_inicio).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{statusBadge(m.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteId(m.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* VincularUsuarioRH Dialog */}
      <VincularUsuarioRH
        open={vincularOpen}
        onOpenChange={setVincularOpen}
        onUsuarioSelecionado={handleUserSelected}
        titulo="Selecionar Funcionário do RH"
        descricao="Busque um servidor cadastrado no RH para vincular à equipe de apoio da Educação."
      />

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar Membro" : "Adicionar Membro da Equipe"}</DialogTitle>
          </DialogHeader>

          {!editando && selectedUser && (
            <div className="bg-muted/50 rounded-md p-3 mb-2">
              <p className="font-medium">{selectedUser.nome}</p>
              <p className="text-sm text-muted-foreground">{selectedUser.email} · CPF: {selectedUser.cpf || "N/A"}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cargo *</Label>
              <Select value={formData.cargo} onValueChange={(v) => setFormData(p => ({ ...p, cargo: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar cargo" /></SelectTrigger>
                <SelectContent>
                  {CARGOS_APOIO_EDUCACAO.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Escola (deixe vazio para Secretaria)</Label>
              <Select value={formData.escola_id || "none"} onValueChange={(v) => setFormData(p => ({ ...p, escola_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Secretaria de Educação" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Secretaria de Educação</SelectItem>
                  {escolas.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Turno *</Label>
                <Select value={formData.turno} onValueChange={(v) => setFormData(p => ({ ...p, turno: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TURNOS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Início *</Label>
                <Input type="date" value={formData.data_inicio} onChange={(e) => setFormData(p => ({ ...p, data_inicio: e.target.value }))} />
              </div>
            </div>

            {editando && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setFormOpen(false); resetForm(); }}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={!formData.cargo || !formData.turno || !formData.data_inicio}>
                {editando ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>Deseja remover este membro da equipe de apoio? Esta ação não afeta o cadastro do RH.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
