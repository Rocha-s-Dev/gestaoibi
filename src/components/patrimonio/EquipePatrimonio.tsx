import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, UserPlus, Loader2, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { useSecretarias } from "@/hooks/useSecretarias";
import { useMunicipios } from "@/hooks/useMunicipios";
import { useUnidadesAdministrativas } from "@/hooks/useUnidadesAdministrativas";
import { PATRIMONIO_ROLE_LABELS, PatrimonioRole, useEquipePatrimonio } from "@/hooks/useEquipePatrimonio";

const NONE = "none";

export function EquipePatrimonio() {
  const { vinculos, isLoading, createVinculo, updateVinculo, deleteVinculo } = useEquipePatrimonio();
  const { municipioAtivo } = useMunicipios();
  const { secretarias } = useSecretarias(municipioAtivo?.id);

  const [showVincular, setShowVincular] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioRH | null>(null);
  const [role, setRole] = useState<PatrimonioRole>("agente_patrimonio");
  const [secretariaId, setSecretariaId] = useState<string | null>(null);
  const [unidadeId, setUnidadeId] = useState<string | null>(null);
  const { unidades } = useUnidadesAdministrativas(secretariaId || undefined);

  const [removerId, setRemoverId] = useState<string | null>(null);

  const handleSalvar = () => {
    if (!usuario) return toast.error("Selecione um servidor do RH.");
    createVinculo.mutate(
      { user_id: usuario.user_id, role, secretaria_id: secretariaId, unidade_id: unidadeId },
      {
        onSuccess: () => {
          setUsuario(null);
          setUnidadeId(null);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Equipe do Patrimônio</CardTitle>
          <p className="text-sm text-muted-foreground">
            Os servidores são cadastrados exclusivamente pelo RH central. Aqui apenas se define o papel de cada um no Patrimônio.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border p-4 space-y-3">
            <p className="text-sm font-medium">Vincular servidor</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Servidor (RH)</Label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setShowVincular(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {usuario ? usuario.nome : "Buscar servidor do RH"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Papel Patrimonial</Label>
                <Select value={role} onValueChange={(v) => setRole(v as PatrimonioRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PATRIMONIO_ROLE_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secretaria</Label>
                <Select value={secretariaId ?? NONE} onValueChange={(v) => { setSecretariaId(v === NONE ? null : v); setUnidadeId(null); }}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Abrangência municipal</SelectItem>
                    {secretarias.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={unidadeId ?? NONE} onValueChange={(v) => setUnidadeId(v === NONE ? null : v)} disabled={!secretariaId}>
                  <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Todas as unidades</SelectItem>
                    {unidades.map((u: any) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleSalvar} disabled={createVinculo.isPending}>
              {createVinculo.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Vincular à Equipe
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servidor</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vinculos.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Nenhum servidor vinculado.</TableCell></TableRow>
                  ) : vinculos.map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>
                        <div className="font-medium">{v.profiles?.name || "Servidor"}</div>
                        <div className="text-xs text-muted-foreground">{v.profiles?.email || "—"}</div>
                      </TableCell>
                      <TableCell>{PATRIMONIO_ROLE_LABELS[v.role]}</TableCell>
                      <TableCell><Badge variant={v.is_active ? "default" : "secondary"}>{v.is_active ? "Ativo" : "Inativo"}</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          title={v.is_active ? "Desativar" : "Reativar"}
                          onClick={() => updateVinculo.mutate({ id: v.id, is_active: !v.is_active })}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" title="Remover vínculo" onClick={() => setRemoverId(v.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <VincularUsuarioRH
        open={showVincular}
        onOpenChange={setShowVincular}
        onUsuarioSelecionado={(u) => setUsuario(u)}
        titulo="Vincular Servidor ao Patrimônio"
      />

      <Dialog open={!!removerId} onOpenChange={(o) => !o && setRemoverId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover vínculo patrimonial</DialogTitle>
            <DialogDescription>
              O papel patrimonial será removido. O servidor permanece cadastrado no RH central.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoverId(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={deleteVinculo.isPending}
              onClick={() => removerId && deleteVinculo.mutate(removerId, { onSuccess: () => setRemoverId(null) })}
            >
              {deleteVinculo.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
