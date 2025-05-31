
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MetaEducacao = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "infraestrutura" | "pedagogico" | "gestao" | "inclusao";
  prazo: Date;
  progresso: number;
  responsavel: string;
  status: "planejada" | "em_andamento" | "concluida" | "atrasada";
};

type MetaEducacaoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (meta: Omit<MetaEducacao, "id"> | MetaEducacao) => void;
  meta?: MetaEducacao | null;
};

export function MetaEducacaoDialog({ open, onOpenChange, onSubmit, meta }: MetaEducacaoDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    categoria: "pedagogico" as "infraestrutura" | "pedagogico" | "gestao" | "inclusao",
    prazo: "",
    progresso: "0",
    responsavel: "",
    status: "planejada" as "planejada" | "em_andamento" | "concluida" | "atrasada"
  });

  useEffect(() => {
    if (meta) {
      setFormData({
        titulo: meta.titulo,
        descricao: meta.descricao,
        categoria: meta.categoria,
        prazo: meta.prazo.toISOString().split('T')[0],
        progresso: meta.progresso.toString(),
        responsavel: meta.responsavel,
        status: meta.status
      });
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        categoria: "pedagogico",
        prazo: "",
        progresso: "0",
        responsavel: "",
        status: "planejada"
      });
    }
  }, [meta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const metaData = {
      ...formData,
      prazo: new Date(formData.prazo),
      progresso: parseInt(formData.progresso)
    };

    if (meta) {
      onSubmit({ ...metaData, id: meta.id });
    } else {
      onSubmit(metaData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {meta ? "Editar Meta" : "Nova Meta Educacional"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Meta *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Aumentar Taxa de Alfabetização"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva detalhadamente a meta a ser alcançada"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: "infraestrutura" | "pedagogico" | "gestao" | "inclusao") => 
                  setFormData(prev => ({ ...prev, categoria: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pedagogico">Pedagógico</SelectItem>
                  <SelectItem value="gestao">Gestão</SelectItem>
                  <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                  <SelectItem value="inclusao">Inclusão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "planejada" | "em_andamento" | "concluida" | "atrasada") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejada">Planejada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Ex: Coordenação Pedagógica"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo *</Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => setFormData(prev => ({ ...prev, prazo: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progresso">Progresso (%)</Label>
              <Input
                id="progresso"
                type="number"
                min="0"
                max="100"
                value={formData.progresso}
                onChange={(e) => setFormData(prev => ({ ...prev, progresso: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {meta ? "Atualizar" : "Criar"} Meta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
