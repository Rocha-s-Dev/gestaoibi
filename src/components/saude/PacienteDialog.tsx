import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus } from "lucide-react";
import { Paciente } from "@/hooks/useSaude";

interface PacienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: Paciente | null;
  onSubmit: (data: Partial<Paciente>) => void;
  viewMode?: boolean;
}

export function PacienteDialog({
  open,
  onOpenChange,
  paciente,
  onSubmit,
  viewMode = false,
}: PacienteDialogProps) {
  const [formData, setFormData] = useState<Partial<Paciente>>({
    nome: "",
    cpf: "",
    data_nascimento: "",
    sexo: null,
    tipo_sanguineo: "",
    endereco: "",
    bairro: "",
    cidade: "Município",
    telefone: "",
    email: "",
    cartao_sus: "",
    nome_mae: "",
    nome_responsavel: "",
    telefone_responsavel: "",
    alergias: [],
    condicoes_cronicas: [],
    medicamentos_uso_continuo: [],
    observacoes: "",
    status: "ativo",
  });

  const [novaAlergia, setNovaAlergia] = useState("");
  const [novaCondicao, setNovaCondicao] = useState("");
  const [novoMedicamento, setNovoMedicamento] = useState("");

  useEffect(() => {
    if (paciente) {
      setFormData({
        ...paciente,
        alergias: paciente.alergias || [],
        condicoes_cronicas: paciente.condicoes_cronicas || [],
        medicamentos_uso_continuo: paciente.medicamentos_uso_continuo || [],
      });
    } else {
      setFormData({
        nome: "",
        cpf: "",
        data_nascimento: "",
        sexo: null,
        tipo_sanguineo: "",
        endereco: "",
        bairro: "",
        cidade: "Município",
        telefone: "",
        email: "",
        cartao_sus: "",
        nome_mae: "",
        nome_responsavel: "",
        telefone_responsavel: "",
        alergias: [],
        condicoes_cronicas: [],
        medicamentos_uso_continuo: [],
        observacoes: "",
        status: "ativo",
      });
    }
  }, [paciente, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addItem = (field: "alergias" | "condicoes_cronicas" | "medicamentos_uso_continuo", value: string, setValue: (v: string) => void) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
    setValue("");
  };

  const removeItem = (field: "alergias" | "condicoes_cronicas" | "medicamentos_uso_continuo", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {viewMode ? "Visualizar Paciente" : paciente ? "Editar Paciente" : "Novo Paciente"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="dados-pessoais" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="contato">Contato</TabsTrigger>
              <TabsTrigger value="saude">Informações de Saúde</TabsTrigger>
            </TabsList>

            <TabsContent value="dados-pessoais" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf || ""}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="cartao_sus">Cartão SUS</Label>
                  <Input
                    id="cartao_sus"
                    value={formData.cartao_sus || ""}
                    onChange={(e) => setFormData({ ...formData, cartao_sus: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento || ""}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select
                    value={formData.sexo || ""}
                    onValueChange={(value) => setFormData({ ...formData, sexo: value as Paciente["sexo"] })}
                    disabled={viewMode}
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
                <div>
                  <Label htmlFor="tipo_sanguineo">Tipo Sanguíneo</Label>
                  <Select
                    value={formData.tipo_sanguineo || ""}
                    onValueChange={(value) => setFormData({ ...formData, tipo_sanguineo: value })}
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="nome_mae">Nome da Mãe</Label>
                  <Input
                    id="nome_mae"
                    value={formData.nome_mae || ""}
                    onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Paciente["status"] })}
                    disabled={viewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="falecido">Falecido</SelectItem>
                      <SelectItem value="mudou">Mudou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contato" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco || ""}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={formData.bairro || ""}
                    onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade || ""}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone || ""}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="nome_responsavel">Nome do Responsável</Label>
                  <Input
                    id="nome_responsavel"
                    value={formData.nome_responsavel || ""}
                    onChange={(e) => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    disabled={viewMode}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone_responsavel">Telefone do Responsável</Label>
                  <Input
                    id="telefone_responsavel"
                    value={formData.telefone_responsavel || ""}
                    onChange={(e) => setFormData({ ...formData, telefone_responsavel: e.target.value })}
                    placeholder="(00) 00000-0000"
                    disabled={viewMode}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="saude" className="space-y-4 mt-4">
              {/* Alergias */}
              <div>
                <Label>Alergias</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={novaAlergia}
                    onChange={(e) => setNovaAlergia(e.target.value)}
                    placeholder="Adicionar alergia"
                    disabled={viewMode}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem("alergias", novaAlergia, setNovaAlergia);
                      }
                    }}
                  />
                  {!viewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addItem("alergias", novaAlergia, setNovaAlergia)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.alergias?.map((item, index) => (
                    <Badge key={index} variant="destructive" className="gap-1">
                      {item}
                      {!viewMode && (
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeItem("alergias", index)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Condições Crônicas */}
              <div>
                <Label>Condições Crônicas</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={novaCondicao}
                    onChange={(e) => setNovaCondicao(e.target.value)}
                    placeholder="Adicionar condição crônica"
                    disabled={viewMode}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem("condicoes_cronicas", novaCondicao, setNovaCondicao);
                      }
                    }}
                  />
                  {!viewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addItem("condicoes_cronicas", novaCondicao, setNovaCondicao)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.condicoes_cronicas?.map((item, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {item}
                      {!viewMode && (
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeItem("condicoes_cronicas", index)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medicamentos de Uso Contínuo */}
              <div>
                <Label>Medicamentos de Uso Contínuo</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={novoMedicamento}
                    onChange={(e) => setNovoMedicamento(e.target.value)}
                    placeholder="Adicionar medicamento"
                    disabled={viewMode}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem("medicamentos_uso_continuo", novoMedicamento, setNovoMedicamento);
                      }
                    }}
                  />
                  {!viewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => addItem("medicamentos_uso_continuo", novoMedicamento, setNovoMedicamento)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.medicamentos_uso_continuo?.map((item, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      {item}
                      {!viewMode && (
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeItem("medicamentos_uso_continuo", index)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes || ""}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={4}
                  disabled={viewMode}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {viewMode ? "Fechar" : "Cancelar"}
            </Button>
            {!viewMode && <Button type="submit">Salvar</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
