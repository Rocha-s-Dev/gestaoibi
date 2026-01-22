
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  FileCheck, 
  FileClock, 
  FileX, 
  Search, 
  AlertTriangle 
} from "lucide-react";
import { format, parseISO, isAfter, addDays, subMonths, addMonths, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Payment {
  id: string;
  contract_id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: "pending" | "paid" | "overdue";
  description: string;
  contract: {
    description: string;
    contract_number: string;
  };
  created_at: string;
}

export function PaymentTracking() {
  const [search, setSearch] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [confirmPayDialog, setConfirmPayDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const formattedMonth = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  
  const { data: payments, isLoading } = useQuery({
    queryKey: ['contract_payments', currentDate, statusFilter],
    queryFn: async () => {
      // Start with base query
      let query = supabase
        .from("contract_payments" as any)
        .select(`
          *,
          contract:contracts(
            description,
            contract_number
          )
        `);

      // If we're filtering by month, add that condition
      if (currentDate) {
        const startOfCurrentMonth = startOfMonth(currentDate);
        const startOfNextMonth = startOfMonth(addMonths(currentDate, 1));

        query = query
          .gte('due_date', startOfCurrentMonth.toISOString())
          .lt('due_date', startOfNextMonth.toISOString());
      }
      
      // If we're filtering by status, add that condition
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Order by due date
      query = query.order('due_date', { ascending: true });

      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Erro ao carregar pagamentos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as unknown as Payment[];
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await (supabase
        .from("contract_payments" as any) as any)
        .update({
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract_payments'] });
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    
    try {
      await markAsPaidMutation.mutateAsync(selectedPayment.id);
      setConfirmPayDialog(false);
    } catch (error) {
      console.error("Error marking payment as paid:", error);
    }
  };

  const previousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <FileCheck className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <FileX className="h-4 w-4 text-red-600" />;
      default:
        return <FileClock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getRelativeTimeInfo = (dueDate: string) => {
    const now = new Date();
    const due = parseISO(dueDate);
    const isOverdue = isAfter(now, due);
    const isUpcoming = isAfter(due, now) && isAfter(due, addDays(now, -7));
    
    if (isOverdue) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-xs">Vencido</span>
        </div>
      );
    }
    
    if (isUpcoming) {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <Clock className="h-4 w-4" />
          <span className="text-xs">Próximo do vencimento</span>
        </div>
      );
    }
    
    return null;
  };

  const filteredPayments = payments?.filter(payment =>
    payment.contract.description.toLowerCase().includes(search.toLowerCase()) ||
    payment.contract.contract_number.toLowerCase().includes(search.toLowerCase()) ||
    payment.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Acompanhamento de Pagamentos
            </div>
          </CardTitle>

          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={previousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="mx-2 min-w-[150px] text-center font-medium">
                {formattedMonth}
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={goToCurrentMonth}
                className="ml-2"
              >
                Hoje
              </Button>
            </div>

            <div className="flex items-center gap-2 md:ml-auto">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os pagamentos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar pagamentos..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Carregando pagamentos...</div>
        ) : filteredPayments?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pagamento encontrado para o período selecionado
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="font-medium">{payment.contract.contract_number}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">{payment.contract.description}</div>
                    </TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>
                      {payment.amount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        {format(parseISO(payment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {getRelativeTimeInfo(payment.due_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(payment.status)}
                        <Badge 
                          variant={
                            payment.status === "paid" ? "default" :
                            payment.status === "overdue" ? "destructive" : "outline"
                          }
                        >
                          {payment.status === "paid" && "Pago"}
                          {payment.status === "overdue" && "Vencido"}
                          {payment.status === "pending" && "Pendente"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status !== "paid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setConfirmPayDialog(true);
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Marcar como pago
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <Dialog open={confirmPayDialog} onOpenChange={setConfirmPayDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Pagamento</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja marcar este pagamento como pago? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedPayment && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Contrato:</span> {selectedPayment.contract.contract_number}</div>
                    <div><span className="font-medium">Descrição:</span> {selectedPayment.description}</div>
                    <div>
                      <span className="font-medium">Valor:</span> {selectedPayment.amount.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </div>
                    <div>
                      <span className="font-medium">Vencimento:</span> {format(parseISO(selectedPayment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmPayDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmPayment}>
                Confirmar Pagamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
