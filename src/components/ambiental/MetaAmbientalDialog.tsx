
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetaAmbiental = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: "residuos" | "areas_verdes" | "outro";
  valorAtual: number;
  valorMeta: number;
  unidadeMedida: string;
  prazo: string;
  status: "em_andamento" | "concluida" | "atrasada";
};

interface MetaAmbientalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (meta: MetaAmbiental) => void;
  meta: MetaAmbiental | null;
}

export function MetaAmbientalDialog({ open, onOpenChange, onSave, meta }: MetaAmbientalDialogProps) {
  const [formData, setFormData] = useState<Omit<MetaAmbiental, "id">>({
    titulo: "",
    descricao: "",
    categoria: "residuos",
    valorAtual: 0,
    valorMeta: 0,
    unidadeMedida: "",
    prazo: new Date().toISOString().split('T')[0],
    status: "em_andamento",
  });
  const [prazoDate, setPrazoDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (meta) {
      setFormData({
        titulo: meta.titulo,
        descricao: meta.descricao,
        categoria: meta.categoria,
        valorAtual: meta.valorAtual,
        valorMeta: meta.valorMeta,
        unidadeMedida: meta.unidadeMedida,
        prazo: meta.prazo,
        status: meta.status,
      });
      setPrazoDate(new Date(meta.prazo));
    } else {
      setFormData({
        titulo: "",
        descricao: "",
        categoria: "residuos",
        valorAtual: 0,
        valorMeta: 0,
        unidadeMedida: "",
        prazo: new Date().toISOString().split('T')[0],
        status: "em_andamento",
      });
      setPrazoDate(new Date());
    }
  }, [meta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const valorAtualNum = Number(formData.valorAtual);
    const valorMetaNum = Number(formData.valorMeta);
    
    const metaData: MetaAmbiental = {
      id: meta?.id || "",
      ...formData,
      valorAtual: valorAtualNum,
      valorMeta: valorMetaNum,
    };
    
    onSave(metaData);
    onOpenChange(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setPrazoDate(date);
      setFormData({
        ...formData,
        prazo: date.toISOString().split('T')[0],
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {meta ? "Editar Meta Ambiental" : "Nova Meta Ambiental"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Digite o título da meta"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva detalhes sobre esta meta ambiental"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value: "residuos" | "areas_verdes" | "outro") => 
                setFormData({ ...formData, categoria: value })
              }
            >
              <SelectTrigger id="categoria">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residuos">Redução de Resíduos</SelectItem>
                <SelectItem value="areas_verdes">Áreas Verdes</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorAtual">Valor Atual</Label>
              <Input
                id="valorAtual"
                type="number"
                value={formData.valorAtual}
                onChange={(e) => setFormData({ ...formData, valorAtual: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorMeta">Valor Meta</Label>
              <Input
                id="valorMeta"
                type="number"
                value={formData.valorMeta}
                onChange={(e) => setFormData({ ...formData, valorMeta: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unidadeMedida">Unidade de Medida</Label>
            <Input
              id="unidadeMedida"
              value={formData.unidadeMedida}
              onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
              placeholder="Ex: toneladas, hectares, unidades"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left",
                    !prazoDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {prazoDate ? (
                    format(prazoDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={prazoDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "em_andamento" | "concluida" | "atrasada") => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {meta ? "Salvar alterações" : "Criar meta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
