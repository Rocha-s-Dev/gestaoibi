import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotasFilho } from "@/hooks/usePortalResponsavel";
import { BookOpen, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NotasResponsavelProps {
  alunoId: string;
  alunoNome: string;
}

export function NotasResponsavel({ alunoId, alunoNome }: NotasResponsavelProps) {
  const { data: notas = [], isLoading } = useNotasFilho(alunoId);

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

  // Agrupar notas por disciplina
  const notasPorDisciplina = notas.reduce((acc, nota) => {
    const disciplinaId = nota.disciplina?.id || "sem-disciplina";
    if (!acc[disciplinaId]) {
      acc[disciplinaId] = {
        disciplina: nota.disciplina?.nome || "Sem disciplina",
        bimestres: {},
      };
    }
    acc[disciplinaId].bimestres[nota.bimestre] = nota.nota;
    return acc;
  }, {} as Record<string, { disciplina: string; bimestres: Record<number, number | null> }>);

  const disciplinas = Object.values(notasPorDisciplina);

  const getNotaBadge = (nota: number | null | undefined) => {
    if (nota === null || nota === undefined) {
      return <Badge variant="outline">-</Badge>;
    }
    if (nota >= 7) {
      return <Badge className="bg-green-500 hover:bg-green-600">{nota.toFixed(1)}</Badge>;
    }
    if (nota >= 5) {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{nota.toFixed(1)}</Badge>;
    }
    return <Badge className="bg-red-500 hover:bg-red-600">{nota.toFixed(1)}</Badge>;
  };

  const calcularMedia = (bimestres: Record<number, number | null>) => {
    const notasValidas = Object.values(bimestres).filter((n): n is number => n !== null);
    if (notasValidas.length === 0) return null;
    return notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Notas de {alunoNome}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {disciplinas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma nota registrada ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-center">1º Bim</TableHead>
                  <TableHead className="text-center">2º Bim</TableHead>
                  <TableHead className="text-center">3º Bim</TableHead>
                  <TableHead className="text-center">4º Bim</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disciplinas.map((item, index) => {
                  const media = calcularMedia(item.bimestres);
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.disciplina}</TableCell>
                      <TableCell className="text-center">
                        {getNotaBadge(item.bimestres[1])}
                      </TableCell>
                      <TableCell className="text-center">
                        {getNotaBadge(item.bimestres[2])}
                      </TableCell>
                      <TableCell className="text-center">
                        {getNotaBadge(item.bimestres[3])}
                      </TableCell>
                      <TableCell className="text-center">
                        {getNotaBadge(item.bimestres[4])}
                      </TableCell>
                      <TableCell className="text-center">
                        {media !== null ? (
                          <span className="font-semibold">{media.toFixed(1)}</span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {media !== null && (
                          <div className="flex items-center justify-center">
                            {media >= 7 ? (
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            ) : media >= 5 ? (
                              <Minus className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500 hover:bg-green-600">≥ 7.0</Badge>
            <span>Aprovado</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-500 hover:bg-yellow-600">5.0 - 6.9</Badge>
            <span>Recuperação</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-500 hover:bg-red-600">&lt; 5.0</Badge>
            <span>Atenção</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
