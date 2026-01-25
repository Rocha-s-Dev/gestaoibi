import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Loader2, Save, UserCheck, UserX } from "lucide-react";
import { useEscolas } from "@/hooks/useEscolas";
import { useTurmas } from "@/hooks/useTurmas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useAlunos } from "@/hooks/useAlunos";
import { useProfessores } from "@/hooks/useProfessores";
import { useLancamentoLote } from "@/hooks/useLancamentoLote";
import { useToast } from "@/hooks/use-toast";

interface PresencaAluno {
  aluno_id: string;
  aluno_nome: string;
  presente: boolean;
  justificativa: string;
}

export function DiarioClasse() {
  const [escolaId, setEscolaId] = useState<string>("");
  const [turmaId, setTurmaId] = useState<string>("");
  const [disciplinaId, setDisciplinaId] = useState<string>("");
  const [professorId, setProfessorId] = useState<string>("");
  const [dataAula, setDataAula] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presencas, setPresencas] = useState<PresencaAluno[]>([]);

  const { escolas } = useEscolas();
  const { turmas: todasTurmas } = useTurmas();
  const { disciplinas } = useDisciplinas();
  const { alunos: todosAlunos } = useAlunos();
  const { professores } = useProfessores();
  const { salvarPresencaEmLote, loading: isSaving } = useLancamentoLote();
  const { toast } = useToast();

  // Filtrar turmas pela escola selecionada
  const turmas = useMemo(() => {
    if (!escolaId) return [];
    return todasTurmas?.filter(t => t.escola_id === escolaId) || [];
  }, [todasTurmas, escolaId]);

  // Filtrar alunos pela turma selecionada
  const alunos = useMemo(() => {
    if (!turmaId) return [];
    return todosAlunos?.filter(a => a.turma_id === turmaId) || [];
  }, [todosAlunos, turmaId]);

  useEffect(() => {
    if (alunos && alunos.length > 0) {
      setPresencas(
        alunos.map((aluno) => ({
          aluno_id: aluno.id,
          aluno_nome: aluno.nome,
          presente: true,
          justificativa: "",
        }))
      );
    } else {
      setPresencas([]);
    }
  }, [alunos]);

  const handlePresencaChange = (alunoId: string, presente: boolean) => {
    setPresencas((prev) =>
      prev.map((p) =>
        p.aluno_id === alunoId ? { ...p, presente, justificativa: presente ? "" : p.justificativa } : p
      )
    );
  };

  const handleJustificativaChange = (alunoId: string, justificativa: string) => {
    setPresencas((prev) =>
      prev.map((p) =>
        p.aluno_id === alunoId ? { ...p, justificativa } : p
      )
    );
  };

  const marcarTodosPresentes = () => {
    setPresencas((prev) => prev.map((p) => ({ ...p, presente: true, justificativa: "" })));
  };

  const marcarTodosAusentes = () => {
    setPresencas((prev) => prev.map((p) => ({ ...p, presente: false })));
  };

  const handleSalvar = async () => {
    if (!turmaId || !disciplinaId || !professorId) {
      toast({
        title: "Erro",
        description: "Selecione turma, disciplina e professor.",
        variant: "destructive",
      });
      return;
    }

    const presencasParaSalvar = presencas.map((p) => ({
      aluno_id: p.aluno_id,
      presente: p.presente,
      justificativa: p.justificativa || undefined,
    }));

    await salvarPresencaEmLote(presencasParaSalvar, disciplinaId, professorId, turmaId, dataAula);
  };

  const totalPresentes = presencas.filter((p) => p.presente).length;
  const totalAusentes = presencas.filter((p) => !p.presente).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          Diário de Classe
        </CardTitle>
        <CardDescription>
          Registro de presença e chamada diária
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-2">
            <Label>Escola</Label>
            <Select value={escolaId} onValueChange={(v) => { setEscolaId(v); setTurmaId(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a escola" />
              </SelectTrigger>
              <SelectContent>
                {escolas?.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Turma</Label>
            <Select value={turmaId} onValueChange={setTurmaId} disabled={!escolaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a turma" />
              </SelectTrigger>
              <SelectContent>
                {turmas?.map((turma) => (
                  <SelectItem key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.serie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Disciplina</Label>
            <Select value={disciplinaId} onValueChange={setDisciplinaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a disciplina" />
              </SelectTrigger>
              <SelectContent>
                {disciplinas?.map((disc) => (
                  <SelectItem key={disc.id} value={disc.id}>
                    {disc.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Professor</Label>
            <Select value={professorId} onValueChange={setProfessorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o professor" />
              </SelectTrigger>
              <SelectContent>
                {professores?.map((prof) => (
                  <SelectItem key={prof.id} value={prof.id}>
                    {prof.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data da Aula</Label>
            <Input
              type="date"
              value={dataAula}
              onChange={(e) => setDataAula(e.target.value)}
            />
          </div>
        </div>

        {/* Resumo e ações rápidas */}
        {presencas.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted p-4">
            <div className="flex gap-4">
              <Badge variant="default" className="text-sm">
                <UserCheck className="mr-1 h-4 w-4" />
                Presentes: {totalPresentes}
              </Badge>
              <Badge variant="destructive" className="text-sm">
                <UserX className="mr-1 h-4 w-4" />
                Ausentes: {totalAusentes}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={marcarTodosPresentes}>
                <UserCheck className="mr-2 h-4 w-4" />
                Todos Presentes
              </Button>
              <Button variant="outline" size="sm" onClick={marcarTodosAusentes}>
                <UserX className="mr-2 h-4 w-4" />
                Todos Ausentes
              </Button>
            </div>
          </div>
        )}

        {/* Tabela de Presença */}
        {presencas.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead className="w-[100px] text-center">Presente</TableHead>
                  <TableHead>Justificativa (se ausente)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presencas.map((presenca, index) => (
                  <TableRow key={presenca.aluno_id} className={!presenca.presente ? "bg-destructive/10" : ""}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {presenca.presente ? (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <UserX className="h-4 w-4 text-destructive" />
                        )}
                        {presenca.aluno_nome}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={presenca.presente}
                        onCheckedChange={(checked) =>
                          handlePresencaChange(presenca.aluno_id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={presenca.justificativa}
                        onChange={(e) => handleJustificativaChange(presenca.aluno_id, e.target.value)}
                        placeholder={presenca.presente ? "—" : "Motivo da falta..."}
                        disabled={presenca.presente}
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
            Selecione uma escola e turma para fazer a chamada.
          </div>
        )}

        {presencas.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSalvar} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Chamada
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
