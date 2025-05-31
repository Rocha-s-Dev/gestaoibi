
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FuncionarioEducacao = {
  id: string;
  nome: string;
  cargo: string;
  setor: string;
  email: string;
  telefone: string;
  dataAdmissao: Date;
  status: "ativo" | "inativo" | "afastado";
};

type FuncionarioEducacaoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (funcionario: Omit<FuncionarioEducacao, "id"> | FuncionarioEducacao) => void;
  funcionario?: FuncionarioEducacao | null;
};

export function FuncionarioEducacaoDialog({ open, onOpenChange, onSubmit, funcionario }: FuncionarioEducacaoDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cargo: "",
    setor: "",
    email: "",
    telefone: "",
    dataAdmissao: "",
    status: "ativo" as "ativo" | "inativo" | "afastado"
  });

  useEffect(() => {
    if (funcionario) {
      setFormData({
        nome: funcionario.nome,
        cargo: funcionario.cargo,
        setor: funcionario.setor,
        email: funcionario.email,
        telefone: funcionario.telefone,
        dataAdmissao: funcionario.dataAdmissao.toISOString().split('T')[0],
        status: funcionario.status
      });
    } else {
      setFormData({
        nome: "",
        cargo: "",
        setor: "",
        email: "",
        telefone: "",
        dataAdmissao: "",
        status: "ativo"
      });
    }
  }, [funcionario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const funcionarioData = {
      ...formData,
      dataAdmissao: new Date(formData.dataAdmissao)
    };

    if (funcionario) {
      onSubmit({ ...funcionarioData, id: funcionario.id });
    } else {
      onSubmit(funcionarioData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {funcionario ? "Editar Funcionário" : "Novo Funcionário"}
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
                placeholder="Ex: João Carlos Pereira"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Select
                value={formData.cargo}
                onValueChange={(value) => setFormData(prev => ({ ...prev, cargo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coordenador Pedagógico">Coordenador Pedagógico</SelectItem>
                  <SelectItem value="Assistente Administrativo">Assistente Administrativo</SelectItem>
                  <SelectItem value="Analista Educacional">Analista Educacional</SelectItem>
                  <SelectItem value="Supervisor de Ensino">Supervisor de Ensino</SelectItem>
                  <SelectItem value="Auxiliar Administrativo">Auxiliar Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setor">Setor *</Label>
              <Select
                value={formData.setor}
                onValueChange={(value) => setFormData(prev => ({ ...prev, setor: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Coordenação Pedagógica">Coordenação Pedagógica</SelectItem>
                  <SelectItem value="Secretaria">Secretaria</SelectItem>
                  <SelectItem value="Supervisão de Ensino">Supervisão de Ensino</SelectItem>
                  <SelectItem value="Planejamento">Planejamento</SelectItem>
                  <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativo" | "inativo" | "afastado") => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="afastado">Afastado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="funcionario@educacao.gov.br"
                required
              />
            </div>

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
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
            <Input
              id="dataAdmissao"
              type="date"
              value={formData.dataAdmissao}
              onChange={(e) => setFormData(prev => ({ ...prev, dataAdmissao: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {funcionario ? "Atualizar" : "Cadastrar"} Funcionário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
