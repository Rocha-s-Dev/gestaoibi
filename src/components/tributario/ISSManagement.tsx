import { useState } from "react";
import { useISS, useContribuintes } from "@/hooks/useArrecadacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Receipt, Building2, XCircle } from "lucide-react";
import { format } from "date-fns";

export function ISSManagement() {
  const { issContribuintes, nfseList, guias, isLoading, createIssContribuinte, emitirNfse, cancelarNfse, gerarGuia } = useISS();
  const { contribuintes } = useContribuintes();
  const [dialogContribuinte, setDialogContribuinte] = useState(false);
  const [dialogNfse, setDialogNfse] = useState(false);
  const [dialogGuia, setDialogGuia] = useState(false);

  const [contribForm, setContribForm] = useState({
    contribuinte_id: "",
    regime_tributacao: "simples_nacional",
    cnae_principal: "",
    descricao_atividade: "",
    aliquota_iss: "0.05",
    simples_nacional: true,
  });

  const [nfseForm, setNfseForm] = useState({
    iss_contribuinte_id: "",
    competencia: new Date().toISOString().split("T")[0].slice(0, 7) + "-01",
    prestador_cpf_cnpj: "",
    prestador_razao_social: "",
    tomador_cpf_cnpj: "",
    tomador_razao_social: "",
    tomador_email: "",
    codigo_servico: "",
    descricao_servico: "",
    valor_servicos: "",
    valor_deducoes: "0",
    aliquota: "0.05",
  });

  const handleCreateContribuinte = () => {
    createIssContribuinte.mutate({
      ...contribForm,
      aliquota_iss: parseFloat(contribForm.aliquota_iss),
    }, {
      onSuccess: () => setDialogContribuinte(false),
    });
  };

  const handleEmitirNfse = () => {
    const valorServicos = parseFloat(nfseForm.valor_servicos) || 0;
    const valorDeducoes = parseFloat(nfseForm.valor_deducoes) || 0;
    const baseCalculo = valorServicos - valorDeducoes;
    const aliquota = parseFloat(nfseForm.aliquota) || 0.05;
    const valorIss = baseCalculo * aliquota;

    emitirNfse.mutate({
      ...nfseForm,
      valor_servicos: valorServicos,
      valor_deducoes: valorDeducoes,
      base_calculo: baseCalculo,
      aliquota: aliquota,
      valor_iss: valorIss,
      valor_liquido: valorServicos - valorIss,
    }, {
      onSuccess: () => setDialogNfse(false),
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <Tabs defaultValue="contribuintes" className="space-y-4">
      <TabsList>
        <TabsTrigger value="contribuintes" className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          Contribuintes ISS
        </TabsTrigger>
        <TabsTrigger value="nfse" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          NFS-e
        </TabsTrigger>
        <TabsTrigger value="guias" className="flex items-center gap-1">
          <Receipt className="h-4 w-4" />
          Guias ISS
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contribuintes" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={dialogContribuinte} onOpenChange={setDialogContribuinte}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contribuinte ISS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Contribuinte ISS</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Contribuinte (PJ)</Label>
                  <Select
                    value={contribForm.contribuinte_id}
                    onValueChange={(v) => setContribForm({ ...contribForm, contribuinte_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar contribuinte" />
                    </SelectTrigger>
                    <SelectContent>
                      {contribuintes.filter((c: any) => c.tipo === "pessoa_juridica").map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nome_razao_social} - {c.cpf_cnpj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Regime de Tributação</Label>
                    <Select
                      value={contribForm.regime_tributacao}
                      onValueChange={(v) => setContribForm({ ...contribForm, regime_tributacao: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simples_nacional">Simples Nacional</SelectItem>
                        <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
                        <SelectItem value="lucro_real">Lucro Real</SelectItem>
                        <SelectItem value="mei">MEI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Alíquota ISS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={contribForm.aliquota_iss}
                      onChange={(e) => setContribForm({ ...contribForm, aliquota_iss: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>CNAE Principal</Label>
                  <Input
                    value={contribForm.cnae_principal}
                    onChange={(e) => setContribForm({ ...contribForm, cnae_principal: e.target.value })}
                    placeholder="Ex: 6201-5/01"
                  />
                </div>

                <div>
                  <Label>Descrição da Atividade</Label>
                  <Textarea
                    value={contribForm.descricao_atividade}
                    onChange={(e) => setContribForm({ ...contribForm, descricao_atividade: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateContribuinte} className="w-full">
                  Cadastrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contribuintes do ISS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>CNAE</TableHead>
                  <TableHead>Regime</TableHead>
                  <TableHead>Alíquota</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {issContribuintes.map((ic: any) => (
                  <TableRow key={ic.id}>
                    <TableCell>{ic.contribuintes?.nome_razao_social}</TableCell>
                    <TableCell className="font-mono">{ic.contribuintes?.cpf_cnpj}</TableCell>
                    <TableCell>{ic.cnae_principal}</TableCell>
                    <TableCell className="capitalize">{ic.regime_tributacao?.replace("_", " ")}</TableCell>
                    <TableCell>{(ic.aliquota_iss * 100).toFixed(2)}%</TableCell>
                    <TableCell>
                      <Badge variant={ic.status === "ativo" ? "default" : "secondary"}>
                        {ic.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="nfse" className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={dialogNfse} onOpenChange={setDialogNfse}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Emitir NFS-e
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Emitir Nota Fiscal de Serviço Eletrônica</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prestador (Contribuinte ISS)</Label>
                    <Select
                      value={nfseForm.iss_contribuinte_id}
                      onValueChange={(v) => {
                        const contrib = issContribuintes.find((c: any) => c.id === v);
                        setNfseForm({
                          ...nfseForm,
                          iss_contribuinte_id: v,
                          prestador_cpf_cnpj: contrib?.contribuintes?.cpf_cnpj || "",
                          prestador_razao_social: contrib?.contribuintes?.nome_razao_social || "",
                          aliquota: String(contrib?.aliquota_iss || 0.05),
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar prestador" />
                      </SelectTrigger>
                      <SelectContent>
                        {issContribuintes.map((ic: any) => (
                          <SelectItem key={ic.id} value={ic.id}>
                            {ic.contribuintes?.nome_razao_social}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Competência</Label>
                    <Input
                      type="date"
                      value={nfseForm.competencia}
                      onChange={(e) => setNfseForm({ ...nfseForm, competencia: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Tomador do Serviço</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>CPF/CNPJ</Label>
                      <Input
                        value={nfseForm.tomador_cpf_cnpj}
                        onChange={(e) => setNfseForm({ ...nfseForm, tomador_cpf_cnpj: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Nome/Razão Social</Label>
                      <Input
                        value={nfseForm.tomador_razao_social}
                        onChange={(e) => setNfseForm({ ...nfseForm, tomador_razao_social: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label>E-mail</Label>
                    <Input
                      type="email"
                      value={nfseForm.tomador_email}
                      onChange={(e) => setNfseForm({ ...nfseForm, tomador_email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Serviço</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Código do Serviço</Label>
                      <Input
                        value={nfseForm.codigo_servico}
                        onChange={(e) => setNfseForm({ ...nfseForm, codigo_servico: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Alíquota (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={nfseForm.aliquota}
                        onChange={(e) => setNfseForm({ ...nfseForm, aliquota: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="mt-2">
                    <Label>Descrição do Serviço</Label>
                    <Textarea
                      value={nfseForm.descricao_servico}
                      onChange={(e) => setNfseForm({ ...nfseForm, descricao_servico: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Valor dos Serviços (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={nfseForm.valor_servicos}
                      onChange={(e) => setNfseForm({ ...nfseForm, valor_servicos: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Deduções (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={nfseForm.valor_deducoes}
                      onChange={(e) => setNfseForm({ ...nfseForm, valor_deducoes: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleEmitirNfse} className="w-full">
                  Emitir NFS-e
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais Emitidas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Prestador</TableHead>
                  <TableHead>Tomador</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>ISS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nfseList.map((nf: any) => (
                  <TableRow key={nf.id}>
                    <TableCell className="font-mono">{nf.numero_nfse}</TableCell>
                    <TableCell>{format(new Date(nf.data_emissao), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{nf.prestador_razao_social}</TableCell>
                    <TableCell>{nf.tomador_razao_social || "-"}</TableCell>
                    <TableCell>{formatCurrency(nf.valor_servicos || 0)}</TableCell>
                    <TableCell>{formatCurrency(nf.valor_iss || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={nf.status === "emitida" ? "default" : "destructive"}>
                        {nf.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {nf.status === "emitida" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelarNfse.mutate({ id: nf.id, motivo: "Cancelamento solicitado" })}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="guias" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Guias de ISS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Guia</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Contribuinte</TableHead>
                  <TableHead>Base Cálculo</TableHead>
                  <TableHead>ISS</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guias.map((g: any) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-mono">{g.numero_guia}</TableCell>
                    <TableCell>{format(new Date(g.competencia), "MM/yyyy")}</TableCell>
                    <TableCell>{g.iss_contribuintes?.contribuintes?.nome_razao_social}</TableCell>
                    <TableCell>{formatCurrency(g.base_calculo || 0)}</TableCell>
                    <TableCell>{formatCurrency(g.valor_iss || 0)}</TableCell>
                    <TableCell>{format(new Date(g.data_vencimento), "dd/MM/yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={g.status === "pago" ? "default" : g.status === "vencido" ? "destructive" : "outline"}>
                        {g.status?.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
