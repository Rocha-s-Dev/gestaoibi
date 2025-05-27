
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Calendar,
  Edit,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MetaCulturalDialog } from "./MetaCulturalDialog";

// Interface para metas culturais
interface MetaCultural {
  id: string;
  tipo: "projetos-aprovados" | "participacao-publico";
  titulo: string;
  descricao: string;
  metaAnual: number;
  valorAtual: number;
  unidade: string;
  ano: number;
  status: "ativa" | "concluida" | "atrasada";
  criadaEm: string;
  ultimaAtualizacao: string;
}

// Interface para relatórios mensais
interface RelatorioMensal {
  id: string;
  metaId: string;
  mes: string;
  ano: number;
  valor: number;
  observacoes: string;
  criadoEm: string;
}

// Dados simulados
const metasData: MetaCultural[] = [
  {
    id: "1",
    tipo: "projetos-aprovados",
    titulo: "Projetos Culturais Aprovados 2024",
    descricao: "Meta de aprovação de projetos culturais para o ano de 2024",
    metaAnual: 50,
    valorAtual: 32,
    unidade: "projetos",
    ano: 2024,
    status: "ativa",
    criadaEm: "2024-01-01",
    ultimaAtualizacao: "2024-06-15"
  },
  {
    id: "2",
    tipo: "participacao-publico",
    titulo: "Participação em Eventos Culturais 2024",
    descricao: "Meta de participação do público em eventos culturais e esportivos",
    metaAnual: 10000,
    valorAtual: 6500,
    unidade: "pessoas",
    ano: 2024,
    status: "ativa",
    criadaEm: "2024-01-01",
    ultimaAtualizacao: "2024-06-15"
  }
];

const relatoriosData: RelatorioMensal[] = [
  {
    id: "1",
    metaId: "1",
    mes: "Janeiro",
    ano: 2024,
    valor: 5,
    observacoes: "Início do ano com bom desempenho",
    criadoEm: "2024-01-31"
  },
  {
    id: "2",
    metaId: "1",
    mes: "Fevereiro",
    ano: 2024,
    valor: 4,
    observacoes: "Carnaval impactou nas aprovações",
    criadoEm: "2024-02-29"
  },
  {
    id: "3",
    metaId: "2",
    mes: "Janeiro",
    ano: 2024,
    valor: 800,
    observacoes: "Festival de verão teve boa participação",
    criadoEm: "2024-01-31"
  }
];

export function MetasProjetos() {
  const [metas, setMetas] = useState<MetaCultural[]>(metasData);
  const [relatorios] = useState<RelatorioMensal[]>(relatoriosData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [metaSelecionada, setMetaSelecionada] = useState<MetaCultural | undefined>();

  const getStatusBadge = (status: MetaCultural["status"]) => {
    const statusConfig = {
      ativa: { label: "Ativa", variant: "default" as const },
      concluida: { label: "Concluída", variant: "secondary" as const },
      atrasada: { label: "Atrasada", variant: "destructive" as const },
    };
    return statusConfig[status];
  };

  const getTipoIcon = (tipo: MetaCultural["tipo"]) => {
    return tipo === "projetos-aprovados" ? CheckCircle : Users;
  };

  const calcularProgresso = (meta: MetaCultural) => {
    return Math.min(Math.round((meta.valorAtual / meta.metaAnual) * 100), 100);
  };

  const handleEditarMeta = (meta: MetaCultural) => {
    setMetaSelecionada(meta);
    setDialogOpen(true);
  };

  const handleNovaMeta = () => {
    setMetaSelecionada(undefined);
    setDialogOpen(true);
  };

  const handleSalvarMeta = (meta: MetaCultural | Omit<MetaCultural, "id">) => {
    if ("id" in meta) {
      // Editando meta existente
      setMetas(prev => prev.map(m => m.id === meta.id ? meta : m));
    } else {
      // Criando nova meta
      const novaMeta = {
        ...meta,
        id: Date.now().toString(),
        criadaEm: new Date().toISOString().split('T')[0],
        ultimaAtualizacao: new Date().toISOString().split('T')[0]
      };
      setMetas(prev => [...prev, novaMeta]);
    }
  };

  const relatoriosPorMeta = (metaId: string) => {
    return relatorios.filter(r => r.metaId === metaId);
  };

  return (
    <div className="space-y-6">
      {/* Header com botão para nova meta */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Metas de Projetos Culturais</h2>
          <p className="text-muted-foreground">
            Defina e acompanhe metas de aprovação de projetos e participação do público
          </p>
        </div>
        <Button onClick={handleNovaMeta}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metas Ativas</p>
                <p className="text-2xl font-bold">
                  {metas.filter(m => m.status === "ativa").length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metas Concluídas</p>
                <p className="text-2xl font-bold">
                  {metas.filter(m => m.status === "concluida").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Metas Atrasadas</p>
                <p className="text-2xl font-bold">
                  {metas.filter(m => m.status === "atrasada").length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metas.map((meta) => {
          const StatusIcon = getTipoIcon(meta.tipo);
          const statusConfig = getStatusBadge(meta.status);
          const progresso = calcularProgresso(meta);
          
          return (
            <Card key={meta.id}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-5 w-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{meta.titulo}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {meta.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusConfig.variant}>
                      {statusConfig.label}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditarMeta(meta)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-muted-foreground">
                      {meta.valorAtual} / {meta.metaAnual} {meta.unidade}
                    </span>
                  </div>
                  <Progress value={progresso} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {progresso}% da meta anual alcançada
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Ano</p>
                    <p className="font-medium">{meta.ano}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Última Atualização</p>
                    <p className="font-medium">
                      {new Date(meta.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Últimos relatórios */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Últimos Relatórios</p>
                  {relatoriosPorMeta(meta.id).slice(-2).map((relatorio) => (
                    <div key={relatorio.id} className="flex justify-between items-center text-sm p-2 bg-muted/50 rounded">
                      <span>{relatorio.mes}/{relatorio.ano}</span>
                      <span className="font-medium">{relatorio.valor} {meta.unidade}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabela de relatórios mensais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relatórios Mensais de Participação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meta</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>Valor Registrado</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Data de Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorios.map((relatorio) => {
                const meta = metas.find(m => m.id === relatorio.metaId);
                return (
                  <TableRow key={relatorio.id}>
                    <TableCell>
                      <div className="font-medium">{meta?.titulo}</div>
                    </TableCell>
                    <TableCell>{relatorio.mes}/{relatorio.ano}</TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {relatorio.valor} {meta?.unidade}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground">
                        {relatorio.observacoes}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(relatorio.criadoEm).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para criar/editar meta */}
      <MetaCulturalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSalvarMeta}
        meta={metaSelecionada}
      />
    </div>
  );
}
