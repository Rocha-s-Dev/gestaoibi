import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { AlertTriangle, TrendingDown, Users, BookOpen } from "lucide-react";

interface Props {
  alunos: any[];
  notas: any[];
  faltas: any[];
  turmas: any[];
  disciplinas: any[];
  escolas: any[];
  escolaId?: string | null;
}

export function DashboardPedagogico({ alunos, notas, faltas, turmas, disciplinas, escolas, escolaId }: Props) {
  const [filtroTurma, setFiltroTurma] = useState<string>("all");
  const [filtroBimestre, setFiltroBimestre] = useState<string>("all");
  const [filtroDisciplina, setFiltroDisciplina] = useState<string>("all");

  const notasFiltradas = useMemo(() => {
    let filtered = notas;
    if (filtroTurma !== "all") filtered = filtered.filter((n: any) => n.aluno?.turma_id === filtroTurma);
    if (filtroBimestre !== "all") filtered = filtered.filter((n: any) => n.bimestre?.toString() === filtroBimestre);
    if (filtroDisciplina !== "all") filtered = filtered.filter((n: any) => n.disciplina_id === filtroDisciplina);
    return filtered;
  }, [notas, filtroTurma, filtroBimestre, filtroDisciplina]);

  const mediaGeral = useMemo(() => {
    if (notasFiltradas.length === 0) return 0;
    const sum = notasFiltradas.reduce((acc: number, n: any) => acc + (n.nota || 0), 0);
    return (sum / notasFiltradas.length).toFixed(1);
  }, [notasFiltradas]);

  const alunosAbaixoMedia = useMemo(() => {
    const alunoNotas: Record<string, number[]> = {};
    notasFiltradas.forEach((n: any) => {
      if (!alunoNotas[n.aluno_id]) alunoNotas[n.aluno_id] = [];
      alunoNotas[n.aluno_id].push(n.nota || 0);
    });
    const total = Object.keys(alunoNotas).length;
    if (total === 0) return 0;
    const abaixo = Object.values(alunoNotas).filter(
      (arr) => arr.reduce((a, b) => a + b, 0) / arr.length < 6
    ).length;
    return ((abaixo / total) * 100).toFixed(1);
  }, [notasFiltradas]);

  const frequenciaMedia = useMemo(() => {
    if (alunos.length === 0) return 100;
    const totalFaltas = faltas.length;
    // Approximation: assume 200 school days
    const freq = Math.max(0, 100 - (totalFaltas / Math.max(alunos.length, 1)) * 100 / 200 * 100);
    return freq.toFixed(1);
  }, [alunos, faltas]);

  const alunosEmRisco = useMemo(() => {
    const alunoNotas: Record<string, number[]> = {};
    notas.forEach((n: any) => {
      if (!alunoNotas[n.aluno_id]) alunoNotas[n.aluno_id] = [];
      alunoNotas[n.aluno_id].push(n.nota || 0);
    });
    const alunoFaltas: Record<string, number> = {};
    faltas.forEach((f: any) => {
      alunoFaltas[f.aluno_id] = (alunoFaltas[f.aluno_id] || 0) + 1;
    });
    let count = 0;
    alunos.forEach((a: any) => {
      const media = alunoNotas[a.id] ? alunoNotas[a.id].reduce((x, y) => x + y, 0) / alunoNotas[a.id].length : 10;
      const faltasCount = alunoFaltas[a.id] || 0;
      const freqApprox = 100 - (faltasCount / 200) * 100;
      if (media < 6 || freqApprox < 75) count++;
    });
    return count;
  }, [alunos, notas, faltas]);

  // Chart: desempenho por turma
  const desempenhoPorTurma = useMemo(() => {
    const turmaMap: Record<string, { nome: string; somaNotas: number; count: number }> = {};
    notasFiltradas.forEach((n: any) => {
      const turmaId = n.aluno?.turma_id;
      if (!turmaId) return;
      if (!turmaMap[turmaId]) {
        const turma = turmas.find((t: any) => t.id === turmaId);
        turmaMap[turmaId] = { nome: turma?.nome || "Sem turma", somaNotas: 0, count: 0 };
      }
      turmaMap[turmaId].somaNotas += n.nota || 0;
      turmaMap[turmaId].count++;
    });
    return Object.values(turmaMap).map((t) => ({ turma: t.nome, media: +(t.somaNotas / t.count).toFixed(1) }));
  }, [notasFiltradas, turmas]);

  // Chart: desempenho por disciplina
  const desempenhoPorDisciplina = useMemo(() => {
    const discMap: Record<string, { nome: string; somaNotas: number; count: number }> = {};
    notasFiltradas.forEach((n: any) => {
      const discId = n.disciplina_id;
      if (!discId) return;
      if (!discMap[discId]) {
        const disc = disciplinas.find((d: any) => d.id === discId);
        discMap[discId] = { nome: disc?.nome || "Sem disciplina", somaNotas: 0, count: 0 };
      }
      discMap[discId].somaNotas += n.nota || 0;
      discMap[discId].count++;
    });
    return Object.values(discMap).map((d) => ({ disciplina: d.nome, media: +(d.somaNotas / d.count).toFixed(1) }));
  }, [notasFiltradas, disciplinas]);

  // Chart: evolução por bimestre
  const evolucaoPorBimestre = useMemo(() => {
    const bimMap: Record<number, { soma: number; count: number }> = {};
    notas.forEach((n: any) => {
      const b = n.bimestre || 1;
      if (!bimMap[b]) bimMap[b] = { soma: 0, count: 0 };
      bimMap[b].soma += n.nota || 0;
      bimMap[b].count++;
    });
    return [1, 2, 3, 4].map((b) => ({
      bimestre: `${b}º Bim`,
      media: bimMap[b] ? +(bimMap[b].soma / bimMap[b].count).toFixed(1) : 0,
    }));
  }, [notas]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <Select value={filtroTurma} onValueChange={setFiltroTurma}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Turma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {turmas.map((t: any) => (
              <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
            ))}
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
        <Select value={filtroDisciplina} onValueChange={setFiltroDisciplina}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Disciplina" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {disciplinas.map((d: any) => (
              <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold">{mediaGeral}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Abaixo da Média</p>
                <p className="text-2xl font-bold">{alunosAbaixoMedia}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Frequência Média</p>
                <p className="text-2xl font-bold">{frequenciaMedia}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alunos em Risco</p>
                <p className="text-2xl font-bold">{alunosEmRisco}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Desempenho por Turma</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={desempenhoPorTurma}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="turma" fontSize={12} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="media" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Desempenho por Disciplina</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={desempenhoPorDisciplina}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="disciplina" fontSize={12} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="media" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Evolução por Bimestre</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={evolucaoPorBimestre}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bimestre" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="media" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
