
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { EspacoCultural } from "./EspacosCulturais";

interface EspacoCulturalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  espaco: EspacoCultural | null;
  onSubmit: (espacoData: any) => void;
}

export function EspacoCulturalDialog({ open, onOpenChange, espaco, onSubmit }: EspacoCulturalDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    tipo: "teatro" as EspacoCultural["tipo"],
    endereco: "",
    capacidade: 0,
    disponivel: true,
    condicoes: "",
    equipamentos: [] as string[],
    responsavel: "",
    contato: "",
    observacoes: "",
    dataCriacao: new Date().toISOString().split('T')[0]
  });

  const [novoEquipamento, setNovoEquipamento] = useState("");

  useEffect(() => {
    if (espaco) {
      setFormData({
        nome: espaco.nome,
        tipo: espaco.tipo,
        endereco: espaco.endereco,
        capacidade: espaco.capacidade,
        disponivel: espaco.disponivel,
        condicoes: espaco.condicoes,
        equipamentos: espaco.equipamentos,
        responsavel: espaco.responsavel,
        contato: espaco.contato,
        observacoes: espaco.observacoes || "",
        dataCriacao: espaco.dataCriacao
      });
    } else {
      setFormData({
        nome: "",
        tipo: "teatro",
        endereco: "",
        capacidade: 0,
        disponivel: true,
        condicoes: "",
        equipamentos: [],
        responsavel: "",
        contato: "",
        observacoes: "",
        dataCriacao: new Date().toISOString().split('T')[0]
      });
    }
  }, [espaco]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (espaco) {
      onSubmit({ ...formData, id: espaco.id });
    } else {
      onSubmit(formData);
    }
    
    onOpenChange(false);
  };

  const adicionarEquipamento = () => {
    if (novoEquipamento.trim() && !formData.equipamentos.includes(novoEquipamento.trim())) {
      setFormData(prev => ({
        ...prev,
        equipamentos: [...prev.equipamentos, novoEquipamento.trim()]
      }));
      setNovoEquipamento("");
    }
  };

  const removerEquipamento = (equipamento: string) => {
    setFormData(prev => ({
      ...prev,
      equipamentos: prev.equipamentos.filter(eq => eq !== equipamento)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {espaco ? "Editar Espaço Cultural" : "Novo Espaço Cultural"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Espaço</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value: EspacoCultural["tipo"]) => 
                setFormData(prev => ({ ...prev, tipo: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teatro">Teatro</SelectItem>
                  <SelectItem value="cinema">Cinema</SelectItem>
                  <SelectItem value="biblioteca">Biblioteca</SelectItem>
                  <SelectItem value="museu">Museu</SelectItem>
                  <SelectItem value="quadra-esportiva">Quadra Esportiva</SelectItem>
                  <SelectItem value="ginasio">Ginásio</SelectItem>
                  <SelectItem value="piscina">Piscina</SelectItem>
                  <SelectItem value="auditorio">Auditório</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacidade">Capacidade (pessoas)</Label>
              <Input
                id="capacidade"
                type="number"
                min="1"
                value={formData.capacidade}
                onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="disponivel"
                checked={formData.disponivel}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, disponivel: checked }))}
              />
              <Label htmlFor="disponivel">Disponível para uso</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="condicoes">Condições do Espaço</Label>
            <Textarea
              id="condicoes"
              value={formData.condicoes}
              onChange={(e) => setFormData(prev => ({ ...prev, condicoes: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Equipamentos Disponíveis</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Adicionar equipamento"
                value={novoEquipamento}
                onChange={(e) => setNovoEquipamento(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarEquipamento())}
              />
              <Button type="button" onClick={adicionarEquipamento}>
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipamentos.map((equipamento) => (
                <Badge key={equipamento} variant="secondary" className="flex items-center gap-1">
                  {equipamento}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removerEquipamento(equipamento)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                type="tel"
                value={formData.contato}
                onChange={(e) => setFormData(prev => ({ ...prev, contato: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
              placeholder="Informações adicionais, regras de agendamento, etc."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {espaco ? "Atualizar" : "Cadastrar"} Espaço
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
