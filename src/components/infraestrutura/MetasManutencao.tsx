
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { MetaManutencaoDialog } from "./MetaManutencaoDialog";

export interface MetaManutencao {
  id: string;
  tipo: string;
  tempoMaximo: number; // em horas
  unidade: "horas" | "dias";
  status: "ativo" | "pausado";
  desempenho: number; // percentual de cumprimento
  dataInicio: string;
  dataFim?: string;
  responsavel: string;
  observacoes?: string;
}

export function MetasManutencao() {
  const [metas, setMetas] = useState<MetaManutencao[]>([
    {
      id: "1",
      tipo: "Iluminação Pública",
      tempoMaximo: 48,
      unidade: "horas",
      status: "ativo",
      desempenho: 85,
      dataInicio: "2024-01-01",
      responsavel: "Equipe Elétrica",
      observacoes: "Meta para reparos de iluminação pública"
    },
    {
      id: "2",
      tipo: "Pavimentação",
      tempoMaximo: 7,
      unidade: "dias",
      status: "ativo",
      desempenho: 72,
      dataInicio: "2024-01-01",
      responsavel: "Equipe de Obras",
      observacoes: "Meta para reparos de pavimentação"
    },
    {
      id: "3",
      tipo: "Água e Esgoto",
      tempoMaximo: 24,
      unidade: "horas",
      status: "ativo",
      desempenho: 92,
      dataInicio: "2024-01-01",
      responsavel: "Equipe Hidráulica",
      observacoes: "Meta para problemas de água e esgoto"
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState<MetaManutencao | null>(null);

  const handleCreateMeta = () => {
    setSelectedMeta(null);
    setDialogOpen(true);
  };

  const handleEditMeta = (meta: MetaManutencao) => {
    setSelectedMeta(meta);
    setDialogOpen(true);
  };

  const handleMetaCreated = () => {
    // Aqui seria implementada a lógica de atualização da lista
    console.log("Meta criada/editada");
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "default",
      pausado: "secondary"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {status}
      </Badge>
    );
  };

  const getDesempenhoBadge = (desempenho: number) => {
    if (desempenho >= 90) return <Badge className="bg-green-500">Excelente</Badge>;
    if (desempenho >= 75) return <Badge className="bg-blue-500">Bom</Badge>;
    if (desempenho >= 60) return <Badge className="bg-yellow-500">Regular</Badge>;
    return <Badge variant="destructive">Abaixo da Meta</Badge>;
  };

  const mediaDesempenho = metas.reduce((acc, meta) => acc + meta.desempenho, 0) / metas.length;

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metas.filter(m => m.status === "ativo").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempenho Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaDesempenho.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Cumpridas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metas.filter(m => m.desempenho >= 80).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Metas de Tempo de Resposta</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as metas de tempo máximo para resposta às solicitações
          </p>
        </div>
        <Button onClick={handleCreateMeta}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {/* Tabela de Metas */}
      <Card>
        <CardHeader>
          <CardTitle>Metas Cadastradas</CardTitle>
          <CardDescription>
            Lista de todas as metas de tempo de resposta por tipo de manutenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo de Manutenção</TableHead>
                <TableHead>Tempo Máximo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Desempenho</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metas.map((meta) => (
                <TableRow key={meta.id}>
                  <TableCell className="font-medium">{meta.tipo}</TableCell>
                  <TableCell>
                    {meta.tempoMaximo} {meta.unidade}
                  </TableCell>
                  <TableCell>{getStatusBadge(meta.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{meta.desempenho}%</span>
                      {getDesempenhoBadge(meta.desempenho)}
                    </div>
                  </TableCell>
                  <TableCell>{meta.responsavel}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMeta(meta)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Relatório Mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório de Desempenho Mensal</CardTitle>
          <CardDescription>
            Acompanhamento do cumprimento das metas no mês atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metas.map((meta) => (
              <div key={meta.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{meta.tipo}</h4>
                  <p className="text-sm text-muted-foreground">
                    Meta: {meta.tempoMaximo} {meta.unidade}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{meta.desempenho}%</div>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        meta.desempenho >= 80 ? 'bg-green-500' : 
                        meta.desempenho >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${meta.desempenho}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <MetaManutencaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        meta={selectedMeta}
        onMetaCreated={handleMetaCreated}
      />
    </div>
  );
}
