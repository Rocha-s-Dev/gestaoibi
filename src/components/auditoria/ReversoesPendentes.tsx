import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSolicitacoesReversao, useAprovarReversao, SolicitacaoReversao } from "@/hooks/useAuditoria";
import { Check, X, RotateCcw, Clock, User } from "lucide-react";

export function ReversoesPendentes() {
  const { data: solicitacoes, isLoading } = useSolicitacoesReversao();
  const aprovarReversao = useAprovarReversao();
  
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoReversao | null>(null);
  const [showRejeicaoDialog, setShowRejeicaoDialog] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState("");

  const handleAprovar = async (solicitacao: SolicitacaoReversao) => {
    await aprovarReversao.mutateAsync({
      id: solicitacao.id,
      aprovar: true,
    });
  };

  const handleRejeitar = async () => {
    if (!selectedSolicitacao) return;
    
    await aprovarReversao.mutateAsync({
      id: selectedSolicitacao.id,
      aprovar: false,
      motivo_rejeicao: motivoRejeicao,
    });
    
    setShowRejeicaoDialog(false);
    setSelectedSolicitacao(null);
    setMotivoRejeicao("");
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pendente</Badge>;
      case "aprovado":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Aprovado</Badge>;
      case "rejeitado":
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  const pendentes = solicitacoes?.filter((s) => s.status === "pendente") || [];
  const historico = solicitacoes?.filter((s) => s.status !== "pendente") || [];

  return (
    <div className="space-y-6">
      {/* Pendentes */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Solicitações Pendentes
          {pendentes.length > 0 && (
            <Badge variant="secondary">{pendentes.length}</Badge>
          )}
        </h3>
        
        {pendentes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg">
            Nenhuma solicitação pendente
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entidade</TableHead>
                <TableHead>Versões</TableHead>
                <TableHead>Solicitante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((solicitacao) => (
                <TableRow key={solicitacao.id}>
                  <TableCell className="font-medium">
                    {solicitacao.entidade}
                    <div className="text-xs text-muted-foreground">
                      {solicitacao.entidade_id.slice(0, 8)}...
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">v{solicitacao.versao_atual}</Badge>
                      <RotateCcw className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline">v{solicitacao.versao_destino}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">{solicitacao.solicitante_id.slice(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(solicitacao.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={solicitacao.motivo}>
                    {solicitacao.motivo}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => handleAprovar(solicitacao)}
                        disabled={aprovarReversao.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setSelectedSolicitacao(solicitacao);
                          setShowRejeicaoDialog(true);
                        }}
                        disabled={aprovarReversao.isPending}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Histórico */}
      {historico.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Histórico de Solicitações</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entidade</TableHead>
                <TableHead>Versões</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Aprovador</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.slice(0, 10).map((solicitacao) => (
                <TableRow key={solicitacao.id}>
                  <TableCell className="font-medium">{solicitacao.entidade}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">v{solicitacao.versao_atual}</Badge>
                      <RotateCcw className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline">v{solicitacao.versao_destino}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>{statusBadge(solicitacao.status)}</TableCell>
                  <TableCell>
                    {solicitacao.aprovado_em &&
                      format(new Date(solicitacao.aprovado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {solicitacao.aprovador_id?.slice(0, 8)}...
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de Rejeição */}
      <Dialog open={showRejeicaoDialog} onOpenChange={setShowRejeicaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação de Reversão</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição desta solicitação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Motivo da Rejeição</Label>
            <Textarea
              placeholder="Descreva o motivo..."
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejeicaoDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejeitar}
              disabled={!motivoRejeicao.trim() || aprovarReversao.isPending}
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
