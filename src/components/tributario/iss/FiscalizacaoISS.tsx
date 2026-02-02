import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, AlertTriangle, FileWarning, CheckCircle } from "lucide-react";
import { useFiscalizacaoISS, useAutosInfracaoISS, useAlertasFiscalizacaoISS } from "@/hooks/useISSCompleto";
import { useContribuintes } from "@/hooks/useArrecadacao";
import { format } from "date-fns";

export function FiscalizacaoISS() {
  const { fiscalizacoes, isLoading, criarFiscalizacao, concluirFiscalizacao } = useFiscalizacaoISS();
  const { autos, lavrarAuto } = useAutosInfracaoISS();
  const { alertas, analisarAlerta } = useAlertasFiscalizacaoISS();
  const { contribuintes } = useContribuintes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoDialogOpen, setAutoDialogOpen] = useState(false);
  const [selectedFiscalizacao, setSelectedFiscalizacao] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    contribuinte_id: "",
    periodo_fiscalizado_inicio: "",
    periodo_fiscalizado_fim: "",
    tipo_fiscalizacao: "rotina",
    motivo: "",
  });

  const [autoFormData, setAutoFormData] = useState({
    contribuinte_id: "",
    fiscalizacao_id: "",
    tipo: "omissao_declaracao",
    descricao_infracao: "",
    fundamentacao_legal: "",
    valor_principal: 0,
    valor_multa: 0,
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      em_andamento: "bg-yellow-100 text-yellow-800",
      concluida: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
    };
    return <Badge className={styles[status] || ""}>{status.replace("_", " ")}</Badge>;
  };

  const handleSubmit = async () => {
    await criarFiscalizacao.mutateAsync(formData);
    setDialogOpen(false);
    resetForm();
  };

  const handleLavrarAuto = async () => {
    await lavrarAuto.mutateAsync(autoFormData);
    setAutoDialogOpen(false);
    resetAutoForm();
  };

  const resetForm = () => {
    setFormData({
      contribuinte_id: "",
      periodo_fiscalizado_inicio: "",
      periodo_fiscalizado_fim: "",
      tipo_fiscalizacao: "rotina",
      motivo: "",
    });
  };

  const resetAutoForm = () => {
    setAutoFormData({
      contribuinte_id: "",
      fiscalizacao_id: "",
      tipo: "omissao_declaracao",
      descricao_infracao: "",
      fundamentacao_legal: "",
      valor_principal: 0,
      valor_multa: 0,
    });
  };

  const openAutoDialog = (fiscalizacao: any) => {
    setSelectedFiscalizacao(fiscalizacao);
    setAutoFormData({
      ...autoFormData,
      contribuinte_id: fiscalizacao.contribuinte_id,
      fiscalizacao_id: fiscalizacao.id,
    });
    setAutoDialogOpen(true);
  };

  const filteredFiscalizacoes = fiscalizacoes.filter((f: any) =>
    f.numero_ordem_servico?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.contribuinte?.nome_razao_social?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Alertas Pendentes */}
      {alertas.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Omissão ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.slice(0, 5).map((alerta: any) => (
                <div
                  key={alerta.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div>
                    <p className="font-medium">{alerta.contribuinte?.nome_razao_social}</p>
                    <p className="text-sm text-muted-foreground">
                      {alerta.tipo} - {alerta.competencia}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      analisarAlerta.mutateAsync({
                        id: alerta.id,
                        resultado_analise: "Analisado",
                        gera_fiscalizacao: false,
                      })
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Analisar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fiscalizações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ordens de Fiscalização</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Fiscalização
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por OS ou contribuinte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem de Serviço</TableHead>
                <TableHead>Contribuinte</TableHead>
                <TableHead>Período Fiscalizado</TableHead>
                <TableHead className="text-right">ISS Apurado</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredFiscalizacoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma fiscalização encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredFiscalizacoes.map((fisc: any) => (
                  <TableRow key={fisc.id}>
                    <TableCell className="font-medium">{fisc.numero_ordem_servico}</TableCell>
                    <TableCell>{fisc.contribuinte?.nome_razao_social || "-"}</TableCell>
                    <TableCell>
                      {fisc.periodo_fiscalizado_inicio} a {fisc.periodo_fiscalizado_fim}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(fisc.total_iss_apurado)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          fisc.diferenca_apurada > 0 ? "text-red-600 font-semibold" : ""
                        }
                      >
                        {formatCurrency(fisc.diferenca_apurada)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(fisc.status)}</TableCell>
                    <TableCell className="text-right">
                      {fisc.status === "em_andamento" && fisc.diferenca_apurada > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAutoDialog(fisc)}
                        >
                          <FileWarning className="h-4 w-4 mr-1" />
                          Lavrar Auto
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Autos de Infração */}
      <Card>
        <CardHeader>
          <CardTitle>Autos de Infração</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data Lavratura</TableHead>
                <TableHead>Contribuinte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {autos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum auto de infração
                  </TableCell>
                </TableRow>
              ) : (
                autos.map((auto: any) => (
                  <TableRow key={auto.id}>
                    <TableCell className="font-medium">{auto.numero_auto}</TableCell>
                    <TableCell>
                      {auto.data_lavratura
                        ? format(new Date(auto.data_lavratura), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell>{auto.contribuinte?.nome_razao_social || "-"}</TableCell>
                    <TableCell>{auto.tipo?.replace("_", " ")}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(auto.valor_total)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge>{auto.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Nova Fiscalização */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Ordem de Fiscalização</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contribuinte *</Label>
              <Select
                value={formData.contribuinte_id}
                onValueChange={(v) => setFormData({ ...formData, contribuinte_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contribuinte" />
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
              <div className="space-y-2">
                <Label>Período Início *</Label>
                <Input
                  type="month"
                  value={formData.periodo_fiscalizado_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, periodo_fiscalizado_inicio: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Período Fim *</Label>
                <Input
                  type="month"
                  value={formData.periodo_fiscalizado_fim}
                  onChange={(e) =>
                    setFormData({ ...formData, periodo_fiscalizado_fim: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.tipo_fiscalizacao}
                onValueChange={(v) => setFormData({ ...formData, tipo_fiscalizacao: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotina">Rotina</SelectItem>
                  <SelectItem value="denúncia">Denúncia</SelectItem>
                  <SelectItem value="cruzamento">Cruzamento de Dados</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Motivo</Label>
              <Textarea
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Justificativa da fiscalização..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.contribuinte_id ||
                !formData.periodo_fiscalizado_inicio ||
                !formData.periodo_fiscalizado_fim ||
                criarFiscalizacao.isPending
              }
            >
              Iniciar Fiscalização
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Lavrar Auto */}
      <Dialog open={autoDialogOpen} onOpenChange={setAutoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lavrar Auto de Infração</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Infração *</Label>
              <Select
                value={autoFormData.tipo}
                onValueChange={(v) => setAutoFormData({ ...autoFormData, tipo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="omissao_declaracao">Omissão de Declaração</SelectItem>
                  <SelectItem value="subfaturamento">Subfaturamento</SelectItem>
                  <SelectItem value="atividade_irregular">Atividade Irregular</SelectItem>
                  <SelectItem value="descumprimento_obrigacao_acessoria">
                    Descumprimento de Obrigação Acessória
                  </SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição da Infração *</Label>
              <Textarea
                value={autoFormData.descricao_infracao}
                onChange={(e) =>
                  setAutoFormData({ ...autoFormData, descricao_infracao: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Fundamentação Legal</Label>
              <Input
                value={autoFormData.fundamentacao_legal}
                onChange={(e) =>
                  setAutoFormData({ ...autoFormData, fundamentacao_legal: e.target.value })
                }
                placeholder="Art. XX da Lei..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor Principal (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={autoFormData.valor_principal}
                  onChange={(e) =>
                    setAutoFormData({
                      ...autoFormData,
                      valor_principal: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Multa (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={autoFormData.valor_multa}
                  onChange={(e) =>
                    setAutoFormData({
                      ...autoFormData,
                      valor_multa: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Valor Total:</p>
              <p className="text-lg font-bold">
                {formatCurrency(autoFormData.valor_principal + autoFormData.valor_multa)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAutoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleLavrarAuto}
              disabled={
                !autoFormData.descricao_infracao ||
                autoFormData.valor_principal <= 0 ||
                lavrarAuto.isPending
              }
            >
              Lavrar Auto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
