import { useState } from "react";
import { usePortalCidadaoIPTU, useRevisoesIPTU } from "@/hooks/useIPTUCompleto";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Download, History, Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function PortalCidadaoIPTU() {
  const { consultarDebitos, gerarSegundaVia } = usePortalCidadaoIPTU();
  const { solicitarRevisao } = useRevisoesIPTU();
  
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [inscricao, setInscricao] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState("");
  const [dialogRevisao, setDialogRevisao] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<any>(null);

  const [revisaoForm, setRevisaoForm] = useState({
    tipo: "valor_venal",
    motivo: "",
    valor_pleiteado: "",
  });

  const handleConsulta = async () => {
    if (!cpfCnpj) {
      setError("Informe o CPF ou CNPJ");
      return;
    }

    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const data = await consultarDebitos(cpfCnpj, inscricao || undefined);
      setResultado(data);
    } catch (err: any) {
      setError(err.message || "Erro ao consultar débitos");
    } finally {
      setLoading(false);
    }
  };

  const handleSegundaVia = async (parcelaId: string) => {
    try {
      const parcela = await gerarSegundaVia(parcelaId);
      // Simulação de download do boleto
      alert(`Boleto gerado para parcela ${parcela.numero_parcela}ª\nCódigo de barras: ${parcela.codigo_barras || 'Disponível em breve'}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSolicitarRevisao = () => {
    solicitarRevisao.mutate({
      imovel_id: selectedLancamento.imovel_id,
      contribuinte_id: selectedLancamento.contribuinte_id,
      tipo: revisaoForm.tipo,
      exercicio: selectedLancamento.exercicio,
      motivo: revisaoForm.motivo,
      valor_atual: selectedLancamento.valor_total,
      valor_pleiteado: parseFloat(revisaoForm.valor_pleiteado) || null,
    }, {
      onSuccess: (protocolo) => {
        setDialogRevisao(false);
        alert(`Revisão protocolada com sucesso!\nProtocolo: ${protocolo}`);
      },
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const formatCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6" />
            Portal do Cidadão - IPTU
          </CardTitle>
          <CardDescription>
            Consulte seus débitos, emita 2ª via de boletos e solicite revisões
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Formulário de Consulta */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Consultar Débitos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>CPF ou CNPJ *</Label>
              <Input
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                placeholder="Digite seu CPF ou CNPJ"
                maxLength={18}
              />
            </div>
            <div className="w-[200px]">
              <Label>Inscrição Imobiliária (opcional)</Label>
              <Input
                value={inscricao}
                onChange={(e) => setInscricao(e.target.value)}
                placeholder="Ex: 01.001.001"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleConsulta} disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Consultando...</>
                ) : (
                  <><Search className="h-4 w-4 mr-2" /> Consultar</>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Consulta */}
      {resultado && (
        <div className="space-y-4">
          {/* Info do Contribuinte */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-lg">{resultado.contribuinte.nome_razao_social}</p>
                  <p className="text-muted-foreground">{formatCpfCnpj(cpfCnpj)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lançamentos */}
          {resultado.lancamentos && resultado.lancamentos.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lançamentos de IPTU
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resultado.lancamentos.map((l: any) => (
                    <Card key={l.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                          <div>
                            <p className="font-mono font-medium">{l.imoveis?.inscricao_imobiliaria}</p>
                            <p className="text-sm text-muted-foreground">
                              {l.imoveis?.logradouro}, {l.imoveis?.numero} - {l.imoveis?.bairro}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">Exercício {l.exercicio}</Badge>
                            <p className="text-lg font-bold">{formatCurrency(l.valor_total || 0)}</p>
                          </div>
                        </div>

                        {/* Parcelas */}
                        {l.iptu_parcelas && l.iptu_parcelas.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50">
                                  <TableHead>Parcela</TableHead>
                                  <TableHead>Vencimento</TableHead>
                                  <TableHead>Valor</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">2ª Via</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {l.iptu_parcelas.map((p: any) => {
                                  const vencida = new Date(p.data_vencimento) < new Date() && p.status === "em_aberto";
                                  return (
                                    <TableRow key={p.id}>
                                      <TableCell>{p.numero_parcela}ª</TableCell>
                                      <TableCell className={vencida ? "text-destructive" : ""}>
                                        {new Date(p.data_vencimento).toLocaleDateString("pt-BR")}
                                      </TableCell>
                                      <TableCell>{formatCurrency(p.valor || 0)}</TableCell>
                                      <TableCell>
                                        <Badge variant={
                                          p.status === "pago" ? "default" :
                                          vencida ? "destructive" : "outline"
                                        }>
                                          {p.status === "pago" ? "Pago" : vencida ? "Vencido" : "Em Aberto"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {p.status !== "pago" && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSegundaVia(p.id)}
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedLancamento(l);
                              setDialogRevisao(true);
                            }}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Solicitar Revisão
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum débito de IPTU encontrado para este contribuinte.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Informações */}
      {!resultado && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Consulta de Débitos</h3>
              <p className="text-sm text-muted-foreground">
                Verifique todos os débitos de IPTU vinculados ao seu CPF ou CNPJ
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Download className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">2ª Via de Boleto</h3>
              <p className="text-sm text-muted-foreground">
                Emita segunda via de boletos para pagamento de parcelas em aberto
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Send className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Solicitação de Revisão</h3>
              <p className="text-sm text-muted-foreground">
                Protocole pedidos de revisão de valor venal, área ou isenção
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog Revisão */}
      <Dialog open={dialogRevisao} onOpenChange={setDialogRevisao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Revisão de IPTU</DialogTitle>
          </DialogHeader>
          {selectedLancamento && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-mono">{selectedLancamento.imoveis?.inscricao_imobiliaria}</p>
                <p className="text-sm text-muted-foreground">
                  Exercício {selectedLancamento.exercicio} - {formatCurrency(selectedLancamento.valor_total || 0)}
                </p>
              </div>

              <div>
                <Label>Tipo de Revisão *</Label>
                <Select
                  value={revisaoForm.tipo}
                  onValueChange={(v) => setRevisaoForm({ ...revisaoForm, tipo: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valor_venal">Valor Venal</SelectItem>
                    <SelectItem value="area">Área do Imóvel</SelectItem>
                    <SelectItem value="uso">Uso do Imóvel</SelectItem>
                    <SelectItem value="isencao">Isenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Motivo da Solicitação *</Label>
                <Textarea
                  value={revisaoForm.motivo}
                  onChange={(e) => setRevisaoForm({ ...revisaoForm, motivo: e.target.value })}
                  placeholder="Descreva detalhadamente o motivo da sua solicitação"
                  rows={4}
                />
              </div>

              <div>
                <Label>Valor Pretendido (opcional)</Label>
                <Input
                  type="number"
                  value={revisaoForm.valor_pleiteado}
                  onChange={(e) => setRevisaoForm({ ...revisaoForm, valor_pleiteado: e.target.value })}
                  placeholder="Informe o valor que você considera correto"
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você receberá um protocolo para acompanhar sua solicitação.
                  O prazo de análise é de até 30 dias úteis.
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogRevisao(false)}>Cancelar</Button>
            <Button 
              onClick={handleSolicitarRevisao}
              disabled={!revisaoForm.motivo || solicitarRevisao.isPending}
            >
              Protocolar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
