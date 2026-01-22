
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  CalendarClock, 
  ChevronDown, 
  FileText, 
  FileCheck, 
  FileX, 
  Download,
  ExternalLink,
  Search
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Contract {
  id: string;
  description: string;
  contract_number: string;
  contractor: string;
  contracted: string;
  value: number;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "cancelled";
  notes?: string;
  document_urls?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    uploaded_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface PaymentInfo {
  id: string;
  contract_id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: "pending" | "paid" | "overdue";
  description: string;
}

export function ContractList({ refreshTrigger }: { refreshTrigger: number }) {
  const [search, setSearch] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const { toast } = useToast();

  const { data: contracts, isLoading } = useQuery({
    queryKey: ['contracts', refreshTrigger],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("contracts" as any) as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Erro ao carregar contratos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Contract[];
    },
  });

  const { data: payments } = useQuery({
    queryKey: ['payments', selectedContract?.id],
    queryFn: async () => {
      if (!selectedContract?.id) return [];
      
      const { data, error } = await (supabase
        .from("contract_payments" as any) as any)
        .select('*')
        .eq('contract_id', selectedContract.id)
        .order('due_date', { ascending: true });
      
      if (error) {
        toast({
          title: "Erro ao carregar pagamentos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as PaymentInfo[];
    },
    enabled: !!selectedContract?.id,
  });

  const filteredContracts = contracts?.filter(contract => 
    contract.description.toLowerCase().includes(search.toLowerCase()) ||
    contract.contract_number.toLowerCase().includes(search.toLowerCase()) ||
    contract.contractor.toLowerCase().includes(search.toLowerCase()) ||
    contract.contracted.toLowerCase().includes(search.toLowerCase())
  );

  const getContractStatus = (contract: Contract) => {
    const now = new Date();
    const endDate = parseISO(contract.end_date);
    
    if (contract.status === "cancelled") {
      return {
        label: "Cancelado",
        color: "destructive",
      };
    } else if (contract.status === "completed") {
      return {
        label: "Concluído",
        color: "green",
      };
    } else if (isAfter(now, endDate)) {
      return {
        label: "Vencido",
        color: "red",
      };
    } else if (isAfter(now, addDays(endDate, -30))) {
      return {
        label: "Vencimento próximo",
        color: "amber",
      };
    } else {
      return {
        label: "Ativo",
        color: "default",
      };
    }
  };

  const handleDownload = async (documentUrl: string, documentName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('contract_documents')
        .download(documentUrl);
      
      if (error) throw error;
      
      // Create a download link for the file
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast({
        title: "Erro ao baixar arquivo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contratos
          </CardTitle>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar contratos..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Carregando contratos...</div>
        ) : filteredContracts?.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum contrato encontrado
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {filteredContracts?.map((contract) => {
              const status = getContractStatus(contract);
              
              return (
                <AccordionItem value={contract.id} key={contract.id}>
                  <AccordionTrigger className="hover:bg-muted/50 px-3 py-2 rounded-md">
                    <div className="flex items-center w-full justify-between pr-4">
                      <div className="flex flex-col items-start text-left">
                        <div className="font-medium">{contract.description}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <span>Contrato Nº: {contract.contract_number}</span>
                          <span className="mx-1">•</span>
                          <span>
                            {parseFloat(contract.value.toString()).toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            })}
                          </span>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={status.color as "default" | "destructive" | "outline" | "secondary"}
                        className="ml-auto mr-4 shrink-0"
                      >
                        {status.label}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3 pt-1">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm">Contratante:</h4>
                          <p>{contract.contractor}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Contratado:</h4>
                          <p>{contract.contracted}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-sm">Data de Início:</h4>
                          <p>{format(parseISO(contract.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Data de Término:</h4>
                          <p>{format(parseISO(contract.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        </div>
                      </div>
                      
                      {contract.notes && (
                        <div>
                          <h4 className="font-medium text-sm">Observações:</h4>
                          <p className="text-sm">{contract.notes}</p>
                        </div>
                      )}
                      
                      {contract.document_urls && contract.document_urls.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">Documentos:</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {contract.document_urls.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between text-sm border rounded-md p-2">
                                <div className="truncate max-w-[200px] flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  {doc.name}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</span>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={() => handleDownload(doc.url, doc.name)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Dialog onOpenChange={(open) => {
                          if (open) setSelectedContract(contract);
                          else setSelectedContract(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <CalendarClock className="h-4 w-4 mr-2" />
                              Ver Pagamentos
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Pagamentos do Contrato</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="max-h-[600px]">
                              <div className="space-y-4">
                                <div className="rounded-md border p-3">
                                  <h3 className="font-medium mb-1">{selectedContract?.description}</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div><span className="font-medium">Contrato:</span> {selectedContract?.contract_number}</div>
                                    <div>
                                      <span className="font-medium">Valor:</span> {selectedContract?.value.toLocaleString('pt-BR', { 
                                        style: 'currency', 
                                        currency: 'BRL' 
                                      })}
                                    </div>
                                    <div>
                                      <span className="font-medium">Início:</span> {selectedContract?.start_date && 
                                        format(parseISO(selectedContract.start_date), "dd/MM/yyyy", { locale: ptBR })
                                      }
                                    </div>
                                    <div>
                                      <span className="font-medium">Término:</span> {selectedContract?.end_date && 
                                        format(parseISO(selectedContract.end_date), "dd/MM/yyyy", { locale: ptBR })
                                      }
                                    </div>
                                  </div>
                                </div>
                          
                                <div>
                                  {!payments || payments.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                      Nenhum pagamento registrado para este contrato
                                    </div>
                                  ) : (
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Descrição</TableHead>
                                          <TableHead>Valor</TableHead>
                                          <TableHead>Vencimento</TableHead>
                                          <TableHead>Pagamento</TableHead>
                                          <TableHead>Status</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {payments.map((payment) => {
                                          let statusIcon;
                                          let statusColor;
                                          
                                          switch (payment.status) {
                                            case "paid":
                                              statusIcon = <FileCheck className="h-4 w-4" />;
                                              statusColor = "text-green-600";
                                              break;
                                            case "overdue":
                                              statusIcon = <FileX className="h-4 w-4" />;
                                              statusColor = "text-red-600";
                                              break;
                                            default:
                                              statusIcon = <CalendarClock className="h-4 w-4" />;
                                              statusColor = "text-amber-600";
                                          }
                                          
                                          return (
                                            <TableRow key={payment.id}>
                                              <TableCell>{payment.description}</TableCell>
                                              <TableCell>
                                                {payment.amount.toLocaleString('pt-BR', { 
                                                  style: 'currency', 
                                                  currency: 'BRL' 
                                                })}
                                              </TableCell>
                                              <TableCell>
                                                {format(parseISO(payment.due_date), "dd/MM/yyyy", { locale: ptBR })}
                                              </TableCell>
                                              <TableCell>
                                                {payment.payment_date 
                                                  ? format(parseISO(payment.payment_date), "dd/MM/yyyy", { locale: ptBR })
                                                  : "-"
                                                }
                                              </TableCell>
                                              <TableCell>
                                                <div className={`flex items-center gap-1 ${statusColor}`}>
                                                  {statusIcon}
                                                  <span>
                                                    {payment.status === "paid" && "Pago"}
                                                    {payment.status === "overdue" && "Vencido"}
                                                    {payment.status === "pending" && "Pendente"}
                                                  </span>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  )}
                                </div>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
