import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VersaoEntidade, useSolicitarReversao } from "@/hooks/useAuditoria";
import {
  ArrowRight,
  GitCompare,
  RotateCcw,
  Check,
  X,
  Clock,
  User,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VersaoComparacaoProps {
  versaoA: VersaoEntidade | null;
  versaoB: VersaoEntidade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSolicitarReversao?: () => void;
}

export function VersaoComparacao({
  versaoA,
  versaoB,
  open,
  onOpenChange,
  onSolicitarReversao,
}: VersaoComparacaoProps) {
  const [showReversaoForm, setShowReversaoForm] = useState(false);
  const [motivoReversao, setMotivoReversao] = useState("");
  const solicitarReversao = useSolicitarReversao();

  if (!versaoA || !versaoB) return null;

  const getDiff = () => {
    const dadosA = versaoA.dados || {};
    const dadosB = versaoB.dados || {};
    const allKeys = new Set([...Object.keys(dadosA), ...Object.keys(dadosB)]);
    
    const changes: Array<{
      campo: string;
      valorA: any;
      valorB: any;
      tipo: 'adicionado' | 'removido' | 'modificado' | 'igual';
    }> = [];

    allKeys.forEach((key) => {
      const valorA = dadosA[key];
      const valorB = dadosB[key];
      
      if (valorA === undefined) {
        changes.push({ campo: key, valorA, valorB, tipo: 'adicionado' });
      } else if (valorB === undefined) {
        changes.push({ campo: key, valorA, valorB, tipo: 'removido' });
      } else if (JSON.stringify(valorA) !== JSON.stringify(valorB)) {
        changes.push({ campo: key, valorA, valorB, tipo: 'modificado' });
      } else {
        changes.push({ campo: key, valorA, valorB, tipo: 'igual' });
      }
    });

    return changes;
  };

  const handleSolicitarReversao = async () => {
    if (!motivoReversao.trim()) return;

    await solicitarReversao.mutateAsync({
      entidade: versaoA.entidade,
      entidade_id: versaoA.entidade_id,
      versao_atual: versaoB.versao,
      versao_destino: versaoA.versao,
      motivo: motivoReversao,
    });

    setShowReversaoForm(false);
    setMotivoReversao("");
    onOpenChange(false);
    onSolicitarReversao?.();
  };

  const diff = getDiff();
  const changedFields = diff.filter((d) => d.tipo !== 'igual');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparação de Versões
          </DialogTitle>
          <DialogDescription>
            Comparando versão {versaoA.versao} com versão {versaoB.versao}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Versão A */}
          <div className="border rounded-lg p-3 bg-red-50/50">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="bg-red-100">
                Versão {versaoA.versao}
              </Badge>
              {versaoA.revertido && (
                <Badge variant="secondary">Revertida</Badge>
              )}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(versaoA.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <code className="text-[10px]">{versaoA.hash_dados.slice(0, 16)}...</code>
              </div>
            </div>
          </div>

          {/* Versão B */}
          <div className="border rounded-lg p-3 bg-green-50/50">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="bg-green-100">
                Versão {versaoB.versao}
              </Badge>
              {versaoB.revertido && (
                <Badge variant="secondary">Revertida</Badge>
              )}
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(versaoB.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </div>
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3" />
                <code className="text-[10px]">{versaoB.hash_dados.slice(0, 16)}...</code>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {changedFields.length} campo(s) alterado(s)
          </span>
          {versaoA.versao < versaoB.versao && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReversaoForm(true)}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Solicitar Reversão para v{versaoA.versao}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {diff.map(({ campo, valorA, valorB, tipo }) => (
              <div
                key={campo}
                className={cn(
                  "border rounded-lg p-3",
                  tipo === 'adicionado' && "border-green-200 bg-green-50/50",
                  tipo === 'removido' && "border-red-200 bg-red-50/50",
                  tipo === 'modificado' && "border-yellow-200 bg-yellow-50/50",
                  tipo === 'igual' && "border-gray-100 bg-gray-50/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{campo}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      tipo === 'adicionado' && "bg-green-100 text-green-700",
                      tipo === 'removido' && "bg-red-100 text-red-700",
                      tipo === 'modificado' && "bg-yellow-100 text-yellow-700",
                      tipo === 'igual' && "bg-gray-100 text-gray-500"
                    )}
                  >
                    {tipo === 'adicionado' && <Check className="h-3 w-3 mr-1" />}
                    {tipo === 'removido' && <X className="h-3 w-3 mr-1" />}
                    {tipo}
                  </Badge>
                </div>

                {tipo !== 'igual' && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex-1 p-2 bg-red-50 rounded font-mono overflow-auto max-h-[100px]">
                      {valorA !== undefined ? JSON.stringify(valorA, null, 2) : "(vazio)"}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 p-2 bg-green-50 rounded font-mono overflow-auto max-h-[100px]">
                      {valorB !== undefined ? JSON.stringify(valorB, null, 2) : "(vazio)"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Formulário de reversão */}
        {showReversaoForm && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label>Motivo da Reversão</Label>
              <Textarea
                placeholder="Descreva o motivo para solicitar a reversão..."
                value={motivoReversao}
                onChange={(e) => setMotivoReversao(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReversaoForm(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSolicitarReversao}
                  disabled={!motivoReversao.trim() || solicitarReversao.isPending}
                >
                  {solicitarReversao.isPending ? "Enviando..." : "Solicitar Reversão"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
