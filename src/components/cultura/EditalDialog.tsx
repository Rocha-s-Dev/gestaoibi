
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edital } from "./GestaoEditais";
import { toast } from "sonner";

interface EditalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edital?: Edital | null;
  onSubmit: (data: Edital | Omit<Edital, "id">) => void;
}

export function EditalDialog({ open, onOpenChange, edital, onSubmit }: EditalDialogProps) {
  const [formData, setFormData] = useState({
    numero: "",
    titulo: "",
    categoria: "cultural" as "cultural" | "esportivo",
    valor: "",
    dataPublicacao: "",
    dataInicioInscricoes: "",
    dataFimInscricoes: "",
    status: "rascunho" as Edital["status"],
    descricao: "",
    requisitos: "",
  });

  useEffect(() => {
    if (edital) {
      setFormData({
        numero: edital.numero,
        titulo: edital.titulo,
        categoria: edital.categoria,
        valor: edital.valor.toString(),
        dataPublicacao: edital.dataPublicacao,
        dataInicioInscricoes: edital.dataInicioInscricoes,
        dataFimInscricoes: edital.dataFimInscricoes,
        status: edital.status,
        descricao: edital.descricao,
        requisitos: edital.requisitos,
      });
    } else {
      setFormData({
        numero: "",
        titulo: "",
        categoria: "cultural",
        valor: "",
        dataPublicacao: "",
        dataInicioInscricoes: "",
        dataFimInscricoes: "",
        status: "rascunho",
        descricao: "",
        requisitos: "",
      });
    }
  }, [edital, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.numero || !formData.titulo || !formData.valor) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const editalData = {
      ...formData,
      valor: Number(formData.valor),
    };

    if (edital) {
      onSubmit({
        id: edital.id,
        ...editalData,
      } as Edital);
      toast.success("Edital atualizado com sucesso!");
    } else {
      onSubmit(editalData);
      toast.success("Edital criado com sucesso!");
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {edital ? "Editar Edital" : "Novo Edital"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero">Número do Edital *</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ex: 001/2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: "cultural" | "esportivo") =>
                  setFormData({ ...formData, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="esportivo">Esportivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Edital *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Edital de Apoio à Cultura Local"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição detalhada do edital..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requisitos">Requisitos</Label>
            <Textarea
              id="requisitos"
              value={formData.requisitos}
              onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
              placeholder="Requisitos para participação..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor Total (R$) *</Label>
              <Input
                id="valor"
                type="number"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                placeholder="50000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Edital["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="em-andamento">Em Andamento</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataPublicacao">Data de Publicação</Label>
              <Input
                id="dataPublicacao"
                type="date"
                value={formData.dataPublicacao}
                onChange={(e) => setFormData({ ...formData, dataPublicacao: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicioInscricoes">Início das Inscrições</Label>
              <Input
                id="dataInicioInscricoes"
                type="date"
                value={formData.dataInicioInscricoes}
                onChange={(e) => setFormData({ ...formData, dataInicioInscricoes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFimInscricoes">Fim das Inscrições</Label>
              <Input
                id="dataFimInscricoes"
                type="date"
                value={formData.dataFimInscricoes}
                onChange={(e) => setFormData({ ...formData, dataFimInscricoes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {edital ? "Atualizar" : "Criar"} Edital
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
