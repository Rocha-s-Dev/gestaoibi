
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Download, Eye, Calendar, Upload } from "lucide-react";
import { RelatorioDialog } from "./RelatorioDialog";

type Relatorio = {
  id: string;
  titulo: string;
  tipo: "mensal" | "trimestral" | "semestral" | "anual";
  categoria: "atividades" | "financeiro" | "projetos" | "resultados";
  dataPublicacao: Date;
  status: "publicado" | "rascunho" | "em_revisao";
  downloads: number;
  responsavel: string;
  arquivo?: string;
};

export function PublicacaoRelatorios() {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([
    {
      id: "1",
      titulo: "Relatório de Atividades - Janeiro 2024",
      tipo: "mensal",
      categoria: "atividades",
      dataPublicacao: new Date("2024-02-01"),
      status: "publicado",
      downloads: 125,
      responsavel: "Maria Silva"
    },
    {
      id: "2",
      titulo: "Relatório Financeiro - Q4 2023",
      tipo: "trimestral",
      categoria: "financeiro",
      dataPublicacao: new Date("2024-01-15"),
      status: "publicado",
      downloads: 89,
      responsavel: "João Santos"
    },
    {
      id: "3",
      titulo: "Relatório de Projetos - Fevereiro 2024",
      tipo: "mensal",
      categoria: "projetos",
      dataPublicacao: new Date("2024-03-01"),
      status: "em_revisao",
      downloads: 0,
      responsavel: "Ana Costa"
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRelatorio, setEditingRelatorio] = useState<Relatorio | null>(null);

  const handleAddRelatorio = (novoRelatorio: Omit<Relatorio, "id">) => {
    const id = Date.now().toString();
    setRelatorios([...relatorios, { ...novoRelatorio, id }]);
    setDialogOpen(false);
  };

  const handleEditRelatorio = (relatorioAtualizado: Relatorio) => {
    setRelatorios(relatorios.map(r => r.id === relatorioAtualizado.id ? relatorioAtualizado : r));
    setDialogOpen(false);
    setEditingRelatorio(null);
  };

  const getStatusBadge = (status: Relatorio["status"]) => {
    const statusConfig = {
      publicado: { label: "Publicado", variant: "default" as const },
      rascunho: { label: "Rascunho", variant: "secondary" as const },
      em_revisao: { label: "Em Revisão", variant: "outline" as const }
    };
    
    return statusConfig[status];
  };

  const getTipoBadge = (tipo: Relatorio["tipo"]) => {
    const tipoConfig = {
      mensal: { label: "Mensal", variant: "outline" as const },
      trimestral: { label: "Trimestral", variant: "secondary" as const },
      semestral: { label: "Semestral", variant: "outline" as const },
      anual: { label: "Anual", variant: "default" as const }
    };
    
    return tipoConfig[tipo];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 mr-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total de Relatórios</p>
                  <p className="text-2xl font-bold">{relatorios.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Publicados</p>
                  <p className="text-2xl font-bold">{relatorios.filter(r => r.status === "publicado").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Total Downloads</p>
                  <p className="text-2xl font-bold">{relatorios.reduce((acc, r) => acc + r.downloads, 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Este Mês</p>
                  <p className="text-2xl font-bold">
                    {relatorios.filter(r => 
                      r.dataPublicacao.getMonth() === new Date().getMonth() &&
                      r.dataPublicacao.getFullYear() === new Date().getFullYear()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Relatórios Publicados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Publicação</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorios.map((relatorio) => (
                <TableRow key={relatorio.id}>
                  <TableCell className="font-medium">{relatorio.titulo}</TableCell>
                  <TableCell>
                    <Badge variant={getTipoBadge(relatorio.tipo).variant}>
                      {getTipoBadge(relatorio.tipo).label}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{relatorio.categoria}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(relatorio.status).variant}>
                      {getStatusBadge(relatorio.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(relatorio.dataPublicacao)}</TableCell>
                  <TableCell>{relatorio.downloads}</TableCell>
                  <TableCell>{relatorio.responsavel}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RelatorioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingRelatorio ? handleEditRelatorio : handleAddRelatorio}
        relatorio={editingRelatorio}
      />
    </div>
  );
}
