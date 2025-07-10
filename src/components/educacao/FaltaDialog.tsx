import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useFaltas, type Falta } from "@/hooks/useFaltas";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurmas } from "@/hooks/useTurmas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useProfessores } from "@/hooks/useProfessores";

type FaltaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  falta?: Falta | null;
  onClose: () => void;
};

export function FaltaDialog({ open, onOpenChange, falta, onClose }: FaltaDialogProps) {
  const [formData, setFormData] = useState({
    aluno_id: "",
    disciplina_id: "",
    professor_id: "",
    turma_id: "",
    data_falta: new Date().toISOString().split('T')[0],
    tipo: "injustificada" as "justificada" | "injustificada",
    justificativa: ""
  });

  const { createFalta, updateFalta } = useFaltas();
  const { alunos } = useAlunos();
  const { turmas } = useTurmas();
  const { disciplinas } = useDisciplinas();
  const { professores } = useProfessores();

  useEffect(() => {
    if (falta) {
      setFormData({
        aluno_id: falta.aluno_id,
        disciplina_id: falta.disciplina_id,
        professor_id: falta.professor_id,
        turma_id: falta.turma_id,
        data_falta: falta.data_falta,
        tipo: falta.tipo,
        justificativa: falta.justificativa || ""
      });
    } else {
      setFormData({
        aluno_id: "",
        disciplina_id: "",
        professor_id: "",
        turma_id: "",
        data_falta: new Date().toISOString().split('T')[0],
        tipo: "injustificada",
        justificativa: ""
      });
    }
  }, [falta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (falta) {
        await updateFalta(falta.id, formData);
        toast.success("Falta atualizada com sucesso!");
      } else {
        await createFalta(formData);
        toast.success("Falta registrada com sucesso!");
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar falta:', error);
      toast.error("Erro ao salvar falta. Tente novamente.");
    }
  };

  // Filtrar alunos pela turma selecionada
  const alunosFiltrados = alunos.filter(aluno => 
    !formData.turma_id || aluno.turma_atual_id === formData.turma_id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {falta ? "Editar Falta" : "Registrar Nova Falta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="turma_id">Turma</Label>
              <Select 
                value={formData.turma_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, turma_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.serie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="aluno_id">Aluno</Label>
              <Select 
                value={formData.aluno_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, aluno_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunosFiltrados.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome} ({aluno.numero_matricula})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="disciplina_id">Disciplina</Label>
              <Select 
                value={formData.disciplina_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, disciplina_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a disciplina" />
                </SelectTrigger>
                <SelectContent>
                  {disciplinas.map((disciplina) => (
                    <SelectItem key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="professor_id">Professor</Label>
              <Select 
                value={formData.professor_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, professor_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o professor" />
                </SelectTrigger>
                <SelectContent>
                  {professores.map((professor) => (
                    <SelectItem key={professor.id} value={professor.id}>
                      {professor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_falta">Data da Falta</Label>
              <Input
                id="data_falta"
                type="date"
                value={formData.data_falta}
                onChange={(e) => setFormData(prev => ({ ...prev, data_falta: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label>Tipo de Falta</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value as "justificada" | "injustificada" }))}
              className="flex space-x-6 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="injustificada" id="injustificada" />
                <Label htmlFor="injustificada" className="text-red-600">Injustificada</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="justificada" id="justificada" />
                <Label htmlFor="justificada" className="text-yellow-600">Justificada</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.tipo === 'justificada' && (
            <div>
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea
                id="justificativa"
                placeholder="Descreva o motivo da justificativa..."
                value={formData.justificativa}
                onChange={(e) => setFormData(prev => ({ ...prev, justificativa: e.target.value }))}
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {falta ? "Atualizar" : "Registrar"} Falta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}