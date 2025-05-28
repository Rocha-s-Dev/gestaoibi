
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MetaIncentivo } from "./MetasIncentivo";
import { toast } from "sonner";

interface MetaIncentivoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meta?: MetaIncentivo | null;
  onSubmit: (data: MetaIncentivo | Omit<MetaIncentivo, "id">) => void;
}

export function MetaIncentivoDialog({ open, onOpenChange, meta, onSubmit }: MetaIncentivoDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    categoria: "cultural" as "cultural" | "esportivo" | "ambos",
    tipoMeta: "captacao-recursos" as "captacao-recursos" | "numero-projetos" | "beneficiarios",
    valorMeta: "",
    valorAtual: "",
    percentualMeta: "",
    percentualAtual: "",
    anoMeta: new Date().getFullYear().toString(),
    status: "nao-iniciada" as MetaIncentivo["status"],
    descricao: "",
    dataInicio: "",
    dataFim: "",
  });

  useEffect(() => {
    if (meta) {
      setFormData({
        titulo: meta.titulo,
        categoria: meta.categoria,
        tipoMeta: meta.tipoMeta,
        valorMeta: meta.valorMeta.toString(),
        valorAtual: meta.valorAtual.toString(),
        percentualMeta: meta.percentualMeta.toString(),
        percentualAtual: meta.percentualAtual.toString(),
        anoMeta: meta.anoMeta.toString(),
        status: meta.status,
        descricao: meta.descricao,
        dataInicio: meta.dataInicio,
        dataFim: meta.dataFim,
      });
    } else {
      setFormData({
        titulo: "",
        categoria: "cultural",
        tipoMeta: "captacao-recursos",
        valorMeta: "",
        valorAtual: "",
        percentualMeta: "",
        percentualAtual: "",
        anoMeta: new Date().getFullYear().toString(),
        status: "nao-iniciada",
        descricao: "",
        dataInicio: "",
        dataFim: "",
      });
    }
  }, [meta, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.valorMeta || !formData.percentualMeta) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const metaData = {
      ...formData,
      valorMeta: Number(formData.valorMeta),
      valorAtual: Number(formData.valorAtual || 0),
      percentualMeta: Number(formData.percentualMeta),
      percentualAtual: Number(formData.percentualAtual || 0),
      anoMeta: Number(formData.anoMeta),
    };

    if (meta) {
      onSubmit({
        id: meta.id,
        ...metaData,
      } as MetaIncentivo);
      toast.success("Meta atualizada com sucesso!");
    } else {
      onSubmit(metaData);
      toast.success("Meta criada com sucesso!");
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {meta ? "Editar Meta" : "Nova Meta de Incentivo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Meta *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Captação de Recursos Culturais 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição detalhada da meta..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value: "cultural" | "esportivo" | "ambos") =>
                  setFormData({ ...formData, categoria: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="esportivo">Esportivo</SelectItem>
                  <SelectItem value="ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipoMeta">Tipo de Meta</Label>
              <Select
                value={formData.tipoMeta}
                onValueChange={(value: "captacao-recursos" | "numero-projetos" | "beneficiarios") =>
                  setFormData({ ...formData, tipoMeta: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="captacao-recursos">Captação de Recursos</SelectItem>
                  <SelectItem value="numero-projetos">Número de Projetos</SelectItem>
                  <SelectItem value="beneficiarios">Beneficiários</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorMeta">Valor Meta (R$) *</Label>
              <Input
                id="valorMeta"
                type="number"
                value={formData.valorMeta}
                onChange={(e) => setFormData({ ...formData, valorMeta: e.target.value })}
                placeholder="500000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorAtual">Valor Atual (R$)</Label>
              <Input
                id="valorAtual"
                type="number"
                value={formData.valorAtual}
                onChange={(e) => setFormData({ ...formData, valorAtual: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="percentualMeta">Percentual Meta (%) *</Label>
              <Input
                id="percentualMeta"
                type="number"
                value={formData.percentualMeta}
                onChange={(e) => setFormData({ ...formData, percentualMeta: e.target.value })}
                placeholder="20"
                min="0"
                max="100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentualAtual">Percentual Atual (%)</Label>
              <Input
                id="percentualAtual"
                type="number"
                value={formData.percentualAtual}
                onChange={(e) => setFormData({ ...formData, percentualAtual: e.target.value })}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anoMeta">Ano da Meta</Label>
              <Input
                id="anoMeta"
                type="number"
                value={formData.anoMeta}
                onChange={(e) => setFormData({ ...formData, anoMeta: e.target.value })}
                min="2020"
                max="2030"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data de Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: MetaIncentivo["status"]) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao-iniciada">Não Iniciada</SelectItem>
                <SelectItem value="em-andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
