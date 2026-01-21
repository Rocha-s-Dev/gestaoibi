import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  User,
  School,
  Calendar
} from "lucide-react";
import { useSolicitacoesMatricula, type SolicitacaoMatricula } from "@/hooks/useSolicitacoesMatricula";

const STATUS_CONFIG = {
  pendente: {
    label: "Pendente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    description: "Sua solicitação foi recebida e está aguardando análise",
  },
  em_analise: {
    label: "Em Análise",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: AlertCircle,
    description: "Sua solicitação está sendo analisada pela equipe da secretaria",
  },
  aprovada: {
    label: "Aprovada",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle2,
    description: "Parabéns! Sua solicitação foi aprovada. Compareça à escola para finalizar a matrícula",
  },
  rejeitada: {
    label: "Indeferida",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    description: "Infelizmente sua solicitação foi indeferida. Verifique o motivo abaixo",
  },
  lista_espera: {
    label: "Lista de Espera",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: Clock,
    description: "Sua solicitação está na lista de espera. Entraremos em contato quando houver vaga",
  },
};

export function ConsultaProtocolo() {
  const [protocolo, setProtocolo] = useState("");
  const [loading, setLoading] = useState(false);
  const [solicitacao, setSolicitacao] = useState<SolicitacaoMatricula | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { consultarPorProtocolo } = useSolicitacoesMatricula();

  const handleConsultar = async () => {
    if (!protocolo.trim()) {
      setError("Digite o número do protocolo");
      return;
    }

    setLoading(true);
    setError(null);
    setSolicitacao(null);

    try {
      const result = await consultarPorProtocolo(protocolo.trim().toUpperCase());
      if (result) {
        setSolicitacao(result);
      } else {
        setError("Protocolo não encontrado. Verifique o número e tente novamente.");
      }
    } catch (err) {
      setError("Erro ao consultar protocolo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pendente;
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="flex-1">
          <Label htmlFor="protocolo">Número do Protocolo</Label>
          <Input
            id="protocolo"
            placeholder="Ex: MAT2024000001"
            value={protocolo}
            onChange={(e) => setProtocolo(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleConsultar()}
            className="mt-1"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleConsultar} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Consultar
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {solicitacao && (
        <Card className="overflow-hidden">
          <div className={`p-4 ${getStatusConfig(solicitacao.status).color}`}>
            <div className="flex items-center gap-3">
              {(() => {
                const StatusIcon = getStatusConfig(solicitacao.status).icon;
                return <StatusIcon className="h-6 w-6" />;
              })()}
              <div>
                <p className="text-sm font-medium">Status da Solicitação</p>
                <p className="text-lg font-bold">{getStatusConfig(solicitacao.status).label}</p>
              </div>
            </div>
            <p className="mt-2 text-sm opacity-90">
              {getStatusConfig(solicitacao.status).description}
            </p>
          </div>

          <CardContent className="p-4 pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Protocolo</span>
                <Badge variant="outline" className="font-mono text-base">
                  {solicitacao.protocolo}
                </Badge>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4" />
                    Dados do Aluno
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Nome:</span> {solicitacao.dados_aluno.nome}</p>
                    <p><span className="text-muted-foreground">Nascimento:</span> {new Date(solicitacao.dados_aluno.data_nascimento).toLocaleDateString("pt-BR")}</p>
                    {solicitacao.dados_aluno.necessidades_especiais && (
                      <p><span className="text-muted-foreground">Necessidades Especiais:</span> Sim</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-semibold">
                    <School className="h-4 w-4" />
                    Dados da Matrícula
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Série:</span> {solicitacao.serie_pretendida}</p>
                    <p><span className="text-muted-foreground">Ano Letivo:</span> {solicitacao.ano_letivo}</p>
                    {solicitacao.escola_preferida && (
                      <p><span className="text-muted-foreground">Escola:</span> {solicitacao.escola_preferida.nome}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Solicitação realizada em {formatDate(solicitacao.created_at)}</span>
              </div>

              {solicitacao.data_processamento && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Processado em {formatDate(solicitacao.data_processamento)}</span>
                </div>
              )}

              {solicitacao.status === "rejeitada" && solicitacao.motivo_rejeicao && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Motivo:</strong> {solicitacao.motivo_rejeicao}
                  </AlertDescription>
                </Alert>
              )}

              {solicitacao.observacoes && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Observações</p>
                  <p className="mt-1 text-sm text-muted-foreground">{solicitacao.observacoes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
