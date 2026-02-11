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
  onSubmit: (data: { user_id: string; especialidade?: string; escola_id?: string; secretaria_id?: string; funcao_educacional?: string }) => void;
  professor?: Professor | null;
};

export function ProfessorDialog({ open, onOpenChange, onSubmit, professor }: ProfessorDialogProps) {
  const { escolas } = useEscolas();
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioRH | null>(null);
  const [especialidade, setEspecialidade] = useState(professor?.especialidade || "");
  const [escolaId, setEscolaId] = useState(professor?.escola_id || "");
  const [funcaoEducacional, setFuncaoEducacional] = useState(professor?.funcao_educacional || "professor");

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
      funcao_educacional: funcaoEducacional,
    });
    
    setUsuarioSelecionado(null);
    setEspecialidade("");
    setEscolaId("");
    setFuncaoEducacional("professor");
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
              {isEditing ? "Editar Vínculo de Professor" : "Vincular Professor/Coordenador do RH"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Atualize os dados do vínculo."
                : "Selecione um servidor cadastrado pelo RH e defina seu vínculo como professor ou coordenador."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Button type="button" variant="outline" size="sm" onClick={() => setVinculoDialogOpen(true)}>
                      Alterar
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setVinculoDialogOpen(true)}>
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
                      <Badge variant="outline" className="text-xs mt-1">CPF: {professor.cpf}</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="funcao_educacional">Função *</Label>
                <Select value={funcaoEducacional} onValueChange={setFuncaoEducacional}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Professor(a)</SelectItem>
                    <SelectItem value="coordenador">Coordenador(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                <Label htmlFor="escola_id">Escola *</Label>
                <Select value={escolaId} onValueChange={setEscolaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>{escola.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!escolaId && (
                  <p className="text-xs text-destructive">Escola é obrigatória para Professor/Coordenador.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={(!isEditing && !usuarioSelecionado) || !escolaId}>
                {isEditing ? "Atualizar" : "Vincular"} {funcaoEducacional === "coordenador" ? "Coordenador" : "Professor"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={vinculoDialogOpen}
        onOpenChange={setVinculoDialogOpen}
        onUsuarioSelecionado={handleUsuarioSelecionado}
        titulo="Selecionar Servidor para Educação"
        descricao="Busque um servidor cadastrado pelo RH para vinculá-lo como professor ou coordenador."
      />
    </>
  );
}
