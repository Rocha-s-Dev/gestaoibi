
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, 
  Calendar,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddContractGoalDialog } from "./AddContractGoalDialog";

const contractGoals = [
  {
    id: "efficiency",
    title: "Eficiência em Licitações",
    description: "Redução do tempo médio de fechamento de licitações",
    target: "30 dias",
    current: "34 dias",
    progress: 88,
    status: "in-progress",
    lastUpdate: "2024-04-05"
  },
  {
    id: "compliance",
    title: "Contratos em Dia",
    description: "Manter 100% dos contratos com prazos de pagamento cumpridos",
    target: "100%",
    current: "95%",
    progress: 95,
    status: "in-progress",
    lastUpdate: "2024-04-07"
  }
];

// Mock data for contract compliance over time
const complianceData = [
  { month: "Janeiro", compliance: "92%" },
  { month: "Fevereiro", compliance: "94%" },
  { month: "Março", compliance: "97%" },
  { month: "Abril", compliance: "95%" }
];

export function ContractGoals() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { data: paymentStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['contract-payment-stats'],
    queryFn: async () => {
      // This would typically fetch from a database or API
      // For now we'll use mock data since this requires SQL aggregations
      return {
        totalContracts: 24,
        activeContracts: 18,
        contractsWithinDeadline: 17,
        overduePending: 1,
        onTimePaymentPercentage: 95
      };
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "at-risk":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleGoalAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    // In a real app, you would refetch the goals here
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Metas de Contratos</h2>
        <Button 
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats?.totalContracts || "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contratos ativos: {paymentStats?.activeContracts || "—"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos em Dia</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats?.onTimePaymentPercentage || "—"}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Meta: 100% de pagamentos em dia
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dentro do Prazo</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats?.contractsWithinDeadline || "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Atrasados: {paymentStats?.overduePending || "—"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prazo Médio Licitação</CardTitle>
            <BarChart2 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34 dias</div>
            <p className="text-xs text-muted-foreground mt-1">
              Meta: 30 dias (↓13% no último mês)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {contractGoals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{goal.title}</CardTitle>
                {getStatusIcon(goal.status)}
              </div>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>Progresso: <span className="font-medium">{goal.progress}%</span></div>
                  <div>Meta: <span className="font-medium">{goal.target}</span></div>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
              <div className="text-sm text-muted-foreground">
                Atual: <span className="font-medium text-foreground">{goal.current}</span>
                <span className="block mt-1">
                  Última atualização: {format(parseISO(goal.lastUpdate), "dd 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Compliance Report */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Mensais de Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Taxa de Conformidade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complianceData.map((month) => (
                <TableRow key={month.month}>
                  <TableCell>{month.month}</TableCell>
                  <TableCell>{month.compliance}</TableCell>
                  <TableCell>
                    {parseInt(month.compliance) >= 95 ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Meta atingida
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <AlertTriangle className="h-4 w-4 mr-1" /> Abaixo da meta
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Goal Dialog */}
      <AddContractGoalDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onGoalAdded={handleGoalAdded}
      />
    </div>
  );
}
