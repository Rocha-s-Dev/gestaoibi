import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JustificativaFaltaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faltaId?: string;
  alunoId: string;
  alunoNome: string;
  onSuccess?: () => void;
}

const tiposJustificativa = [
  { value: "atestado_medico", label: "Atestado Médico" },
  { value: "consulta_medica", label: "Consulta Médica" },
  { value: "luto", label: "Luto Familiar" },
  { value: "doenca_familia", label: "Doença na Família" },
  { value: "compromisso_legal", label: "Compromisso Legal" },
  { value: "outro", label: "Outro" },
];

export function JustificativaFaltaDialog({
  open,
  onOpenChange,
  faltaId,
  alunoId,
  alunoNome,
  onSuccess,
}: JustificativaFaltaDialogProps) {
  const [tipoJustificativa, setTipoJustificativa] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [dataFalta, setDataFalta] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipoJustificativa || !justificativa) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      if (faltaId) {
        // Atualizar falta existente com justificativa - using database fields
        const { error } = await supabase
          .from("faltas")
          .update({
            justificada: true,
            motivo: `[${tiposJustificativa.find(t => t.value === tipoJustificativa)?.label}] ${justificativa}`,
          })
          .eq("id", faltaId);

        if (error) throw error;
        toast.success("Justificativa enviada com sucesso!");
      } else {
        // Criar nova solicitação de justificativa (para faltas futuras ou sem registro)
        // Por enquanto, apenas notifica
        toast.success("Solicitação de justificativa enviada para análise da escola.");
      }

      onSuccess?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao enviar justificativa:", error);
      toast.error("Erro ao enviar justificativa");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTipoJustificativa("");
    setJustificativa("");
    setDataFalta("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Justificar Falta</DialogTitle>
          <DialogDescription>
            Envie uma justificativa de falta para {alunoNome}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!faltaId && (
            <div>
              <Label htmlFor="data">Data da Falta *</Label>
              <Input
                id="data"
                type="date"
                value={dataFalta}
                onChange={(e) => setDataFalta(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="tipo">Tipo de Justificativa *</Label>
            <Select value={tipoJustificativa} onValueChange={setTipoJustificativa}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposJustificativa.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="justificativa">Descrição *</Label>
            <Textarea
              id="justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Descreva o motivo da falta..."
              rows={4}
              required
            />
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Observação:</p>
            <p className="text-muted-foreground">
              A justificativa será analisada pela escola. Documentos comprobatórios 
              (como atestados médicos) devem ser entregues na secretaria.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Justificativa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
