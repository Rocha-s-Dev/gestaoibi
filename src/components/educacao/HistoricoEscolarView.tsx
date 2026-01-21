import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Search, 
  GraduationCap, 
  CheckCircle, 
  XCircle, 
  Clock,
  Printer
} from "lucide-react";
import { useHistoricoEscolar, HistoricoEscolar, SituacaoAnoLetivo } from "@/hooks/useHistoricoTransferencias";
import { useAlunos } from "@/hooks/useAlunos";
import { toast } from "sonner";

const situacaoConfig: Record<SituacaoAnoLetivo, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  aprovado: { label: "Aprovado", variant: "default", icon: CheckCircle },
  reprovado: { label: "Reprovado", variant: "destructive", icon: XCircle },
  transferido: { label: "Transferido", variant: "secondary", icon: FileText },
  em_curso: { label: "Em Curso", variant: "outline", icon: Clock },
  evadido: { label: "Evadido", variant: "destructive", icon: XCircle },
};

export function HistoricoEscolarView() {
  const [alunoSelecionado, setAlunoSelecionado] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [gerandoHistorico, setGerandoHistorico] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const { historicos, loading, gerarHistoricoAnoAtual, fetchHistoricos } = useHistoricoEscolar();
  const { alunos } = useAlunos();

  const historicosFiltrados = alunoSelecionado
    ? historicos.filter(h => h.aluno_id === alunoSelecionado)
    : historicos.filter(h => 
        !pesquisa || 
        h.aluno?.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        h.aluno?.numero_matricula?.includes(pesquisa)
      );

  const handleGerarHistorico = async () => {
    if (!alunoSelecionado) {
      toast.error("Selecione um aluno para gerar o histórico");
      return;
    }
    
    setGerandoHistorico(true);
    try {
      await gerarHistoricoAnoAtual(alunoSelecionado);
      await fetchHistoricos(alunoSelecionado);
    } finally {
      setGerandoHistorico(false);
    }
  };

  const handlePrint = () => {
    if (!alunoSelecionado) {
      toast.error("Selecione um aluno para imprimir o histórico");
      return;
    }
    
    window.print();
  };

  const alunoInfo = alunos.find(a => a.id === alunoSelecionado);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Histórico Escolar
          </CardTitle>
          <CardDescription>
            Visualize e gere históricos escolares dos alunos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Select value={alunoSelecionado} onValueChange={setAlunoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.nome} - {aluno.numero_matricula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGerarHistorico} 
                disabled={!alunoSelecionado || gerandoHistorico}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${gerandoHistorico ? 'animate-spin' : ''}`} />
                Gerar
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrint}
                disabled={!alunoSelecionado}
              >
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico do Aluno Selecionado */}
      {alunoSelecionado && alunoInfo && (
        <div ref={printRef} className="print:p-8">
          <Card className="print:shadow-none print:border-2">
            <CardHeader className="text-center border-b">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">HISTÓRICO ESCOLAR</h2>
                <p className="text-muted-foreground">Secretaria Municipal de Educação</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Dados do Aluno */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted rounded-lg print:bg-gray-100">
                <div>
                  <p className="text-xs text-muted-foreground">Nome do Aluno</p>
                  <p className="font-semibold">{alunoInfo.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Matrícula</p>
                  <p className="font-semibold">{alunoInfo.numero_matricula}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                  <p className="font-semibold">
                    {new Date(alunoInfo.data_nascimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge>{alunoInfo.status}</Badge>
                </div>
              </div>

              {/* Tabela de Histórico */}
              {loading ? (
                <div className="text-center py-8">Carregando histórico...</div>
              ) : historicosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum registro encontrado. Clique em "Gerar" para criar o histórico do ano atual.
                </div>
              ) : (
                <div className="space-y-6">
                  {historicosFiltrados.map((h) => (
                    <div key={h.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="text-lg px-3 py-1">
                            {h.ano_letivo}
                          </Badge>
                          <div>
                            <p className="font-medium">{h.escola_nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {h.serie} {h.turma_nome && `- ${h.turma_nome}`}
                            </p>
                          </div>
                        </div>
                        <Badge variant={situacaoConfig[h.situacao]?.variant || "outline"}>
                          {situacaoConfig[h.situacao]?.label || h.situacao}
                        </Badge>
                      </div>

                      {/* Notas por Disciplina */}
                      {h.notas_finais && Object.keys(h.notas_finais).length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Notas por Disciplina</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(h.notas_finais).map(([disciplina, nota]) => (
                              <div key={disciplina} className="flex justify-between items-center bg-muted p-2 rounded text-sm">
                                <span>{disciplina}</span>
                                <span className={`font-bold ${
                                  (nota as number) >= 7 ? 'text-green-600' : 
                                  (nota as number) >= 5 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {(nota as number).toFixed(1)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resumo */}
                      <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Média Geral</p>
                          <p className={`text-xl font-bold ${
                            (h.media_geral || 0) >= 7 ? 'text-green-600' : 
                            (h.media_geral || 0) >= 5 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {h.media_geral?.toFixed(1) || '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total de Faltas</p>
                          <p className="text-xl font-bold">{h.total_faltas}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Frequência</p>
                          <p className={`text-xl font-bold ${
                            (h.percentual_frequencia || 0) >= 75 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {h.percentual_frequencia?.toFixed(1) || '-'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rodapé para impressão */}
              <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
                <p>Documento gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                <p className="mt-4">_______________________________________</p>
                <p>Assinatura do Secretário de Educação</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista Geral de Históricos (quando nenhum aluno selecionado) */}
      {!alunoSelecionado && (
        <Card>
          <CardHeader>
            <CardTitle>Todos os Históricos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : historicosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum histórico encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Aluno</th>
                      <th className="text-left p-3">Ano</th>
                      <th className="text-left p-3">Escola</th>
                      <th className="text-left p-3">Série</th>
                      <th className="text-left p-3">Média</th>
                      <th className="text-left p-3">Frequência</th>
                      <th className="text-left p-3">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicosFiltrados.map((h) => {
                      const SituacaoIcon = situacaoConfig[h.situacao]?.icon || Clock;
                      return (
                        <tr key={h.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{h.aluno?.nome}</p>
                              <p className="text-sm text-muted-foreground">
                                {h.aluno?.numero_matricula}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{h.ano_letivo}</Badge>
                          </td>
                          <td className="p-3">{h.escola_nome}</td>
                          <td className="p-3">{h.serie}</td>
                          <td className="p-3">
                            <span className={`font-bold ${
                              (h.media_geral || 0) >= 7 ? 'text-green-600' : 
                              (h.media_geral || 0) >= 5 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {h.media_geral?.toFixed(1) || '-'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`${
                              (h.percentual_frequencia || 0) >= 75 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {h.percentual_frequencia?.toFixed(1) || '-'}%
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge variant={situacaoConfig[h.situacao]?.variant || "outline"}>
                              <SituacaoIcon className="h-3 w-3 mr-1" />
                              {situacaoConfig[h.situacao]?.label || h.situacao}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
