import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Search, User } from "lucide-react";
import { useAlunos } from "@/hooks/useAlunos";
import { useTurmas } from "@/hooks/useTurmas";
import { useNotas } from "@/hooks/useNotas";
import { useFaltas } from "@/hooks/useFaltas";
import { toast } from "sonner";

export function BoletimEscolar() {
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [pesquisaAluno, setPesquisaAluno] = useState("");
  const [boletimData, setBoletimData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { alunos } = useAlunos();
  const { turmas } = useTurmas();
  const { getNotasByAluno } = useNotas();
  const { getResumoFaltas } = useFaltas();

  const alunosFiltrados = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(pesquisaAluno.toLowerCase()) ||
    aluno.numero_matricula.includes(pesquisaAluno)
  );

  const gerarBoletim = async () => {
    if (!alunoSelecionado || !anoLetivo) {
      toast.error("Selecione um aluno e o ano letivo.");
      return;
    }

    try {
      setLoading(true);
      
      const [notas, resumoFaltas] = await Promise.all([
        getNotasByAluno(alunoSelecionado, parseInt(anoLetivo)),
        getResumoFaltas(alunoSelecionado, parseInt(anoLetivo))
      ]);

      const aluno = alunos.find(a => a.id === alunoSelecionado);
      const turma = aluno?.turma_atual_id ? turmas.find(t => t.id === aluno.turma_atual_id) : null;

      // Organizar notas por disciplina e bimestre
      const notasPorDisciplina: Record<string, any> = {};
      
      notas.forEach(nota => {
        const disciplina = nota.disciplina?.nome || 'Sem disciplina';
        if (!notasPorDisciplina[disciplina]) {
          notasPorDisciplina[disciplina] = {
            disciplina,
            bimestre1: null,
            bimestre2: null,
            bimestre3: null,
            bimestre4: null,
            media: 0,
            situacao: 'Em andamento'
          };
        }
        
        notasPorDisciplina[disciplina][`bimestre${nota.bimestre}`] = nota.nota;
      });

      // Calcular médias e situação
      Object.keys(notasPorDisciplina).forEach(disciplina => {
        const disc = notasPorDisciplina[disciplina];
        const notas = [disc.bimestre1, disc.bimestre2, disc.bimestre3, disc.bimestre4]
          .filter(n => n !== null);
        
        if (notas.length > 0) {
          disc.media = notas.reduce((sum: number, nota: number) => sum + nota, 0) / notas.length;
          disc.situacao = disc.media >= 7 ? 'Aprovado' : 
                          disc.media >= 5 ? 'Recuperação' : 'Reprovado';
        }
      });

      setBoletimData({
        aluno,
        turma,
        anoLetivo: parseInt(anoLetivo),
        disciplinas: Object.values(notasPorDisciplina),
        resumoFaltas,
        dataGeracao: new Date().toLocaleDateString('pt-BR')
      });

    } catch (error) {
      console.error('Erro ao gerar boletim:', error);
      toast.error("Erro ao gerar boletim. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'Aprovado': return 'text-green-600';
      case 'Recuperação': return 'text-yellow-600';
      case 'Reprovado': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getNotaColor = (nota: number | null) => {
    if (nota === null) return "text-gray-500";
    if (nota >= 7) return "text-green-600";
    if (nota >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const imprimirBoletim = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Aluno */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Selecionar Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

            <div>
              <Label htmlFor="aluno">Aluno</Label>
              <Select value={alunoSelecionado} onValueChange={setAlunoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunosFiltrados.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome} ({aluno.numero_matricula})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ano">Ano Letivo</Label>
              <Select value={anoLetivo} onValueChange={setAnoLetivo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={gerarBoletim} disabled={loading} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                {loading ? "Gerando..." : "Gerar Boletim"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boletim Gerado */}
      {boletimData && (
        <Card className="print:shadow-none">
          <CardHeader className="print:pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">Boletim Escolar</CardTitle>
                <p className="text-muted-foreground">Ano Letivo: {boletimData.anoLetivo}</p>
              </div>
              <Button onClick={imprimirBoletim} variant="outline" className="print:hidden">
                <Download className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados do Aluno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Dados do Aluno</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Nome:</strong> {boletimData.aluno?.nome}</p>
                  <p><strong>Matrícula:</strong> {boletimData.aluno?.numero_matricula}</p>
                  <p><strong>Data de Nascimento:</strong> {
                    boletimData.aluno?.data_nascimento && 
                    new Date(boletimData.aluno.data_nascimento).toLocaleDateString('pt-BR')
                  }</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Dados da Turma</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Turma:</strong> {boletimData.turma?.nome || '-'}</p>
                  <p><strong>Série:</strong> {boletimData.turma?.serie || '-'}</p>
                  <p><strong>Turno:</strong> {boletimData.turma?.turno || '-'}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notas por Disciplina */}
            <div>
              <h3 className="font-semibold mb-4">Notas por Disciplina</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-gray-300 p-2 text-left">Disciplina</th>
                      <th className="border border-gray-300 p-2 text-center">1º Bim</th>
                      <th className="border border-gray-300 p-2 text-center">2º Bim</th>
                      <th className="border border-gray-300 p-2 text-center">3º Bim</th>
                      <th className="border border-gray-300 p-2 text-center">4º Bim</th>
                      <th className="border border-gray-300 p-2 text-center">Média</th>
                      <th className="border border-gray-300 p-2 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boletimData.disciplinas.map((disciplina: any, index: number) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2 font-medium">
                          {disciplina.disciplina}
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span className={getNotaColor(disciplina.bimestre1)}>
                            {disciplina.bimestre1?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span className={getNotaColor(disciplina.bimestre2)}>
                            {disciplina.bimestre2?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span className={getNotaColor(disciplina.bimestre3)}>
                            {disciplina.bimestre3?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span className={getNotaColor(disciplina.bimestre4)}>
                            {disciplina.bimestre4?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <span className={`font-semibold ${getNotaColor(disciplina.media)}`}>
                            {disciplina.media > 0 ? disciplina.media.toFixed(1) : '-'}
                          </span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <Badge 
                            variant="outline"
                            className={getSituacaoColor(disciplina.situacao)}
                          >
                            {disciplina.situacao}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Separator />

            {/* Resumo de Faltas */}
            <div>
              <h3 className="font-semibold mb-4">Resumo de Faltas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold">{boletimData.resumoFaltas.total}</div>
                  <div className="text-sm text-muted-foreground">Total de Faltas</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {boletimData.resumoFaltas.justificadas}
                  </div>
                  <div className="text-sm text-muted-foreground">Justificadas</div>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {boletimData.resumoFaltas.injustificadas}
                  </div>
                  <div className="text-sm text-muted-foreground">Injustificadas</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rodapé */}
            <div className="text-sm text-muted-foreground text-center">
              <p>Boletim gerado em {boletimData.dataGeracao}</p>
              <p>Sistema de Gestão Educacional</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}