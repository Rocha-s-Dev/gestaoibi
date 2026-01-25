import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Escola } from "@/hooks/useEscolas";

type NovaEscolaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (escola: Omit<Escola, "id"> | Escola) => void;
  escola?: Escola | null;
};

export function NovaEscolaDialog({ open, onOpenChange, onSubmit, escola }: NovaEscolaDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
    diretor: "",
    tipo: "municipal",
    capacidade: 0
  });

  useEffect(() => {
    if (escola) {
      setFormData({
        nome: escola.nome,
        endereco: escola.endereco || "",
        telefone: escola.telefone || "",
        email: escola.email || "",
        diretor: escola.diretor || "",
        tipo: escola.tipo || "municipal",
        capacidade: escola.capacidade || 0
      });
    } else {
      setFormData({
        nome: "",
        endereco: "",
        telefone: "",
        email: "",
        diretor: "",
        tipo: "municipal",
        capacidade: 0
      });
    }
  }, [escola]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (escola) {
      onSubmit({ ...formData, id: escola.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {escola ? "Editar Escola" : "Nova Escola"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Escola *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: EMEF Dom Pedro II"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diretor">Diretor(a)</Label>
              <Input
                id="diretor"
                value={formData.diretor}
                onChange={(e) => setFormData(prev => ({ ...prev, diretor: e.target.value }))}
                placeholder="Nome do diretor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 3456-7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="escola@educacao.gov.br"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="municipal">Municipal</SelectItem>
                  <SelectItem value="estadual">Estadual</SelectItem>
                  <SelectItem value="federal">Federal</SelectItem>
                  <SelectItem value="privada">Privada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade de Alunos</Label>
              <Input
                id="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={(e) => setFormData(prev => ({ ...prev, capacidade: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {escola ? "Atualizar" : "Cadastrar"} Escola
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
