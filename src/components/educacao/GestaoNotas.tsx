import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { NotaDialog } from "./NotaDialog";
import { useNotas } from "@/hooks/useNotas";
import { useTurmas } from "@/hooks/useTurmas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { toast } from "sonner";

export function GestaoNotas() {
  const [notaDialogOpen, setNotaDialogOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState(null);
  const [filtroTurma, setFiltroTurma] = useState("");
  const [filtroDisciplina, setFiltroDisciplina] = useState("");
  const [filtroTrimestre, setFiltroTrimestre] = useState("");
  const [pesquisaAluno, setPesquisaAluno] = useState("");

  const { notas, loading, deleteNota } = useNotas();
  const { turmas } = useTurmas();
  const { disciplinas } = useDisciplinas();

  const notasFiltradas = notas.filter(nota => {
    const matchTurma = !filtroTurma || nota.turma_id === filtroTurma;
    const matchDisciplina = !filtroDisciplina || nota.disciplina_id === filtroDisciplina;
    const matchTrimestre = !filtroTrimestre || nota.trimestre.toString() === filtroTrimestre;
    const matchAluno = !pesquisaAluno || 
      nota.aluno?.nome.toLowerCase().includes(pesquisaAluno.toLowerCase()) ||
      nota.aluno?.numero_matricula.includes(pesquisaAluno);
    
    return matchTurma && matchDisciplina && matchTrimestre && matchAluno;
  });

  const handleDeleteNota = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta nota?")) {
      try {
        await deleteNota(id);
        toast.success("Nota excluída com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir nota.");
      }
    }
  };

  const getNotaColor = (nota: number | null) => {
    if (nota === null) return "text-gray-500";
    if (nota >= 7) return "text-green-600";
    if (nota >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="turma">Turma</Label>
              <Select value={filtroTurma || "all"} onValueChange={(v) => setFiltroTurma(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.serie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="disciplina">Disciplina</Label>
              <Select value={filtroDisciplina || "all"} onValueChange={(v) => setFiltroDisciplina(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as disciplinas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as disciplinas</SelectItem>
                  {disciplinas.map((disciplina) => (
                    <SelectItem key={disciplina.id} value={disciplina.id}>
                      {disciplina.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trimestre">Trimestre</Label>
              <Select value={filtroTrimestre || "all"} onValueChange={(v) => setFiltroTrimestre(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os trimestres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os trimestres</SelectItem>
                  <SelectItem value="1">1º Trimestre</SelectItem>
                  <SelectItem value="2">2º Trimestre</SelectItem>
                  <SelectItem value="3">3º Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pesquisa">Pesquisar Aluno</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pesquisa"
                  placeholder="Nome ou matrícula"
                  value={pesquisaAluno}
                  onChange={(e) => setPesquisaAluno(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={() => setNotaDialogOpen(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nova Nota
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Notas Lançadas</CardTitle>
            <Badge variant="outline">
              {notasFiltradas.length} registro(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Carregando notas...</p>
            </div>
          ) : notasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma nota encontrada com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Aluno</th>
                    <th className="text-left p-3">Turma</th>
                    <th className="text-left p-3">Disciplina</th>
                    <th className="text-left p-3">Trimestre</th>
                    <th className="text-left p-3">Nota</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {notasFiltradas.map((nota) => (
                    <tr key={nota.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{nota.aluno?.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {nota.aluno?.numero_matricula}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">{nota.turma?.nome}</td>
                      <td className="p-3">{nota.disciplina?.nome}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {nota.trimestre}º Trim
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold text-lg ${getNotaColor(nota.nota)}`}>
                          {nota.nota !== null ? nota.nota.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={nota.fechada ? "default" : "secondary"}>
                          {nota.fechada ? "Fechada" : "Aberta"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedNota(nota);
                              setNotaDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteNota(nota.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <NotaDialog
        open={notaDialogOpen}
        onOpenChange={setNotaDialogOpen}
        nota={selectedNota}
        onClose={() => {
          setSelectedNota(null);
          setNotaDialogOpen(false);
        }}
      />
    </div>
  );
}
