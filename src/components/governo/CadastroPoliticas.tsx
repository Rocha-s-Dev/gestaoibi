
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Users, Target, Calendar, Eye, Edit, Trash2 } from "lucide-react";
import { PoliticaDialog } from "./PoliticaDialog";

type Politica = {
  id: string;
  nome: string;
  descricao: string;
  objetivos: string[];
  publicoAlvo: string;
  indicadoresSuccesso: string[];
  dataInicio: Date;
  status: "ativa" | "inativa" | "em_desenvolvimento";
  responsavel: string;
  orcamento: number;
};

export function CadastroPoliticas() {
  const [politicas, setPoliticas] = useState<Politica[]>([
    {
      id: "1",
      nome: "Programa Habitação Popular",
      descricao: "Política de acesso à habitação para famílias de baixa renda",
      objetivos: ["Reduzir déficit habitacional", "Melhorar qualidade de vida", "Promover inclusão social"],
      publicoAlvo: "Famílias com renda até 3 salários mínimos",
      indicadoresSuccesso: ["1000 famílias atendidas", "95% de satisfação", "Redução de 20% no déficit"],
      dataInicio: new Date("2024-01-15"),
      status: "ativa",
      responsavel: "João Silva",
      orcamento: 5000000
    },
    {
      id: "2",
      nome: "Educação Digital",
      descricao: "Programa de inclusão digital nas escolas municipais",
      objetivos: ["Melhorar ensino", "Incluir tecnologia", "Capacitar professores"],
      publicoAlvo: "Estudantes e professores da rede municipal",
      indicadoresSuccesso: ["100% escolas conectadas", "500 professores capacitados"],
      dataInicio: new Date("2024-02-01"),
      status: "ativa",
      responsavel: "Maria Santos",
      orcamento: 2000000
    }
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolitica, setEditingPolitica] = useState<Politica | null>(null);

  const handleAddPolitica = (novaPolitica: Omit<Politica, "id">) => {
    const id = Date.now().toString();
    setPoliticas([...politicas, { ...novaPolitica, id }]);
    setDialogOpen(false);
  };

  const handleEditPolitica = (politicaAtualizada: Politica) => {
    setPoliticas(politicas.map(p => p.id === politicaAtualizada.id ? politicaAtualizada : p));
    setDialogOpen(false);
    setEditingPolitica(null);
  };

  const handleDeletePolitica = (id: string) => {
    setPoliticas(politicas.filter(p => p.id !== id));
  };

  const getStatusBadge = (status: Politica["status"]) => {
    const statusConfig = {
      ativa: { label: "Ativa", variant: "default" as const },
      inativa: { label: "Inativa", variant: "secondary" as const },
      em_desenvolvimento: { label: "Em Desenvolvimento", variant: "outline" as const }
    };
    
    return statusConfig[status];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
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
                  <p className="text-sm font-medium">Total de Políticas</p>
                  <p className="text-2xl font-bold">{politicas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Políticas Ativas</p>
                  <p className="text-2xl font-bold">{politicas.filter(p => p.status === "ativa").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Em Desenvolvimento</p>
                  <p className="text-2xl font-bold">{politicas.filter(p => p.status === "em_desenvolvimento").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Orçamento Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(politicas.reduce((sum, p) => sum + p.orcamento, 0))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Política
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Políticas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Público-Alvo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Data Início</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {politicas.map((politica) => (
                <TableRow key={politica.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{politica.nome}</p>
                      <p className="text-sm text-gray-500">{politica.descricao}</p>
                    </div>
                  </TableCell>
                  <TableCell>{politica.publicoAlvo}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(politica.status).variant}>
                      {getStatusBadge(politica.status).label}
                    </Badge>
                  </TableCell>
                  <TableCell>{politica.responsavel}</TableCell>
                  <TableCell>{formatCurrency(politica.orcamento)}</TableCell>
                  <TableCell>{formatDate(politica.dataInicio)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPolitica(politica);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePolitica(politica.id)}
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

      <PoliticaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingPolitica ? handleEditPolitica : handleAddPolitica}
        politica={editingPolitica}
      />
    </div>
  );
}
