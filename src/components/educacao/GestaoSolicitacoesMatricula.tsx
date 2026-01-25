import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  FileText,
  RefreshCw,
  Users
} from "lucide-react";
import { useSolicitacoesMatricula, type StatusSolicitacaoMatricula, type SolicitacaoMatricula } from "@/hooks/useSolicitacoesMatricula";
import { SolicitacaoDetalhesDialog } from "./SolicitacaoDetalhesDialog";

const STATUS_CONFIG: Record<StatusSolicitacaoMatricula, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  em_analise: { label: "Em Análise", color: "bg-blue-100 text-blue-800", icon: AlertCircle },
  aprovada: { label: "Aprovada", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejeitada: { label: "Indeferida", color: "bg-red-100 text-red-800", icon: XCircle },
  lista_espera: { label: "Lista de Espera", color: "bg-orange-100 text-orange-800", icon: Users },
};

export function GestaoSolicitacoesMatricula() {
  const [filtroStatus, setFiltroStatus] = useState<StatusSolicitacaoMatricula | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoMatricula | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { solicitacoes, loading, fetchSolicitacoes, atualizarStatus, aprovarSolicitacao, rejeitarSolicitacao } = useSolicitacoesMatricula();

  useEffect(() => {
    const status = filtroStatus === "todos" ? undefined : filtroStatus;
    fetchSolicitacoes(status);
  }, [filtroStatus, fetchSolicitacoes]);

  const solicitacoesFiltradas = solicitacoes.filter((s) => {
    if (!busca) return true;
    const termoBusca = busca.toLowerCase();
    return (
      s.protocolo.toLowerCase().includes(termoBusca) ||
      s.nome_aluno?.toLowerCase().includes(termoBusca) ||
      s.nome_responsavel?.toLowerCase().includes(termoBusca) ||
      s.cpf_responsavel?.includes(termoBusca)
    );
  });

  const contadores = {
    total: solicitacoes.length,
    pendente: solicitacoes.filter((s) => s.status === "pendente").length,
    em_analise: solicitacoes.filter((s) => s.status === "em_analise").length,
    aprovada: solicitacoes.filter((s) => s.status === "aprovada").length,
    rejeitada: solicitacoes.filter((s) => s.status === "rejeitada").length,
    lista_espera: solicitacoes.filter((s) => s.status === "lista_espera").length,
  };

  const handleVerDetalhes = (solicitacao: SolicitacaoMatricula) => {
    setSelectedSolicitacao(solicitacao);
    setDialogOpen(true);
  };

  const handleAprovar = async (id: string, turmaId?: string) => {
    await aprovarSolicitacao(id, turmaId);
    setDialogOpen(false);
  };

  const handleRejeitar = async (id: string, motivo: string) => {
    await rejeitarSolicitacao(id, motivo);
    setDialogOpen(false);
  };

  const handleIniciarAnalise = async (id: string) => {
    await atualizarStatus(id, "em_analise");
  };

  const handleListaEspera = async (id: string) => {
    await atualizarStatus(id, "lista_espera");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50" onClick={() => setFiltroStatus("todos")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{contadores.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-colors hover:bg-yellow-50" onClick={() => setFiltroStatus("pendente")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{contadores.pendente}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-colors hover:bg-blue-50" onClick={() => setFiltroStatus("em_analise")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Análise</p>
                <p className="text-2xl font-bold text-blue-600">{contadores.em_analise}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-colors hover:bg-green-50" onClick={() => setFiltroStatus("aprovada")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{contadores.aprovada}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer transition-colors hover:bg-red-50" onClick={() => setFiltroStatus("rejeitada")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Indeferidas</p>
                <p className="text-2xl font-bold text-red-600">{contadores.rejeitada}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Solicitações de Matrícula
              </CardTitle>
              <CardDescription>
                Gerencie as solicitações de matrícula recebidas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchSolicitacoes()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por protocolo, nome do aluno ou responsável..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={filtroStatus} 
              onValueChange={(v) => setFiltroStatus(v as StatusSolicitacaoMatricula | "todos")}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="rejeitada">Indeferida</SelectItem>
                <SelectItem value="lista_espera">Lista de Espera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : solicitacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma solicitação encontrada</h3>
              <p className="text-sm text-muted-foreground">
                {busca ? "Tente ajustar os termos de busca" : "Não há solicitações com este status"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Série</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoesFiltradas.map((solicitacao) => {
                    const statusConfig = STATUS_CONFIG[solicitacao.status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow key={solicitacao.id}>
                        <TableCell className="font-mono font-medium">
                          {solicitacao.protocolo}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{solicitacao.nome_aluno}</p>
                            <p className="text-xs text-muted-foreground">
                              Nasc: {new Date(solicitacao.data_nascimento).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{solicitacao.nome_responsavel}</p>
                            <p className="text-xs text-muted-foreground">
                              {solicitacao.telefone_responsavel}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{solicitacao.serie_pretendida}</TableCell>
                        <TableCell>{formatDate(solicitacao.created_at)}</TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {solicitacao.status === "pendente" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleIniciarAnalise(solicitacao.id)}
                              >
                                Iniciar Análise
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerDetalhes(solicitacao)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSolicitacao && (
        <SolicitacaoDetalhesDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          solicitacao={selectedSolicitacao}
          onAprovar={handleAprovar}
          onRejeitar={handleRejeitar}
          onListaEspera={handleListaEspera}
        />
      )}
    </div>
  );
}
