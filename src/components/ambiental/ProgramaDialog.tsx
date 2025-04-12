
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Programa = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  dataInicio: string;
  status: "ativo" | "concluido" | "planejado";
};

interface ProgramaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (programa: Programa) => void;
  programa: Programa | null;
}

const tiposDePrograma = ["Resíduos", "Educação", "Preservação", "Energia", "Água"];

export function ProgramaDialog({ open, onOpenChange, onSave, programa }: ProgramaDialogProps) {
  const [form, setForm] = useState<Programa>({
    id: "",
    titulo: "",
    descricao: "",
    tipo: "",
    dataInicio: new Date().toISOString().split('T')[0],
    status: "planejado",
  });

  const [errors, setErrors] = useState({
    titulo: false,
    descricao: false,
    tipo: false,
  });

  useEffect(() => {
    if (programa) {
      setForm(programa);
    } else {
      setForm({
        id: "",
        titulo: "",
        descricao: "",
        tipo: "",
        dataInicio: new Date().toISOString().split('T')[0],
        status: "planejado",
      });
    }
  }, [programa]);

  const handleChange = (field: keyof Programa, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
    
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: false,
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      titulo: !form.titulo.trim(),
      descricao: !form.descricao.trim(),
      tipo: !form.tipo,
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(form);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{programa ? "Editar Programa" : "Adicionar Programa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              className={errors.titulo ? "border-destructive" : ""}
            />
            {errors.titulo && (
              <p className="text-sm text-destructive">O título é obrigatório</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Programa</Label>
            <Select
              value={form.tipo}
              onValueChange={(value) => handleChange("tipo", value)}
            >
              <SelectTrigger id="tipo" className={errors.tipo ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposDePrograma.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipo && (
              <p className="text-sm text-destructive">O tipo é obrigatório</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => handleChange("status", value as "ativo" | "concluido" | "planejado")}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planejado">Planejado</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={form.dataInicio}
              onChange={(e) => handleChange("dataInicio", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              className={errors.descricao ? "border-destructive" : ""}
              rows={4}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">A descrição é obrigatória</p>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {programa ? "Salvar alterações" : "Adicionar programa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
