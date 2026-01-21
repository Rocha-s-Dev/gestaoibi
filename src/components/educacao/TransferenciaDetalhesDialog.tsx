import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Transferencia, StatusTransferencia } from "@/hooks/useHistoricoTransferencias";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, Calendar, FileText, User, School, Info } from "lucide-react";

interface TransferenciaDetalhesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferencia: Transferencia;
}

const statusConfig: Record<StatusTransferencia, { label: string; color: string }> = {
  solicitada: { label: "Solicitada", color: "bg-yellow-100 text-yellow-800" },
  em_analise: { label: "Em Análise", color: "bg-blue-100 text-blue-800" },
  aprovada: { label: "Aprovada", color: "bg-green-100 text-green-800" },
  rejeitada: { label: "Rejeitada", color: "bg-red-100 text-red-800" },
  cancelada: { label: "Cancelada", color: "bg-gray-100 text-gray-800" },
  concluida: { label: "Concluída", color: "bg-primary/20 text-primary" },
};

const tipoLabels = {
  interna_turma: "Mudança de Turma",
  interna_escola: "Mudança de Escola",
  externa_entrada: "Entrada na Rede",
  externa_saida: "Saída da Rede",
};

export function TransferenciaDetalhesDialog({ 
  open, 
  onOpenChange, 
  transferencia 
}: TransferenciaDetalhesDialogProps) {
  const { status } = transferencia;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Transferência
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge className={`text-lg px-4 py-2 ${statusConfig[status]?.color}`}>
              {statusConfig[status]?.label}
            </Badge>
          </div>

          <Separator />

          {/* Aluno */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Aluno
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-semibold">{transferencia.aluno?.nome}</p>
              <p className="text-sm text-muted-foreground">
                Matrícula: {transferencia.aluno?.numero_matricula}
              </p>
            </div>
          </div>

          {/* Tipo de Transferência */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="h-4 w-4" />
              Tipo de Transferência
            </div>
            <Badge variant="secondary" className="text-base">
              {tipoLabels[transferencia.tipo]}
            </Badge>
          </div>

          {/* Origem → Destino */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <School className="h-4 w-4" />
              Movimentação
            </div>
            <div className="flex items-center gap-4 bg-muted p-4 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Origem</p>
                <p className="font-medium">
                  {transferencia.escola_origem?.nome || transferencia.escola_externa_origem || "-"}
                </p>
                {transferencia.turma_origem?.nome && (
                  <p className="text-sm text-muted-foreground">
                    Turma: {transferencia.turma_origem.nome}
                  </p>
                )}
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Destino</p>
                <p className="font-medium">
                  {transferencia.escola_destino?.nome || transferencia.escola_externa_destino || "-"}
                </p>
                {transferencia.turma_destino?.nome && (
                  <p className="text-sm text-muted-foreground">
                    Turma: {transferencia.turma_destino.nome}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Data da Solicitação
              </div>
              <p className="font-medium">
                {format(new Date(transferencia.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
            {transferencia.data_efetivacao && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Data de Efetivação
                </div>
                <p className="font-medium">
                  {format(new Date(transferencia.data_efetivacao), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {/* Motivo */}
          {transferencia.motivo && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Motivo</p>
              <p className="bg-muted p-3 rounded-lg text-sm">{transferencia.motivo}</p>
            </div>
          )}

          {/* Observações */}
          {transferencia.observacoes && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Observações</p>
              <p className="bg-muted p-3 rounded-lg text-sm">{transferencia.observacoes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
