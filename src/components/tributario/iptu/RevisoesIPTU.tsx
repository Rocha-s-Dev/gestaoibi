import { useState } from "react";
import { useRevisoesIPTU } from "@/hooks/useIPTUCompleto";
import { useImoveis, useContribuintes } from "@/hooks/useArrecadacao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileSearch, CheckCircle, XCircle, Clock } from "lucide-react";

export function RevisoesIPTU() {
  const { revisoes, isLoading, solicitarRevisao, analisarRevisao } = useRevisoesIPTU();
  const { imoveis } = useImoveis();
  const { contribuintes } = useContribuintes();
  
  const [dialogNova, setDialogNova] = useState(false);
  const [dialogAnalise, setDialogAnalise] = useState(false);
  const [selectedRevisao, setSelectedRevisao] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const [form, setForm] = useState({
    imovel_id: "",
    contribuinte_id: "",
    tipo: "valor_venal",
    exercicio: new Date().getFullYear(),
    motivo: "",
    fundamentacao: "",
    valor_atual: "",
    valor_pleiteado: "",
  });

  const [analiseForm, setAnaliseForm] = useState({
    status: "",
    parecer: "",
    decisao: "",
  });

  const handleSolicitar = () => {
    solicitarRevisao.mutate({
      ...form,
      valor_atual: parseFloat(form.valor_atual) || null,
      valor_pleiteado: parseFloat(form.valor_pleiteado) || null,
    }, {
      onSuccess: () => {
        setDialogNova(false);
        setForm({
          imovel_id: "",
          contribuinte_id: "",
          tipo: "valor_venal",
          exercicio: new Date().getFullYear(),
          motivo: "",
          fundamentacao: "",
          valor_atual: "",
          valor_pleiteado: "",
        });
      },
    });
  };

  const handleAnalisar = () => {
    analisarRevisao.mutate({
      id: selectedRevisao.id,
      ...analiseForm,
    }, {
      onSuccess: () => {
        setDialogAnalise(false);
        setSelectedRevisao(null);
      },
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any; label: string }> = {
      pendente: { variant: "outline", icon: Clock, label: "Pendente" },
      em_analise: { variant: "secondary", icon: FileSearch, label: "Em Análise" },
      deferida: { variant: "default", icon: CheckCircle, label: "Deferida" },
      indeferida: { variant: "destructive", icon: XCircle, label: "Indeferida" },
      cancelada: { variant: "outline", icon: XCircle, label: "Cancelada" },
    };
    const c = config[status] || config.pendente;
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const labels: Record<string, string> = {
      valor_venal: "Valor Venal",
      aliquota: "Alíquota",
      isencao: "Isenção",
      imunidade: "Imunidade",
      area: "Área",
      uso: "Uso do Imóvel",
    };
    return <Badge variant="outline">{labels[tipo] || tipo}</Badge>;
  };

  const filteredRevisoes = revisoes.filter((r: any) => 
    !filterStatus || r.status === filterStatus
  );

  const estatisticas = {
    total: revisoes.length,
    pendentes: revisoes.filter((r: any) => r.status === "pendente").length,
    emAnalise: revisoes.filter((r: any) => r.status === "em_analise").length,
    deferidas: revisoes.filter((r: any) => r.status === "deferida").length,
    indeferidas: revisoes.filter((r: any) => r.status === "indeferida").length,
  };

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-sm text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.pendentes}</div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.emAnalise}</div>
            <p className="text-sm text-muted-foreground">Em Análise</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{estatisticas.deferidas}</div>
            <p className="text-sm text-muted-foreground">Deferidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{estatisticas.indeferidas}</div>
            <p className="text-sm text-muted-foreground">Indeferidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Ações */}
      <div className="flex justify-between items-center">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos os status</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_analise">Em Análise</SelectItem>
            <SelectItem value="deferida">Deferida</SelectItem>
            <SelectItem value="indeferida">Indeferida</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogNova} onOpenChange={setDialogNova}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Solicitar Revisão de IPTU</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Imóvel *</Label>
                  <Select
                    value={form.imovel_id}
                    onValueChange={(v) => setForm({ ...form, imovel_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar imóvel" />
                    </SelectTrigger>
                    <SelectContent>
                      {imoveis.map((im: any) => (
                        <SelectItem key={im.id} value={im.id}>
                          {im.inscricao_imobiliaria} - {im.logradouro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Contribuinte *</Label>
                  <Select
                    value={form.contribuinte_id}
                    onValueChange={(v) => setForm({ ...form, contribuinte_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar contribuinte" />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Revisão *</Label>
                  <Select
                    value={form.tipo}
                    onValueChange={(v) => setForm({ ...form, tipo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="valor_venal">Valor Venal</SelectItem>
                      <SelectItem value="aliquota">Alíquota</SelectItem>
                      <SelectItem value="isencao">Isenção</SelectItem>
                      <SelectItem value="imunidade">Imunidade</SelectItem>
                      <SelectItem value="area">Área</SelectItem>
                      <SelectItem value="uso">Uso do Imóvel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exercício *</Label>
                  <Input
                    type="number"
                    value={form.exercicio}
                    onChange={(e) => setForm({ ...form, exercicio: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Valor Atual (R$)</Label>
                  <Input
                    type="number"
                    value={form.valor_atual}
                    onChange={(e) => setForm({ ...form, valor_atual: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Valor Pleiteado (R$)</Label>
                  <Input
                    type="number"
                    value={form.valor_pleiteado}
                    onChange={(e) => setForm({ ...form, valor_pleiteado: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Motivo da Revisão *</Label>
                <Textarea
                  value={form.motivo}
                  onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                  placeholder="Descreva o motivo da solicitação de revisão"
                  rows={3}
                />
              </div>

              <div>
                <Label>Fundamentação Legal</Label>
                <Textarea
                  value={form.fundamentacao}
                  onChange={(e) => setForm({ ...form, fundamentacao: e.target.value })}
                  placeholder="Cite a legislação ou jurisprudência aplicável"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogNova(false)}>Cancelar</Button>
              <Button 
                onClick={handleSolicitar} 
                disabled={!form.imovel_id || !form.motivo || solicitarRevisao.isPending}
              >
                Protocolar Revisão
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de Revisões */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Revisão</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Imóvel</TableHead>
                <TableHead>Contribuinte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Exercício</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRevisoes.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono">{r.protocolo}</TableCell>
                  <TableCell>{new Date(r.data_solicitacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{r.imoveis?.inscricao_imobiliaria}</TableCell>
                  <TableCell>{r.contribuintes?.nome_razao_social}</TableCell>
                  <TableCell>{getTipoBadge(r.tipo)}</TableCell>
                  <TableCell>{r.exercicio}</TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="text-right">
                    {["pendente", "em_analise"].includes(r.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRevisao(r);
                          setAnaliseForm({ status: "em_analise", parecer: "", decisao: "" });
                          setDialogAnalise(true);
                        }}
                      >
                        Analisar
                      </Button>
                    )}
                    {r.status === "deferida" && r.decisao && (
                      <span className="text-sm text-green-600">Aplicada</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRevisoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma solicitação encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Análise */}
      <Dialog open={dialogAnalise} onOpenChange={setDialogAnalise}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Analisar Revisão - {selectedRevisao?.protocolo}</DialogTitle>
          </DialogHeader>
          {selectedRevisao && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-muted-foreground text-xs">Imóvel</Label>
                  <p>{selectedRevisao.imoveis?.inscricao_imobiliaria}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Tipo</Label>
                  <p className="capitalize">{selectedRevisao.tipo.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Valor Atual</Label>
                  <p>{formatCurrency(selectedRevisao.valor_atual || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Valor Pleiteado</Label>
                  <p>{formatCurrency(selectedRevisao.valor_pleiteado || 0)}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Motivo</Label>
                <p className="text-sm">{selectedRevisao.motivo}</p>
              </div>

              {selectedRevisao.fundamentacao && (
                <div>
                  <Label className="text-muted-foreground text-xs">Fundamentação</Label>
                  <p className="text-sm">{selectedRevisao.fundamentacao}</p>
                </div>
              )}

              <div>
                <Label>Decisão *</Label>
                <Select
                  value={analiseForm.status}
                  onValueChange={(v) => setAnaliseForm({ ...analiseForm, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_analise">Manter em Análise</SelectItem>
                    <SelectItem value="deferida">Deferir</SelectItem>
                    <SelectItem value="indeferida">Indeferir</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Parecer Técnico *</Label>
                <Textarea
                  value={analiseForm.parecer}
                  onChange={(e) => setAnaliseForm({ ...analiseForm, parecer: e.target.value })}
                  placeholder="Descreva a análise técnica realizada"
                  rows={4}
                />
              </div>

              <div>
                <Label>Decisão/Encaminhamento</Label>
                <Textarea
                  value={analiseForm.decisao}
                  onChange={(e) => setAnaliseForm({ ...analiseForm, decisao: e.target.value })}
                  placeholder="Descreva as providências a serem tomadas"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAnalise(false)}>Cancelar</Button>
            <Button 
              onClick={handleAnalisar}
              disabled={!analiseForm.parecer || analisarRevisao.isPending}
            >
              Registrar Análise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
