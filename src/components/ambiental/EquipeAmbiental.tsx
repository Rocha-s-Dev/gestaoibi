import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, Loader2, Trash2, Leaf } from "lucide-react";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import {
  useEquipeAmbiental,
  ENVIRONMENT_ROLE_LABELS,
  type EnvironmentRole,
} from "@/hooks/useEquipeAmbiental";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROLES = Object.keys(ENVIRONMENT_ROLE_LABELS) as EnvironmentRole[];

export function EquipeAmbiental() {
  const { secretariaAtiva } = useSecretariaContext();
  const secretariaId = secretariaAtiva?.id;
  const { membros, isLoading, addMembro, updateRole, removeMembro } = useEquipeAmbiental(secretariaId);

  const [showVincular, setShowVincular] = useState(false);
  const [pendingUser, setPendingUser] = useState<UsuarioRH | null>(null);
  const [selectedRole, setSelectedRole] = useState<EnvironmentRole>("agente_ambiental");
  const [editRoleFor, setEditRoleFor] = useState<{ id: string; role: EnvironmentRole } | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [filtroRole, setFiltroRole] = useState<string>("todos");

  const membrosFiltrados = useMemo(() => {
    if (!membros) return [];
    if (filtroRole === "todos") return membros;
    return membros.filter((m) => m.role === filtroRole);
  }, [membros, filtroRole]);

  const handleUsuarioSelecionado = (usuario: UsuarioRH) => {
    if (!secretariaId) {
      toast.error("Selecione uma secretaria antes de vincular membros.");
      return;
    }
    if (membros?.some((m) => m.user_id === usuario.user_id)) {
      toast.warning("Este servidor já está vinculado à equipe ambiental.");
      return;
    }
    setPendingUser(usuario);
    setSelectedRole("agente_ambiental");
    setShowVincular(false);
  };

  const confirmarVinculo = () => {
    if (!pendingUser || !secretariaId) return;
    addMembro.mutate(
      { user_id: pendingUser.user_id, role: selectedRole, secretaria_id: secretariaId },
      { onSuccess: () => setPendingUser(null) }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Equipe da Secretaria de Meio Ambiente
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os papéis ambientais dos servidores vinculados pelo RH central.
            </p>
          </div>
          <Button onClick={() => setShowVincular(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Vincular Membro
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtrar por cargo:</span>
            <Select value={filtroRole} onValueChange={setFiltroRole}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cargos</SelectItem>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ENVIRONMENT_ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-muted-foreground">Carregando equipe ambiental...</span>
            </div>
          ) : membrosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Nenhum membro encontrado.</p>
              <p className="text-xs mt-1">Clique em "Vincular Membro" para adicionar servidores do RH.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servidor</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Função no Módulo Ambiental</TableHead>
                  <TableHead>Data de Vínculo</TableHead>
                  <TableHead className="w-[180px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membrosFiltrados.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {m.profiles?.first_name} {m.profiles?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{m.profiles?.cpf || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ENVIRONMENT_ROLE_LABELS[m.role as EnvironmentRole]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {m.created_at
                        ? format(new Date(m.created_at), "dd/MM/yyyy", { locale: ptBR })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditRoleFor({ id: m.id, role: m.role })}
                      >
                        Alterar papel
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setRemoveId(m.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <VincularUsuarioRH
        open={showVincular}
        onOpenChange={setShowVincular}
        onUsuarioSelecionado={handleUsuarioSelecionado}
        titulo="Vincular Servidor à Equipe Ambiental"
        descricao="Busque e selecione um servidor cadastrado pelo RH para vincular à equipe."
      />

      {/* Selecionar papel após escolher usuário */}
      <Dialog open={!!pendingUser} onOpenChange={(o) => !o && setPendingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir papel ambiental</DialogTitle>
            <DialogDescription>
              Servidor: <strong>{pendingUser?.nome}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Papel</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as EnvironmentRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ENVIRONMENT_ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={confirmarVinculo} disabled={addMembro.isPending}>
              {addMembro.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar vínculo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editar papel */}
      <Dialog open={!!editRoleFor} onOpenChange={(o) => !o && setEditRoleFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar papel ambiental</DialogTitle>
          </DialogHeader>
          {editRoleFor && (
            <Select
              value={editRoleFor.role}
              onValueChange={(v) => setEditRoleFor({ ...editRoleFor, role: v as EnvironmentRole })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ENVIRONMENT_ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleFor(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!editRoleFor) return;
                updateRole.mutate(editRoleFor, { onSuccess: () => setEditRoleFor(null) });
              }}
              disabled={updateRole.isPending}
            >
              {updateRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro da equipe ambiental</AlertDialogTitle>
            <AlertDialogDescription>
              O servidor não será excluído do sistema, apenas perderá o papel ambiental.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeId) removeMembro.mutate(removeId, { onSuccess: () => setRemoveId(null) });
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
