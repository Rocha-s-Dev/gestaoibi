import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Users, Loader2, Trash2, HeartHandshake } from "lucide-react";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { useEquipeSocial, SOCIAL_ROLE_LABELS, type SocialRole } from "@/hooks/useEquipeSocial";
import { useSocial } from "@/hooks/useSocial";
import { useEffect } from "react";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ROLES = Object.keys(SOCIAL_ROLE_LABELS) as SocialRole[];

export function EquipeSocial() {
  const { secretariaAtiva } = useSecretariaContext();
  const secretariaId = secretariaAtiva?.id;
  const { membros, isLoading, addMembro, updateRole, removeMembro } = useEquipeSocial(secretariaId);
  const { unidades, fetchUnidades } = useSocial();

  useEffect(() => { fetchUnidades(); }, [fetchUnidades]);

  const [showVincular, setShowVincular] = useState(false);
  const [pendingUser, setPendingUser] = useState<UsuarioRH | null>(null);
  const [selectedRole, setSelectedRole] = useState<SocialRole>("agente_social");
  const [selectedUnidade, setSelectedUnidade] = useState<string>("nenhuma");
  const [editFor, setEditFor] = useState<{ id: string; role: SocialRole; unidade_id: string | null } | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [filtroRole, setFiltroRole] = useState<string>("todos");
  const [filtroUnidade, setFiltroUnidade] = useState<string>("todos");

  const filtered = useMemo(() => {
    if (!membros) return [];
    return membros.filter((m) => {
      if (filtroRole !== "todos" && m.role !== filtroRole) return false;
      if (filtroUnidade !== "todos" && m.unidade_id !== filtroUnidade) return false;
      return true;
    });
  }, [membros, filtroRole, filtroUnidade]);

  const handleUsuarioSelecionado = (usuario: UsuarioRH) => {
    if (!secretariaId) {
      toast.error("Selecione uma secretaria antes de vincular membros.");
      return;
    }
    if (membros?.some((m) => m.user_id === usuario.user_id)) {
      toast.warning("Este servidor já está vinculado à equipe social.");
      return;
    }
    setPendingUser(usuario);
    setSelectedRole("agente_social");
    setSelectedUnidade("nenhuma");
    setShowVincular(false);
  };

  const confirmarVinculo = () => {
    if (!pendingUser || !secretariaId) return;
    addMembro.mutate(
      {
        user_id: pendingUser.user_id,
        role: selectedRole,
        secretaria_id: secretariaId,
        unidade_id: selectedUnidade === "nenhuma" ? null : selectedUnidade,
      },
      { onSuccess: () => setPendingUser(null) }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="h-5 w-5 text-primary" />
              Equipe da Secretaria de Desenvolvimento Social
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie os papéis sociais dos servidores vinculados pelo RH central.
            </p>
          </div>
          <Button onClick={() => setShowVincular(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Vincular Membro
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Cargo:</span>
              <Select value={filtroRole} onValueChange={setFiltroRole}>
                <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os cargos</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{SOCIAL_ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Unidade:</span>
              <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
                <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as unidades</SelectItem>
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-muted-foreground">Carregando equipe social...</span>
            </div>
          ) : filtered.length === 0 ? (
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
                  <TableHead>Papel Social</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Data de Vínculo</TableHead>
                  <TableHead className="w-[200px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{m.profiles?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{m.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{m.profiles?.cpf || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{SOCIAL_ROLE_LABELS[m.role as SocialRole]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{m.unidade?.nome || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {m.created_at ? format(new Date(m.created_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditFor({ id: m.id, role: m.role, unidade_id: m.unidade_id })}>
                        Alterar
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
        titulo="Vincular Servidor à Equipe Social"
        descricao="Busque e selecione um servidor cadastrado pelo RH para vincular à equipe."
      />

      <Dialog open={!!pendingUser} onOpenChange={(o) => !o && setPendingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir papel social</DialogTitle>
            <DialogDescription>Servidor: <strong>{pendingUser?.nome}</strong></DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Papel</label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as SocialRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r}>{SOCIAL_ROLE_LABELS[r]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unidade (opcional)</label>
              <Select value={selectedUnidade} onValueChange={setSelectedUnidade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Sem unidade específica</SelectItem>
                  {unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome} ({u.tipo})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUser(null)}>Cancelar</Button>
            <Button onClick={confirmarVinculo} disabled={addMembro.isPending}>
              {addMembro.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar vínculo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editFor} onOpenChange={(o) => !o && setEditFor(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Alterar vínculo</DialogTitle></DialogHeader>
          {editFor && (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Papel</label>
                <Select value={editFor.role} onValueChange={(v) => setEditFor({ ...editFor, role: v as SocialRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{SOCIAL_ROLE_LABELS[r]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unidade</label>
                <Select
                  value={editFor.unidade_id ?? "nenhuma"}
                  onValueChange={(v) => setEditFor({ ...editFor, unidade_id: v === "nenhuma" ? null : v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Sem unidade específica</SelectItem>
                    {unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome} ({u.tipo})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditFor(null)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!editFor) return;
                updateRole.mutate(
                  { id: editFor.id, role: editFor.role, unidade_id: editFor.unidade_id },
                  { onSuccess: () => setEditFor(null) }
                );
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
            <AlertDialogTitle>Remover membro da equipe social</AlertDialogTitle>
            <AlertDialogDescription>
              O servidor não será excluído do sistema, apenas perderá o papel social.
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
