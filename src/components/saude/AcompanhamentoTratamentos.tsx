
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Plus, Activity, Users, Calendar, TrendingUp } from "lucide-react";
import { TratamentoDialog } from "./TratamentoDialog";

// Dados mock para demonstração
const tratamentosAtivos = [
  {
    id: "1",
    paciente: "Maria Silva Santos",
    cpf: "123.456.789-00",
    tratamento: "Hipertensão Arterial",
    medico: "Dr. João Carvalho",
    dataInicio: "2024-01-15",
    proximaConsulta: "2024-12-20",
    status: "em_andamento" as const,
    progresso: 75,
    medicamentos: ["Losartana 50mg", "Hidroclorotiazida 25mg"],
    observacoes: "Pressão controlada, paciente aderente ao tratamento"
  },
  {
    id: "2",
    paciente: "José Oliveira Lima",
    cpf: "987.654.321-00",
    tratamento: "Diabetes Mellitus Tipo 2",
    medico: "Dra. Ana Paula",
    dataInicio: "2024-02-20",
    proximaConsulta: "2024-12-18",
    status: "em_andamento" as const,
    progresso: 60,
    medicamentos: ["Metformina 850mg", "Glibenclamida 5mg"],
    observacoes: "Glicemia em melhora, ajuste na dieta necessário"
  },
  {
    id: "3",
    paciente: "Ana Costa Pereira",
    cpf: "456.789.123-00",
    tratamento: "Fisioterapia Pós-Cirúrgica",
    medico: "Dr. Carlos Mendes",
    dataInicio: "2024-11-01",
    proximaConsulta: "2024-12-15",
    status: "concluido" as const,
    progresso: 100,
    medicamentos: [],
    observacoes: "Recuperação completa, alta médica"
  }
];

const dadosProgresso = [
  { mes: "Jul", concluidos: 45, ativos: 120 },
  { mes: "Ago", concluidos: 52, ativos: 128 },
  { mes: "Set", concluidos: 48, ativos: 135 },
  { mes: "Out", concluidos: 58, ativos: 142 },
  { mes: "Nov", concluidos: 61, ativos: 150 }
];

const dadosResultados = [
  { categoria: "Melhora Significativa", valor: 68 },
  { categoria: "Melhora Parcial", valor: 22 },
  { categoria: "Estável", valor: 8 },
  { categoria: "Piora", valor: 2 }
];

export function AcompanhamentoTratamentos() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTratamento, setEditingTratamento] = useState(null);

  const handleAddTratamento = () => {
    setEditingTratamento(null);
    setDialogOpen(true);
  };

  const handleEditTratamento = (tratamento: any) => {
    setEditingTratamento(tratamento);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTratamento(null);
  };

  const handleSubmitTratamento = (data: any) => {
    console.log("Tratamento submetido:", data);
    // Aqui seria a lógica para salvar o tratamento
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      em_andamento: "bg-blue-100 text-blue-800",
      concluido: "bg-green-100 text-green-800",
      suspenso: "bg-yellow-100 text-yellow-800",
      cancelado: "bg-red-100 text-red-800"
    };
    
    const labels = {
      em_andamento: "Em Andamento",
      concluido: "Concluído",
      suspenso: "Suspenso",
      cancelado: "Cancelado"
    };

    return {
      className: variants[status] || variants.em_andamento,
      label: labels[status] || status
    };
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com ações */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Acompanhamento de Tratamentos</h2>
          <p className="text-muted-foreground">
            Registro e monitoramento de tratamentos em andamento
          </p>
        </div>
        <Button onClick={handleAddTratamento}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tratamento
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tratamentos Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div>
            <p className="text-xs text-muted-foreground">
              +8 desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes em Tratamento</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68</div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Melhora</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
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
            <CardTitle>Evolução dos Tratamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosProgresso}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ativos" fill="#3b82f6" name="Ativos" />
                <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Tratamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dadosResultados.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.categoria}</span>
                  <span className="font-medium">{item.valor}%</span>
                </div>
                <Progress value={item.valor} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lista de tratamentos ativos */}
      <Card>
        <CardHeader>
          <CardTitle>Tratamentos Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tratamentosAtivos.map((tratamento) => {
              const statusInfo = getStatusBadge(tratamento.status);
              return (
                <div
                  key={tratamento.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleEditTratamento(tratamento)}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{tratamento.paciente}</h3>
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong>Tratamento:</strong> {tratamento.tratamento}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Médico:</strong> {tratamento.medico} • 
                      <strong> CPF:</strong> {tratamento.cpf}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Início: {new Date(tratamento.dataInicio).toLocaleDateString('pt-BR')}</span>
                      <span>Próxima consulta: {new Date(tratamento.proximaConsulta).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {tratamento.medicamentos.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Medicamentos:</strong> {tratamento.medicamentos.join(", ")}
                      </p>
                    )}
                    {tratamento.observacoes && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Observações:</strong> {tratamento.observacoes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {tratamento.progresso}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Progresso
                      </div>
                    </div>
                    <Progress value={tratamento.progresso} className="w-24 h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <TratamentoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmitTratamento}
        editingTratamento={editingTratamento}
        onClose={handleCloseDialog}
      />
    </div>
  );
}
