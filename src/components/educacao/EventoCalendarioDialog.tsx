import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCalendarioEscolar, type EventoCalendario } from "@/hooks/useCalendarioEscolar";
import { useEscolas } from "@/hooks/useEscolas";
import { useTurmas } from "@/hooks/useTurmas";

type EventoCalendarioDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evento?: EventoCalendario | null;
  onClose: () => void;
};

export function EventoCalendarioDialog({ open, onOpenChange, evento, onClose }: EventoCalendarioDialogProps) {
  const [formData, setFormData] = useState({
    escola_id: "",
    titulo: "",
    descricao: "",
    tipo_evento: "",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    turmas_especificas: [] as string[]
  });

  const { createEvento, updateEvento } = useCalendarioEscolar();
  const { escolas } = useEscolas();
  const { turmas } = useTurmas();

  useEffect(() => {
    if (evento) {
      setFormData({
        escola_id: evento.escola_id || "",
        titulo: evento.titulo,
        descricao: evento.descricao || "",
        tipo_evento: evento.tipo_evento,
        data_inicio: evento.data_inicio,
        data_fim: evento.data_fim || "",
        turmas_especificas: evento.turmas_especificas || []
      });
    } else {
      setFormData({
        escola_id: "",
        titulo: "",
        descricao: "",
        tipo_evento: "",
        data_inicio: new Date().toISOString().split('T')[0],
        data_fim: "",
        turmas_especificas: []
      });
    }
  }, [evento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventoData = {
        ...formData,
        escola_id: formData.escola_id || null,
        data_fim: formData.data_fim || null,
        turmas_especificas: formData.turmas_especificas.length > 0 ? formData.turmas_especificas : null
      };

      if (evento) {
        await updateEvento(evento.id, eventoData);
        toast.success("Evento atualizado com sucesso!");
      } else {
        await createEvento(eventoData);
        toast.success("Evento criado com sucesso!");
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error("Erro ao salvar evento. Tente novamente.");
    }
  };

  const tiposEvento = [
    { value: "feriado", label: "Feriado" },
    { value: "reuniao", label: "Reunião" },
    { value: "evento", label: "Evento Escolar" },
    { value: "avaliacao", label: "Avaliação" },
    { value: "formacao", label: "Formação" },
    { value: "conselho", label: "Conselho de Classe" },
    { value: "feira", label: "Feira de Ciências" },
    { value: "festa", label: "Festa Escolar" },
    { value: "palestras", label: "Palestra" },
    { value: "outros", label: "Outros" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {evento ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="titulo">Título do Evento</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Digite o título do evento"
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo_evento">Tipo de Evento</Label>
              <Select 
                value={formData.tipo_evento} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_evento: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposEvento.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="escola_id">Escola (Opcional)</Label>
              <Select 
                value={formData.escola_id || "all"} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, escola_id: value === "all" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as escolas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as escolas</SelectItem>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="data_fim">Data de Fim (Opcional)</Label>
              <Input
                id="data_fim"
                type="date"
                value={formData.data_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                min={formData.data_inicio}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva o evento..."
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Turmas Específicas */}
          <div>
            <Label>Turmas Específicas (Opcional)</Label>
            <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
              {turmas
                .filter(turma => !formData.escola_id || turma.escola_id === formData.escola_id)
                .map((turma) => (
                  <div key={turma.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id={`turma-${turma.id}`}
                      checked={formData.turmas_especificas.includes(turma.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            turmas_especificas: [...prev.turmas_especificas, turma.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            turmas_especificas: prev.turmas_especificas.filter(id => id !== turma.id)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <Label 
                      htmlFor={`turma-${turma.id}`} 
                      className="text-sm cursor-pointer"
                    >
                      {turma.nome} - {turma.serie}
                    </Label>
                  </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Deixe em branco para aplicar a todas as turmas da escola
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {evento ? "Atualizar" : "Criar"} Evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}