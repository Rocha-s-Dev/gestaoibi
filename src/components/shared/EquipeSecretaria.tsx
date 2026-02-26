import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Users, Loader2, Trash2 } from "lucide-react";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { useVinculosFuncionais } from "@/hooks/useVinculosFuncionais";
import { useCargosSecretaria } from "@/hooks/useCargosSecretaria";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { toast } from "sonner";
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

interface EquipeSecretariaProps {
  secretariaId?: string;
  titulo?: string;
  descricao?: string;
}

export function EquipeSecretaria({ secretariaId, titulo, descricao }: EquipeSecretariaProps) {
  const { secretariaAtiva } = useSecretariaContext();
  const effectiveSecretariaId = secretariaId || secretariaAtiva?.id;
  const { vinculos, isLoading, createVinculo, deleteVinculo } = useVinculosFuncionais(effectiveSecretariaId);
  const { cargos, isLoading: cargosLoading } = useCargosSecretaria(effectiveSecretariaId);
  const [showVincular, setShowVincular] = useState(false);
  const [vinculoToDelete, setVinculoToDelete] = useState<string | null>(null);

  // Cargo selection dialog state
  const [cargoDialogOpen, setCargoDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioRH | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string>("");

  const handleUsuarioSelecionado = (usuario: UsuarioRH) => {
    if (!effectiveSecretariaId) {
      toast.error("Selecione uma secretaria antes de vincular funcionários.");
      return;
    }

    const jaVinculado = vinculos?.some((v: any) => v.user_id === usuario.user_id);
    if (jaVinculado) {
      toast.warning("Este servidor já está vinculado a esta secretaria.");
      return;
    }

    setSelectedUsuario(usuario);
    setSelectedCargoId("");
    setShowVincular(false);
    setCargoDialogOpen(true);
  };

  const handleConfirmVinculo = () => {
    if (!selectedUsuario || !effectiveSecretariaId) return;

    createVinculo.mutate({
      user_id: selectedUsuario.user_id,
      secretaria_id: effectiveSecretariaId,
      situacao: "ativo",
      is_primary: false,
      data_admissao: new Date().toISOString().split("T")[0],
      ...(selectedCargoId ? { cargo_secretaria_id: selectedCargoId } : {}),
    } as any);

    setCargoDialogOpen(false);
    setSelectedUsuario(null);
    setSelectedCargoId("");
  };

  const handleDelete = () => {
    if (vinculoToDelete) {
      deleteVinculo.mutate(vinculoToDelete);
      setVinculoToDelete(null);
    }
  };

  // Group cargos by nivel for better display
  const nivelLabels: Record<string, string> = {
    estrategico: "Estratégico",
    gerencial: "Gerencial",
    operacional: "Operacional",
    apoio: "Apoio",
  };

  // Find cargo name from cargos list or from vinculo
  const getCargoNome = (vinculo: any) => {
    if (vinculo.cargo_secretaria_id) {
      const cargo = cargos.find((c) => c.id === vinculo.cargo_secretaria_id);
      if (cargo) return cargo.nome;
    }
    return vinculo.cargos_publicos?.nome || "—";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {titulo || "Equipe da Secretaria"}
            </CardTitle>
            {descricao && <p className="text-sm text-muted-foreground mt-1">{descricao}</p>}
          </div>
          <Button onClick={() => setShowVincular(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Vincular Funcionário
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-muted-foreground">Carregando equipe...</span>
            </div>
          ) : !vinculos || vinculos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Nenhum funcionário vinculado a esta secretaria.</p>
              <p className="text-xs mt-1">Clique em "Vincular Funcionário" para adicionar servidores do RH.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servidor</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vinculos.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {v.profiles?.first_name} {v.profiles?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{v.profiles?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getCargoNome(v)}</TableCell>
                    <TableCell>{v.funcoes_administrativas?.nome || "—"}</TableCell>
                    <TableCell>{v.matricula || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={v.situacao === "ativo" ? "default" : "secondary"}>
                        {v.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setVinculoToDelete(v.id)}
                      >
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
        titulo="Vincular Servidor à Secretaria"
        descricao="Busque e selecione um servidor cadastrado pelo RH para vincular a esta secretaria."
      />

      {/* Cargo selection dialog */}
      <Dialog open={cargoDialogOpen} onOpenChange={(open) => { if (!open) { setCargoDialogOpen(false); setSelectedUsuario(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cargo</DialogTitle>
            <DialogDescription>
              Servidor: <strong>{selectedUsuario?.nome}</strong> — Escolha o cargo para vinculação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Cargo na Secretaria <span className="text-destructive">*</span></Label>
            <Select value={selectedCargoId} onValueChange={setSelectedCargoId}>
              <SelectTrigger>
                <SelectValue placeholder={cargosLoading ? "Carregando..." : "Selecione o cargo"} />
              </SelectTrigger>
              <SelectContent>
                {cargos.map((cargo) => (
                  <SelectItem key={cargo.id} value={cargo.id}>
                    {cargo.nome} ({nivelLabels[cargo.nivel] || cargo.nivel})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCargoDialogOpen(false); setSelectedUsuario(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmVinculo} disabled={!selectedCargoId}>
              Confirmar Vinculação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!vinculoToDelete} onOpenChange={(open) => !open && setVinculoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular Funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este vínculo funcional? O servidor não será excluído do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
