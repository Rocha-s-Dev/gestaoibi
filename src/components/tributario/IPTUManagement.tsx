import { useState } from "react";
import { useImoveis, useIPTU, useContribuintes } from "@/hooks/useArrecadacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Home, FileText, CreditCard, QrCode, Barcode, Search } from "lucide-react";

export function IPTUManagement() {
  const { imoveis, isLoading: loadingImoveis, createImovel } = useImoveis();
  const { lancamentos, isLoading: loadingLanc, createLancamento, registrarPagamento } = useIPTU();
  const { contribuintes } = useContribuintes();
  const [dialogImovel, setDialogImovel] = useState(false);
  const [dialogLancamento, setDialogLancamento] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [imovelForm, setImovelForm] = useState({
    inscricao_imobiliaria: "",
    contribuinte_id: "",
    logradouro: "",
    numero: "",
    bairro: "",
    quadra: "",
    lote: "",
    tipo_uso: "residencial",
    area_terreno: "",
    area_construida: "",
    valor_venal_terreno: "",
    valor_venal_construcao: "",
    aliquota_iptu: "0.01",
  });

  const [lancamentoForm, setLancamentoForm] = useState({
    imovel_id: "",
    exercicio: new Date().getFullYear(),
    numero_parcelas: 10,
  });

  const handleCreateImovel = () => {
    const valorTotal = (parseFloat(imovelForm.valor_venal_terreno) || 0) + 
                       (parseFloat(imovelForm.valor_venal_construcao) || 0);
    createImovel.mutate({
      ...imovelForm,
      area_terreno: parseFloat(imovelForm.area_terreno) || null,
      area_construida: parseFloat(imovelForm.area_construida) || null,
      valor_venal_terreno: parseFloat(imovelForm.valor_venal_terreno) || null,
      valor_venal_construcao: parseFloat(imovelForm.valor_venal_construcao) || null,
      valor_venal_total: valorTotal || null,
      aliquota_iptu: parseFloat(imovelForm.aliquota_iptu),
      contribuinte_id: imovelForm.contribuinte_id || null,
    }, {
      onSuccess: () => setDialogImovel(false),
    });
  };

  const handleCreateLancamento = () => {
    const imovel = imoveis.find((i: any) => i.id === lancamentoForm.imovel_id);
    if (!imovel) return;

    const valorVenal = imovel.valor_venal_total || 0;
    const aliquota = imovel.aliquota_iptu || 0.01;
    const valorIPTU = valorVenal * aliquota;

    createLancamento.mutate({
      imovel_id: lancamentoForm.imovel_id,
      contribuinte_id: imovel.contribuinte_id,
      exercicio: lancamentoForm.exercicio,
      valor_venal: valorVenal,
      aliquota: aliquota,
      valor_iptu: valorIPTU,
      valor_total: valorIPTU,
      numero_parcelas: lancamentoForm.numero_parcelas,
      valor_cota_unica: valorIPTU * 0.9,
    }, {
      onSuccess: () => setDialogLancamento(false),
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      em_aberto: "outline",
      vencido: "destructive",
      pago: "default",
      parcelado: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status.replace("_", " ")}</Badge>;
  };

  const filteredImoveis = imoveis.filter((i: any) =>
    i.inscricao_imobiliaria?.includes(searchTerm) ||
    i.logradouro?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Tabs defaultValue="imoveis" className="space-y-4">
      <TabsList>
        <TabsTrigger value="imoveis" className="flex items-center gap-1">
          <Home className="h-4 w-4" />
          Cadastro Imobiliário
        </TabsTrigger>
        <TabsTrigger value="lancamentos" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Lançamentos
        </TabsTrigger>
        <TabsTrigger value="pagamentos" className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          Pagamentos
        </TabsTrigger>
      </TabsList>

      <TabsContent value="imoveis" className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por inscrição ou endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={dialogImovel} onOpenChange={setDialogImovel}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Imóvel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cadastrar Imóvel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Inscrição Imobiliária *</Label>
                    <Input
                      value={imovelForm.inscricao_imobiliaria}
                      onChange={(e) => setImovelForm({ ...imovelForm, inscricao_imobiliaria: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Contribuinte</Label>
                    <Select
                      value={imovelForm.contribuinte_id}
                      onValueChange={(v) => setImovelForm({ ...imovelForm, contribuinte_id: v })}
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
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Label>Logradouro *</Label>
                    <Input
                      value={imovelForm.logradouro}
                      onChange={(e) => setImovelForm({ ...imovelForm, logradouro: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input
                      value={imovelForm.numero}
                      onChange={(e) => setImovelForm({ ...imovelForm, numero: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bairro *</Label>
                    <Input
                      value={imovelForm.bairro}
                      onChange={(e) => setImovelForm({ ...imovelForm, bairro: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Quadra</Label>
                    <Input
                      value={imovelForm.quadra}
                      onChange={(e) => setImovelForm({ ...imovelForm, quadra: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Lote</Label>
                    <Input
                      value={imovelForm.lote}
                      onChange={(e) => setImovelForm({ ...imovelForm, lote: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tipo de Uso</Label>
                    <Select
                      value={imovelForm.tipo_uso}
                      onValueChange={(v) => setImovelForm({ ...imovelForm, tipo_uso: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residencial">Residencial</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="misto">Misto</SelectItem>
                        <SelectItem value="territorial">Territorial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Alíquota IPTU (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={imovelForm.aliquota_iptu}
                      onChange={(e) => setImovelForm({ ...imovelForm, aliquota_iptu: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Área Terreno (m²)</Label>
                    <Input
                      type="number"
                      value={imovelForm.area_terreno}
                      onChange={(e) => setImovelForm({ ...imovelForm, area_terreno: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Área Construída (m²)</Label>
                    <Input
                      type="number"
                      value={imovelForm.area_construida}
                      onChange={(e) => setImovelForm({ ...imovelForm, area_construida: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Valor Venal Terreno</Label>
                    <Input
                      type="number"
                      value={imovelForm.valor_venal_terreno}
                      onChange={(e) => setImovelForm({ ...imovelForm, valor_venal_terreno: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Valor Venal Construção</Label>
                    <Input
                      type="number"
                      value={imovelForm.valor_venal_construcao}
                      onChange={(e) => setImovelForm({ ...imovelForm, valor_venal_construcao: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleCreateImovel} disabled={createImovel.isPending} className="w-full">
                  Cadastrar Imóvel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Imóveis Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inscrição</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Proprietário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Área (m²)</TableHead>
                  <TableHead>Valor Venal</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredImoveis.map((im: any) => (
                  <TableRow key={im.id}>
                    <TableCell className="font-mono">{im.inscricao_imobiliaria}</TableCell>
                    <TableCell>{im.logradouro}, {im.numero} - {im.bairro}</TableCell>
                    <TableCell>{im.contribuintes?.nome_razao_social || "-"}</TableCell>
                    <TableCell className="capitalize">{im.tipo_uso}</TableCell>
                    <TableCell>{im.area_terreno || 0} / {im.area_construida || 0}</TableCell>
                    <TableCell>{formatCurrency(im.valor_venal_total || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={im.status === "ativo" ? "default" : "secondary"}>
                        {im.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="lancamentos" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={dialogLancamento} onOpenChange={setDialogLancamento}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lançar IPTU</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Imóvel</Label>
                  <Select
                    value={lancamentoForm.imovel_id}
                    onValueChange={(v) => setLancamentoForm({ ...lancamentoForm, imovel_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      {imoveis.filter((i: any) => i.status === "ativo").map((im: any) => (
                        <SelectItem key={im.id} value={im.id}>
                          {im.inscricao_imobiliaria} - {im.logradouro}, {im.numero}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Exercício</Label>
                    <Input
                      type="number"
                      value={lancamentoForm.exercicio}
                      onChange={(e) => setLancamentoForm({ ...lancamentoForm, exercicio: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Número de Parcelas</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={lancamentoForm.numero_parcelas}
                      onChange={(e) => setLancamentoForm({ ...lancamentoForm, numero_parcelas: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateLancamento} disabled={createLancamento.isPending} className="w-full">
                  Gerar Lançamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lançamentos de IPTU</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercício</TableHead>
                  <TableHead>Imóvel</TableHead>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead>Valor Venal</TableHead>
                  <TableHead>Valor IPTU</TableHead>
                  <TableHead>Parcelas</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lancamentos.map((l: any) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-bold">{l.exercicio}</TableCell>
                    <TableCell>{l.imoveis?.inscricao_imobiliaria}</TableCell>
                    <TableCell>{l.contribuintes?.nome_razao_social || "-"}</TableCell>
                    <TableCell>{formatCurrency(l.valor_venal || 0)}</TableCell>
                    <TableCell>{formatCurrency(l.valor_total || 0)}</TableCell>
                    <TableCell>{l.numero_parcelas}x</TableCell>
                    <TableCell>{getStatusBadge(l.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pagamentos" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Opções de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 text-center">
                  <Barcode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Boleto Bancário</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Gere boletos para pagamento em qualquer banco
                  </p>
                  <Button variant="outline" className="w-full">Gerar Boleto</Button>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 text-center">
                  <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">PIX</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Pagamento instantâneo via QR Code PIX
                  </p>
                  <Button variant="outline" className="w-full">Gerar PIX</Button>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-dashed">
                <CardContent className="pt-6 text-center">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Cartão</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Débito ou crédito com parcelamento
                  </p>
                  <Button variant="outline" className="w-full">Pagar com Cartão</Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
