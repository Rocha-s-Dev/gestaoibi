import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { HardHat, Loader2, Search, Trash2, UserPlus, Pencil } from "lucide-react";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { useEquipeInfraestrutura, INFRASTRUCTURE_ROLE_LABELS, InfrastructureRole, EquipeInfraestruturaVinculo } from "@/hooks/useEquipeInfraestrutura";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { useUnidadesAdministrativas } from "@/hooks/useUnidadesAdministrativas";

const ROLE_ENTRIES = Object.entries(INFRASTRUCTURE_ROLE_LABELS) as [InfrastructureRole, string][];

export function EquipeInfraestrutura() {
  const { secretariaAtiva } = useSecretariaContext();
  const { vinculos, isLoading, createVinculo, updateVinculo, deleteVinculo } = useEquipeInfraestrutura(secretariaAtiva?.id);
  const { unidades } = useUnidadesAdministrativas(secretariaAtiva?.id);

  const [showVincular, setShowVincular] = useState(false);
  const [pendingUser, setPendingUser] = useState<UsuarioRH | null>(null);
  const [selectedRole, setSelectedRole] = useState<InfrastructureRole | "">("");
  const [selectedUnidade, setSelectedUnidade] = useState<string>("none");

  const [editing, setEditing] = useState<EquipeInfraestruturaVinculo | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [filtroRole, setFiltroRole] = useState<string>("all");
  const [filtroUnidade, setFiltroUnidade] = useState<string>("all");
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    return vinculos.filter((v) => {
      if (filtroRole !== "all" && v.role !== filtroRole) return false;
      if (filtroUnidade !== "all") {
        if (filtroUnidade === "none" ? v.unidade_id !== null : v.unidade_id !== filtroUnidade) return false;
      }
      if (busca.trim()) {
        const t = busca.toLowerCase();
        const nome = (v.profiles?.name || "").toLowerCase();
        const email = (v.profiles?.email || "").toLowerCase();
        if (!nome.includes(t) && !email.includes(t)) return false;
      }
      return true;
    });
  }, [vinculos, filtroRole, filtroUnidade, busca]);

  const handleUsuarioSelecionado = (u: UsuarioRH) => {
    setPendingUser(u);
    setSelectedRole("");
    setSelectedUnidade("none");
  };

  const confirmarVinculo = () => {
    if (!pendingUser || !selectedRole) return;
    createVinculo.mutate(
      {
        user_id: pendingUser.user_id,
        role: selectedRole,
        unidade_id: selectedUnidade === "none" ? null : selectedUnidade,
      },
      { onSuccess: () => setPendingUser(null) }
    );
  };

  const salvarEdicao = () => {
    if (!editing) return;
    updateVinculo.mutate(
      { id: editing.id, role: editing.role, unidade_id: editing.unidade_id },
      { onSuccess: () => setEditing(null) }
    );
  };

  const nomeUnidade = (id: string | null) => unidades.find((u: any) => u.id === id)?.nome || "—";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" />
              Equipe da Infraestrutura
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Engenheiros, fiscais, coordenadores e equipes operacionais. Todos são cadastrados exclusivamente pelo RH.
            </p>
          </div>
          <Button onClick={() => setShowVincular(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Vincular Servidor
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nome ou e-mail..." className="pl-10" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>
            <Select value={filtroRole} onValueChange={setFiltroRole}>
              <SelectTrigger><SelectValue placeholder="Papel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os papéis</SelectItem>
                {ROLE_ENTRIES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
              <SelectTrigger><SelectValue placeholder="Unidade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as unidades</SelectItem>
                <SelectItem value="none">Sem unidade</SelectItem>
                {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-muted-foreground">Carregando equipe...</span>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <HardHat className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Nenhum servidor vinculado à Infraestrutura ainda.</p>
              <p className="text-xs mt-1">Use "Vincular Servidor" para adicionar profissionais do RH.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servidor</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vinculado em</TableHead>
                  <TableHead className="w-[110px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{v.profiles?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{v.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{INFRASTRUCTURE_ROLE_LABELS[v.role]}</Badge>
                    </TableCell>
                    <TableCell>{nomeUnidade(v.unidade_id)}</TableCell>
                    <TableCell>
                      <Badge variant={v.profiles?.status_cadastral === "ativo" ? "default" : "secondary"}>
                        {v.profiles?.status_cadastral || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(v.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setEditing(v)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(v.id)}>
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
        titulo="Vincular Servidor à Infraestrutura"
        descricao="Selecione um servidor do RH e depois defina o papel administrativo dentro da Infraestrutura."
      />

      <Dialog open={!!pendingUser} onOpenChange={(o) => !o && setPendingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir papel na Infraestrutura</DialogTitle>
            <DialogDescription>
              Servidor: <strong>{pendingUser?.nome}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Papel administrativo *</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as InfrastructureRole)}>
                <SelectTrigger><SelectValue placeholder="Selecione o papel" /></SelectTrigger>
                <SelectContent>
                  {ROLE_ENTRIES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Unidade (opcional)</Label>
              <Select value={selectedUnidade} onValueChange={setSelectedUnidade}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem unidade específica</SelectItem>
                  {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUser(null)}>Cancelar</Button>
            <Button onClick={confirmarVinculo} disabled={!selectedRole || createVinculo.isPending}>
              {createVinculo.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Vínculo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar vínculo</DialogTitle>
            <DialogDescription>Altere apenas dados da secretaria. Dados do RH permanecem inalterados.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Papel</Label>
                <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as InfrastructureRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLE_ENTRIES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unidade</Label>
                <Select value={editing.unidade_id ?? "none"} onValueChange={(v) => setEditing({ ...editing, unidade_id: v === "none" ? null : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem unidade específica</SelectItem>
                    {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={salvarEdicao} disabled={updateVinculo.isPending}>
              {updateVinculo.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover vínculo</AlertDialogTitle>
            <AlertDialogDescription>
              O servidor deixará de compor a equipe de Infraestrutura, mas continuará ativo no RH Central.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteVinculo.mutate(deleteId); setDeleteId(null); } }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
