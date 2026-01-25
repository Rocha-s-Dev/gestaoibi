import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Bell, CheckCircle, Eye, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertaEducacional } from "@/hooks/useAlertasEducacionais";

interface AlertaItemProps {
  alerta: AlertaEducacional;
  onResolver: () => void;
}

const tipoLabels: Record<string, string> = {
  faltas_excessivas: "Faltas Excessivas",
  nota_baixa: "Nota Baixa",
  risco_reprovacao: "Risco de Reprovação",
  evasao: "Risco de Evasão",
};

const nivelColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  warning: "bg-orange-500 text-white",
  info: "bg-blue-500 text-white",
};

const nivelIcons: Record<string, React.ReactNode> = {
  critical: <AlertTriangle className="h-5 w-5" />,
  warning: <Eye className="h-5 w-5" />,
  info: <Bell className="h-5 w-5" />,
};

export function AlertaItem({ alerta, onResolver }: AlertaItemProps) {
  const alunoData = alerta.aluno;
  const nivel = alerta.nivel || 'info';

  return (
    <Card className={`transition-all ${alerta.resolvido ? 'bg-muted/50 opacity-75' : ''}`}>
      <CardContent className="flex items-start gap-4 p-4">
        <div className={`rounded-full p-2 ${nivelColors[nivel] || 'bg-muted'}`}>
          {nivelIcons[nivel] || <Bell className="h-5 w-5" />}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={nivel === "critical" ? "destructive" : "secondary"}>
              {tipoLabels[alerta.tipo] || alerta.tipo}
            </Badge>
            {alerta.resolvido && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <CheckCircle className="mr-1 h-3 w-3" />
                Resolvido
              </Badge>
            )}
          </div>

          <p className="text-sm font-medium">{alerta.mensagem}</p>

          {alunoData && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{alunoData.nome}</span>
              </div>
              <span>Matrícula: {alunoData.numero_matricula}</span>
              {alunoData.turma_atual && (
                <span>Turma: {alunoData.turma_atual.nome}</span>
              )}
              {alunoData.escola && (
                <span className="hidden md:inline">Escola: {alunoData.escola.nome}</span>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {alerta.created_at && (
              <span>
                Gerado em: {format(new Date(alerta.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!alerta.resolvido && (
            <Button variant="outline" size="sm" onClick={onResolver}>
              <CheckCircle className="mr-1 h-4 w-4" />
              Resolver
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
