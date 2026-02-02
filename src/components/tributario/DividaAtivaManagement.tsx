import { useState } from "react";
import { useDividaAtiva, useContribuintes } from "@/hooks/useArrecadacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Scale, FileWarning, Gavel } from "lucide-react";
import { format } from "date-fns";

export function DividaAtivaManagement() {
  const { dividas, isLoading, inscreverDivida, ajuizarDivida } = useDividaAtiva();
  const { contribuintes } = useContribuintes();
  const [dialogInscricao, setDialogInscricao] = useState(false);
  const [dialogAjuizamento, setDialogAjuizamento] = useState(false);
  const [selectedDivida, setSelectedDivida] = useState<any>(null);

  const [inscricaoForm, setInscricaoForm] = useState({
    contribuinte_id: "",
    tipo_tributo: "iptu",
    exercicio: new Date().getFullYear() - 1,
    valor_principal: "",
    valor_multa: "",
    valor_juros: "",
    valor_correcao: "",
    data_vencimento_original: "",
    observacoes: "",
  });

  const [ajuizamentoForm, setAjuizamentoForm] = useState({
    numeroProcesso: "",
    varaJuizo: "",
  });

  const handleInscrever = () => {
    const valorTotal = 
      (parseFloat(inscricaoForm.valor_principal) || 0) +
      (parseFloat(inscricaoForm.valor_multa) || 0) +
      (parseFloat(inscricaoForm.valor_juros) || 0) +
      (parseFloat(inscricaoForm.valor_correcao) || 0);

    inscreverDivida.mutate({
      ...inscricaoForm,
      valor_principal: parseFloat(inscricaoForm.valor_principal) || 0,
      valor_multa: parseFloat(inscricaoForm.valor_multa) || 0,
      valor_juros: parseFloat(inscricaoForm.valor_juros) || 0,
      valor_correcao: parseFloat(inscricaoForm.valor_correcao) || 0,
      valor_total: valorTotal,
    }, {
      onSuccess: () => setDialogInscricao(false),
    });
  };

  const handleAjuizar = () => {
    if (!selectedDivida) return;
    ajuizarDivida.mutate({
      id: selectedDivida.id,
      ...ajuizamentoForm,
    }, {
      onSuccess: () => {
        setDialogAjuizamento(false);
        setSelectedDivida(null);
      },
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      inscrita: "outline",
      parcelada: "secondary",
      em_execucao: "destructive",
      quitada: "default",
      prescrita: "secondary",
      cancelada: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status?.replace("_", " ")}</Badge>;
  };

  // Estatísticas
  const totalInscrito = dividas.filter((d: any) => d.status === "inscrita").reduce((sum: number, d: any) => sum + (d.valor_total || 0), 0);
  const totalExecucao = dividas.filter((d: any) => d.status === "em_execucao").reduce((sum: number, d: any) => sum + (d.valor_total || 0), 0);
  const totalParcelado = dividas.filter((d: any) => d.status === "parcelada").reduce((sum: number, d: any) => sum + (d.valor_total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-orange-600" />
              Total Inscrito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(totalInscrito)}</div>
            <p className="text-xs text-muted-foreground">
              {dividas.filter((d: any) => d.status === "inscrita").length} inscrições
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gavel className="h-4 w-4 text-red-600" />
              Em Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(totalExecucao)}</div>
            <p className="text-xs text-muted-foreground">
              {dividas.filter((d: any) => d.status === "em_execucao").length} processos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-600" />
              Parcelado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(totalParcelado)}</div>
            <p className="text-xs text-muted-foreground">
              {dividas.filter((d: any) => d.status === "parcelada").length} parcelamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {formatCurrency(dividas.reduce((sum: number, d: any) => sum + (d.valor_total || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {dividas.length} registros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex justify-end">
        <Dialog open={dialogInscricao} onOpenChange={setDialogInscricao}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Inscrever Débito
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Inscrever em Dívida Ativa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Contribuinte</Label>
                <Select
                  value={inscricaoForm.contribuinte_id}
                  onValueChange={(v) => setInscricaoForm({ ...inscricaoForm, contribuinte_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar contribuinte" />
                  </SelectTrigger>
                  <SelectContent>
                    {contribuintes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome_razao_social} - {c.cpf_cnpj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Tributo</Label>
                  <Select
                    value={inscricaoForm.tipo_tributo}
                    onValueChange={(v) => setInscricaoForm({ ...inscricaoForm, tipo_tributo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iptu">IPTU</SelectItem>
                      <SelectItem value="iss">ISS</SelectItem>
                      <SelectItem value="itbi">ITBI</SelectItem>
                      <SelectItem value="taxas">Taxas</SelectItem>
                      <SelectItem value="multas">Multas</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exercício</Label>
                  <Input
                    type="number"
                    value={inscricaoForm.exercicio}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, exercicio: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Principal (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inscricaoForm.valor_principal}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, valor_principal: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Multa (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inscricaoForm.valor_multa}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, valor_multa: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Juros (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inscricaoForm.valor_juros}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, valor_juros: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Correção Monetária (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={inscricaoForm.valor_correcao}
                    onChange={(e) => setInscricaoForm({ ...inscricaoForm, valor_correcao: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Data Vencimento Original</Label>
                <Input
                  type="date"
                  value={inscricaoForm.data_vencimento_original}
                  onChange={(e) => setInscricaoForm({ ...inscricaoForm, data_vencimento_original: e.target.value })}
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={inscricaoForm.observacoes}
                  onChange={(e) => setInscricaoForm({ ...inscricaoForm, observacoes: e.target.value })}
                />
              </div>

              <Button onClick={handleInscrever} className="w-full">
                Inscrever em Dívida Ativa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog de Ajuizamento */}
      <Dialog open={dialogAjuizamento} onOpenChange={setDialogAjuizamento}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuizar Execução Fiscal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Número do Processo</Label>
              <Input
                value={ajuizamentoForm.numeroProcesso}
                onChange={(e) => setAjuizamentoForm({ ...ajuizamentoForm, numeroProcesso: e.target.value })}
                placeholder="0000000-00.0000.0.00.0000"
              />
            </div>
            <div>
              <Label>Vara/Juízo</Label>
              <Input
                value={ajuizamentoForm.varaJuizo}
                onChange={(e) => setAjuizamentoForm({ ...ajuizamentoForm, varaJuizo: e.target.value })}
                placeholder="1ª Vara da Fazenda Pública"
              />
            </div>
            <Button onClick={handleAjuizar} className="w-full">
              Confirmar Ajuizamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Dívida Ativa</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Inscrição</TableHead>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead>Tributo</TableHead>
                  <TableHead>Exercício</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Data Inscrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividas.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono">{d.numero_inscricao}</TableCell>
                    <TableCell>{d.contribuintes?.nome_razao_social}</TableCell>
                    <TableCell className="uppercase">{d.tipo_tributo}</TableCell>
                    <TableCell>{d.exercicio}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(d.valor_total || 0)}</TableCell>
                    <TableCell>{format(new Date(d.data_inscricao), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(d.status)}</TableCell>
                    <TableCell>
                      {d.status === "inscrita" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedDivida(d);
                            setDialogAjuizamento(true);
                          }}
                        >
                          <Gavel className="h-4 w-4 mr-1" />
                          Ajuizar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
