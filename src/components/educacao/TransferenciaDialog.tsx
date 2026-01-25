import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAlunos } from "@/hooks/useAlunos";
import { useEscolas } from "@/hooks/useEscolas";
import { useTurmas } from "@/hooks/useTurmas";
import { useTransferencias, TipoTransferencia } from "@/hooks/useHistoricoTransferencias";
import { toast } from "sonner";

interface TransferenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function TransferenciaDialog({ open, onOpenChange, onClose }: TransferenciaDialogProps) {
  const [alunoId, setAlunoId] = useState("");
  const [tipo, setTipo] = useState<TipoTransferencia>("interna_turma");
  const [escolaDestinoId, setEscolaDestinoId] = useState("");
  const [turmaDestinoId, setTurmaDestinoId] = useState("");
  const [escolaExternaDestino, setEscolaExternaDestino] = useState("");
  const [motivo, setMotivo] = useState("");
  const [loading, setLoading] = useState(false);

  const { alunos } = useAlunos();
  const { escolas } = useEscolas();
  const { turmas } = useTurmas();
  const { solicitarTransferencia } = useTransferencias();

  const alunoSelecionado = alunos.find(a => a.id === alunoId);
  const turmasFiltradas = escolaDestinoId 
    ? turmas.filter(t => t.escola_id === escolaDestinoId)
    : turmas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alunoId) {
      toast.error("Selecione um aluno");
      return;
    }

    if ((tipo === "interna_escola" || tipo === "interna_turma") && !turmaDestinoId) {
      toast.error("Selecione a turma de destino");
      return;
    }

    if (tipo === "externa_saida" && !escolaExternaDestino) {
      toast.error("Informe a escola de destino");
      return;
    }

    try {
      setLoading(true);
      
      await solicitarTransferencia({
        aluno_id: alunoId,
        escola_origem_id: alunoSelecionado?.escola_id,
        turma_origem_id: alunoSelecionado?.turma_id,
        escola_destino_id: tipo === "interna_escola" ? escolaDestinoId : undefined,
        turma_destino_id: tipo !== "externa_saida" ? turmaDestinoId : undefined,
        motivo
      });
      
      toast.success("Solicitação de transferência criada com sucesso!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao solicitar transferência:", error);
      toast.error("Erro ao solicitar transferência");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAlunoId("");
    setTipo("interna_turma");
    setEscolaDestinoId("");
    setTurmaDestinoId("");
    setEscolaExternaDestino("");
    setMotivo("");
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Transferência</DialogTitle>
          <DialogDescription>
            Solicitar transferência de aluno entre turmas, escolas ou para rede externa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="aluno">Aluno *</Label>
            <Select value={alunoId} onValueChange={setAlunoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.filter(a => a.situacao === 'ativo').map((aluno) => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.nome} - {aluno.numero_matricula}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo">Tipo de Transferência *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as TipoTransferencia)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interna_turma">Interna - Mudança de Turma</SelectItem>
                <SelectItem value="interna_escola">Interna - Mudança de Escola</SelectItem>
                <SelectItem value="externa_saida">Externa - Saída da Rede</SelectItem>
                <SelectItem value="externa_entrada">Externa - Entrada na Rede</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === "interna_escola" && (
            <div>
              <Label htmlFor="escolaDestino">Escola de Destino *</Label>
              <Select value={escolaDestinoId} onValueChange={setEscolaDestinoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a escola" />
                </SelectTrigger>
                <SelectContent>
                  {escolas.filter(e => e.id !== alunoSelecionado?.escola_id).map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(tipo === "interna_turma" || tipo === "interna_escola") && (
            <div>
              <Label htmlFor="turmaDestino">Turma de Destino *</Label>
              <Select value={turmaDestinoId} onValueChange={setTurmaDestinoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a turma" />
                </SelectTrigger>
                <SelectContent>
                  {turmasFiltradas
                    .filter(t => t.id !== alunoSelecionado?.turma_id)
                    .map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.serie}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === "externa_saida" && (
            <div>
              <Label htmlFor="escolaExterna">Escola de Destino (Externa) *</Label>
              <Input
                id="escolaExterna"
                value={escolaExternaDestino}
                onChange={(e) => setEscolaExternaDestino(e.target.value)}
                placeholder="Nome da escola de destino"
              />
            </div>
          )}

          <div>
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Descreva o motivo da transferência"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Solicitando..." : "Solicitar Transferência"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
