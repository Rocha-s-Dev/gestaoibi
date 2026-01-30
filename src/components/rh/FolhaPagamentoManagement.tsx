import { useState } from "react";
import { useFolhaPagamento, useFolhaServidores } from "@/hooks/useFolhaPagamento";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Calculator, Lock, Eye, FileText, Loader2 } from "lucide-react";

export function FolhaPagamentoManagement() {
  const { folhas, loadingFolhas, criarFolha, calcularFolha, fecharFolha } = useFolhaPagamento();
  const [novaCompetencia, setNovaCompetencia] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFolha, setSelectedFolha] = useState<string | null>(null);

  const handleCriarFolha = () => {
    if (novaCompetencia) {
      criarFolha.mutate({ competencia: novaCompetencia });
      setDialogOpen(false);
      setNovaCompetencia("");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      aberta: "outline",
      calculada: "secondary",
      conferida: "default",
      fechada: "destructive",
    };
    const labels: Record<string, string> = {
      aberta: "Aberta",
      calculada: "Calculada",
      conferida: "Conferida",
      fechada: "Fechada",
    };
    return <Badge variant={variants[status] || "outline"}>{labels[status] || status}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loadingFolhas) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Folha de Pagamento</h2>
          <p className="text-muted-foreground">Gestão de folhas mensais e cálculos de vencimentos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Folha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Folha de Pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Competência</Label>
                <Input
                  type="month"
                  value={novaCompetencia}
                  onChange={(e) => setNovaCompetencia(e.target.value)}
                />
              </div>
              <Button onClick={handleCriarFolha} className="w-full" disabled={criarFolha.isPending}>
                {criarFolha.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Folha
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Bruto (Última Folha)</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(folhas?.[0]?.total_bruto || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Descontos</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(folhas?.[0]?.total_descontos || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Líquido</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(folhas?.[0]?.total_liquido || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Servidores</CardDescription>
            <CardTitle className="text-2xl">
              {folhas?.[0]?.quantidade_servidores || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabela de Folhas */}
      <Card>
        <CardHeader>
          <CardTitle>Folhas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Bruto</TableHead>
                <TableHead className="text-right">Descontos</TableHead>
                <TableHead className="text-right">Líquido</TableHead>
                <TableHead className="text-right">Servidores</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {folhas?.map((folha) => (
                <TableRow key={folha.id}>
                  <TableCell>
                    {format(new Date(folha.competencia + "-01"), "MMMM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{getStatusBadge(folha.status)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(folha.total_bruto)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(folha.total_descontos)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(folha.total_liquido)}</TableCell>
                  <TableCell className="text-right">{folha.quantidade_servidores}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFolha(folha.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {folha.status === "aberta" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => calcularFolha.mutate(folha.id)}
                          disabled={calcularFolha.isPending}
                        >
                          {calcularFolha.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Calculator className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {folha.status === "calculada" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fecharFolha.mutate(folha.id)}
                          disabled={fecharFolha.isPending}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!folhas || folhas.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhuma folha de pagamento encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes da Folha */}
      {selectedFolha && (
        <FolhaDetalhesDialog
          folhaId={selectedFolha}
          onClose={() => setSelectedFolha(null)}
        />
      )}
    </div>
  );
}

function FolhaDetalhesDialog({ folhaId, onClose }: { folhaId: string; onClose: () => void }) {
  const { data: servidores, isLoading } = useFolhaServidores(folhaId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalhes da Folha
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servidor</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="text-right">Salário Base</TableHead>
                <TableHead className="text-right">INSS</TableHead>
                <TableHead className="text-right">IRRF</TableHead>
                <TableHead className="text-right">Líquido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servidores?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.servidor?.name || "-"}</TableCell>
                  <TableCell>{s.servidor?.cpf || "-"}</TableCell>
                  <TableCell>{s.cargo_nome || "-"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.salario_base)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.valor_inss)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(s.valor_irrf)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(s.salario_liquido)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
