import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, User } from "lucide-react";
import { useEscolas } from "@/hooks/useEscolas";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { Professor } from "@/hooks/useProfessores";

type ProfessorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { user_id: string; especialidade?: string; escola_id?: string; secretaria_id?: string }) => void;
  professor?: Professor | null;
};

export function ProfessorDialog({ open, onOpenChange, onSubmit, professor }: ProfessorDialogProps) {
  const { escolas } = useEscolas();
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioRH | null>(null);
  const [especialidade, setEspecialidade] = useState(professor?.especialidade || "");
  const [escolaId, setEscolaId] = useState(professor?.escola_id || "");

  const handleUsuarioSelecionado = (usuario: UsuarioRH) => {
    setUsuarioSelecionado(usuario);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = professor ? professor.user_id : usuarioSelecionado?.user_id;
    if (!userId) return;

    onSubmit({
      user_id: userId,
      especialidade: especialidade || undefined,
      escola_id: escolaId || undefined,
    });
    
    // Reset
    setUsuarioSelecionado(null);
    setEspecialidade("");
    setEscolaId("");
    onOpenChange(false);
  };

  const isEditing = !!professor;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {isEditing ? "Editar Vínculo de Professor" : "Vincular Professor do RH"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize os dados do vínculo do professor."
                : "Selecione um servidor cadastrado pelo RH e defina seu vínculo como professor."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção de Usuário do RH */}
            {!isEditing && (
              <div className="space-y-2">
                <Label>Servidor do RH *</Label>
                {usuarioSelecionado ? (
                  <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{usuarioSelecionado.nome}</p>
                        <p className="text-sm text-muted-foreground">{usuarioSelecionado.email}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVinculoDialogOpen(true)}
                    >
                      Alterar
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setVinculoDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Selecionar Servidor do RH
                  </Button>
                )}
              </div>
            )}

            {isEditing && (
              <div className="p-3 border rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{professor.nome}</p>
                    <p className="text-sm text-muted-foreground">{professor.email}</p>
                    {professor.cpf && (
                      <Badge variant="outline" className="text-xs mt-1">
                        CPF: {professor.cpf}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dados do vínculo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade / Área</Label>
                <Input
                  id="especialidade"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Ex: Matemática, Português..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escola_id">Escola</Label>
                <Select
                  value={escolaId || "none"}
                  onValueChange={(value) => setEscolaId(value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma escola" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma escola</SelectItem>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isEditing && !usuarioSelecionado}>
                {isEditing ? "Atualizar" : "Vincular"} Professor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={vinculoDialogOpen}
        onOpenChange={setVinculoDialogOpen}
        onUsuarioSelecionado={handleUsuarioSelecionado}
        titulo="Selecionar Servidor para Professor"
        descricao="Busque um servidor cadastrado pelo RH para vinculá-lo como professor."
      />
    </>
  );
}
