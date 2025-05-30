
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MetaSaude {
  id: string;
  titulo: string;
  tipo: "cobertura_vacinal" | "tempo_espera";
  valorMeta: number;
  valorAtual: number;
  unidadeMedida: string;
  prazo: string;
  status: "atingida" | "em_progresso" | "atrasada" | "critica";
  responsavel: string;
  descricao?: string;
  historico: Array<{
    mes: string;
    valor: number;
  }>;
}

interface MetaSaudeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (meta: MetaSaude | Omit<MetaSaude, "id">) => void;
  editingMeta?: MetaSaude | null;
  onClose: () => void;
}

export function MetaSaudeDialog({
  open,
  onOpenChange,
  onSubmit,
  editingMeta,
  onClose
}: MetaSaudeDialogProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "cobertura_vacinal" as "cobertura_vacinal" | "tempo_espera",
    valorMeta: "",
    valorAtual: "",
    unidadeMedida: "%",
    prazo: "",
    status: "em_progresso" as "atingida" | "em_progresso" | "atrasada" | "critica",
    responsavel: "",
    descricao: ""
  });

  useEffect(() => {
    if (editingMeta) {
      setFormData({
        titulo: editingMeta.titulo,
        tipo: editingMeta.tipo,
        valorMeta: editingMeta.valorMeta.toString(),
        valorAtual: editingMeta.valorAtual.toString(),
        unidadeMedida: editingMeta.unidadeMedida,
        prazo: editingMeta.prazo,
        status: editingMeta.status,
        responsavel: editingMeta.responsavel,
        descricao: editingMeta.descricao || ""
      });
    } else {
      setFormData({
        titulo: "",
        tipo: "cobertura_vacinal",
        valorMeta: "",
        valorAtual: "",
        unidadeMedida: "%",
        prazo: "",
        status: "em_progresso",
        responsavel: "",
        descricao: ""
      });
    }
  }, [editingMeta, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const metaData = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      valorMeta: parseFloat(formData.valorMeta),
      valorAtual: parseFloat(formData.valorAtual),
      unidadeMedida: formData.unidadeMedida,
      prazo: formData.prazo,
      status: formData.status,
      responsavel: formData.responsavel,
      descricao: formData.descricao,
      historico: editingMeta?.historico || []
    };

    if (editingMeta) {
      onSubmit({ ...metaData, id: editingMeta.id });
    } else {
      onSubmit(metaData);
    }

    onClose();
  };

  const handleTipoChange = (tipo: "cobertura_vacinal" | "tempo_espera") => {
    setFormData({
      ...formData,
      tipo,
      unidadeMedida: tipo === "cobertura_vacinal" ? "%" : "dias"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingMeta ? "Editar Meta de Saúde" : "Nova Meta de Saúde"}
          </DialogTitle>
          <DialogDescription>
            {editingMeta ? "Edite as informações da meta de saúde pública." : "Adicione uma nova meta de saúde pública para acompanhamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Meta</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Cobertura Vacinal COVID-19"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Meta</Label>
            <Select value={formData.tipo} onValueChange={handleTipoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cobertura_vacinal">Cobertura Vacinal</SelectItem>
                <SelectItem value="tempo_espera">Tempo de Espera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorMeta">Valor Meta</Label>
              <Input
                id="valorMeta"
                type="number"
                step="0.1"
                value={formData.valorMeta}
                onChange={(e) => setFormData({ ...formData, valorMeta: e.target.value })}
                placeholder="95"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorAtual">Valor Atual</Label>
              <Input
                id="valorAtual"
                type="number"
                step="0.1"
                value={formData.valorAtual}
                onChange={(e) => setFormData({ ...formData, valorAtual: e.target.value })}
                placeholder="87.5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidadeMedida">Unidade</Label>
              <Input
                id="unidadeMedida"
                value={formData.unidadeMedida}
                onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
                placeholder="% ou dias"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="atingida">Atingida</SelectItem>
                  <SelectItem value="em_progresso">Em Progresso</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              placeholder="Dr. João Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prazo">Prazo</Label>
            <Input
              id="prazo"
              value={formData.prazo}
              onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
              placeholder="Dezembro 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (Opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição detalhada da meta..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingMeta ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
