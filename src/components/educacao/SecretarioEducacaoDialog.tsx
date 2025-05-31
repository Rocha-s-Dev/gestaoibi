
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SecretarioEducacao = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  dataInicio: Date;
  formacao: string;
  status: "ativo" | "inativo";
};

type SecretarioEducacaoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (secretario: Omit<SecretarioEducacao, "id"> | SecretarioEducacao) => void;
  secretario?: SecretarioEducacao | null;
};

export function SecretarioEducacaoDialog({ open, onOpenChange, onSubmit, secretario }: SecretarioEducacaoDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    dataInicio: "",
    formacao: "",
    status: "ativo" as "ativo" | "inativo"
  });

  useEffect(() => {
    if (secretario) {
      setFormData({
        nome: secretario.nome,
        email: secretario.email,
        telefone: secretario.telefone,
        dataInicio: secretario.dataInicio.toISOString().split('T')[0],
        formacao: secretario.formacao,
        status: secretario.status
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        dataInicio: "",
        formacao: "",
        status: "ativo"
      });
    }
  }, [secretario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const secretarioData = {
      ...formData,
      dataInicio: new Date(formData.dataInicio)
    };

    if (secretario) {
      onSubmit({ ...secretarioData, id: secretario.id });
    } else {
      onSubmit(secretarioData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {secretario ? "Editar Secretário(a)" : "Novo Secretário(a) de Educação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Maria Silva Santos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="secretario@educacao.gov.br"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 3456-7890"
                required
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="formacao">Formação Acadêmica *</Label>
            <Textarea
              id="formacao"
              value={formData.formacao}
              onChange={(e) => setFormData(prev => ({ ...prev, formacao: e.target.value }))}
              placeholder="Ex: Pedagogia - Mestrado em Gestão Educacional"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "ativo" | "inativo") => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {secretario ? "Atualizar" : "Cadastrar"} Secretário(a)
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
