import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useEscolas } from "@/hooks/useEscolas";
import { Cardapio, TipoRefeicao } from "@/hooks/useMerendaEscolar";

interface ItemCardapio {
  nome: string;
  quantidade?: string;
}

interface CardapioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardapio?: Cardapio | null;
  onSave: (data: Omit<Cardapio, 'id' | 'escola'>) => Promise<void>;
}

const tiposRefeicao: { value: TipoRefeicao; label: string }[] = [
  { value: 'cafe_manha', label: 'Café da Manhã' },
  { value: 'lanche_manha', label: 'Lanche da Manhã' },
  { value: 'almoco', label: 'Almoço' },
  { value: 'lanche_tarde', label: 'Lanche da Tarde' },
  { value: 'jantar', label: 'Jantar' },
];

export function CardapioDialog({ open, onOpenChange, cardapio, onSave }: CardapioDialogProps) {
  const { escolas } = useEscolas();
  const [loading, setLoading] = useState(false);
  const [novoItemNome, setNovoItemNome] = useState("");
  const [novoItemQtd, setNovoItemQtd] = useState("");
  const [formData, setFormData] = useState({
    escola_id: undefined as string | undefined,
    data: new Date().toISOString().split('T')[0],
    refeicao: "almoco" as TipoRefeicao,
    itens: [] as ItemCardapio[],
    calorias_estimadas: undefined as number | undefined,
    observacoes: undefined as string | undefined,
  });

  useEffect(() => {
    if (cardapio) {
      setFormData({
        escola_id: cardapio.escola_id,
        data: cardapio.data,
        refeicao: cardapio.refeicao,
        itens: Array.isArray(cardapio.itens) ? cardapio.itens : [],
        calorias_estimadas: cardapio.calorias_estimadas,
        observacoes: cardapio.observacoes,
      });
    } else {
      setFormData({
        escola_id: undefined,
        data: new Date().toISOString().split('T')[0],
        refeicao: "almoco",
        itens: [],
        calorias_estimadas: undefined,
        observacoes: undefined,
      });
    }
  }, [cardapio, open]);

  const handleAddItem = () => {
    if (novoItemNome.trim()) {
      setFormData(prev => ({
        ...prev,
        itens: [...prev.itens, { nome: novoItemNome.trim(), quantidade: novoItemQtd.trim() || undefined }]
      }));
      setNovoItemNome("");
      setNovoItemQtd("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cardapio ? "Editar Cardápio" : "Novo Cardápio"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refeicao">Tipo de Refeição</Label>
              <Select
                value={formData.refeicao}
                onValueChange={(value: TipoRefeicao) => setFormData(prev => ({ ...prev, refeicao: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tiposRefeicao.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="escola">Escola (opcional)</Label>
            <Select
              value={formData.escola_id || "none"}
              onValueChange={(value) => setFormData(prev => ({ ...prev, escola_id: value === "none" ? undefined : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as escolas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todas as escolas</SelectItem>
                {escolas.map(escola => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Itens do Cardápio</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nome do item..."
                value={novoItemNome}
                onChange={(e) => setNovoItemNome(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Qtd"
                value={novoItemQtd}
                onChange={(e) => setNovoItemQtd(e.target.value)}
                className="w-20"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.itens.map((item, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {item.nome}{item.quantidade && ` (${item.quantidade})`}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleRemoveItem(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calorias">Calorias Estimadas</Label>
            <Input
              id="calorias"
              type="number"
              min="0"
              value={formData.calorias_estimadas || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, calorias_estimadas: parseInt(e.target.value) || undefined }))}
              placeholder="Ex: 500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value || undefined }))}
              placeholder="Observações sobre o cardápio..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || formData.itens.length === 0}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
