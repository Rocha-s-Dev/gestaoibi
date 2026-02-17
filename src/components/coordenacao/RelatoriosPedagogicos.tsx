import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExportButtons } from "@/components/shared/ExportButtons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  alunos: any[];
  notas: any[];
  faltas: any[];
  turmas: any[];
  disciplinas: any[];
  escolas: any[];
  escolaId?: string | null;
}

export function RelatoriosPedagogicos({ alunos, notas, faltas, turmas, disciplinas, escolas, escolaId }: Props) {
  const [filtroEscola, setFiltroEscola] = useState<string>(escolaId || "all");
  const [filtroTurma, setFiltroTurma] = useState<string>("all");
  const [filtroBimestre, setFiltroBimestre] = useState<string>("all");

  const notasFiltradas = useMemo(() => {
    let filtered = notas;
    if (filtroEscola !== "all") filtered = filtered.filter((n: any) => n.aluno?.escola_id === filtroEscola);
    if (filtroTurma !== "all") filtered = filtered.filter((n: any) => n.aluno?.turma_id === filtroTurma);
    if (filtroBimestre !== "all") filtered = filtered.filter((n: any) => n.bimestre?.toString() === filtroBimestre);
    return filtered;
  }, [notas, filtroEscola, filtroTurma, filtroBimestre]);

  // Desempenho por turma
  const desempenhoPorTurma = useMemo(() => {
    const map: Record<string, { nome: string; soma: number; count: number }> = {};
    notasFiltradas.forEach((n: any) => {
      const tid = n.aluno?.turma_id;
      if (!tid) return;
      if (!map[tid]) {
        const turma = turmas.find((t: any) => t.id === tid);
        map[tid] = { nome: turma?.nome || "-", soma: 0, count: 0 };
      }
      map[tid].soma += n.nota || 0;
      map[tid].count++;
    });
    return Object.values(map).map((t) => ({ turma: t.nome, media: (t.soma / t.count).toFixed(1), total: t.count }));
  }, [notasFiltradas, turmas]);

  // Desempenho por disciplina
  const desempenhoPorDisciplina = useMemo(() => {
    const map: Record<string, { nome: string; soma: number; count: number }> = {};
    notasFiltradas.forEach((n: any) => {
      const did = n.disciplina_id;
      if (!did) return;
      if (!map[did]) {
        const disc = disciplinas.find((d: any) => d.id === did);
        map[did] = { nome: disc?.nome || "-", soma: 0, count: 0 };
      }
      map[did].soma += n.nota || 0;
      map[did].count++;
    });
    return Object.values(map).map((d) => ({ disciplina: d.nome, media: (d.soma / d.count).toFixed(1), total: d.count }));
  }, [notasFiltradas, disciplinas]);

  // Alunos em risco
  const alunosEmRisco = useMemo(() => {
    const alunoNotasMap: Record<string, number[]> = {};
    notasFiltradas.forEach((n: any) => {
      if (!alunoNotasMap[n.aluno_id]) alunoNotasMap[n.aluno_id] = [];
      alunoNotasMap[n.aluno_id].push(n.nota || 0);
    });
    const alunoFaltasMap: Record<string, number> = {};
    faltas.forEach((f: any) => {
      alunoFaltasMap[f.aluno_id] = (alunoFaltasMap[f.aluno_id] || 0) + 1;
    });
    return alunos.filter((a: any) => {
      if (filtroEscola !== "all" && a.escola_id !== filtroEscola) return false;
      if (filtroTurma !== "all" && a.turma_id !== filtroTurma) return false;
      const media = alunoNotasMap[a.id] ? alunoNotasMap[a.id].reduce((x, y) => x + y, 0) / alunoNotasMap[a.id].length : 10;
      const faltasCount = alunoFaltasMap[a.id] || 0;
      const freq = 100 - (faltasCount / 200) * 100;
      return media < 6 || freq < 75;
    }).map((a: any) => {
      const media = alunoNotasMap[a.id] ? (alunoNotasMap[a.id].reduce((x, y) => x + y, 0) / alunoNotasMap[a.id].length).toFixed(1) : "-";
      const faltasCount = alunoFaltasMap[a.id] || 0;
      const freq = (100 - (faltasCount / 200) * 100).toFixed(1);
      const turma = turmas.find((t: any) => t.id === a.turma_id);
      return { nome: a.nome, turma: turma?.nome || "-", media, frequencia: freq };
    });
  }, [alunos, notasFiltradas, faltas, turmas, filtroEscola, filtroTurma]);

  const turmaExportData = desempenhoPorTurma.map((t) => ({ Turma: t.turma, "Média": t.media, "Lançamentos": t.total }));
  const disciplinaExportData = desempenhoPorDisciplina.map((d) => ({ Disciplina: d.disciplina, "Média": d.media, "Lançamentos": d.total }));
  const riscoExportData = alunosEmRisco.map((a) => ({ Aluno: a.nome, Turma: a.turma, "Média": a.media, "Frequência": a.frequencia }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {!escolaId && (
          <Select value={filtroEscola} onValueChange={setFiltroEscola}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Escola" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as escolas</SelectItem>
              {escolas.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={filtroTurma} onValueChange={setFiltroTurma}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Turma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {turmas.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroBimestre} onValueChange={setFiltroBimestre}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Bimestre" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="1">1º Bimestre</SelectItem>
            <SelectItem value="2">2º Bimestre</SelectItem>
            <SelectItem value="3">3º Bimestre</SelectItem>
            <SelectItem value="4">4º Bimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="turma">
        <TabsList>
          <TabsTrigger value="turma">Por Turma</TabsTrigger>
          <TabsTrigger value="disciplina">Por Disciplina</TabsTrigger>
          <TabsTrigger value="risco">Alunos em Risco</TabsTrigger>
        </TabsList>
        <TabsContent value="turma">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Desempenho por Turma</CardTitle>
              <ExportButtons data={turmaExportData} filename="desempenho-turma" title="Desempenho por Turma" columns={[{ header: "Turma", key: "Turma" }, { header: "Média", key: "Média" }, { header: "Lançamentos", key: "Lançamentos" }]} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Turma</TableHead><TableHead>Média</TableHead><TableHead>Lançamentos</TableHead></TableRow></TableHeader>
                <TableBody>
                  {desempenhoPorTurma.map((t, i) => (
                    <TableRow key={i}><TableCell>{t.turma}</TableCell><TableCell>{t.media}</TableCell><TableCell>{t.total}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="disciplina">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Desempenho por Disciplina</CardTitle>
              <ExportButtons data={disciplinaExportData} filename="desempenho-disciplina" title="Desempenho por Disciplina" columns={[{ header: "Disciplina", key: "Disciplina" }, { header: "Média", key: "Média" }, { header: "Lançamentos", key: "Lançamentos" }]} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Disciplina</TableHead><TableHead>Média</TableHead><TableHead>Lançamentos</TableHead></TableRow></TableHeader>
                <TableBody>
                  {desempenhoPorDisciplina.map((d, i) => (
                    <TableRow key={i}><TableCell>{d.disciplina}</TableCell><TableCell>{d.media}</TableCell><TableCell>{d.total}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="risco">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Alunos em Risco</CardTitle>
              <ExportButtons data={riscoExportData} filename="alunos-risco" title="Alunos em Risco" columns={[{ header: "Aluno", key: "Aluno" }, { header: "Turma", key: "Turma" }, { header: "Média", key: "Média" }, { header: "Frequência", key: "Frequência" }]} />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Aluno</TableHead><TableHead>Turma</TableHead><TableHead>Média</TableHead><TableHead>Frequência</TableHead></TableRow></TableHeader>
                <TableBody>
                  {alunosEmRisco.map((a, i) => (
                    <TableRow key={i}><TableCell>{a.nome}</TableCell><TableCell>{a.turma}</TableCell><TableCell>{a.media}</TableCell><TableCell>{a.frequencia}%</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
