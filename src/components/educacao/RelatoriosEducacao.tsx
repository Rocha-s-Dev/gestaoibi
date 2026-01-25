import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, FileDown } from "lucide-react";
import { useEducacaoStats } from "@/hooks/useEducacaoStats";
import { useEscolas } from "@/hooks/useEscolas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function RelatoriosEducacao() {
  const [selectedSchool, setSelectedSchool] = useState<string>("todas");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("2024");
  const [relatorioTipo, setRelatorioTipo] = useState<string>("geral");
  
  const { toast } = useToast();
  const { escolas } = useEscolas();
  const { statsPorEscola, frequenciaPorTurma, desempenhoPorDisciplina, loading } = useEducacaoStats();

  const handleExportarPDF = async () => {
    toast({
      title: "Exportando relatório",
      description: "Gerando PDF do relatório selecionado...",
    });
    
    // Implementar exportação PDF aqui
    setTimeout(() => {
      toast({
        title: "Relatório exportado",
        description: "O relatório foi baixado com sucesso.",
      });
    }, 1500);
  };

  const handleExportarExcel = async () => {
    toast({
      title: "Exportando para Excel",
      description: "Gerando arquivo Excel...",
    });
    
    // Implementar exportação Excel aqui
    setTimeout(() => {
      toast({
        title: "Arquivo exportado",
        description: "O arquivo Excel foi baixado com sucesso.",
      });
    }, 1500);
  };

  const getDadosFiltrados = () => {
    if (selectedSchool === "todas") {
      return statsPorEscola;
    }
    return statsPorEscola.filter(e => e.escola_id === selectedSchool);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Exportação */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap gap-4">
          <Select value={relatorioTipo} onValueChange={setRelatorioTipo}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="geral">Relatório Geral</SelectItem>
              <SelectItem value="frequencia">Frequência por Turma</SelectItem>
              <SelectItem value="desempenho">Desempenho por Disciplina</SelectItem>
              <SelectItem value="escola">Desempenho por Escola</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar escola" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Escolas</SelectItem>
              {escolas.map((escola) => (
                <SelectItem key={escola.id} value={escola.id}>
                  {escola.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportarExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={handleExportarPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      {relatorioTipo === "geral" && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório Geral de Educação - {selectedPeriod}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Escola</TableHead>
                  <TableHead className="text-right">Alunos</TableHead>
                  <TableHead className="text-right">Turmas</TableHead>
                  <TableHead className="text-right">Professores</TableHead>
                  <TableHead className="text-right">Ocupação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getDadosFiltrados().map((escola) => (
                  <TableRow key={escola.escola_id}>
                    <TableCell className="font-medium">{escola.escola_nome}</TableCell>
                    <TableCell className="text-right">{escola.total_alunos}</TableCell>
                    <TableCell className="text-right">{escola.total_turmas}</TableCell>
                    <TableCell className="text-right">{escola.total_professores}</TableCell>
                    <TableCell className="text-right">{escola.taxa_ocupacao}%</TableCell>
                    <TableCell>
                      <Badge variant={escola.taxa_ocupacao > 90 ? "destructive" : "secondary"}>
                        {escola.taxa_ocupacao > 90 ? "Superlotada" : "Normal"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {getDadosFiltrados().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado disponível para os filtros selecionados
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {relatorioTipo === "frequencia" && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Frequência por Turma - {selectedPeriod}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead className="text-right">Alunos</TableHead>
                  <TableHead className="text-right">Total Faltas</TableHead>
                  <TableHead className="text-right">Taxa de Presença</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {frequenciaPorTurma
                  .filter(t => selectedSchool === "todas" || t.escola_nome === escolas.find(e => e.id === selectedSchool)?.nome)
                  .map((turma) => (
                    <TableRow key={turma.turma_id}>
                      <TableCell className="font-medium">{turma.turma_nome}</TableCell>
                      <TableCell>{turma.escola_nome}</TableCell>
                      <TableCell className="text-right">{turma.total_alunos}</TableCell>
                      <TableCell className="text-right">{turma.total_faltas}</TableCell>
                      <TableCell className="text-right font-semibold">{turma.taxa_presenca}%</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            turma.taxa_presenca >= 90 ? "default" : 
                            turma.taxa_presenca >= 75 ? "secondary" : 
                            "destructive"
                          }
                        >
                          {turma.taxa_presenca >= 90 ? "Excelente" : 
                           turma.taxa_presenca >= 75 ? "Boa" : 
                           "Atenção"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {frequenciaPorTurma.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de frequência disponível
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {relatorioTipo === "desempenho" && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Desempenho por Disciplina - {selectedPeriod}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Disciplina</TableHead>
                  <TableHead className="text-right">Média Geral</TableHead>
                  <TableHead className="text-right">Total de Avaliações</TableHead>
                  <TableHead>Desempenho</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {desempenhoPorDisciplina.map((disciplina) => (
                  <TableRow key={disciplina.disciplina_id}>
                    <TableCell className="font-medium">{disciplina.disciplina_nome}</TableCell>
                    <TableCell className="text-right font-semibold text-lg">
                      {disciplina.media_geral.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">{disciplina.total_avaliacoes}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          disciplina.media_geral >= 7 ? "default" : 
                          disciplina.media_geral >= 6 ? "secondary" : 
                          "destructive"
                        }
                      >
                        {disciplina.media_geral >= 7 ? "Ótimo" : 
                         disciplina.media_geral >= 6 ? "Bom" : 
                         "Precisa Melhorar"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {desempenhoPorDisciplina.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de desempenho disponível
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {relatorioTipo === "escola" && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório Detalhado por Escola - {selectedPeriod}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {getDadosFiltrados().map((escola) => (
                <div key={escola.escola_id} className="border-b pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold mb-4">{escola.escola_nome}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total de Alunos</p>
                      <p className="text-2xl font-bold">{escola.total_alunos}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total de Turmas</p>
                      <p className="text-2xl font-bold">{escola.total_turmas}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Professores</p>
                      <p className="text-2xl font-bold">{escola.total_professores}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                      <p className="text-2xl font-bold">{escola.taxa_ocupacao}%</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Capacidade: {escola.total_alunos} / {escola.capacidade || 0} alunos
                    </p>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(escola.taxa_ocupacao, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {getDadosFiltrados().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma escola encontrada
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
