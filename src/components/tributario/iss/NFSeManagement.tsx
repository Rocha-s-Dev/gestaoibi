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
import { Plus, XCircle, Search, FileText, Eye } from "lucide-react";
import { useNFSe, useListaServicosISS } from "@/hooks/useISSCompleto";
import { useContribuintes } from "@/hooks/useArrecadacao";
import { format } from "date-fns";

export function NFSeManagement() {
  const { notas, isLoading, emitirNFSe, cancelarNFSe } = useNFSe();
  const { servicos } = useListaServicosISS();
  const { contribuintes } = useContribuintes();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedNota, setSelectedNota] = useState<any>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    iss_contribuinte_id: "",
    prestador_cpf_cnpj: "",
    prestador_razao_social: "",
    tomador_cpf_cnpj: "",
    tomador_razao_social: "",
    tomador_email: "",
    servico_id: "",
    codigo_servico: "",
    descricao_servico: "",
    valor_servicos: 0,
    valor_deducoes: 0,
    aliquota: 5,
  });

  const filteredNotas = notas.filter((n: any) =>
    n.numero_nfse?.toString().includes(searchTerm) ||
    n.tomador_razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.prestador_razao_social?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      emitida: "bg-green-100 text-green-800",
      cancelada: "bg-red-100 text-red-800",
      substituida: "bg-blue-100 text-blue-800",
    };
    return <Badge className={styles[status] || ""}>{status}</Badge>;
  };

  const handleContribuinteChange = (id: string) => {
    const contrib = contribuintes.find((c: any) => c.id === id);
    if (contrib) {
      setFormData({
        ...formData,
        iss_contribuinte_id: id,
        prestador_cpf_cnpj: contrib.cpf_cnpj || "",
        prestador_razao_social: contrib.nome_razao_social || "",
      });
    }
  };

  const handleServicoChange = (id: string) => {
    const servico = servicos.find((s: any) => s.id === id);
    if (servico) {
      setFormData({
        ...formData,
        servico_id: id,
        codigo_servico: servico.codigo_municipal || "",
        aliquota: servico.aliquota_padrao || 5,
      });
    }
  };

  const handleSubmit = async () => {
    await emitirNFSe.mutateAsync(formData);
    setDialogOpen(false);
    resetForm();
  };

  const handleCancelar = async () => {
    if (selectedNota && motivoCancelamento) {
      await cancelarNFSe.mutateAsync({ id: selectedNota.id, motivo: motivoCancelamento });
      setCancelDialogOpen(false);
      setMotivoCancelamento("");
      setSelectedNota(null);
    }
  };

  const resetForm = () => {
    setFormData({
      iss_contribuinte_id: "",
      prestador_cpf_cnpj: "",
      prestador_razao_social: "",
      tomador_cpf_cnpj: "",
      tomador_razao_social: "",
      tomador_email: "",
      servico_id: "",
      codigo_servico: "",
      descricao_servico: "",
      valor_servicos: 0,
      valor_deducoes: 0,
      aliquota: 5,
    });
  };

  const contribuintesPJ = contribuintes.filter((c: any) => c.tipo === "juridica");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>NFS-e - Notas Fiscais de Serviço Eletrônicas</CardTitle>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Emitir NFS-e
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, prestador ou tomador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Prestador</TableHead>
                <TableHead>Tomador</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">ISS</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredNotas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma NFS-e encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotas.map((nota: any) => (
                  <TableRow key={nota.id}>
                    <TableCell className="font-medium">{nota.numero_nfse}</TableCell>
                    <TableCell>
                      {nota.data_emissao
                        ? format(new Date(nota.data_emissao), "dd/MM/yyyy HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell>{nota.prestador_razao_social || "-"}</TableCell>
                    <TableCell>{nota.tomador_razao_social || "-"}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(nota.valor_servicos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(nota.valor_iss)}
                    </TableCell>
                    <TableCell className="text-center">{getStatusBadge(nota.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {nota.status === "emitida" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedNota(nota);
                              setCancelDialogOpen(true);
                            }}
                            title="Cancelar"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Emitir NFS-e */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Emitir NFS-e</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Prestador *</Label>
              <Select
                value={formData.iss_contribuinte_id}
                onValueChange={handleContribuinteChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o prestador" />
                </SelectTrigger>
                <SelectContent>
                  {contribuintesPJ.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome_razao_social} - {c.cpf_cnpj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Tomador do Serviço</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <Input
                    value={formData.tomador_cpf_cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, tomador_cpf_cnpj: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razão Social/Nome</Label>
                  <Input
                    value={formData.tomador_razao_social}
                    onChange={(e) =>
                      setFormData({ ...formData, tomador_razao_social: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2 mt-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={formData.tomador_email}
                  onChange={(e) =>
                    setFormData({ ...formData, tomador_email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Serviço Prestado</h4>
              <div className="space-y-2">
                <Label>Serviço *</Label>
                <Select
                  value={formData.servico_id}
                  onValueChange={handleServicoChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicos.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.codigo_municipal} - {s.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 mt-2">
                <Label>Discriminação do Serviço *</Label>
                <Textarea
                  value={formData.descricao_servico}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao_servico: e.target.value })
                  }
                  placeholder="Descreva os serviços prestados..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                <div className="space-y-2">
                  <Label>Valor dos Serviços (R$) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_servicos}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_servicos: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deduções (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.valor_deducoes}
                    onChange={(e) =>
                      setFormData({ ...formData, valor_deducoes: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alíquota (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.aliquota}
                    onChange={(e) =>
                      setFormData({ ...formData, aliquota: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              {formData.valor_servicos > 0 && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Base de Cálculo:</span>
                      <p className="font-medium">
                        {formatCurrency(formData.valor_servicos - formData.valor_deducoes)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ISS:</span>
                      <p className="font-medium">
                        {formatCurrency(
                          (formData.valor_servicos - formData.valor_deducoes) *
                            (formData.aliquota / 100)
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Valor Líquido:</span>
                      <p className="font-medium">
                        {formatCurrency(
                          formData.valor_servicos -
                            (formData.valor_servicos - formData.valor_deducoes) *
                              (formData.aliquota / 100)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !formData.iss_contribuinte_id ||
                !formData.codigo_servico ||
                !formData.descricao_servico ||
                formData.valor_servicos <= 0 ||
                emitirNFSe.isPending
              }
            >
              Emitir NFS-e
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Cancelar NFS-e */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar NFS-e</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p>
              Tem certeza que deseja cancelar a NFS-e nº{" "}
              <strong>{selectedNota?.numero_nfse}</strong>?
            </p>

            <div className="space-y-2">
              <Label>Motivo do Cancelamento *</Label>
              <Textarea
                value={motivoCancelamento}
                onChange={(e) => setMotivoCancelamento(e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={!motivoCancelamento || cancelarNFSe.isPending}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
