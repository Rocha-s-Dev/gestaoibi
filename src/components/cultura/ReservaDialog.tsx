
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Reserva } from "./ReservasAgendamentos";

interface ReservaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserva: Reserva | null;
  onSubmit: (reservaData: any) => void;
}

// Simulando dados de espaços disponíveis - em uma aplicação real, isso viria de uma API
const espacosDisponiveis = [
  { id: "1", nome: "Teatro Municipal" },
  { id: "2", nome: "Ginásio Poliesportivo" },
  { id: "3", nome: "Biblioteca Central" },
  { id: "4", nome: "Auditório da Cultura" },
];

export function ReservaDialog({ open, onOpenChange, reserva, onSubmit }: ReservaDialogProps) {
  const [formData, setFormData] = useState({
    espacoId: "",
    espacoNome: "",
    evento: "",
    responsavel: "",
    contato: "",
    dataInicio: "",
    dataFim: "",
    horaInicio: "",
    horaFim: "",
    status: "pendente" as Reserva["status"],
    observacoes: "",
    dataCriacao: new Date().toISOString().split('T')[0]
  });

  const [conflitos, setConflitos] = useState<string[]>([]);

  useEffect(() => {
    if (reserva) {
      setFormData({
        espacoId: reserva.espacoId,
        espacoNome: reserva.espacoNome,
        evento: reserva.evento,
        responsavel: reserva.responsavel,
        contato: reserva.contato,
        dataInicio: reserva.dataInicio,
        dataFim: reserva.dataFim,
        horaInicio: reserva.horaInicio,
        horaFim: reserva.horaFim,
        status: reserva.status,
        observacoes: reserva.observacoes || "",
        dataCriacao: reserva.dataCriacao
      });
    } else {
      setFormData({
        espacoId: "",
        espacoNome: "",
        evento: "",
        responsavel: "",
        contato: "",
        dataInicio: "",
        dataFim: "",
        horaInicio: "",
        horaFim: "",
        status: "pendente",
        observacoes: "",
        dataCriacao: new Date().toISOString().split('T')[0]
      });
    }
    setConflitos([]);
  }, [reserva]);

  const verificarConflitos = () => {
    // Simulação de verificação de conflitos - em uma aplicação real, isso faria uma consulta ao backend
    const conflitosEncontrados: string[] = [];
    
    if (formData.espacoId && formData.dataInicio && formData.horaInicio) {
      // Simulando um conflito potencial
      if (formData.espacoId === "1" && formData.dataInicio === "2024-06-15") {
        conflitosEncontrados.push("Já existe uma reserva para este espaço no horário solicitado");
      }
    }
    
    setConflitos(conflitosEncontrados);
  };

  const handleEspacoChange = (espacoId: string) => {
    const espaco = espacosDisponiveis.find(e => e.id === espacoId);
    setFormData(prev => ({
      ...prev,
      espacoId,
      espacoNome: espaco?.nome || ""
    }));
    
    // Verificar conflitos quando o espaço mudar
    if (formData.dataInicio && formData.horaInicio) {
      verificarConflitos();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar conflitos antes de submeter
    verificarConflitos();
    
    if (conflitos.length > 0) {
      return; // Não submeter se houver conflitos
    }
    
    if (reserva) {
      onSubmit({ ...formData, id: reserva.id });
    } else {
      onSubmit(formData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reserva ? "Editar Reserva" : "Nova Reserva"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="espaco">Espaço</Label>
              <Select value={formData.espacoId} onValueChange={handleEspacoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um espaço" />
                </SelectTrigger>
                <SelectContent>
                  {espacosDisponiveis.map((espaco) => (
                    <SelectItem key={espaco.id} value={espaco.id}>
                      {espaco.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="evento">Nome do Evento</Label>
              <Input
                id="evento"
                value={formData.evento}
                onChange={(e) => setFormData(prev => ({ ...prev, evento: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="contato">Contato</Label>
              <Input
                id="contato"
                type="tel"
                value={formData.contato}
                onChange={(e) => setFormData(prev => ({ ...prev, contato: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, dataInicio: e.target.value }));
                  if (formData.espacoId && formData.horaInicio) {
                    setTimeout(verificarConflitos, 100);
                  }
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data de Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData(prev => ({ ...prev, dataFim: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="horaInicio">Horário de Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, horaInicio: e.target.value }));
                  if (formData.espacoId && formData.dataInicio) {
                    setTimeout(verificarConflitos, 100);
                  }
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="horaFim">Horário de Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={formData.horaFim}
                onChange={(e) => setFormData(prev => ({ ...prev, horaFim: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: Reserva["status"]) => 
              setFormData(prev => ({ ...prev, status: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="confirmada">Confirmada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
              placeholder="Equipamentos especiais, requisitos técnicos, etc."
            />
          </div>

          {conflitos.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-red-800 font-medium mb-2">Conflitos de Agendamento:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                {conflitos.map((conflito, index) => (
                  <li key={index}>• {conflito}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={conflitos.length > 0}>
              {reserva ? "Atualizar" : "Cadastrar"} Reserva
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
