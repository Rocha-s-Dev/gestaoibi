
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { UnidadeSaude } from "./CadastroUnidadesSaude";

interface UnidadeSaudeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unidade?: UnidadeSaude | null;
  onUnidadeCreated: () => void;
}

const tiposUnidade = [
  { value: "UBS", label: "UBS - Unidade Básica de Saúde" },
  { value: "UPA", label: "UPA - Unidade de Pronto Atendimento" },
  { value: "Hospital", label: "Hospital" },
  { value: "Clinica", label: "Clínica Especializada" },
  { value: "CAPS", label: "CAPS - Centro de Atenção Psicossocial" },
  { value: "Laboratorio", label: "Laboratório" }
];

const especialidadesDisponiveis = [
  "Clínica Geral",
  "Pediatria",
  "Ginecologia",
  "Cardiologia",
  "Ortopedia",
  "Dermatologia",
  "Psiquiatria",
  "Neurologia",
  "Oftalmologia",
  "Otorrinolaringologia",
  "Urologia",
  "Endocrinologia",
  "Pneumologia",
  "Gastroenterologia",
  "Oncologia",
  "Urgência e Emergência",
  "UTI",
  "Cirurgia Geral",
  "Maternidade",
  "Fisioterapia",
  "Psicologia",
  "Nutrição",
  "Fonoaudiologia"
];

export function UnidadeSaudeDialog({ 
  open, 
  onOpenChange, 
  unidade, 
  onUnidadeCreated 
}: UnidadeSaudeDialogProps) {
  const [formData, setFormData] = useState<Partial<UnidadeSaude>>({
    nome: "",
    tipo: "UBS",
    endereco: "",
    telefone: "",
    horarioFuncionamento: {
      segunda: "08:00-17:00",
      terca: "08:00-17:00",
      quarta: "08:00-17:00",
      quinta: "08:00-17:00",
      sexta: "08:00-17:00",
      sabado: "Fechado",
      domingo: "Fechado"
    },
    especialidades: [],
    responsavel: "",
    capacidade: 50,
    status: "ativo",
    observacoes: ""
  });

  const [novaEspecialidade, setNovaEspecialidade] = useState("");

  useEffect(() => {
    if (unidade) {
      setFormData(unidade);
    } else {
      setFormData({
        nome: "",
        tipo: "UBS",
        endereco: "",
        telefone: "",
        horarioFuncionamento: {
          segunda: "08:00-17:00",
          terca: "08:00-17:00",
          quarta: "08:00-17:00",
          quinta: "08:00-17:00",
          sexta: "08:00-17:00",
          sabado: "Fechado",
          domingo: "Fechado"
        },
        especialidades: [],
        responsavel: "",
        capacidade: 50,
        status: "ativo",
        observacoes: ""
      });
    }
  }, [unidade]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aqui seria implementada a lógica de salvar no backend
    console.log("Dados da unidade:", formData);
    
    onUnidadeCreated();
    onOpenChange(false);
  };

  const adicionarEspecialidade = () => {
    if (novaEspecialidade && !formData.especialidades?.includes(novaEspecialidade)) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...(prev.especialidades || []), novaEspecialidade]
      }));
      setNovaEspecialidade("");
    }
  };

  const removerEspecialidade = (especialidade: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades?.filter(esp => esp !== especialidade) || []
    }));
  };

  const updateHorario = (dia: string, horario: string) => {
    setFormData(prev => ({
      ...prev,
      horarioFuncionamento: {
        ...prev.horarioFuncionamento!,
        [dia]: horario
      }
    }));
  };

  const isEditing = !!unidade;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Unidade de Saúde" : "Nova Unidade de Saúde"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Edite as informações da unidade de saúde."
              : "Registre uma nova unidade de saúde no sistema."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Unidade</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: UBS Centro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Unidade</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, tipo: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposUnidade.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                placeholder="Rua, número, bairro"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 1234-5678"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome do responsável"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade (pacientes/dia)</Label>
              <Input
                id="capacidade"
                type="number"
                value={formData.capacidade}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  capacidade: parseInt(e.target.value) || 0 
                }))}
                placeholder="50"
                required
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, status: value as any }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Horários de Funcionamento</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.horarioFuncionamento || {}).map(([dia, horario]) => (
                <div key={dia} className="space-y-2">
                  <Label className="capitalize">{dia.replace('terca', 'terça').replace('sabado', 'sábado')}</Label>
                  <Input
                    value={horario}
                    onChange={(e) => updateHorario(dia, e.target.value)}
                    placeholder="08:00-17:00 ou Fechado ou 24h"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Especialidades</Label>
            <div className="flex gap-2">
              <Select
                value={novaEspecialidade}
                onValueChange={setNovaEspecialidade}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {especialidadesDisponiveis
                    .filter(esp => !formData.especialidades?.includes(esp))
                    .map((especialidade) => (
                    <SelectItem key={especialidade} value={especialidade}>
                      {especialidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={adicionarEspecialidade}>
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.especialidades?.map((especialidade, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {especialidade}
                  <X 
                    size={14} 
                    className="cursor-pointer hover:text-red-600" 
                    onClick={() => removerEspecialidade(especialidade)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre a unidade..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Salvar Alterações" : "Criar Unidade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
