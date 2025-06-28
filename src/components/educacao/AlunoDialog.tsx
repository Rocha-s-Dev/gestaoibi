
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
    rg: "",
    data_nascimento: "",
    genero: "",
    telefone: "",
    email: "",
    endereco: "",
    numero_endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
    data_matricula: new Date().toISOString().split('T')[0],
    escola_id: "",
    turma_atual_id: "",
    status: "matriculado" as const,
    observacoes: "",
    necessidades_especiais: ""
  });

  useEffect(() => {
    if (aluno) {
      setFormData({
        nome: aluno.nome,
        cpf: aluno.cpf || "",
        rg: aluno.rg || "",
        data_nascimento: aluno.data_nascimento,
        genero: aluno.genero || "",
        telefone: aluno.telefone || "",
        email: aluno.email || "",
        endereco: aluno.endereco || "",
        numero_endereco: aluno.numero_endereco || "",
        bairro: aluno.bairro || "",
        cidade: aluno.cidade || "",
        estado: aluno.estado || "",
        cep: aluno.cep || "",
        data_matricula: aluno.data_matricula,
        escola_id: aluno.escola_id,
        turma_atual_id: aluno.turma_atual_id || "",
        status: aluno.status,
        observacoes: aluno.observacoes || "",
        necessidades_especiais: aluno.necessidades_especiais || ""
      });
    } else {
      setFormData({
        nome: "",
        cpf: "",
        rg: "",
        data_nascimento: "",
        genero: "",
        telefone: "",
        email: "",
        endereco: "",
        numero_endereco: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        data_matricula: new Date().toISOString().split('T')[0],
        escola_id: "",
        turma_atual_id: "",
        status: "matriculado",
        observacoes: "",
        necessidades_especiais: ""
      });
    }
  }, [aluno]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const alunoData = {
      ...formData,
      turma_atual_id: formData.turma_atual_id || null
    };

    if (aluno) {
      onSubmit({ ...alunoData, id: aluno.id, numero_matricula: aluno.numero_matricula });
    } else {
      onSubmit(alunoData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => setFormData(prev => ({ ...prev, rg: e.target.value }))}
                  placeholder="00.000.000-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genero">Gênero</Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, genero: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder="aluno@email.com"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Endereço</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_endereco">Número</Label>
                <Input
                  id="numero_endereco"
                  value={formData.numero_endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, numero_endereco: e.target.value }))}
                  placeholder="123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Dados Escolares */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Escolares</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="escola_id">Escola *</Label>
                <Select
                  value={formData.escola_id}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, escola_id: value }))
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
                <Label htmlFor="turma_atual_id">Turma Atual</Label>
                <Select
                  value={formData.turma_atual_id}
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, turma_atual_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma turma</SelectItem>
                    {turmas
                      .filter(turma => turma.escola_id === formData.escola_id)
                      .map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome}
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
                    setFormData(prev => ({ ...prev, status: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matriculado">Matriculado</SelectItem>
                    <SelectItem value="transferido">Transferido</SelectItem>
                    <SelectItem value="evadido">Evadido</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_matricula">Data de Matrícula *</Label>
              <Input
                id="data_matricula"
                type="date"
                value={formData.data_matricula}
                onChange={(e) => setFormData(prev => ({ ...prev, data_matricula: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Observações</h3>
            
            <div className="space-y-2">
              <Label htmlFor="necessidades_especiais">Necessidades Especiais</Label>
              <Textarea
                id="necessidades_especiais"
                value={formData.necessidades_especiais}
                onChange={(e) => setFormData(prev => ({ ...prev, necessidades_especiais: e.target.value }))}
                placeholder="Descreva necessidades especiais, deficiências ou restrições médicas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações gerais sobre o aluno"
              />
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
