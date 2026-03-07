import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, User, BookMarked, Plus, Trash2 } from "lucide-react";
import { useEscolas } from "@/hooks/useEscolas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useProfessorDisciplinas } from "@/hooks/useProfessorDisciplinas";
import { useProfessorTurmas } from "@/hooks/useProfessorTurmas";
import { useTurmas } from "@/hooks/useTurmas";
import { VincularUsuarioRH } from "@/components/shared/VincularUsuarioRH";
import { UsuarioRH } from "@/hooks/useUsuariosRH";
import { Professor } from "@/hooks/useProfessores";
import { toast } from "sonner";

const TIPOS_PROFESSOR: Record<string, string> = {
  professor_regente: "Professor Regente",
  professor_ed_fisica: "Professor de Educação Física",
  professor_arte: "Professor de Arte",
  professor_ingles: "Professor de Inglês",
  professor_aee: "Professor de AEE",
  professor_reforco: "Professor de Reforço Escolar",
  professor_substituto: "Professor Substituto",
  professor_temporario: "Professor Temporário",
};

type ProfessorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { user_id: string; especialidade?: string; escola_id?: string; secretaria_id?: string; funcao_educacional?: string; tipo_professor?: string; status?: string; data_inicio?: string }) => void;
  professor?: Professor | null;
};

export function ProfessorDialog({ open, onOpenChange, onSubmit, professor }: ProfessorDialogProps) {
  const { escolas } = useEscolas();
  const { disciplinas } = useDisciplinas();
  const { turmas } = useTurmas();
  const { disciplinaIds, saveDisciplinas } = useProfessorDisciplinas(professor?.id);
  const { vinculos, addVinculo, removeVinculo } = useProfessorTurmas(professor?.id);

  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioRH | null>(null);
  const [especialidade, setEspecialidade] = useState("");
  const [escolaId, setEscolaId] = useState("");
  const [funcaoEducacional, setFuncaoEducacional] = useState("professor");
  const [tipoProfessor, setTipoProfessor] = useState("professor_regente");
  const [status, setStatus] = useState("ativo");
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split("T")[0]);
  const [selectedDisciplinaIds, setSelectedDisciplinaIds] = useState<string[]>([]);

  // New turma vinculo state
  const [newTurmaId, setNewTurmaId] = useState("");
  const [newDisciplinaId, setNewDisciplinaId] = useState("");
  const [newTurno, setNewTurno] = useState("");

  useEffect(() => {
    if (professor?.id) setSelectedDisciplinaIds(disciplinaIds);
  }, [disciplinaIds, professor?.id]);

  useEffect(() => {
    if (professor) {
      setEspecialidade(professor.especialidade || "");
      setEscolaId(professor.escola_id || "");
      setFuncaoEducacional(professor.funcao_educacional || "professor");
      setTipoProfessor(professor.tipo_professor || "professor_regente");
      setStatus(professor.status || "ativo");
      setDataInicio(professor.data_inicio || new Date().toISOString().split("T")[0]);
    } else {
      setEspecialidade(""); setEscolaId(""); setFuncaoEducacional("professor");
      setTipoProfessor("professor_regente"); setStatus("ativo");
      setDataInicio(new Date().toISOString().split("T")[0]);
      setSelectedDisciplinaIds([]);
    }
  }, [professor]);

  const toggleDisciplina = (id: string) => {
    setSelectedDisciplinaIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleAddTurmaVinculo = async () => {
    if (!professor?.id || !newTurmaId) return;
    try {
      await addVinculo({ professor_id: professor.id, turma_id: newTurmaId, disciplina_id: newDisciplinaId || undefined, turno: newTurno || undefined });
      setNewTurmaId(""); setNewDisciplinaId(""); setNewTurno("");
      toast.success("Turma vinculada!");
    } catch { toast.error("Erro ao vincular turma."); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = professor ? professor.user_id : usuarioSelecionado?.user_id;
    if (!userId) return;

    onSubmit({
      user_id: userId,
      especialidade: especialidade || undefined,
      escola_id: escolaId || undefined,
      funcao_educacional: funcaoEducacional,
      tipo_professor: tipoProfessor,
      status,
      data_inicio: dataInicio,
    });

    if (professor?.id) {
      try { await saveDisciplinas(professor.id, selectedDisciplinaIds); } catch { toast.error("Erro ao salvar matérias."); }
    }

    setUsuarioSelecionado(null);
    onOpenChange(false);
  };

  const isEditing = !!professor;
  const escolaTurmas = turmas.filter(t => !escolaId || t.escola_id === escolaId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {isEditing ? "Editar Professor" : "Vincular Professor/Coordenador do RH"}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? "Atualize os dados do vínculo." : "Selecione um servidor cadastrado pelo RH."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Seleção de servidor */}
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
                    <p className="font-medium">{professor.nome}</p>
                    <p className="text-sm text-muted-foreground">{professor.email}</p>
                    {professor.cpf && <Badge variant="outline" className="text-xs mt-1">CPF: {professor.cpf}</Badge>}
                  </div>
                </div>
              </div>
            )}

            {/* Campos principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Função *</Label>
                <Select value={funcaoEducacional} onValueChange={setFuncaoEducacional}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Professor(a)</SelectItem>
                    <SelectItem value="coordenador">Coordenador(a)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Professor *</Label>
                <Select value={tipoProfessor} onValueChange={setTipoProfessor}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPOS_PROFESSOR).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Escola *</Label>
                <Select value={escolaId} onValueChange={setEscolaId}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma escola" /></SelectTrigger>
                  <SelectContent>
                    {escolas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Especialidade / Área</Label>
                <Input value={especialidade} onChange={e => setEspecialidade(e.target.value)} placeholder="Ex: Matemática..." />
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

            {/* Matérias */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2"><BookMarked className="h-4 w-4" />Matérias que leciona</Label>
              {disciplinas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma matéria cadastrada.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {disciplinas.map(disc => (
                    <div key={disc.id} className="flex items-center space-x-2">
                      <Checkbox id={`disc-${disc.id}`} checked={selectedDisciplinaIds.includes(disc.id)} onCheckedChange={() => toggleDisciplina(disc.id)} />
                      <label htmlFor={`disc-${disc.id}`} className="text-sm cursor-pointer">{disc.nome}</label>
                    </div>
                  ))}
                </div>
              )}
              {selectedDisciplinaIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedDisciplinaIds.map(id => { const d = disciplinas.find(x => x.id === id); return d ? <Badge key={id} variant="secondary" className="text-xs">{d.nome}</Badge> : null; })}
                </div>
              )}
            </div>

            {/* Turmas vinculadas (somente edição) */}
            {isEditing && (
              <div className="space-y-3">
                <Label className="font-semibold">Turmas que leciona</Label>
                {vinculos.length > 0 && (
                  <div className="space-y-2">
                    {vinculos.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/20 text-sm">
                        <div>
                          <span className="font-medium">{v.turma?.nome || "Turma"}</span>
                          {v.disciplina?.nome && <span className="text-muted-foreground"> — {v.disciplina.nome}</span>}
                          {v.turno && <Badge variant="outline" className="ml-2 text-xs capitalize">{v.turno}</Badge>}
                        </div>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeVinculo(v.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Turma</Label>
                    <Select value={newTurmaId} onValueChange={setNewTurmaId}>
                      <SelectTrigger><SelectValue placeholder="Turma" /></SelectTrigger>
                      <SelectContent>{escolaTurmas.map(t => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Disciplina</Label>
                    <Select value={newDisciplinaId} onValueChange={setNewDisciplinaId}>
                      <SelectTrigger><SelectValue placeholder="Disciplina" /></SelectTrigger>
                      <SelectContent>{disciplinas.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
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
                    <Plus className="h-4 w-4 mr-1" />Adicionar
                  </Button>
                </div>
              </div>
            )}

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
        onUsuarioSelecionado={(u) => setUsuarioSelecionado(u)}
        titulo="Selecionar Servidor para Educação"
        descricao="Busque um servidor cadastrado pelo RH para vinculá-lo como professor ou coordenador."
      />
    </>
  );
}
