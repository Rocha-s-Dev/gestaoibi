import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Loader2 } from "lucide-react";
import { useTurmaProfessores } from "@/hooks/useProfessorTurmas";
import { useTurmaAuxiliares } from "@/hooks/useAuxiliarTurmas";

type TurmaDetalhesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turma: { id: string; nome: string; serie: string } | null;
};

export function TurmaDetalhesDialog({ open, onOpenChange, turma }: TurmaDetalhesDialogProps) {
  const { professores, loading: loadingProf } = useTurmaProfessores(turma?.id);
  const { auxiliares, loading: loadingAux } = useTurmaAuxiliares(turma?.id);

  if (!turma) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Equipe da Turma: {turma.nome}</DialogTitle>
          <DialogDescription>{turma.serie}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Professores */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Professores</h3>
            {loadingProf ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" />Carregando...</div>
            ) : professores.length > 0 ? (
              <div className="space-y-2">
                {professores.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                    <div>
                      <p className="font-medium text-sm">{p.professor?.profiles?.name || "Professor"}</p>
                      {p.disciplina?.nome && <p className="text-xs text-muted-foreground">{p.disciplina.nome}</p>}
                    </div>
                    {p.turno && <Badge variant="outline" className="text-xs capitalize">{p.turno}</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum professor vinculado a esta turma.</p>
            )}
          </div>

          {/* Auxiliares */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4" />Auxiliares</h3>
            {loadingAux ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="h-4 w-4 animate-spin" />Carregando...</div>
            ) : auxiliares.length > 0 ? (
              <div className="space-y-2">
                {auxiliares.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                    <div>
                      <p className="font-medium text-sm">{a.auxiliar?.profiles?.name || "Auxiliar"}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.tipo_auxiliar === "auxiliar_aluno_especial" ? "Auxiliar Especial" : "Auxiliar de Turma"}
                        {a.aluno?.nome && ` — Aluno: ${a.aluno.nome}`}
                      </p>
                    </div>
                    {a.turno && <Badge variant="outline" className="text-xs capitalize">{a.turno}</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum auxiliar vinculado a esta turma.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
