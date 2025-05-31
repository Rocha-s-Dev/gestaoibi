
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Target, Users, TrendingUp, Calendar, Edit, Trash2, CheckCircle } from "lucide-react";
import { MetaPoliticaDialog } from "./MetaPoliticaDialog";

type MetaPolitica = {
  id: string;
  tipo: "implementacao" | "demandas_atendidas";
  titulo: string;
  descricao: string;
  metaAnual: number;
  valorAtual: number;
  unidadeMedida: string;
  anoReferencia: number;
  status: "ativa" | "concluida" | "em_andamento";
  dataLimite: Date;
  responsavel: string;
};

export function MetasPoliticasPublicas() {
  const [metas, setMetas] = useState<MetaPolitica[]>([
    {
      id: "1",
      tipo: "implementacao",
      titulo: "Implementação de Políticas de Habitação",
      descricao: "Meta anual de implementação de novas políticas habitacionais",
      metaAnual: 5,
      valorAtual: 3,
      unidadeMedida: "políticas",
      anoReferencia: 2024,
      status: "em_andamento",
      dataLimite: new Date("2024-12-31"),
      responsavel: "João Silva"
    },
    {
      id: "2",
      tipo: "demandas_atendidas",
      titulo: "Atendimentos da Ouvidoria",
      descricao: "Meta de aumento no número de demandas atendidas pela ouvidoria",
      metaAnual: 1000,
      valorAtual: 750,
      unidadeMedida: "atendimentos",
      anoReferencia: 2024,
      status: "em_andamento",
      dataLimite: new Date("2024-12-31"),
      responsavel: "Maria Santos"
    },
    {
      id: "3",
      tipo: "implementacao",
      titulo: "Políticas de Educação Digital",
      descricao: "Implementação de políticas para inclusão digital nas escolas",
      metaAnual: 3,
      valorAtual: 3,
      unidadeMedida: "políticas",
      anoReferencia: 2024,
      status: "concluida",
      dataLimite: new Date("2024-10-31"),
      responsavel: "Pedro Costa"
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeta, setEditingMeta] = useState<MetaPolitica | null>(null);

  const handleAddMeta = (novaMeta: Omit<MetaPolitica, "id">) => {
    const id = Date.now().toString();
    setMetas([...metas, { ...novaMeta, id }]);
    setDialogOpen(false);
  };

  const handleEditMeta = (metaAtualizada: MetaPolitica) => {
    setMetas(metas.map(m => m.id === metaAtualizada.id ? metaAtualizada : m));
    setDialogOpen(false);
    setEditingMeta(null);
  };

  const handleDeleteMeta = (id: string) => {
    setMetas(metas.filter(m => m.id !== id));
  };

  const getStatusBadge = (status: MetaPolitica["status"]) => {
    const statusConfig = {
      ativa: { label: "Ativa", variant: "default" as const },
      concluida: { label: "Concluída", variant: "default" as const },
      em_andamento: { label: "Em Andamento", variant: "secondary" as const }
    };
    
    return statusConfig[status];
  };

  const getTipoBadge = (tipo: MetaPolitica["tipo"]) => {
    const tipoConfig = {
      implementacao: { label: "Implementação", variant: "outline" as const },
      demandas_atendidas: { label: "Demandas Atendidas", variant: "secondary" as const }
    };
    
    return tipoConfig[tipo];
  };

  const calcularPercentual = (valorAtual: number, metaAnual: number) => {
    return Math.round((valorAtual / metaAnual) * 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const metasImplementacao = metas.filter(m => m.tipo === "implementacao");
  const metasDemandas = metas.filter(m => m.tipo === "demandas_atendidas");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 mr-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total de Metas</p>
                  <p className="text-2xl font-bold">{metas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Metas Concluídas</p>
                  <p className="text-2xl font-bold">{metas.filter(m => m.status === "concluida").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Em Andamento</p>
                  <p className="text-2xl font-bold">{metas.filter(m => m.status === "em_andamento").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Implementação</p>
                  <p className="text-2xl font-bold">{metasImplementacao.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metas de Políticas Públicas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Data Limite</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{meta.titulo}</p>
                      <p className="text-sm text-gray-500">{meta.descricao}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTipoBadge(meta.tipo).variant}>
                      {getTipoBadge(meta.tipo).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(meta.status).variant}>
                      {getStatusBadge(meta.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm font-medium">
                        {meta.valorAtual}/{meta.metaAnual} {meta.unidadeMedida}
                      </div>
                      <div className="text-sm text-gray-500">
                        ({calcularPercentual(meta.valorAtual, meta.metaAnual)}%)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{meta.responsavel}</TableCell>
                  <TableCell>{formatDate(meta.dataLimite)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingMeta(meta);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMeta(meta.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MetaPoliticaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingMeta ? handleEditMeta : handleAddMeta}
        meta={editingMeta}
      />
    </div>
  );
}
