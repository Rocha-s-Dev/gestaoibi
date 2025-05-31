
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign, FileText, Users, Building, Eye, Download } from "lucide-react";
import { InformacaoDialog } from "./InformacaoDialog";

type InformacaoTransparencia = {
  id: string;
  titulo: string;
  categoria: "receitas" | "despesas" | "contratos" | "licitacoes" | "servidores" | "obras";
  descricao: string;
  dataAtualizacao: Date;
  status: "ativo" | "inativo";
  visualizacoes: number;
  responsavel: string;
  arquivo?: string;
};

export function PortalTransparencia() {
  const [informacoes, setInformacoes] = useState<InformacaoTransparencia[]>([
    {
      id: "1",
      titulo: "Receitas Municipais - Janeiro 2024",
      categoria: "receitas",
      descricao: "Detalhamento das receitas arrecadadas no mês de janeiro",
      dataAtualizacao: new Date("2024-02-01"),
      status: "ativo",
      visualizacoes: 234,
      responsavel: "Secretaria de Finanças"
    },
    {
      id: "2",
      titulo: "Contratos Vigentes",
      categoria: "contratos",
      descricao: "Lista de todos os contratos ativos da prefeitura",
      dataAtualizacao: new Date("2024-01-30"),
      status: "ativo",
      visualizacoes: 156,
      responsavel: "Secretaria de Administração"
    },
    {
      id: "3",
      titulo: "Quadro de Servidores",
      categoria: "servidores",
      descricao: "Informações sobre servidores públicos municipais",
      dataAtualizacao: new Date("2024-01-15"),
      status: "ativo",
      visualizacoes: 89,
      responsavel: "Recursos Humanos"
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInformacao, setEditingInformacao] = useState<InformacaoTransparencia | null>(null);

  const handleAddInformacao = (novaInformacao: Omit<InformacaoTransparencia, "id">) => {
    const id = Date.now().toString();
    setInformacoes([...informacoes, { ...novaInformacao, id }]);
    setDialogOpen(false);
  };

  const handleEditInformacao = (informacaoAtualizada: InformacaoTransparencia) => {
    setInformacoes(informacoes.map(i => i.id === informacaoAtualizada.id ? informacaoAtualizada : i));
    setDialogOpen(false);
    setEditingInformacao(null);
  };

  const getCategoriaBadge = (categoria: InformacaoTransparencia["categoria"]) => {
    const categoriaConfig = {
      receitas: { label: "Receitas", variant: "default" as const, icon: DollarSign },
      despesas: { label: "Despesas", variant: "destructive" as const, icon: DollarSign },
      contratos: { label: "Contratos", variant: "secondary" as const, icon: FileText },
      licitacoes: { label: "Licitações", variant: "outline" as const, icon: FileText },
      servidores: { label: "Servidores", variant: "secondary" as const, icon: Users },
      obras: { label: "Obras", variant: "outline" as const, icon: Building }
    };
    
    return categoriaConfig[categoria];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const categorias = [
    { key: "receitas", label: "Receitas", count: informacoes.filter(i => i.categoria === "receitas").length, icon: DollarSign, color: "text-green-500" },
    { key: "despesas", label: "Despesas", count: informacoes.filter(i => i.categoria === "despesas").length, icon: DollarSign, color: "text-red-500" },
    { key: "contratos", label: "Contratos", count: informacoes.filter(i => i.categoria === "contratos").length, icon: FileText, color: "text-blue-500" },
    { key: "servidores", label: "Servidores", count: informacoes.filter(i => i.categoria === "servidores").length, icon: Users, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 mr-4">
          {categorias.map((categoria) => (
            <Card key={categoria.key}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <categoria.icon className={`h-5 w-5 ${categoria.color}`} />
                  <div>
                    <p className="text-sm font-medium">{categoria.label}</p>
                    <p className="text-2xl font-bold">{categoria.count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Informação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Mais Acessadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {informacoes
                .sort((a, b) => b.visualizacoes - a.visualizacoes)
                .slice(0, 5)
                .map((info) => {
                  const categoria = getCategoriaBadge(info.categoria);
                  return (
                    <div key={info.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <categoria.icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">{info.titulo}</p>
                          <p className="text-xs text-gray-500">{info.visualizacoes} visualizações</p>
                        </div>
                      </div>
                      <Badge variant={categoria.variant} className="text-xs">
                        {categoria.label}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atualizações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {informacoes
                .sort((a, b) => b.dataAtualizacao.getTime() - a.dataAtualizacao.getTime())
                .slice(0, 5)
                .map((info) => {
                  const categoria = getCategoriaBadge(info.categoria);
                  return (
                    <div key={info.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <categoria.icon className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">{info.titulo}</p>
                          <p className="text-xs text-gray-500">{formatDate(info.dataAtualizacao)}</p>
                        </div>
                      </div>
                      <Badge variant={categoria.variant} className="text-xs">
                        {categoria.label}
                      </Badge>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {informacoes.map((info) => {
                const categoria = getCategoriaBadge(info.categoria);
                return (
                  <TableRow key={info.id}>
                    <TableCell className="font-medium">{info.titulo}</TableCell>
                    <TableCell>
                      <Badge variant={categoria.variant}>
                        {categoria.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{info.descricao}</TableCell>
                    <TableCell>{formatDate(info.dataAtualizacao)}</TableCell>
                    <TableCell>{info.visualizacoes}</TableCell>
                    <TableCell>{info.responsavel}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InformacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingInformacao ? handleEditInformacao : handleAddInformacao}
        informacao={editingInformacao}
      />
    </div>
  );
}
