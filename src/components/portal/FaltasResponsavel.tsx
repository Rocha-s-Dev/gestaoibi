import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFaltasFilho, FaltaFilho } from "@/hooks/usePortalResponsavel";
import { Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FaltasResponsavelProps {
  alunoId: string;
  alunoNome: string;
}

export function FaltasResponsavel({ alunoId, alunoNome }: FaltasResponsavelProps) {
  const { data: faltas = [], isLoading } = useFaltasFilho(alunoId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Estatísticas
  const totalFaltas = faltas.filter((f) => !f.justificada).length;
  const faltasJustificadas = faltas.filter((f) => f.justificada).length;

  // Agrupar por mês
  const faltasPorMes = faltas.reduce((acc, falta) => {
    const mes = format(new Date(falta.data), "MMMM yyyy", { locale: ptBR });
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(falta);
    return acc;
  }, {} as Record<string, FaltaFilho[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Frequência de {alunoNome}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{totalFaltas}</p>
            <p className="text-sm text-muted-foreground">Faltas não justificadas</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{faltasJustificadas}</p>
            <p className="text-sm text-muted-foreground">Justificadas</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{faltas.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Lista de Faltas */}
        {faltas.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma falta registrada. Parabéns!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(faltasPorMes).map(([mes, faltasMes]) => (
              <div key={mes}>
                <h4 className="font-medium capitalize mb-3 text-muted-foreground">
                  {mes}
                </h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faltasMes.map((falta) => (
                        <TableRow key={falta.id}>
                          <TableCell>
                            {format(new Date(falta.data), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={falta.justificada ? "outline" : "destructive"}
                            >
                              {falta.justificada ? "Justificada" : "Não Justificada"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {falta.motivo ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm truncate max-w-[200px]">
                                  {falta.motivo}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">Sem motivo informado</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alerta de frequência */}
        {totalFaltas > 10 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Atenção à Frequência</p>
              <p className="text-sm text-muted-foreground">
                O aluno possui mais de 10 faltas. Entre em contato com a escola para mais informações.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
