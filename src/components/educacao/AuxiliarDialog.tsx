import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, User, Plus, Trash2 } from "lucide-react";
import { useEscolas } from "@/hooks/useEscolas";
import { useTurmas } from "@/hooks/useTurmas";
import { useAlunos } from "@/hooks/useAlunos";
import { useAuxiliarTurmas } from "@/hooks/useAuxiliarTurmas";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { AuxiliarClasse } from "@/hooks/useAuxiliaresClasse";
import { toast } from "sonner";

const TIPOS_AUXILIAR: Record<string, string> = {
  auxiliar_turma: "Auxiliar de Classe (Turma)",
  auxiliar_aluno_especial: "Auxiliar de Aluno com Necessidades Especiais",
};

type AuxiliarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { user_id: string; tipo_profissional?: string; escola_id?: string; status?: string; data_inicio?: string }) => void;
  auxiliar?: AuxiliarClasse | null;
};

export function AuxiliarDialog({ open, onOpenChange, onSubmit, auxiliar }: AuxiliarDialogProps) {
  const { escolas } = useEscolas();
  const { turmas } = useTurmas();
  const { alunos } = useAlunos();
  const { vinculos, addVinculo, removeVinculo } = useAuxiliarTurmas(auxiliar?.id);

  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioRH | null>(null);
  const [tipoProfissional, setTipoProfissional] = useState("auxiliar_turma");
  const [escolaId, setEscolaId] = useState("");
  const [status, setStatus] = useState("ativo");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);

  // New turma vinculo
  const [newTurmaId, setNewTurmaId] = useState("");
  const [newTipoAuxiliar, setNewTipoAuxiliar] = useState("auxiliar_turma");
  const [newAlunoId, setNewAlunoId] = useState("");
  const [newTurno, setNewTurno] = useState("");

  useEffect(() => {
    if (auxiliar) {
      setTipoProfissional(auxiliar.tipo_profissional || "auxiliar_turma");
      setEscolaId(auxiliar.escola_id || "");
      setStatus(auxiliar.status || "ativo");
      setDataInicio(auxiliar.data_inicio || new Date().toISOString().split("T")[0]);
    } else {
      setTipoProfissional("auxiliar_turma"); setEscolaId(""); setStatus("ativo");
      setDataInicio(new Date().toISOString().split("T")[0]);
    }
  }, [auxiliar]);

  const handleAddTurmaVinculo = async () => {
    if (!auxiliar?.id || !newTurmaId) return;
    try {
      await addVinculo({
        auxiliar_id: auxiliar.id,
        turma_id: newTurmaId,
        tipo_auxiliar: newTipoAuxiliar,
        aluno_id: newTipoAuxiliar === "auxiliar_aluno_especial" && newAlunoId ? newAlunoId : undefined,
        turno: newTurno || undefined,
      });
      setNewTurmaId(""); setNewAlunoId(""); setNewTurno("");
      toast.success("Turma vinculada!");
    } catch { toast.error("Erro ao vincular turma."); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userId = auxiliar ? auxiliar.user_id : usuarioSelecionado?.user_id;
    if (!userId) return;
    onSubmit({ user_id: userId, tipo_profissional: tipoProfissional, escola_id: escolaId || undefined, status, data_inicio: dataInicio });
    setUsuarioSelecionado(null);
    onOpenChange(false);
  };

  const isEditing = !!auxiliar;
  const escolaTurmas = turmas.filter(t => !escolaId || t.escola_id === escolaId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {isEditing ? "Editar Auxiliar" : "Vincular Auxiliar de Classe"}
            </DialogTitle>
            <DialogDescription>{isEditing ? "Atualize os dados do auxiliar." : "Selecione um servidor do RH."}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                    <Button type="button" variant="outline" size="sm" onClick={() => setVinculoDialogOpen(true)}>Alterar</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setVinculoDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />Selecionar Servidor do RH
                  </Button>
                )}
              </div>
            )}

            {isEditing && (
              <div className="p-3 border rounded-md bg-muted/30">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">{auxiliar.nome}</p>
                    <p className="text-sm text-muted-foreground">{auxiliar.email}</p>
                    {auxiliar.cpf && <Badge variant="outline" className="text-xs mt-1">CPF: {auxiliar.cpf}</Badge>}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select value={tipoProfissional} onValueChange={setTipoProfissional}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPOS_AUXILIAR).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Escola</Label>
                <Select value={escolaId} onValueChange={setEscolaId}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma escola" /></SelectTrigger>
                  <SelectContent>{escolas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                    <SelectItem value="desligado">Desligado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
              </div>
            </div>

            {/* Turmas vinculadas (somente edição) */}
            {isEditing && (
              <div className="space-y-3">
                <Label className="font-semibold">Turmas vinculadas</Label>
                {vinculos.length > 0 && (
                  <div className="space-y-2">
                    {vinculos.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/20 text-sm">
                        <div>
                          <span className="font-medium">{v.turma?.nome || "Turma"}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{v.tipo_auxiliar === "auxiliar_aluno_especial" ? "Auxiliar Especial" : "Auxiliar de Turma"}</Badge>
                          {v.aluno?.nome && <span className="text-muted-foreground ml-2">— Aluno: {v.aluno.nome}</span>}
                          {v.turno && <Badge variant="outline" className="ml-2 text-xs capitalize">{v.turno}</Badge>}
                        </div>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeVinculo(v.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Turma</Label>
                    <Select value={newTurmaId} onValueChange={setNewTurmaId}>
                      <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
                      <SelectContent>{escolaTurmas.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select value={newTipoAuxiliar} onValueChange={setNewTipoAuxiliar}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auxiliar_turma">Auxiliar Turma</SelectItem>
                        <SelectItem value="auxiliar_aluno_especial">Auxiliar Especial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newTipoAuxiliar === "auxiliar_aluno_especial" && (
                    <div className="space-y-1">
                      <Label className="text-xs">Aluno</Label>
                      <Select value={newAlunoId} onValueChange={setNewAlunoId}>
                        <SelectTrigger><SelectValue placeholder="Aluno" /></SelectTrigger>
                        <SelectContent>{alunos.filter(a => !newTurmaId || a.turma_id === newTurmaId).map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label className="text-xs">Turno</Label>
                    <Select value={newTurno} onValueChange={setNewTurno}>
                      <SelectTrigger><SelectValue placeholder="Turno" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="matutino">Matutino</SelectItem>
                        <SelectItem value="vespertino">Vespertino</SelectItem>
                        <SelectItem value="noturno">Noturno</SelectItem>
                        <SelectItem value="integral">Integral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" size="sm" onClick={handleAddTurmaVinculo} disabled={!newTurmaId}>
                    <Plus className="h-4 w-4 mr-1" />Vincular
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={!isEditing && !usuarioSelecionado}>
                {isEditing ? "Atualizar" : "Vincular"} Auxiliar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <VincularUsuarioRH
        open={vinculoDialogOpen}
        onOpenChange={setVinculoDialogOpen}
        onUsuarioSelecionado={(u) => setUsuarioSelecionado(u)}
        titulo="Selecionar Servidor para Auxiliar"
        descricao="Busque um servidor cadastrado pelo RH para vinculá-lo como auxiliar de classe."
      />
    </>
  );
}
