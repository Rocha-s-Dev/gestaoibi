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
import { useVinculosFuncionais, VinculoFuncionalView } from "@/hooks/useVinculosFuncionais";
import { useCargosSecretaria } from "@/hooks/useCargosSecretaria";
import { useEscolas } from "@/hooks/useEscolas";
import { useUnidadesSaude } from "@/hooks/useUnidadesSaude";
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

// Known secretaria IDs
const SME_ID = "79afaec7-100b-4c39-80d9-84346f862206";
const SMS_ID = "19d25d5c-f41c-4a8e-9152-4926296d36b8";

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
  const { escolas, loading: escolasLoading } = useEscolas();
  const { unidades: unidadesSaude, isLoading: unidadesLoading } = useUnidadesSaude();
  const [showVincular, setShowVincular] = useState(false);
  const [vinculoToDelete, setVinculoToDelete] = useState<string | null>(null);

  // Cargo + location selection dialog state
  const [cargoDialogOpen, setCargoDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<UsuarioRH | null>(null);
  const [selectedCargoId, setSelectedCargoId] = useState<string>("");
  const [selectedLocalId, setSelectedLocalId] = useState<string>("sede");

  const isEducacao = effectiveSecretariaId === SME_ID;
  const isSaude = effectiveSecretariaId === SMS_ID;
  const needsLocal = isEducacao || isSaude;

  const handleUsuarioSelecionado = (usuario: UsuarioRH) => {
    if (!effectiveSecretariaId) {
      toast.error("Selecione uma secretaria antes de vincular funcionários.");
      return;
    }

    const jaVinculado = vinculos?.some((v) => v.user_id === usuario.user_id);
    if (jaVinculado) {
      toast.warning("Este servidor já está vinculado a esta secretaria.");
      return;
    }

    setSelectedUsuario(usuario);
    setSelectedCargoId("");
    setSelectedLocalId("sede");
    setShowVincular(false);
    setCargoDialogOpen(true);
  };

  const handleConfirmVinculo = () => {
    if (!selectedUsuario || !effectiveSecretariaId) return;

    const vinculoData: Record<string, any> = {
      user_id: selectedUsuario.user_id,
      secretaria_id: effectiveSecretariaId,
      situacao: "ativo",
      is_primary: false,
      data_admissao: new Date().toISOString().split("T")[0],
    };

    if (selectedCargoId) {
      vinculoData.cargo_secretaria_id = selectedCargoId;
    }

    if (needsLocal && selectedLocalId !== "sede") {
      if (isEducacao) {
        vinculoData.escola_id = selectedLocalId;
      } else if (isSaude) {
        vinculoData.unidade_saude_id = selectedLocalId;
      }
    }

    createVinculo.mutate(vinculoData);
    setCargoDialogOpen(false);
    setSelectedUsuario(null);
    setSelectedCargoId("");
    setSelectedLocalId("sede");
  };

  const handleDelete = () => {
    if (vinculoToDelete) {
      deleteVinculo.mutate(vinculoToDelete);
      setVinculoToDelete(null);
    }
  };

  const nivelLabels: Record<string, string> = {
    estrategico: "Estratégico",
    gerencial: "Gerencial",
    operacional: "Operacional",
    apoio: "Apoio",
  };

  const getCargoNome = (vinculo: VinculoFuncionalView) => {
    return vinculo.cargo_secretaria_nome || vinculo.cargo_publico_nome || "—";
  };

  const getLocalNome = (vinculo: VinculoFuncionalView) => {
    if (vinculo.escola_nome) return vinculo.escola_nome;
    if (vinculo.unidade_saude_nome) return vinculo.unidade_saude_nome;
    if (isEducacao || isSaude) return "Secretaria (sede)";
    return "—";
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
                  {needsLocal && <TableHead>Local</TableHead>}
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vinculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{v.profile_nome || "—"}</p>
                        <p className="text-xs text-muted-foreground">{v.profile_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getCargoNome(v)}</TableCell>
                    <TableCell>{v.funcao_nome || "—"}</TableCell>
                    {needsLocal && <TableCell>{getLocalNome(v)}</TableCell>}
                    <TableCell>{v.matricula || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={v.situacao === "ativo" ? "default" : "secondary"}>
                        {v.situacao}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setVinculoToDelete(v.id)}>
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

      {/* Cargo + location selection dialog */}
      <Dialog open={cargoDialogOpen} onOpenChange={(open) => { if (!open) { setCargoDialogOpen(false); setSelectedUsuario(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selecionar Cargo{needsLocal ? " e Local" : ""}</DialogTitle>
            <DialogDescription>
              Servidor: <strong>{selectedUsuario?.nome}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
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

            {needsLocal && (
              <div className="space-y-2">
                <Label>Local de Trabalho <span className="text-destructive">*</span></Label>
                <Select value={selectedLocalId} onValueChange={setSelectedLocalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sede">Secretaria (sede)</SelectItem>
                    {isEducacao && escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                    {isSaude && unidadesSaude.map((unidade) => (
                      <SelectItem key={unidade.id!} value={unidade.id!}>
                        {unidade.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
