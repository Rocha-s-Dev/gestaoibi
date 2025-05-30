
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Plus, TrendingUp, Users, Star, FileText } from "lucide-react";
import { PesquisaSatisfacaoDialog } from "./PesquisaSatisfacaoDialog";

// Dados mock para demonstração
const pesquisasSatisfacao = [
  {
    id: "1",
    titulo: "Satisfação Geral - UBS Centro",
    periodo: "Novembro 2024",
    totalRespostas: 245,
    notaMedia: 4.2,
    status: "ativa" as const,
    dataInicio: "2024-11-01",
    dataFim: "2024-11-30",
    unidade: "UBS Centro",
    categoria: "Atendimento Geral"
  },
  {
    id: "2",
    titulo: "Qualidade do Atendimento - Hospital Municipal",
    periodo: "Outubro 2024",
    totalRespostas: 189,
    notaMedia: 3.8,
    status: "finalizada" as const,
    dataInicio: "2024-10-01",
    dataFim: "2024-10-31",
    unidade: "Hospital Municipal",
    categoria: "Atendimento Médico"
  },
  {
    id: "3",
    titulo: "Tempo de Espera - UBS Vila Nova",
    periodo: "Setembro 2024",
    totalRespostas: 156,
    notaMedia: 3.5,
    status: "finalizada" as const,
    dataInicio: "2024-09-01",
    dataFim: "2024-09-30",
    unidade: "UBS Vila Nova",
    categoria: "Tempo de Espera"
  }
];

const dadosEvolucao = [
  { mes: "Jul", satisfacao: 3.2 },
  { mes: "Ago", satisfacao: 3.5 },
  { mes: "Set", satisfacao: 3.8 },
  { mes: "Out", satisfacao: 4.0 },
  { mes: "Nov", satisfacao: 4.2 }
];

const dadosCategoria = [
  { categoria: "Atendimento", valor: 4.1, cor: "#10b981" },
  { categoria: "Infraestrutura", valor: 3.8, cor: "#3b82f6" },
  { categoria: "Tempo de Espera", valor: 3.5, cor: "#f59e0b" },
  { categoria: "Comunicação", valor: 4.0, cor: "#8b5cf6" }
];

export function SatisfacaoPaciente() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPesquisa, setEditingPesquisa] = useState(null);

  const handleAddPesquisa = () => {
    setEditingPesquisa(null);
    setDialogOpen(true);
  };

  const handleEditPesquisa = (pesquisa: any) => {
    setEditingPesquisa(pesquisa);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPesquisa(null);
  };

  const handleSubmitPesquisa = (data: any) => {
    console.log("Pesquisa submetida:", data);
    // Aqui seria a lógica para salvar a pesquisa
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativa: "bg-green-100 text-green-800",
      finalizada: "bg-gray-100 text-gray-800",
      planejada: "bg-blue-100 text-blue-800"
    };
    return variants[status] || variants.finalizada;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Pesquisas de Satisfação</h2>
          <p className="text-muted-foreground">
            Monitore a satisfação dos pacientes com os serviços de saúde
          </p>
        </div>
        <Button onClick={handleAddPesquisa}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Pesquisa
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesquisas Ativas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              +0 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">590</div>
            <p className="text-xs text-muted-foreground">
              +15% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota Média Geral</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2</div>
            <p className="text-xs text-muted-foreground">
              +0.3 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground">
              +5% desde o mês passado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Satisfação</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosEvolucao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="satisfacao" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satisfação por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dadosCategoria.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.categoria}</span>
                  <span className="font-medium">{item.valor}/5.0</span>
                </div>
                <Progress value={(item.valor / 5) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lista de pesquisas */}
      <Card>
        <CardHeader>
          <CardTitle>Pesquisas de Satisfação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pesquisasSatisfacao.map((pesquisa) => (
              <div
                key={pesquisa.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleEditPesquisa(pesquisa)}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium">{pesquisa.titulo}</h3>
                    <Badge className={getStatusBadge(pesquisa.status)}>
                      {pesquisa.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pesquisa.unidade} • {pesquisa.periodo}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{pesquisa.totalRespostas} respostas</span>
                    <span>Nota média: {pesquisa.notaMedia}/5.0</span>
                    <span>{pesquisa.categoria}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {pesquisa.notaMedia}/5.0
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round((pesquisa.notaMedia / 5) * 100)}% satisfação
                    </div>
                  </div>
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <PesquisaSatisfacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitPesquisa}
        editingPesquisa={editingPesquisa}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
