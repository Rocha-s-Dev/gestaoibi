
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MetaPolitica = {
  id: string;
  tipo: "implementacao" | "demandas_atendidas";
  titulo: string;
  descricao: string;
  metaAnual: number;
  valorAtual: number;
  unidadeMedida: string;
  anoReferencia: number;
  status: "ativa" | "concluida" | "em_andamento";
  dataLimite: Date;
  responsavel: string;
};

type MetaPoliticaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (meta: Omit<MetaPolitica, "id"> | MetaPolitica) => void;
  meta?: MetaPolitica | null;
};

export function MetaPoliticaDialog({ open, onOpenChange, onSubmit, meta }: MetaPoliticaDialogProps) {
  const [formData, setFormData] = useState({
    tipo: "implementacao" as "implementacao" | "demandas_atendidas",
    titulo: "",
    descricao: "",
    metaAnual: "",
    valorAtual: "",
    unidadeMedida: "",
    anoReferencia: new Date().getFullYear().toString(),
    status: "ativa" as "ativa" | "concluida" | "em_andamento",
    dataLimite: "",
    responsavel: ""
  });

  useEffect(() => {
    if (meta) {
      setFormData({
        tipo: meta.tipo,
        titulo: meta.titulo,
        descricao: meta.descricao,
        metaAnual: meta.metaAnual.toString(),
        valorAtual: meta.valorAtual.toString(),
        unidadeMedida: meta.unidadeMedida,
        anoReferencia: meta.anoReferencia.toString(),
        status: meta.status,
        dataLimite: meta.dataLimite.toISOString().split('T')[0],
        responsavel: meta.responsavel
      });
    } else {
      setFormData({
        tipo: "implementacao",
        titulo: "",
        descricao: "",
        metaAnual: "",
        valorAtual: "",
        unidadeMedida: "",
        anoReferencia: new Date().getFullYear().toString(),
        status: "ativa",
        dataLimite: "",
        responsavel: ""
      });
    }
  }, [meta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const metaData = {
      ...formData,
      metaAnual: parseInt(formData.metaAnual),
      valorAtual: parseInt(formData.valorAtual),
      anoReferencia: parseInt(formData.anoReferencia),
      dataLimite: new Date(formData.dataLimite)
    };

    if (meta) {
      onSubmit({ ...metaData, id: meta.id });
    } else {
      onSubmit(metaData);
    }
  };

  const getUnidadesPorTipo = (tipo: "implementacao" | "demandas_atendidas") => {
    if (tipo === "implementacao") {
      return ["políticas", "programas", "projetos", "ações"];
    } else {
      return ["atendimentos", "demandas", "solicitações", "casos"];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {meta ? "Editar Meta de Política Pública" : "Nova Meta de Política Pública"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Meta *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: "implementacao" | "demandas_atendidas") => 
                  setFormData(prev => ({ ...prev, tipo: value, unidadeMedida: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="implementacao">Implementação de Políticas</SelectItem>
                  <SelectItem value="demandas_atendidas">Demandas Atendidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativa" | "concluida" | "em_andamento") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Meta *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Implementação de Políticas de Habitação"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva os detalhes da meta"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Nome do responsável pela meta"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="metaAnual">Meta Anual *</Label>
              <Input
                id="metaAnual"
                type="number"
                value={formData.metaAnual}
                onChange={(e) => setFormData(prev => ({ ...prev, metaAnual: e.target.value }))}
                placeholder="0"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorAtual">Valor Atual *</Label>
              <Input
                id="valorAtual"
                type="number"
                value={formData.valorAtual}
                onChange={(e) => setFormData(prev => ({ ...prev, valorAtual: e.target.value }))}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadeMedida">Unidade de Medida *</Label>
              <Select
                value={formData.unidadeMedida}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unidadeMedida: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {getUnidadesPorTipo(formData.tipo).map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="anoReferencia">Ano Referência *</Label>
              <Input
                id="anoReferencia"
                type="number"
                value={formData.anoReferencia}
                onChange={(e) => setFormData(prev => ({ ...prev, anoReferencia: e.target.value }))}
                min="2020"
                max="2030"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataLimite">Data Limite *</Label>
            <Input
              id="dataLimite"
              type="date"
              value={formData.dataLimite}
              onChange={(e) => setFormData(prev => ({ ...prev, dataLimite: e.target.value }))}
              required
            />
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
