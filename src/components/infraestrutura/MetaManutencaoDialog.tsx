
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetaManutencao } from "./MetasManutencao";

interface MetaManutencaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta?: MetaManutencao | null;
  onMetaCreated: () => void;
}

export function MetaManutencaoDialog({ 
  open, 
  onOpenChange, 
  meta, 
  onMetaCreated 
}: MetaManutencaoDialogProps) {
  const [formData, setFormData] = useState<Partial<MetaManutencao>>({
    tipo: "",
    tempoMaximo: 24,
    unidade: "horas",
    status: "ativo",
    desempenho: 0,
    dataInicio: new Date().toISOString().split('T')[0],
    responsavel: "",
    observacoes: ""
  });

  useEffect(() => {
    if (meta) {
      setFormData(meta);
    } else {
      setFormData({
        tipo: "",
        tempoMaximo: 24,
        unidade: "horas",
        status: "ativo",
        desempenho: 0,
        dataInicio: new Date().toISOString().split('T')[0],
        responsavel: "",
        observacoes: ""
      });
    }
  }, [meta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aqui seria implementada a lógica de salvar no backend
    console.log("Dados da meta:", formData);
    
    onMetaCreated();
    onOpenChange(false);
  };

  const isEditing = !!meta;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Meta de Manutenção" : "Nova Meta de Manutenção"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edite as informações da meta de tempo de resposta."
              : "Defina uma nova meta de tempo máximo de resposta para manutenções."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Manutenção</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Iluminação Pública">Iluminação Pública</SelectItem>
                  <SelectItem value="Pavimentação">Pavimentação</SelectItem>
                  <SelectItem value="Sinalização">Sinalização</SelectItem>
                  <SelectItem value="Água e Esgoto">Água e Esgoto</SelectItem>
                  <SelectItem value="Limpeza Pública">Limpeza Pública</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, status: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pausado">Pausado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tempoMaximo">Tempo Máximo</Label>
              <Input
                id="tempoMaximo"
                type="number"
                value={formData.tempoMaximo}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tempoMaximo: parseInt(e.target.value) || 0 
                }))}
                placeholder="24"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade</Label>
              <Select
                value={formData.unidade}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, unidade: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="horas">Horas</SelectItem>
                  <SelectItem value="dias">Dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Equipe ou responsável pela meta"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim (Opcional)</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="desempenho">Desempenho Atual (%)</Label>
              <Input
                id="desempenho"
                type="number"
                value={formData.desempenho}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  desempenho: parseInt(e.target.value) || 0 
                }))}
                placeholder="85"
                min="0"
                max="100"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre a meta..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Salvar Alterações" : "Criar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
