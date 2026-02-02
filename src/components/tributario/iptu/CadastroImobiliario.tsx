import { useState } from "react";
import { useImoveis, useContribuintes } from "@/hooks/useArrecadacao";
import { useHistoricoProprietarios, usePadroesConstrutivos } from "@/hooks/useIPTUCompleto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Home, Search, History, MapPin, Edit, Eye } from "lucide-react";

export function CadastroImobiliario() {
  const { imoveis, isLoading, createImovel, updateImovel } = useImoveis();
  const { contribuintes } = useContribuintes();
  const { padroes } = usePadroesConstrutivos();
  const [dialogImovel, setDialogImovel] = useState(false);
  const [dialogTransferencia, setDialogTransferencia] = useState(false);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [selectedImovel, setSelectedImovel] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBairro, setFilterBairro] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [imovelForm, setImovelForm] = useState({
    inscricao_imobiliaria: "",
    contribuinte_id: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cep: "",
    quadra: "",
    lote: "",
    setor: "",
    distrito: "",
    tipo_imovel: "urbano",
    tipo_uso: "residencial",
    area_terreno: "",
    area_construida: "",
    testada: "",
    profundidade: "",
    frente_logradouro: "",
    valor_venal_terreno: "",
    valor_venal_construcao: "",
    aliquota_iptu: "0.01",
    padrao_construtivo_id: "",
    ano_construcao: "",
    estado_conservacao: "bom",
    topografia: "plano",
    situacao_terreno: "meio_quadra",
    latitude: "",
    longitude: "",
    observacoes: "",
  });

  const [transferenciaForm, setTransferenciaForm] = useState({
    contribuinte_id: "",
    tipo_transferencia: "compra_venda",
    data_transferencia: new Date().toISOString().split("T")[0],
    documento_titulo: "",
    numero_matricula: "",
    cartorio: "",
    valor_transacao: "",
    observacoes: "",
  });

  const handleCreateImovel = () => {
    const valorTotal = (parseFloat(imovelForm.valor_venal_terreno) || 0) + 
                       (parseFloat(imovelForm.valor_venal_construcao) || 0);
    createImovel.mutate({
      ...imovelForm,
      area_terreno: parseFloat(imovelForm.area_terreno) || null,
      area_construida: parseFloat(imovelForm.area_construida) || null,
      testada: parseFloat(imovelForm.testada) || null,
      profundidade: parseFloat(imovelForm.profundidade) || null,
      frente_logradouro: parseFloat(imovelForm.frente_logradouro) || null,
      valor_venal_terreno: parseFloat(imovelForm.valor_venal_terreno) || null,
      valor_venal_construcao: parseFloat(imovelForm.valor_venal_construcao) || null,
      valor_venal_total: valorTotal || null,
      aliquota_iptu: parseFloat(imovelForm.aliquota_iptu),
      ano_construcao: parseInt(imovelForm.ano_construcao) || null,
      latitude: parseFloat(imovelForm.latitude) || null,
      longitude: parseFloat(imovelForm.longitude) || null,
      contribuinte_id: imovelForm.contribuinte_id || null,
      padrao_construtivo_id: imovelForm.padrao_construtivo_id || null,
    }, {
      onSuccess: () => {
        setDialogImovel(false);
        resetForm();
      },
    });
  };

  const handleInativar = (imovel: any) => {
    updateImovel.mutate({
      id: imovel.id,
      status: "inativo",
    });
  };

  const resetForm = () => {
    setImovelForm({
      inscricao_imobiliaria: "",
      contribuinte_id: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cep: "",
      quadra: "",
      lote: "",
      setor: "",
      distrito: "",
      tipo_imovel: "urbano",
      tipo_uso: "residencial",
      area_terreno: "",
      area_construida: "",
      testada: "",
      profundidade: "",
      frente_logradouro: "",
      valor_venal_terreno: "",
      valor_venal_construcao: "",
      aliquota_iptu: "0.01",
      padrao_construtivo_id: "",
      ano_construcao: "",
      estado_conservacao: "bom",
      topografia: "plano",
      situacao_terreno: "meio_quadra",
      latitude: "",
      longitude: "",
      observacoes: "",
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const bairros = [...new Set(imoveis.map((i: any) => i.bairro))].filter(Boolean);

  const filteredImoveis = imoveis.filter((i: any) => {
    const matchesSearch = 
      i.inscricao_imobiliaria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.logradouro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.contribuintes?.nome_razao_social?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBairro = !filterBairro || i.bairro === filterBairro;
    const matchesStatus = !filterStatus || i.status === filterStatus;
    return matchesSearch && matchesBairro && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por inscrição, endereço ou proprietário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterBairro || "all"} onValueChange={(v) => setFilterBairro(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os bairros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os bairros</SelectItem>
                {bairros.map((b: string) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="isento">Isento</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={dialogImovel} onOpenChange={setDialogImovel}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Imóvel
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastrar Imóvel</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="endereco" className="mt-4">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                    <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                    <TabsTrigger value="valores">Valores</TabsTrigger>
                    <TabsTrigger value="geo">Georreferenciamento</TabsTrigger>
                  </TabsList>

                  <TabsContent value="endereco" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Inscrição Imobiliária *</Label>
                        <Input
                          value={imovelForm.inscricao_imobiliaria}
                          onChange={(e) => setImovelForm({ ...imovelForm, inscricao_imobiliaria: e.target.value })}
                          placeholder="Ex: 01.001.001.0001"
                        />
                      </div>
                      <div>
                        <Label>Proprietário</Label>
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
                        <Label>Complemento</Label>
                        <Input
                          value={imovelForm.complemento}
                          onChange={(e) => setImovelForm({ ...imovelForm, complemento: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>CEP</Label>
                        <Input
                          value={imovelForm.cep}
                          onChange={(e) => setImovelForm({ ...imovelForm, cep: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Bairro *</Label>
                        <Input
                          value={imovelForm.bairro}
                          onChange={(e) => setImovelForm({ ...imovelForm, bairro: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Setor</Label>
                        <Input
                          value={imovelForm.setor}
                          onChange={(e) => setImovelForm({ ...imovelForm, setor: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Distrito</Label>
                        <Input
                          value={imovelForm.distrito}
                          onChange={(e) => setImovelForm({ ...imovelForm, distrito: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </TabsContent>

                  <TabsContent value="caracteristicas" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Tipo de Imóvel</Label>
                        <Select
                          value={imovelForm.tipo_imovel}
                          onValueChange={(v) => setImovelForm({ ...imovelForm, tipo_imovel: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="urbano">Urbano</SelectItem>
                            <SelectItem value="rural">Rural</SelectItem>
                            <SelectItem value="edificado">Edificado</SelectItem>
                            <SelectItem value="terreno">Terreno</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Label>Padrão Construtivo</Label>
                        <Select
                          value={imovelForm.padrao_construtivo_id}
                          onValueChange={(v) => setImovelForm({ ...imovelForm, padrao_construtivo_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {padroes.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Label>Testada (m)</Label>
                        <Input
                          type="number"
                          value={imovelForm.testada}
                          onChange={(e) => setImovelForm({ ...imovelForm, testada: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Profundidade (m)</Label>
                        <Input
                          type="number"
                          value={imovelForm.profundidade}
                          onChange={(e) => setImovelForm({ ...imovelForm, profundidade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label>Ano Construção</Label>
                        <Input
                          type="number"
                          value={imovelForm.ano_construcao}
                          onChange={(e) => setImovelForm({ ...imovelForm, ano_construcao: e.target.value })}
                          placeholder="Ex: 2010"
                        />
                      </div>
                      <div>
                        <Label>Estado Conservação</Label>
                        <Select
                          value={imovelForm.estado_conservacao}
                          onValueChange={(v) => setImovelForm({ ...imovelForm, estado_conservacao: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="novo">Novo</SelectItem>
                            <SelectItem value="otimo">Ótimo</SelectItem>
                            <SelectItem value="bom">Bom</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="ruim">Ruim</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Topografia</Label>
                        <Select
                          value={imovelForm.topografia}
                          onValueChange={(v) => setImovelForm({ ...imovelForm, topografia: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="plano">Plano</SelectItem>
                            <SelectItem value="aclive">Aclive</SelectItem>
                            <SelectItem value="declive">Declive</SelectItem>
                            <SelectItem value="irregular">Irregular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Situação Terreno</Label>
                        <Select
                          value={imovelForm.situacao_terreno}
                          onValueChange={(v) => setImovelForm({ ...imovelForm, situacao_terreno: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="esquina">Esquina</SelectItem>
                            <SelectItem value="meio_quadra">Meio de Quadra</SelectItem>
                            <SelectItem value="encravado">Encravado</SelectItem>
                            <SelectItem value="vila">Vila/Condomínio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="valores" className="space-y-4 mt-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Valor Venal Terreno (R$)</Label>
                        <Input
                          type="number"
                          value={imovelForm.valor_venal_terreno}
                          onChange={(e) => setImovelForm({ ...imovelForm, valor_venal_terreno: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Valor Venal Construção (R$)</Label>
                        <Input
                          type="number"
                          value={imovelForm.valor_venal_construcao}
                          onChange={(e) => setImovelForm({ ...imovelForm, valor_venal_construcao: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Valor Venal Total (R$)</Label>
                        <Input
                          type="number"
                          disabled
                          value={(parseFloat(imovelForm.valor_venal_terreno) || 0) + (parseFloat(imovelForm.valor_venal_construcao) || 0)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Alíquota IPTU (%)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={imovelForm.aliquota_iptu}
                          onChange={(e) => setImovelForm({ ...imovelForm, aliquota_iptu: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Frente para Logradouro (m)</Label>
                        <Input
                          type="number"
                          value={imovelForm.frente_logradouro}
                          onChange={(e) => setImovelForm({ ...imovelForm, frente_logradouro: e.target.value })}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="geo" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={imovelForm.latitude}
                          onChange={(e) => setImovelForm({ ...imovelForm, latitude: e.target.value })}
                          placeholder="Ex: -23.550520"
                        />
                      </div>
                      <div>
                        <Label>Longitude</Label>
                        <Input
                          type="number"
                          step="any"
                          value={imovelForm.longitude}
                          onChange={(e) => setImovelForm({ ...imovelForm, longitude: e.target.value })}
                          placeholder="Ex: -46.633309"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={imovelForm.observacoes}
                        onChange={(e) => setImovelForm({ ...imovelForm, observacoes: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button onClick={handleCreateImovel} disabled={createImovel.isPending} className="w-full mt-4">
                  Cadastrar Imóvel
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Imóveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Imóveis Cadastrados ({filteredImoveis.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inscrição</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Tipo/Uso</TableHead>
                <TableHead>Área (m²)</TableHead>
                <TableHead>Valor Venal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredImoveis.map((im: any) => (
                <TableRow key={im.id}>
                  <TableCell className="font-mono font-medium">{im.inscricao_imobiliaria}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {im.latitude && im.longitude && (
                        <MapPin className="h-3 w-3 text-green-600" />
                      )}
                      {im.logradouro}, {im.numero} - {im.bairro}
                    </div>
                  </TableCell>
                  <TableCell>{im.contribuintes?.nome_razao_social || "-"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="capitalize">{im.tipo_imovel || "urbano"}</span>
                      <span className="text-muted-foreground"> / {im.tipo_uso}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>T: {im.area_terreno || 0}</div>
                      <div className="text-muted-foreground">C: {im.area_construida || 0}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(im.valor_venal_total || 0)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      im.status === "ativo" ? "default" : 
                      im.status === "isento" ? "secondary" : "outline"
                    }>
                      {im.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedImovel(im);
                          setDialogDetalhes(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setSelectedImovel(im);
                          setDialogTransferencia(true);
                        }}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredImoveis.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum imóvel encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Detalhes */}
      <Dialog open={dialogDetalhes} onOpenChange={setDialogDetalhes}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Imóvel</DialogTitle>
          </DialogHeader>
          {selectedImovel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Inscrição</Label>
                  <p className="font-mono font-medium">{selectedImovel.inscricao_imobiliaria}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Proprietário</Label>
                  <p>{selectedImovel.contribuintes?.nome_razao_social || "-"}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Endereço</Label>
                <p>{selectedImovel.logradouro}, {selectedImovel.numero} {selectedImovel.complemento}</p>
                <p className="text-sm text-muted-foreground">{selectedImovel.bairro} - Q{selectedImovel.quadra} L{selectedImovel.lote}</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <p className="capitalize">{selectedImovel.tipo_imovel || "urbano"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Uso</Label>
                  <p className="capitalize">{selectedImovel.tipo_uso}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Área Terreno</Label>
                  <p>{selectedImovel.area_terreno || 0} m²</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Área Construída</Label>
                  <p>{selectedImovel.area_construida || 0} m²</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Valor Venal Terreno</Label>
                  <p>{formatCurrency(selectedImovel.valor_venal_terreno || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Venal Construção</Label>
                  <p>{formatCurrency(selectedImovel.valor_venal_construcao || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valor Venal Total</Label>
                  <p className="font-bold">{formatCurrency(selectedImovel.valor_venal_total || 0)}</p>
                </div>
              </div>
              {selectedImovel.latitude && selectedImovel.longitude && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Latitude</Label>
                    <p>{selectedImovel.latitude}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Longitude</Label>
                    <p>{selectedImovel.longitude}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Transferência */}
      <TransferenciaDialog 
        open={dialogTransferencia} 
        onOpenChange={setDialogTransferencia}
        imovel={selectedImovel}
        contribuintes={contribuintes}
      />
    </div>
  );
}

function TransferenciaDialog({ open, onOpenChange, imovel, contribuintes }: any) {
  const { historico, registrarTransferencia } = useHistoricoProprietarios(imovel?.id);
  const [form, setForm] = useState({
    contribuinte_id: "",
    tipo_transferencia: "compra_venda",
    data_transferencia: new Date().toISOString().split("T")[0],
    documento_titulo: "",
    numero_matricula: "",
    cartorio: "",
    valor_transacao: "",
    observacoes: "",
  });

  const handleSubmit = () => {
    registrarTransferencia.mutate({
      ...form,
      imovel_id: imovel.id,
      valor_transacao: parseFloat(form.valor_transacao) || null,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({
          contribuinte_id: "",
          tipo_transferencia: "compra_venda",
          data_transferencia: new Date().toISOString().split("T")[0],
          documento_titulo: "",
          numero_matricula: "",
          cartorio: "",
          valor_transacao: "",
          observacoes: "",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Transferências</DialogTitle>
        </DialogHeader>
        
        {/* Histórico */}
        {historico.length > 0 && (
          <div className="space-y-2 mb-4">
            <Label>Histórico de Proprietários</Label>
            <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
              {historico.map((h: any) => (
                <div key={h.id} className="p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{h.contribuintes?.nome_razao_social}</span>
                    <Badge variant="outline" className="capitalize">{h.tipo_transferencia.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(h.data_transferencia).toLocaleDateString("pt-BR")}
                    {h.valor_transacao && ` - R$ ${h.valor_transacao.toLocaleString("pt-BR")}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nova Transferência */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">Registrar Nova Transferência</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Novo Proprietário *</Label>
              <Select
                value={form.contribuinte_id}
                onValueChange={(v) => setForm({ ...form, contribuinte_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {contribuintes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome_razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Transferência *</Label>
              <Select
                value={form.tipo_transferencia}
                onValueChange={(v) => setForm({ ...form, tipo_transferencia: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compra_venda">Compra e Venda</SelectItem>
                  <SelectItem value="doacao">Doação</SelectItem>
                  <SelectItem value="heranca">Herança</SelectItem>
                  <SelectItem value="permuta">Permuta</SelectItem>
                  <SelectItem value="adjudicacao">Adjudicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data da Transferência *</Label>
              <Input
                type="date"
                value={form.data_transferencia}
                onChange={(e) => setForm({ ...form, data_transferencia: e.target.value })}
              />
            </div>
            <div>
              <Label>Valor da Transação</Label>
              <Input
                type="number"
                value={form.valor_transacao}
                onChange={(e) => setForm({ ...form, valor_transacao: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nº Matrícula</Label>
              <Input
                value={form.numero_matricula}
                onChange={(e) => setForm({ ...form, numero_matricula: e.target.value })}
              />
            </div>
            <div>
              <Label>Cartório</Label>
              <Input
                value={form.cartorio}
                onChange={(e) => setForm({ ...form, cartorio: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Documento/Título</Label>
            <Input
              value={form.documento_titulo}
              onChange={(e) => setForm({ ...form, documento_titulo: e.target.value })}
              placeholder="Ex: Escritura Pública"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!form.contribuinte_id || registrarTransferencia.isPending}
            className="w-full"
          >
            Registrar Transferência
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
