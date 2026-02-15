import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserPlus, Users, Loader2, Trash2 } from "lucide-react";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { useVinculosFuncionais } from "@/hooks/useVinculosFuncionais";
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
  const [showVincular, setShowVincular] = useState(false);
  const [vinculoToDelete, setVinculoToDelete] = useState<string | null>(null);

  const handleUsuarioSelecionado = (usuario: UsuarioRH) => {
    if (!effectiveSecretariaId) {
      toast.error("Selecione uma secretaria antes de vincular funcionários.");
      return;
    }

    // Check if already linked
    const jaVinculado = vinculos?.some((v: any) => v.user_id === usuario.user_id);
    if (jaVinculado) {
      toast.warning("Este servidor já está vinculado a esta secretaria.");
      return;
    }

    createVinculo.mutate({
      user_id: usuario.user_id,
      secretaria_id: effectiveSecretariaId,
      situacao: "ativo",
      is_primary: false,
      data_admissao: new Date().toISOString().split("T")[0],
    });
  };

  const handleDelete = () => {
    if (vinculoToDelete) {
      deleteVinculo.mutate(vinculoToDelete);
      setVinculoToDelete(null);
    }
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
                    <TableCell>{v.cargos_publicos?.nome || "—"}</TableCell>
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
