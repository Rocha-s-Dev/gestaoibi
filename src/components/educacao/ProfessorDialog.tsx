
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Professor } from "@/hooks/useProfessores";
import { Escola, useEscolas } from "@/hooks/useEscolas";

type ProfessorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (professor: Omit<Professor, "id"> | Professor) => void;
  professor?: Professor | null;
};

export function ProfessorDialog({ open, onOpenChange, onSubmit, professor }: ProfessorDialogProps) {
  const { escolas } = useEscolas();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    rg: "",
    data_nascimento: "",
    telefone: "",
    email: "",
    endereco: "",
    formacao: "",
    especializacao: "",
    registro_profissional: "",
    data_admissao: "",
    status: "ativo" as string,
    escola_principal_id: ""
  });

  useEffect(() => {
    if (professor) {
      setFormData({
        nome: professor.nome,
        cpf: professor.cpf,
        rg: professor.rg || "",
        data_nascimento: professor.data_nascimento || "",
        telefone: professor.telefone || "",
        email: professor.email || "",
        endereco: professor.endereco || "",
        formacao: professor.formacao || "",
        especializacao: professor.especializacao || "",
        registro_profissional: professor.registro_profissional || "",
        data_admissao: professor.data_admissao,
        status: professor.status,
        escola_principal_id: professor.escola_principal_id || ""
      });
    } else {
      setFormData({
        nome: "",
        cpf: "",
        rg: "",
        data_nascimento: "",
        telefone: "",
        email: "",
        endereco: "",
        formacao: "",
        especializacao: "",
        registro_profissional: "",
        data_admissao: "",
        status: "ativo",
        escola_principal_id: ""
      });
    }
  }, [professor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const professorData = {
      ...formData,
      escola_principal_id: formData.escola_principal_id || null
    };

    if (professor) {
      onSubmit({ ...professorData, id: professor.id });
    } else {
      onSubmit(professorData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {professor ? "Editar Professor" : "Novo Professor"}
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
                placeholder="Ex: João Silva Santos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rg">RG</Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                placeholder="00.000.000-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
              />
            </div>
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
                placeholder="professor@escola.com.br"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, número, bairro, cidade, CEP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="formacao">Formação *</Label>
            <Textarea
              id="formacao"
              value={formData.formacao}
              onChange={(e) => setFormData(prev => ({ ...prev, formacao: e.target.value }))}
              placeholder="Ex: Licenciatura em Pedagogia - Universidade XYZ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="especializacao">Especialização</Label>
            <Textarea
              id="especializacao"
              value={formData.especializacao}
              onChange={(e) => setFormData(prev => ({ ...prev, especializacao: e.target.value }))}
              placeholder="Ex: Pós-graduação em Educação Especial"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registro_profissional">Registro Profissional</Label>
              <Input
                id="registro_profissional"
                value={formData.registro_profissional}
                onChange={(e) => setFormData(prev => ({ ...prev, registro_profissional: e.target.value }))}
                placeholder="Ex: CRE 123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_admissao">Data de Admissão *</Label>
              <Input
                id="data_admissao"
                type="date"
                value={formData.data_admissao}
                onChange={(e) => setFormData(prev => ({ ...prev, data_admissao: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="escola_principal_id">Escola Principal</Label>
              <Select
                value={formData.escola_principal_id || "none"}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, escola_principal_id: value === "none" ? "" : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escola" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma escola</SelectItem>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="licenca">Em Licença</SelectItem>
                  <SelectItem value="aposentado">Aposentado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {professor ? "Atualizar" : "Cadastrar"} Professor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
