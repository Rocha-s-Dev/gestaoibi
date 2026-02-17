import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Props {
  professores: any[];
  turmas: any[];
  disciplinas: any[];
  notas: any[];
  faltas: any[];
}

export function SupervisaoProfessores({ professores, turmas, disciplinas, notas, faltas }: Props) {
  const [filtroTurma, setFiltroTurma] = useState<string>("all");
  const [filtroDisciplina, setFiltroDisciplina] = useState<string>("all");

  const professoresComStatus = useMemo(() => {
    return professores.map((prof: any) => {
      // Turmas vinculadas
      const turmasVinculadas = turmas.filter((t: any) => t.professor_id === prof.id || t.escola_id === prof.escola_id);
      // Disciplinas - from notas or professores table
      const discIds = new Set(notas.filter((n: any) => turmasVinculadas.some((t: any) => n.aluno?.turma_id === t.id)).map((n: any) => n.disciplina_id));
      const discs = disciplinas.filter((d: any) => discIds.has(d.id));
      
      // Status de lançamento de notas
      const temNotas = notas.some((n: any) => turmasVinculadas.some((t: any) => n.aluno?.turma_id === t.id));
      // Status de frequência
      const temFaltas = faltas.some((f: any) => turmasVinculadas.some((t: any) => f.aluno?.turma_id === t.id));

      return {
        ...prof,
        turmasVinculadas,
        disciplinasVinculadas: discs,
        statusNotas: temNotas ? "em_dia" : "pendente",
        statusFrequencia: temFaltas ? "em_dia" : "pendente",
      };
    });
  }, [professores, turmas, disciplinas, notas, faltas]);

  const filteredProfessores = useMemo(() => {
    let list = professoresComStatus;
    if (filtroTurma !== "all") {
      list = list.filter((p) => p.turmasVinculadas.some((t: any) => t.id === filtroTurma));
    }
    if (filtroDisciplina !== "all") {
      list = list.filter((p) => p.disciplinasVinculadas.some((d: any) => d.id === filtroDisciplina));
    }
    return list;
  }, [professoresComStatus, filtroTurma, filtroDisciplina]);

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader><CardTitle>Supervisão de Professores</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professor</TableHead>
                <TableHead>Turmas</TableHead>
                <TableHead>Disciplinas</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Frequência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessores.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum professor encontrado</TableCell></TableRow>
              ) : filteredProfessores.map((prof) => (
                <TableRow key={prof.id}>
                  <TableCell className="font-medium">{prof.nome || prof.user_id?.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prof.turmasVinculadas.slice(0, 3).map((t: any) => (
                        <Badge key={t.id} variant="outline" className="text-xs">{t.nome}</Badge>
                      ))}
                      {prof.turmasVinculadas.length > 3 && <Badge variant="outline" className="text-xs">+{prof.turmasVinculadas.length - 3}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {prof.disciplinasVinculadas.slice(0, 2).map((d: any) => (
                        <Badge key={d.id} variant="secondary" className="text-xs">{d.nome}</Badge>
                      ))}
                      {prof.disciplinasVinculadas.length > 2 && <Badge variant="secondary" className="text-xs">+{prof.disciplinasVinculadas.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {prof.statusNotas === "em_dia" ? (
                      <div className="flex items-center gap-1 text-green-600"><CheckCircle2 size={16} /> Em dia</div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600"><Clock size={16} /> Pendente</div>
                    )}
                  </TableCell>
                  <TableCell>
                    {prof.statusFrequencia === "em_dia" ? (
                      <div className="flex items-center gap-1 text-green-600"><CheckCircle2 size={16} /> Em dia</div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600"><Clock size={16} /> Pendente</div>
                    )}
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
