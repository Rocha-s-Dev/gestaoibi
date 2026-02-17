import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  alunos: any[];
  notas: any[];
  faltas: any[];
  turmas: any[];
  onRegistrarIntervencao: (aluno: any) => void;
}

type StatusRisco = "verde" | "amarelo" | "vermelho";

export function AlunosEmRisco({ alunos, notas, faltas, turmas, onRegistrarIntervencao }: Props) {
  const alunosComRisco = useMemo(() => {
    const alunoNotasMap: Record<string, number[]> = {};
    const alunoNotasBimMap: Record<string, Record<number, number[]>> = {};
    notas.forEach((n: any) => {
      if (!alunoNotasMap[n.aluno_id]) alunoNotasMap[n.aluno_id] = [];
      alunoNotasMap[n.aluno_id].push(n.nota || 0);
      if (!alunoNotasBimMap[n.aluno_id]) alunoNotasBimMap[n.aluno_id] = {};
      const b = n.bimestre || 1;
      if (!alunoNotasBimMap[n.aluno_id][b]) alunoNotasBimMap[n.aluno_id][b] = [];
      alunoNotasBimMap[n.aluno_id][b].push(n.nota || 0);
    });

    const alunoFaltasMap: Record<string, number> = {};
    faltas.forEach((f: any) => {
      alunoFaltasMap[f.aluno_id] = (alunoFaltasMap[f.aluno_id] || 0) + 1;
    });

    return alunos.map((a: any) => {
      const notasAluno = alunoNotasMap[a.id] || [];
      const media = notasAluno.length > 0 ? notasAluno.reduce((x, y) => x + y, 0) / notasAluno.length : null;
      const faltasCount = alunoFaltasMap[a.id] || 0;
      const frequencia = Math.max(0, 100 - (faltasCount / 200) * 100);

      // Check queda de desempenho
      const bimNotas = alunoNotasBimMap[a.id] || {};
      const bimestres = Object.keys(bimNotas).map(Number).sort();
      let queda = false;
      if (bimestres.length >= 2) {
        const lastBim = bimestres[bimestres.length - 1];
        const prevBim = bimestres[bimestres.length - 2];
        const mediaLast = bimNotas[lastBim].reduce((x, y) => x + y, 0) / bimNotas[lastBim].length;
        const mediaPrev = bimNotas[prevBim].reduce((x, y) => x + y, 0) / bimNotas[prevBim].length;
        queda = mediaLast < mediaPrev - 1;
      }

      let status: StatusRisco = "verde";
      if ((media !== null && media < 6) || frequencia < 75) {
        status = "vermelho";
      } else if (queda || (media !== null && media < 7)) {
        status = "amarelo";
      }

      const turma = turmas.find((t: any) => t.id === a.turma_id);

      return {
        ...a,
        media: media !== null ? media.toFixed(1) : "-",
        frequencia: frequencia.toFixed(1),
        status,
        queda,
        turmaNome: turma?.nome || "-",
      };
    }).filter((a) => a.status !== "verde").sort((a, b) => {
      const order = { vermelho: 0, amarelo: 1, verde: 2 };
      return order[a.status] - order[b.status];
    });
  }, [alunos, notas, faltas, turmas]);

  const statusBadge = (status: StatusRisco) => {
    switch (status) {
      case "vermelho": return <Badge variant="destructive">Crítico</Badge>;
      case "amarelo": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Atenção</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alunos em Risco ({alunosComRisco.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Média</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alunosComRisco.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum aluno em situação de risco</TableCell></TableRow>
              ) : alunosComRisco.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell>{aluno.turmaNome}</TableCell>
                  <TableCell>{aluno.media}</TableCell>
                  <TableCell>{aluno.frequencia}%</TableCell>
                  <TableCell>{statusBadge(aluno.status)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => onRegistrarIntervencao(aluno)}>
                      Registrar Intervenção
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
