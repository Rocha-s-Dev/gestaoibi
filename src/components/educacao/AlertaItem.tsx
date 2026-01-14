import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Bell, CheckCircle, Eye, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertaItemProps {
  alerta: {
    id: string;
    tipo: string;
    nivel: string;
    mensagem: string;
    lido: boolean | null;
    resolvido: boolean | null;
    created_at: string | null;
    data_resolucao: string | null;
    dados_adicionais: any;
    alunos?: {
      nome: string;
      numero_matricula: string;
      turmas?: {
        nome: string;
        escolas?: {
          nome: string;
        };
      };
    };
  };
  onMarcarLido: () => void;
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

export function AlertaItem({ alerta, onMarcarLido, onResolver }: AlertaItemProps) {
  const aluno = alerta.alunos;

  return (
    <Card className={`transition-all ${alerta.lido ? 'opacity-75' : ''} ${alerta.resolvido ? 'bg-muted/50' : ''}`}>
      <CardContent className="flex items-start gap-4 p-4">
        <div className={`rounded-full p-2 ${nivelColors[alerta.nivel] || 'bg-muted'}`}>
          {nivelIcons[alerta.nivel] || <Bell className="h-5 w-5" />}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={alerta.nivel === "critical" ? "destructive" : "secondary"}>
              {tipoLabels[alerta.tipo] || alerta.tipo}
            </Badge>
            {!alerta.lido && (
              <Badge variant="outline" className="border-primary text-primary">
                Novo
              </Badge>
            )}
            {alerta.resolvido && (
              <Badge variant="outline" className="border-green-500 text-green-500">
                <CheckCircle className="mr-1 h-3 w-3" />
                Resolvido
              </Badge>
            )}
          </div>

          <p className="text-sm font-medium">{alerta.mensagem}</p>

          {aluno && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{aluno.nome}</span>
              </div>
              <span>Matrícula: {aluno.numero_matricula}</span>
              {aluno.turmas && (
                <span>Turma: {aluno.turmas.nome}</span>
              )}
              {aluno.turmas?.escolas && (
                <span className="hidden md:inline">Escola: {aluno.turmas.escolas.nome}</span>
              )}
            </div>
          )}

          {alerta.dados_adicionais && (
            <div className="text-xs text-muted-foreground">
              {alerta.dados_adicionais.percentual_faltas && (
                <span>Percentual de faltas: {alerta.dados_adicionais.percentual_faltas.toFixed(1)}%</span>
              )}
              {alerta.dados_adicionais.media_notas && (
                <span>Média: {alerta.dados_adicionais.media_notas.toFixed(1)}</span>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {alerta.created_at && (
              <span>
                Gerado em: {format(new Date(alerta.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
            {alerta.data_resolucao && (
              <span className="ml-4">
                Resolvido em: {format(new Date(alerta.data_resolucao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {!alerta.lido && (
            <Button variant="ghost" size="sm" onClick={onMarcarLido}>
              <Eye className="mr-1 h-4 w-4" />
              Marcar lido
            </Button>
          )}
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
