
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Obra } from "./CadastroObras";

interface ObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  obra?: Obra | null;
  onSubmit: (obra: Obra | Omit<Obra, "id">) => void;
}

export function ObraDialog({ open, onOpenChange, obra, onSubmit }: ObraDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    local: "",
    responsavel: "",
    empresa: "",
    contato: "",
    dataInicio: "",
    previsaoTermino: "",
    orcamentoTotal: "",
    valorGasto: "",
    status: "planejamento" as Obra["status"],
    observacoes: ""
  });

  useEffect(() => {
    if (obra) {
      setFormData({
        nome: obra.nome,
        descricao: obra.descricao,
        local: obra.local,
        responsavel: obra.responsavel,
        empresa: obra.empresa,
        contato: obra.contato,
        dataInicio: obra.dataInicio,
        previsaoTermino: obra.previsaoTermino,
        orcamentoTotal: obra.orcamentoTotal.toString(),
        valorGasto: obra.valorGasto.toString(),
        status: obra.status,
        observacoes: obra.observacoes || ""
      });
    } else {
      setFormData({
        nome: "",
        descricao: "",
        local: "",
        responsavel: "",
        empresa: "",
        contato: "",
        dataInicio: "",
        previsaoTermino: "",
        orcamentoTotal: "",
        valorGasto: "",
        status: "planejamento",
        observacoes: ""
      });
    }
  }, [obra]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const obraData = {
      ...formData,
      orcamentoTotal: parseFloat(formData.orcamentoTotal) || 0,
      valorGasto: parseFloat(formData.valorGasto) || 0,
      dataCriacao: obra?.dataCriacao || new Date().toISOString().split('T')[0]
    };

    if (obra) {
      onSubmit({ ...obraData, id: obra.id });
    } else {
      onSubmit(obraData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {obra ? "Editar Obra" : "Nova Obra"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nome">Nome da Obra *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="local">Local da Obra *</Label>
              <Input
                id="local"
                value={formData.local}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="empresa">Empresa Executora *</Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Obra["status"]) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejamento">Planejamento</SelectItem>
                  <SelectItem value="andamento">Em Andamento</SelectItem>
                  <SelectItem value="parada">Parada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataInicio">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="previsaoTermino">Previsão de Término *</Label>
              <Input
                id="previsaoTermino"
                type="date"
                value={formData.previsaoTermino}
                onChange={(e) => setFormData({ ...formData, previsaoTermino: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="orcamentoTotal">Orçamento Total *</Label>
              <Input
                id="orcamentoTotal"
                type="number"
                step="0.01"
                min="0"
                value={formData.orcamentoTotal}
                onChange={(e) => setFormData({ ...formData, orcamentoTotal: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="valorGasto">Valor Gasto</Label>
              <Input
                id="valorGasto"
                type="number"
                step="0.01"
                min="0"
                value={formData.valorGasto}
                onChange={(e) => setFormData({ ...formData, valorGasto: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={3}
              />
            </div>
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
              {obra ? "Atualizar" : "Cadastrar"} Obra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
