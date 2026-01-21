import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  BookOpen, 
  Calculator, 
  Lock, 
  Unlock, 
  RefreshCw, 
  AlertTriangle,
  TrendingUp,
  Settings,
  Save
} from "lucide-react";
import { GestaoNotas } from "./GestaoNotas";
import { LancamentoNotasLote } from "./LancamentoNotasLote";
import { useNotas } from "@/hooks/useNotas";
import { useTurmas } from "@/hooks/useTurmas";
import { useDisciplinas } from "@/hooks/useDisciplinas";
import { useAlunos } from "@/hooks/useAlunos";
import { toast } from "sonner";

interface ConfiguracaoNotas {
  mediaAprovacao: number;
  mediaRecuperacao: number;
  pesoRecuperacao: number;
  bimestresBloqueados: number[];
}

export function GestaoNotasAvancada() {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoNotas>({
    mediaAprovacao: 7,
    mediaRecuperacao: 5,
    pesoRecuperacao: 0.4,
    bimestresBloqueados: [],
  });
  
  const [turmaRecuperacao, setTurmaRecuperacao] = useState("");
  const [bimestreRecuperacao, setBimestreRecuperacao] = useState("");
  const [processandoRecuperacao, setProcessandoRecuperacao] = useState(false);

  const { notas, refreshNotas } = useNotas();
  const { turmas } = useTurmas();
  const { disciplinas } = useDisciplinas();
  const { alunos } = useAlunos();

  const toggleBloqueioBimestre = (bimestre: number) => {
    setConfiguracao(prev => ({
      ...prev,
      bimestresBloqueados: prev.bimestresBloqueados.includes(bimestre)
        ? prev.bimestresBloqueados.filter(b => b !== bimestre)
        : [...prev.bimestresBloqueados, bimestre]
    }));
    
    const bloqueado = configuracao.bimestresBloqueados.includes(bimestre);
    toast.success(`${bimestre}º Bimestre ${bloqueado ? 'desbloqueado' : 'bloqueado'}!`);
  };

  // Calcular alunos em recuperação
  const calcularAlunosRecuperacao = () => {
    if (!turmaRecuperacao) return [];

    const notasTurma = notas.filter(n => n.turma_id === turmaRecuperacao);
    const alunosTurma = alunos.filter(a => a.turma_atual_id === turmaRecuperacao);
    
    const alunosEmRecuperacao: { 
      aluno: typeof alunos[0]; 
      disciplina: string; 
      media: number;
      bimestres: Record<number, number | null>;
    }[] = [];

    alunosTurma.forEach(aluno => {
      const notasAluno = notasTurma.filter(n => n.aluno_id === aluno.id);
      
      // Agrupar por disciplina
      const notasPorDisciplina: Record<string, { notas: (number | null)[]; disciplinaNome: string }> = {};
      
      notasAluno.forEach(n => {
        const discId = n.disciplina_id;
        const discNome = n.disciplina?.nome || 'Sem disciplina';
        
        if (!notasPorDisciplina[discId]) {
          notasPorDisciplina[discId] = { notas: [null, null, null, null], disciplinaNome: discNome };
        }
        
        if (n.bimestre >= 1 && n.bimestre <= 4) {
          notasPorDisciplina[discId].notas[n.bimestre - 1] = n.nota;
        }
      });

      // Verificar quem está em recuperação
      Object.entries(notasPorDisciplina).forEach(([discId, data]) => {
        const notasValidas = data.notas.filter((n): n is number => n !== null);
        if (notasValidas.length === 0) return;
        
        const media = notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
        
        if (media < configuracao.mediaAprovacao && media >= configuracao.mediaRecuperacao) {
          alunosEmRecuperacao.push({
            aluno,
            disciplina: data.disciplinaNome,
            media,
            bimestres: {
              1: data.notas[0],
              2: data.notas[1],
              3: data.notas[2],
              4: data.notas[3],
            }
          });
        }
      });
    });

    return alunosEmRecuperacao;
  };

  const alunosRecuperacao = calcularAlunosRecuperacao();

  // Estatísticas gerais
  const estatisticas = {
    totalNotas: notas.length,
    mediasAcima7: notas.filter(n => n.nota !== null && n.nota >= 7).length,
    mediaAbaixo5: notas.filter(n => n.nota !== null && n.nota < 5).length,
    semNota: notas.filter(n => n.nota === null).length,
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lancamento" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lancamento" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="lote" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Lançamento em Lote
          </TabsTrigger>
          <TabsTrigger value="recuperacao" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recuperação
          </TabsTrigger>
          <TabsTrigger value="configuracao" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
        </TabsList>

        {/* Aba de Notas Normal */}
        <TabsContent value="lancamento">
          <GestaoNotas />
        </TabsContent>

        {/* Lançamento em Lote */}
        <TabsContent value="lote">
          <LancamentoNotasLote />
        </TabsContent>

        {/* Recuperação Paralela */}
        <TabsContent value="recuperacao">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recuperação Paralela
                </CardTitle>
                <CardDescription>
                  Identifique alunos que precisam de recuperação (média entre {configuracao.mediaRecuperacao} e {configuracao.mediaAprovacao})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Label>Turma</Label>
                    <Select value={turmaRecuperacao} onValueChange={setTurmaRecuperacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas.map((turma) => (
                          <SelectItem key={turma.id} value={turma.id}>
                            {turma.nome} - {turma.serie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {turmaRecuperacao && (
                  <>
                    {alunosRecuperacao.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>Nenhum aluno em recuperação nesta turma!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium">
                            {alunosRecuperacao.length} aluno(s) em recuperação
                          </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-3">Aluno</th>
                                <th className="text-left p-3">Disciplina</th>
                                <th className="text-center p-3">1º Bim</th>
                                <th className="text-center p-3">2º Bim</th>
                                <th className="text-center p-3">3º Bim</th>
                                <th className="text-center p-3">4º Bim</th>
                                <th className="text-center p-3">Média Atual</th>
                                <th className="text-center p-3">Nota Necessária</th>
                              </tr>
                            </thead>
                            <tbody>
                              {alunosRecuperacao.map((item, idx) => {
                                const notaNecessaria = (configuracao.mediaAprovacao * (1 + configuracao.pesoRecuperacao)) - (item.media * configuracao.pesoRecuperacao);
                                return (
                                  <tr key={idx} className="border-b hover:bg-muted/50">
                                    <td className="p-3">
                                      <div>
                                        <p className="font-medium">{item.aluno.nome}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {item.aluno.numero_matricula}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="p-3">{item.disciplina}</td>
                                    <td className="p-3 text-center">
                                      {item.bimestres[1]?.toFixed(1) || '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                      {item.bimestres[2]?.toFixed(1) || '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                      {item.bimestres[3]?.toFixed(1) || '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                      {item.bimestres[4]?.toFixed(1) || '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                      <Badge variant="secondary" className="text-yellow-600">
                                        {item.media.toFixed(1)}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-center">
                                      <Badge variant="outline">
                                        ≥ {Math.min(10, notaNecessaria).toFixed(1)}
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Configuração */}
        <TabsContent value="configuracao">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Configuração de Médias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Configuração de Médias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Média para Aprovação</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={configuracao.mediaAprovacao}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      mediaAprovacao: parseFloat(e.target.value) || 7
                    }))}
                  />
                </div>
                <div>
                  <Label>Média Mínima para Recuperação</Label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={configuracao.mediaRecuperacao}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      mediaRecuperacao: parseFloat(e.target.value) || 5
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Alunos abaixo dessa média vão direto para reprovação
                  </p>
                </div>
                <div>
                  <Label>Peso da Nota de Recuperação (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="10"
                    value={configuracao.pesoRecuperacao * 100}
                    onChange={(e) => setConfiguracao(prev => ({
                      ...prev,
                      pesoRecuperacao: (parseFloat(e.target.value) || 40) / 100
                    }))}
                  />
                </div>
                <Button className="w-full" onClick={() => toast.success("Configurações salvas!")}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Bloqueio de Bimestres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Fechamento de Bimestre
                </CardTitle>
                <CardDescription>
                  Bloquear bimestres impede novas alterações de notas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3, 4].map((bimestre) => {
                  const bloqueado = configuracao.bimestresBloqueados.includes(bimestre);
                  return (
                    <div key={bimestre} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {bloqueado ? (
                          <Lock className="h-5 w-5 text-red-500" />
                        ) : (
                          <Unlock className="h-5 w-5 text-green-500" />
                        )}
                        <span className="font-medium">{bimestre}º Bimestre</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={bloqueado ? "destructive" : "secondary"}>
                          {bloqueado ? "Bloqueado" : "Aberto"}
                        </Badge>
                        <Switch
                          checked={bloqueado}
                          onCheckedChange={() => toggleBloqueioBimestre(bimestre)}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Estatísticas Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-2xl font-bold">{estatisticas.totalNotas}</p>
                    <p className="text-sm text-muted-foreground">Total de Notas</p>
                  </div>
                  <div className="p-4 bg-green-100 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{estatisticas.mediasAcima7}</p>
                    <p className="text-sm text-muted-foreground">Notas ≥ 7</p>
                  </div>
                  <div className="p-4 bg-red-100 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{estatisticas.mediaAbaixo5}</p>
                    <p className="text-sm text-muted-foreground">Notas &lt; 5</p>
                  </div>
                  <div className="p-4 bg-yellow-100 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{estatisticas.semNota}</p>
                    <p className="text-sm text-muted-foreground">Sem Nota</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
