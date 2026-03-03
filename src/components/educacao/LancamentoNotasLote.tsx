import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Loader2, Save } from "lucide-react";
import { useEscolas } from "@/hooks/useEscolas";
import { useTurmas } from "@/hooks/useTurmas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useAlunos } from "@/hooks/useAlunos";
import { useProfessores } from "@/hooks/useProfessores";
import { useLancamentoLote } from "@/hooks/useLancamentoLote";
import { useToast } from "@/hooks/use-toast";

interface NotaAluno {
  aluno_id: string;
  aluno_nome: string;
  nota: number | null;
  observacoes: string;
}

export function LancamentoNotasLote() {
  const [escolaId, setEscolaId] = useState<string>("");
  const [turmaId, setTurmaId] = useState<string>("");
  const [disciplinaId, setDisciplinaId] = useState<string>("");
  const [professorId, setProfessorId] = useState<string>("");
  const [trimestre, setTrimestre] = useState<string>("1");
  const [tipoAvaliacao, setTipoAvaliacao] = useState<string>("prova");
  const [dataAvaliacao, setDataAvaliacao] = useState<string>(new Date().toISOString().split("T")[0]);
  const [notas, setNotas] = useState<NotaAluno[]>([]);

  const { escolas } = useEscolas();
  const { turmas: todasTurmas } = useTurmas();
  const { disciplinas } = useDisciplinas();
  const { alunos: todosAlunos } = useAlunos();
  const { professores } = useProfessores();
  const { salvarNotasEmLote, loading: isSaving } = useLancamentoLote();
  const { toast } = useToast();

  const anoLetivo = new Date().getFullYear();

  const turmas = useMemo(() => {
    if (!escolaId) return [];
    return todasTurmas?.filter((t) => t.escola_id === escolaId) || [];
  }, [todasTurmas, escolaId]);

  const alunos = useMemo(() => {
    if (!turmaId) return [];
    return todosAlunos?.filter((a) => a.turma_id === turmaId) || [];
  }, [todosAlunos, turmaId]);

  useEffect(() => {
    if (alunos && alunos.length > 0) {
      setNotas(
        alunos.map((aluno) => ({
          aluno_id: aluno.id,
          aluno_nome: aluno.nome,
          nota: null,
          observacoes: "",
        }))
      );
    } else {
      setNotas([]);
    }
  }, [alunos]);

  const handleNotaChange = (alunoId: string, valor: string) => {
    const notaValor = valor === "" ? null : parseFloat(valor);
    setNotas((prev) => prev.map((n) => (n.aluno_id === alunoId ? { ...n, nota: notaValor } : n)));
  };

  const handleObservacaoChange = (alunoId: string, valor: string) => {
    setNotas((prev) => prev.map((n) => (n.aluno_id === alunoId ? { ...n, observacoes: valor } : n)));
  };

  const handleSalvar = async () => {
    if (!turmaId || !disciplinaId || !professorId) {
      toast({ title: "Erro", description: "Selecione turma, disciplina e professor.", variant: "destructive" });
      return;
    }

    const notasParaSalvar = notas
      .filter((n) => n.nota !== null)
      .map((n) => ({
        aluno_id: n.aluno_id,
        turma_id: turmaId,
        disciplina_id: disciplinaId,
        trimestre: parseInt(trimestre),
        ano_letivo: anoLetivo,
        nota: n.nota!,
        observacoes: n.observacoes || undefined,
      }));

    if (notasParaSalvar.length === 0) {
      toast({ title: "Aviso", description: "Preencha pelo menos uma nota para salvar.", variant: "destructive" });
      return;
    }

    await salvarNotasEmLote(notasParaSalvar);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Lançamento de Notas em Lote
        </CardTitle>
        <CardDescription>Lance notas para todos os alunos da turma de uma vez</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Escola</Label>
            <Select value={escolaId} onValueChange={(v) => { setEscolaId(v); setTurmaId(""); }}>
              <SelectTrigger><SelectValue placeholder="Selecione a escola" /></SelectTrigger>
              <SelectContent>
                {escolas?.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>{escola.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Turma</Label>
            <Select value={turmaId} onValueChange={setTurmaId} disabled={!escolaId}>
              <SelectTrigger><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
              <SelectContent>
                {turmas?.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>{turma.nome} - {turma.serie}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Disciplina</Label>
            <Select value={disciplinaId} onValueChange={setDisciplinaId}>
              <SelectTrigger><SelectValue placeholder="Selecione a disciplina" /></SelectTrigger>
              <SelectContent>
                {disciplinas?.map((disc) => (
                  <SelectItem key={disc.id} value={disc.id}>{disc.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Professor</Label>
            <Select value={professorId} onValueChange={setProfessorId}>
              <SelectTrigger><SelectValue placeholder="Selecione o professor" /></SelectTrigger>
              <SelectContent>
                {professores?.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>{prof.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trimestre</Label>
            <Select value={trimestre} onValueChange={setTrimestre}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1º Trimestre</SelectItem>
                <SelectItem value="2">2º Trimestre</SelectItem>
                <SelectItem value="3">3º Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Avaliação</Label>
            <Select value={tipoAvaliacao} onValueChange={setTipoAvaliacao}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="prova">Prova</SelectItem>
                <SelectItem value="trabalho">Trabalho</SelectItem>
                <SelectItem value="participacao">Participação</SelectItem>
                <SelectItem value="recuperacao">Recuperação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data da Avaliação</Label>
            <Input type="date" value={dataAvaliacao} onChange={(e) => setDataAvaliacao(e.target.value)} />
          </div>
        </div>

        {notas.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="w-[120px]">Nota (0-10)</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notas.map((nota, index) => (
                  <TableRow key={nota.aluno_id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{nota.aluno_nome}</TableCell>
                    <TableCell>
                      <Input
                        type="number" min="0" max="10" step="0.1"
                        value={nota.nota ?? ""}
                        onChange={(e) => handleNotaChange(nota.aluno_id, e.target.value)}
                        className="w-full" placeholder="0.0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={nota.observacoes}
                        onChange={(e) => handleObservacaoChange(nota.aluno_id, e.target.value)}
                        placeholder="Observações..."
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : turmaId ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Nenhum aluno encontrado nesta turma.
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Selecione uma escola e turma para ver os alunos.
          </div>
        )}

        {notas.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSalvar} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Notas
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
