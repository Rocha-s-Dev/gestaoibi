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

type FaltaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  falta?: Falta | null;
  onClose: () => void;
};

export function FaltaDialog({ open, onOpenChange, falta, onClose }: FaltaDialogProps) {
  const [formData, setFormData] = useState({
    aluno_id: "",
    data: new Date().toISOString().split('T')[0],
    justificada: false,
    motivo: ""
  });

  const { createFalta, updateFalta } = useFaltas();
  const { alunos } = useAlunos();

  useEffect(() => {
    if (falta) {
      setFormData({
        aluno_id: falta.aluno_id,
        data: falta.data,
        justificada: falta.justificada || false,
        motivo: falta.motivo || ""
      });
    } else {
      setFormData({
        aluno_id: "",
        data: new Date().toISOString().split('T')[0],
        justificada: false,
        motivo: ""
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {falta ? "Editar Falta" : "Registrar Nova Falta"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                {alunos.map((aluno) => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.nome} ({aluno.numero_matricula})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data">Data da Falta</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label>Tipo de Falta</Label>
            <RadioGroup
              value={formData.justificada ? "justificada" : "injustificada"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, justificada: value === "justificada" }))}
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

          {formData.justificada && (
            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Textarea
                id="motivo"
                placeholder="Descreva o motivo da justificativa..."
                value={formData.motivo}
                onChange={(e) => setFormData(prev => ({ ...prev, motivo: e.target.value }))}
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
