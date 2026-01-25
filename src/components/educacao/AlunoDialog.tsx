import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Aluno } from "@/hooks/useAlunos";
import { useEscolas } from "@/hooks/useEscolas";
import { useTurmas } from "@/hooks/useTurmas";

type AlunoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (aluno: Omit<Aluno, "id" | "numero_matricula"> | Aluno) => void;
  aluno?: Aluno | null;
};

export function AlunoDialog({ open, onOpenChange, onSubmit, aluno }: AlunoDialogProps) {
  const { escolas } = useEscolas();
  const { turmas } = useTurmas();
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    data_nascimento: "",
    endereco: "",
    data_matricula: new Date().toISOString().split('T')[0],
    escola_id: "",
    turma_id: "",
    situacao: "ativo",
    responsavel_nome: "",
    responsavel_telefone: "",
    responsavel_email: ""
  });

  useEffect(() => {
    if (aluno) {
      setFormData({
        nome: aluno.nome,
        cpf: aluno.cpf || "",
        data_nascimento: aluno.data_nascimento || "",
        endereco: aluno.endereco || "",
        data_matricula: aluno.data_matricula || new Date().toISOString().split('T')[0],
        escola_id: aluno.escola_id || "",
        turma_id: aluno.turma_id || "",
        situacao: aluno.situacao || "ativo",
        responsavel_nome: aluno.responsavel_nome || "",
        responsavel_telefone: aluno.responsavel_telefone || "",
        responsavel_email: aluno.responsavel_email || ""
      });
    } else {
      setFormData({
        nome: "",
        cpf: "",
        data_nascimento: "",
        endereco: "",
        data_matricula: new Date().toISOString().split('T')[0],
        escola_id: "",
        turma_id: "",
        situacao: "ativo",
        responsavel_nome: "",
        responsavel_telefone: "",
        responsavel_email: ""
      });
    }
  }, [aluno]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alunoData = {
      ...formData,
      turma_id: formData.turma_id || null,
      escola_id: formData.escola_id || null
    };

    if (aluno) {
      onSubmit({ ...alunoData, id: aluno.id, numero_matricula: aluno.numero_matricula });
    } else {
      onSubmit(alunoData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {aluno ? "Editar Aluno" : "Novo Aluno"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            
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
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro"
                />
              </div>
            </div>
          </div>

          {/* Dados Escolares */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Escolares</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="escola_id">Escola</Label>
                <Select
                  value={formData.escola_id}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, escola_id: value, turma_id: "" }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma escola" />
                  </SelectTrigger>
                  <SelectContent>
                    {escolas.map((escola) => (
                      <SelectItem key={escola.id} value={escola.id}>
                        {escola.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="turma_id">Turma</Label>
                <Select
                  value={formData.turma_id || "none"}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, turma_id: value === "none" ? "" : value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma turma</SelectItem>
                    {turmas
                      .filter(turma => !formData.escola_id || turma.escola_id === formData.escola_id)
                      .map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="situacao">Situação</Label>
                <Select
                  value={formData.situacao}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, situacao: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="transferido">Transferido</SelectItem>
                    <SelectItem value="evadido">Evadido</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_matricula">Data de Matrícula</Label>
              <Input
                id="data_matricula"
                type="date"
                value={formData.data_matricula}
                onChange={(e) => setFormData(prev => ({ ...prev, data_matricula: e.target.value }))}
              />
            </div>
          </div>

          {/* Dados do Responsável */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados do Responsável</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel_nome">Nome do Responsável</Label>
                <Input
                  id="responsavel_nome"
                  value={formData.responsavel_nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavel_nome: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel_telefone">Telefone</Label>
                <Input
                  id="responsavel_telefone"
                  value={formData.responsavel_telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavel_telefone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel_email">E-mail</Label>
                <Input
                  id="responsavel_email"
                  type="email"
                  value={formData.responsavel_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsavel_email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {aluno ? "Atualizar" : "Cadastrar"} Aluno
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
