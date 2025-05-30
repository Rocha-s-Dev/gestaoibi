
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Tratamento {
  id: string;
  paciente: string;
  cpf: string;
  tratamento: string;
  medico: string;
  dataInicio: string;
  proximaConsulta: string;
  status: "em_andamento" | "concluido" | "suspenso" | "cancelado";
  progresso: number;
  medicamentos: string[];
  observacoes?: string;
}

interface TratamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (tratamento: Tratamento | Omit<Tratamento, "id">) => void;
  editingTratamento?: Tratamento | null;
  onClose: () => void;
}

export function TratamentoDialog({
  open,
  onOpenChange,
  onSubmit,
  editingTratamento,
  onClose
}: TratamentoDialogProps) {
  const [formData, setFormData] = useState({
    paciente: "",
    cpf: "",
    tratamento: "",
    medico: "",
    dataInicio: "",
    proximaConsulta: "",
    status: "em_andamento" as "em_andamento" | "concluido" | "suspenso" | "cancelado",
    progresso: 0,
    medicamentos: "",
    observacoes: ""
  });

  useEffect(() => {
    if (editingTratamento) {
      setFormData({
        paciente: editingTratamento.paciente,
        cpf: editingTratamento.cpf,
        tratamento: editingTratamento.tratamento,
        medico: editingTratamento.medico,
        dataInicio: editingTratamento.dataInicio,
        proximaConsulta: editingTratamento.proximaConsulta,
        status: editingTratamento.status,
        progresso: editingTratamento.progresso,
        medicamentos: editingTratamento.medicamentos.join(", "),
        observacoes: editingTratamento.observacoes || ""
      });
    } else {
      setFormData({
        paciente: "",
        cpf: "",
        tratamento: "",
        medico: "",
        dataInicio: "",
        proximaConsulta: "",
        status: "em_andamento",
        progresso: 0,
        medicamentos: "",
        observacoes: ""
      });
    }
  }, [editingTratamento, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tratamentoData = {
      paciente: formData.paciente,
      cpf: formData.cpf,
      tratamento: formData.tratamento,
      medico: formData.medico,
      dataInicio: formData.dataInicio,
      proximaConsulta: formData.proximaConsulta,
      status: formData.status,
      progresso: formData.progresso,
      medicamentos: formData.medicamentos.split(",").map(med => med.trim()).filter(med => med),
      observacoes: formData.observacoes
    };

    if (editingTratamento) {
      onSubmit({ ...tratamentoData, id: editingTratamento.id });
    } else {
      onSubmit(tratamentoData);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTratamento ? "Editar Tratamento" : "Novo Tratamento"}
          </DialogTitle>
          <DialogDescription>
            {editingTratamento ? "Edite as informações do tratamento em andamento." : "Registre um novo tratamento para acompanhamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente">Nome do Paciente</Label>
              <Input
                id="paciente"
                value={formData.paciente}
                onChange={(e) => setFormData({ ...formData, paciente: e.target.value })}
                placeholder="Ex: Maria Silva Santos"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tratamento">Tipo de Tratamento</Label>
            <Select value={formData.tratamento} onValueChange={(value) => setFormData({ ...formData, tratamento: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tratamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hipertensão Arterial">Hipertensão Arterial</SelectItem>
                <SelectItem value="Diabetes Mellitus">Diabetes Mellitus</SelectItem>
                <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                <SelectItem value="Oncologia">Oncologia</SelectItem>
                <SelectItem value="Pneumologia">Pneumologia</SelectItem>
                <SelectItem value="Neurologia">Neurologia</SelectItem>
                <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                <SelectItem value="Psiquiatria">Psiquiatria</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medico">Médico Responsável</Label>
            <Select value={formData.medico} onValueChange={(value) => setFormData({ ...formData, medico: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dr. João Carvalho">Dr. João Carvalho</SelectItem>
                <SelectItem value="Dra. Ana Paula">Dra. Ana Paula</SelectItem>
                <SelectItem value="Dr. Carlos Mendes">Dr. Carlos Mendes</SelectItem>
                <SelectItem value="Dra. Maria Fernanda">Dra. Maria Fernanda</SelectItem>
                <SelectItem value="Dr. Roberto Silva">Dr. Roberto Silva</SelectItem>
                <SelectItem value="Dra. Cristina Lopes">Dra. Cristina Lopes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proximaConsulta">Próxima Consulta</Label>
              <Input
                id="proximaConsulta"
                type="date"
                value={formData.proximaConsulta}
                onChange={(e) => setFormData({ ...formData, proximaConsulta: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status do Tratamento</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progresso">Progresso (%)</Label>
              <Input
                id="progresso"
                type="number"
                min="0"
                max="100"
                value={formData.progresso}
                onChange={(e) => setFormData({ ...formData, progresso: Number(e.target.value) })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicamentos">Medicamentos (separados por vírgula)</Label>
            <Textarea
              id="medicamentos"
              value={formData.medicamentos}
              onChange={(e) => setFormData({ ...formData, medicamentos: e.target.value })}
              placeholder="Ex: Losartana 50mg, Hidroclorotiazida 25mg"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações sobre o tratamento, evolução do paciente, etc."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTratamento ? "Atualizar" : "Registrar Tratamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
