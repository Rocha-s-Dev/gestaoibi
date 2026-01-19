import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEscolas } from "@/hooks/useEscolas";
import { EstoqueAlimento } from "@/hooks/useMerendaEscolar";

interface EstoqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: EstoqueAlimento | null;
  onSave: (data: Omit<EstoqueAlimento, 'id' | 'escola'>) => Promise<void>;
}

const unidades = ["kg", "g", "L", "ml", "unidade", "pacote", "caixa", "lata", "saco"];

export function EstoqueDialog({ open, onOpenChange, item, onSave }: EstoqueDialogProps) {
  const { escolas } = useEscolas();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    escola_id: undefined as string | undefined,
    item: "",
    quantidade: 0,
    unidade: "kg",
    data_validade: undefined as string | undefined,
    fornecedor: undefined as string | undefined,
    lote: undefined as string | undefined,
    preco_unitario: undefined as number | undefined,
    estoque_minimo: undefined as number | undefined,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        escola_id: item.escola_id,
        item: item.item,
        quantidade: item.quantidade,
        unidade: item.unidade,
        data_validade: item.data_validade,
        fornecedor: item.fornecedor,
        lote: item.lote,
        preco_unitario: item.preco_unitario,
        estoque_minimo: item.estoque_minimo,
      });
    } else {
      setFormData({
        escola_id: undefined,
        item: "",
        quantidade: 0,
        unidade: "kg",
        data_validade: undefined,
        fornecedor: undefined,
        lote: undefined,
        preco_unitario: undefined,
        estoque_minimo: undefined,
      });
    }
  }, [item, open]);

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
          <DialogTitle>{item ? "Editar Item" : "Novo Item de Estoque"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item">Nome do Item *</Label>
            <Input
              id="item"
              value={formData.item}
              onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value }))}
              placeholder="Ex: Arroz, Feijão, Leite..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade *</Label>
              <Input
                id="quantidade"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade *</Label>
              <Select
                value={formData.unidade}
                onValueChange={(value) => setFormData(prev => ({ ...prev, unidade: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map(unidade => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
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
                <SelectValue placeholder="Estoque central" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Estoque central</SelectItem>
                {escolas.map(escola => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_validade">Data de Validade</Label>
              <Input
                id="data_validade"
                type="date"
                value={formData.data_validade || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, data_validade: e.target.value || undefined }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lote">Lote</Label>
              <Input
                id="lote"
                value={formData.lote || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, lote: e.target.value || undefined }))}
                placeholder="Ex: L001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Input
              id="fornecedor"
              value={formData.fornecedor || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value || undefined }))}
              placeholder="Nome do fornecedor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco_unitario">Preço Unitário (R$)</Label>
              <Input
                id="preco_unitario"
                type="number"
                min="0"
                step="0.01"
                value={formData.preco_unitario || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, preco_unitario: parseFloat(e.target.value) || undefined }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
              <Input
                id="estoque_minimo"
                type="number"
                min="0"
                step="0.01"
                value={formData.estoque_minimo || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, estoque_minimo: parseFloat(e.target.value) || undefined }))}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !formData.item}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
