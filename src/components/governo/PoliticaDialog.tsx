
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

type Politica = {
  id: string;
  nome: string;
  descricao: string;
  objetivos: string[];
  publicoAlvo: string;
  indicadoresSuccesso: string[];
  dataInicio: Date;
  status: "ativa" | "inativa" | "em_desenvolvimento";
  responsavel: string;
  orcamento: number;
};

type PoliticaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (politica: Omit<Politica, "id"> | Politica) => void;
  politica?: Politica | null;
};

export function PoliticaDialog({ open, onOpenChange, onSubmit, politica }: PoliticaDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    objetivos: [] as string[],
    publicoAlvo: "",
    indicadoresSuccesso: [] as string[],
    dataInicio: "",
    status: "em_desenvolvimento" as const,
    responsavel: "",
    orcamento: ""
  });
  
  const [novoObjetivo, setNovoObjetivo] = useState("");
  const [novoIndicador, setNovoIndicador] = useState("");

  useEffect(() => {
    if (politica) {
      setFormData({
        nome: politica.nome,
        descricao: politica.descricao,
        objetivos: politica.objetivos,
        publicoAlvo: politica.publicoAlvo,
        indicadoresSuccesso: politica.indicadoresSuccesso,
        dataInicio: politica.dataInicio.toISOString().split('T')[0],
        status: politica.status,
        responsavel: politica.responsavel,
        orcamento: politica.orcamento.toString()
      });
    } else {
      setFormData({
        nome: "",
        descricao: "",
        objetivos: [],
        publicoAlvo: "",
        indicadoresSuccesso: [],
        dataInicio: "",
        status: "em_desenvolvimento",
        responsavel: "",
        orcamento: ""
      });
    }
  }, [politica]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const politicaData = {
      ...formData,
      dataInicio: new Date(formData.dataInicio),
      orcamento: parseFloat(formData.orcamento)
    };

    if (politica) {
      onSubmit({ ...politicaData, id: politica.id });
    } else {
      onSubmit(politicaData);
    }
  };

  const adicionarObjetivo = () => {
    if (novoObjetivo.trim()) {
      setFormData(prev => ({
        ...prev,
        objetivos: [...prev.objetivos, novoObjetivo.trim()]
      }));
      setNovoObjetivo("");
    }
  };

  const removerObjetivo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objetivos: prev.objetivos.filter((_, i) => i !== index)
    }));
  };

  const adicionarIndicador = () => {
    if (novoIndicador.trim()) {
      setFormData(prev => ({
        ...prev,
        indicadoresSuccesso: [...prev.indicadoresSuccesso, novoIndicador.trim()]
      }));
      setNovoIndicador("");
    }
  };

  const removerIndicador = (index: number) => {
    setFormData(prev => ({
      ...prev,
      indicadoresSuccesso: prev.indicadoresSuccesso.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {politica ? "Editar Política Pública" : "Nova Política Pública"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Política *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Programa Habitação Popular"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva os detalhes da política pública"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicoAlvo">Público-Alvo *</Label>
            <Input
              id="publicoAlvo"
              value={formData.publicoAlvo}
              onChange={(e) => setFormData(prev => ({ ...prev, publicoAlvo: e.target.value }))}
              placeholder="Ex: Famílias com renda até 3 salários mínimos"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Objetivos</Label>
            <div className="flex gap-2">
              <Input
                value={novoObjetivo}
                onChange={(e) => setNovoObjetivo(e.target.value)}
                placeholder="Digite um objetivo"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarObjetivo())}
              />
              <Button type="button" onClick={adicionarObjetivo} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.objetivos.map((objetivo, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {objetivo}
                  <button
                    type="button"
                    onClick={() => removerObjetivo(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Indicadores de Sucesso</Label>
            <div className="flex gap-2">
              <Input
                value={novoIndicador}
                onChange={(e) => setNovoIndicador(e.target.value)}
                placeholder="Digite um indicador de sucesso"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarIndicador())}
              />
              <Button type="button" onClick={adicionarIndicador} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.indicadoresSuccesso.map((indicador, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {indicador}
                  <button
                    type="button"
                    onClick={() => removerIndicador(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, dataInicio: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativa" | "inativa" | "em_desenvolvimento") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orcamento">Orçamento (R$) *</Label>
              <Input
                id="orcamento"
                type="number"
                value={formData.orcamento}
                onChange={(e) => setFormData(prev => ({ ...prev, orcamento: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {politica ? "Atualizar" : "Criar"} Política
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
