
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Chamada, StatusChamada, TipoChamada } from "./SistemaChamadas";

interface ChamadaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chamada?: Chamada | null;
  onChamadaCreated: () => void;
}

export function ChamadaDialog({ open, onOpenChange, chamada, onChamadaCreated }: ChamadaDialogProps) {
  const [formData, setFormData] = useState<Partial<Chamada>>({
    tipo: "iluminacao",
    status: "aberta",
    prioridade: "media",
    titulo: "",
    descricao: "",
    endereco: "",
    bairro: "",
    solicitante: "",
    telefone: "",
    email: "",
    dataAbertura: new Date().toISOString().split('T')[0],
    observacoes: ""
  });

  useEffect(() => {
    if (chamada) {
      setFormData(chamada);
    } else {
      setFormData({
        tipo: "iluminacao",
        status: "aberta",
        prioridade: "media",
        titulo: "",
        descricao: "",
        endereco: "",
        bairro: "",
        solicitante: "",
        telefone: "",
        email: "",
        dataAbertura: new Date().toISOString().split('T')[0],
        observacoes: ""
      });
    }
  }, [chamada]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aqui seria implementada a lógica de salvar no backend
    console.log("Dados da chamada:", formData);
    
    onChamadaCreated();
    onOpenChange(false);
  };

  const isEditing = !!chamada;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Chamada" : "Nova Chamada"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edite as informações da solicitação de manutenção."
              : "Registre uma nova solicitação de manutenção."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Manutenção</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: TipoChamada) => 
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iluminacao">Iluminação Pública</SelectItem>
                  <SelectItem value="pavimentacao">Pavimentação</SelectItem>
                  <SelectItem value="sinalizacao">Sinalização</SelectItem>
                  <SelectItem value="agua_esgoto">Água e Esgoto</SelectItem>
                  <SelectItem value="limpeza">Limpeza Pública</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, prioridade: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Solicitação</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ex: Poste de iluminação queimado"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva detalhadamente o problema..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua, número"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                placeholder="Nome do bairro"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="solicitante">Nome do Solicitante</Label>
            <Input
              id="solicitante"
              value={formData.solicitante}
              onChange={(e) => setFormData(prev => ({ ...prev, solicitante: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {isEditing && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: StatusChamada) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aberta">Aberta</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                    placeholder="Equipe responsável"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataPrevisao">Data de Previsão</Label>
                  <Input
                    id="dataPrevisao"
                    type="date"
                    value={formData.dataPrevisao || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataPrevisao: e.target.value }))}
                  />
                </div>

                {formData.status === "concluida" && (
                  <div className="space-y-2">
                    <Label htmlFor="dataConclusao">Data de Conclusão</Label>
                    <Input
                      id="dataConclusao"
                      type="date"
                      value={formData.dataConclusao || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataConclusao: e.target.value }))}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Observações sobre o andamento..."
                  rows={3}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Salvar Alterações" : "Criar Chamada"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
