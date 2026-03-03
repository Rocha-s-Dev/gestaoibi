import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNotas, type Nota } from "@/hooks/useNotas";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurmas } from "@/hooks/useTurmas";
import { useDisciplinas } from "@/hooks/useDisciplinas";

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
    turma_id: "",
    trimestre: 1,
    ano_letivo: new Date().getFullYear(),
    nota: 0,
    observacoes: "",
    fechada: false
  });

  const { createNota, updateNota } = useNotas();
  const { alunos } = useAlunos();
  const { turmas } = useTurmas();
  const { disciplinas } = useDisciplinas();

  useEffect(() => {
    if (nota) {
      setFormData({
        aluno_id: nota.aluno_id,
        disciplina_id: nota.disciplina_id,
        turma_id: nota.turma_id || "",
        trimestre: nota.trimestre,
        ano_letivo: nota.ano_letivo || new Date().getFullYear(),
        nota: nota.nota || 0,
        observacoes: nota.observacoes || "",
        fechada: nota.fechada || false
      });
    } else {
      setFormData({
        aluno_id: "",
        disciplina_id: "",
        turma_id: "",
        trimestre: 1,
        ano_letivo: new Date().getFullYear(),
        nota: 0,
        observacoes: "",
        fechada: false
      });
    }
  }, [nota]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const notaData = {
        aluno_id: formData.aluno_id,
        disciplina_id: formData.disciplina_id,
        turma_id: formData.turma_id || null,
        trimestre: formData.trimestre,
        ano_letivo: formData.ano_letivo,
        nota: formData.nota,
        observacoes: formData.observacoes || null,
        fechada: formData.fechada
      };

      if (nota) {
        await updateNota(nota.id, notaData);
        toast.success("Nota atualizada com sucesso!");
      } else {
        await createNota(notaData);
        toast.success("Nota lançada com sucesso!");
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast.error("Erro ao salvar nota. Tente novamente.");
    }
  };

  const alunosFiltrados = alunos.filter(aluno => 
    !formData.turma_id || aluno.turma_id === formData.turma_id
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
              <Label htmlFor="aluno_id">Aluno *</Label>
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
              <Label htmlFor="disciplina_id">Disciplina *</Label>
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
              <Label htmlFor="trimestre">Trimestre *</Label>
              <Select 
                value={formData.trimestre.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, trimestre: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1º Trimestre</SelectItem>
                  <SelectItem value="2">2º Trimestre</SelectItem>
                  <SelectItem value="3">3º Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano_letivo">Ano Letivo *</Label>
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
              <Label htmlFor="nota">Nota (0-10) *</Label>
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

          <div className="flex items-center space-x-2">
            <Switch
              id="fechada"
              checked={formData.fechada}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fechada: checked }))}
            />
            <Label htmlFor="fechada">Nota fechada (não pode ser alterada pelo professor)</Label>
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
