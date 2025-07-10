import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNotas, type Nota } from "@/hooks/useNotas";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurmas } from "@/hooks/useTurmas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useProfessores } from "@/hooks/useProfessores";

type NotaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nota?: Nota | null;
  onClose: () => void;
};

export function NotaDialog({ open, onOpenChange, nota, onClose }: NotaDialogProps) {
  const [formData, setFormData] = useState({
    aluno_id: "",
    disciplina_id: "",
    professor_id: "",
    turma_id: "",
    bimestre: 1,
    ano_letivo: new Date().getFullYear(),
    nota: 0,
    data_avaliacao: new Date().toISOString().split('T')[0],
    observacoes: "",
    tipo_avaliacao: "prova"
  });

  const { createNota, updateNota } = useNotas();
  const { alunos } = useAlunos();
  const { turmas } = useTurmas();
  const { disciplinas } = useDisciplinas();
  const { professores } = useProfessores();

  useEffect(() => {
    if (nota) {
      setFormData({
        aluno_id: nota.aluno_id,
        disciplina_id: nota.disciplina_id,
        professor_id: nota.professor_id,
        turma_id: nota.turma_id,
        bimestre: nota.bimestre,
        ano_letivo: nota.ano_letivo,
        nota: nota.nota || 0,
        data_avaliacao: nota.data_avaliacao || new Date().toISOString().split('T')[0],
        observacoes: nota.observacoes || "",
        tipo_avaliacao: nota.tipo_avaliacao
      });
    } else {
      setFormData({
        aluno_id: "",
        disciplina_id: "",
        professor_id: "",
        turma_id: "",
        bimestre: 1,
        ano_letivo: new Date().getFullYear(),
        nota: 0,
        data_avaliacao: new Date().toISOString().split('T')[0],
        observacoes: "",
        tipo_avaliacao: "prova"
      });
    }
  }, [nota]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (nota) {
        await updateNota(nota.id, formData);
        toast.success("Nota atualizada com sucesso!");
      } else {
        await createNota(formData);
        toast.success("Nota lançada com sucesso!");
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast.error("Erro ao salvar nota. Tente novamente.");
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
            {nota ? "Editar Nota" : "Lançar Nova Nota"}
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
              <Label htmlFor="bimestre">Bimestre</Label>
              <Select 
                value={formData.bimestre.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, bimestre: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Bimestre</SelectItem>
                  <SelectItem value="2">2º Bimestre</SelectItem>
                  <SelectItem value="3">3º Bimestre</SelectItem>
                  <SelectItem value="4">4º Bimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano_letivo">Ano Letivo</Label>
              <Input
                id="ano_letivo"
                type="number"
                min="2020"
                max="2030"
                value={formData.ano_letivo}
                onChange={(e) => setFormData(prev => ({ ...prev, ano_letivo: parseInt(e.target.value) }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="nota">Nota (0-10)</Label>
              <Input
                id="nota"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.nota}
                onChange={(e) => setFormData(prev => ({ ...prev, nota: parseFloat(e.target.value) }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo_avaliacao">Tipo de Avaliação</Label>
              <Select 
                value={formData.tipo_avaliacao} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_avaliacao: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prova">Prova</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="seminario">Seminário</SelectItem>
                  <SelectItem value="participacao">Participação</SelectItem>
                  <SelectItem value="exercicio">Exercício</SelectItem>
                  <SelectItem value="projeto">Projeto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_avaliacao">Data da Avaliação</Label>
              <Input
                id="data_avaliacao"
                type="date"
                value={formData.data_avaliacao}
                onChange={(e) => setFormData(prev => ({ ...prev, data_avaliacao: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre a avaliação..."
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {nota ? "Atualizar" : "Lançar"} Nota
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}