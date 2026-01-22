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
import { Agendamento, usePacientes, useProfissionaisSaude, useUnidadesSaude } from "@/hooks/useSaude";
import { Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AgendamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agendamento: Agendamento | null;
  onSubmit: (data: Partial<Agendamento>) => void;
}

export function AgendamentoDialog({
  open,
  onOpenChange,
  agendamento,
  onSubmit,
}: AgendamentoDialogProps) {
  const { pacientes, searchPacientes } = usePacientes();
  const { profissionais } = useProfissionaisSaude();
  const { unidades } = useUnidadesSaude();

  const [formData, setFormData] = useState({
    paciente_id: "",
    profissional_id: "",
    unidade_id: "",
    data_hora: "",
    tipo: "consulta" as Agendamento["tipo"],
    especialidade: "",
    status: "agendado" as Agendamento["status"],
    prioridade: "normal" as Agendamento["prioridade"],
    observacoes: "",
  });

  const [searchPaciente, setSearchPaciente] = useState("");
  const [pacientesFiltrados, setPacientesFiltrados] = useState(pacientes);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (agendamento) {
      setFormData({
        paciente_id: agendamento.paciente_id,
        profissional_id: agendamento.profissional_id || "",
        unidade_id: agendamento.unidade_id,
        data_hora: format(new Date(agendamento.data_hora), "yyyy-MM-dd'T'HH:mm"),
        tipo: agendamento.tipo,
        especialidade: agendamento.especialidade || "",
        status: agendamento.status,
        prioridade: agendamento.prioridade,
        observacoes: agendamento.observacoes || "",
      });
    } else {
      setFormData({
        paciente_id: "",
        profissional_id: "",
        unidade_id: "",
        data_hora: "",
        tipo: "consulta",
        especialidade: "",
        status: "agendado",
        prioridade: "normal",
        observacoes: "",
      });
    }
  }, [agendamento, open]);

  useEffect(() => {
    setPacientesFiltrados(pacientes);
  }, [pacientes]);

  const handleSearchPaciente = async () => {
    if (!searchPaciente.trim()) {
      setPacientesFiltrados(pacientes);
      return;
    }
    setBuscando(true);
    try {
      const results = await searchPacientes(searchPaciente);
      setPacientesFiltrados(results);
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      profissional_id: formData.profissional_id || null,
      especialidade: formData.especialidade || null,
      observacoes: formData.observacoes || null,
    });
  };

  const especialidades = [
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
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Busca de Paciente */}
          <div>
            <Label>Paciente *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={searchPaciente}
                onChange={(e) => setSearchPaciente(e.target.value)}
                placeholder="Buscar por nome ou CPF"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchPaciente();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleSearchPaciente} disabled={buscando}>
                {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <Select
              value={formData.paciente_id}
              onValueChange={(value) => setFormData({ ...formData, paciente_id: value })}
              required
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientesFiltrados.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} {p.cpf && `- ${p.cpf}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Unidade */}
            <div>
              <Label>Unidade de Saúde *</Label>
              <Select
                value={formData.unidade_id}
                onValueChange={(value) => setFormData({ ...formData, unidade_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome} ({u.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profissional */}
            <div>
              <Label>Profissional</Label>
              <Select
                value={formData.profissional_id}
                onValueChange={(value) => setFormData({ ...formData, profissional_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o profissional" />
                </SelectTrigger>
                <SelectContent>
                  {profissionais.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} {p.especialidade && `- ${p.especialidade}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data e Hora */}
            <div>
              <Label>Data e Hora *</Label>
              <Input
                type="datetime-local"
                value={formData.data_hora}
                onChange={(e) => setFormData({ ...formData, data_hora: e.target.value })}
                required
              />
            </div>

            {/* Tipo */}
            <div>
              <Label>Tipo *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value as Agendamento["tipo"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="retorno">Retorno</SelectItem>
                  <SelectItem value="exame">Exame</SelectItem>
                  <SelectItem value="vacina">Vacina</SelectItem>
                  <SelectItem value="procedimento">Procedimento</SelectItem>
                  <SelectItem value="urgencia">Urgência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Especialidade */}
            <div>
              <Label>Especialidade</Label>
              <Select
                value={formData.especialidade}
                onValueChange={(value) => setFormData({ ...formData, especialidade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div>
              <Label>Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => setFormData({ ...formData, prioridade: value as Agendamento["prioridade"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status (apenas em edição) */}
            {agendamento && (
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as Agendamento["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                    <SelectItem value="realizado">Realizado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                    <SelectItem value="faltou">Faltou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Observações */}
          <div>
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              rows={3}
              placeholder="Observações adicionais sobre o agendamento"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
