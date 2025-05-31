
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Escola = {
  id: string;
  nome: string;
  endereco: string;
  diretor: string;
  telefone: string;
  email: string;
  numeroAlunos: number;
  modalidade: "infantil" | "fundamental" | "eja" | "creche";
  status: "ativa" | "inativa" | "em_reforma";
};

type EscolaDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (escola: Omit<Escola, "id"> | Escola) => void;
  escola?: Escola | null;
};

export function EscolaDialog({ open, onOpenChange, onSubmit, escola }: EscolaDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    diretor: "",
    telefone: "",
    email: "",
    numeroAlunos: "",
    modalidade: "infantil" as "infantil" | "fundamental" | "eja" | "creche",
    status: "ativa" as "ativa" | "inativa" | "em_reforma"
  });

  useEffect(() => {
    if (escola) {
      setFormData({
        nome: escola.nome,
        endereco: escola.endereco,
        diretor: escola.diretor,
        telefone: escola.telefone,
        email: escola.email,
        numeroAlunos: escola.numeroAlunos.toString(),
        modalidade: escola.modalidade,
        status: escola.status
      });
    } else {
      setFormData({
        nome: "",
        endereco: "",
        diretor: "",
        telefone: "",
        email: "",
        numeroAlunos: "",
        modalidade: "infantil",
        status: "ativa"
      });
    }
  }, [escola]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const escolaData = {
      ...formData,
      numeroAlunos: parseInt(formData.numeroAlunos)
    };

    if (escola) {
      onSubmit({ ...escolaData, id: escola.id });
    } else {
      onSubmit(escolaData);
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
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Escola *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: EMEI Pequeno Príncipe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo *</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, número, bairro, CEP"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diretor">Diretor(a) *</Label>
              <Input
                id="diretor"
                value={formData.diretor}
                onChange={(e) => setFormData(prev => ({ ...prev, diretor: e.target.value }))}
                placeholder="Nome do diretor"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroAlunos">Número de Alunos *</Label>
              <Input
                id="numeroAlunos"
                type="number"
                value={formData.numeroAlunos}
                onChange={(e) => setFormData(prev => ({ ...prev, numeroAlunos: e.target.value }))}
                placeholder="0"
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
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="escola@educacao.gov.br"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modalidade">Modalidade *</Label>
              <Select
                value={formData.modalidade}
                onValueChange={(value: "infantil" | "fundamental" | "eja" | "creche") => 
                  setFormData(prev => ({ ...prev, modalidade: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infantil">Educação Infantil</SelectItem>
                  <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                  <SelectItem value="eja">EJA - Educação de Jovens e Adultos</SelectItem>
                  <SelectItem value="creche">Creche</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativa" | "inativa" | "em_reforma") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="inativa">Inativa</SelectItem>
                  <SelectItem value="em_reforma">Em Reforma</SelectItem>
                </SelectContent>
              </Select>
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
