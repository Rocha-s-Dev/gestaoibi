import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Scale, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useControladoria } from "@/hooks/useControladoria";
import { useSecretarias } from "@/hooks/useSecretarias";
import { format } from "date-fns";

export function AnalisesContratos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { analisesContratos, loadingAnalises, createAnaliseContrato, alertasVigencia } = useControladoria();
  const { secretarias } = useSecretarias();

  const [novaAnalise, setNovaAnalise] = useState({
    tipo_analise: "previa",
    objeto: "",
    valor_contrato: 0,
    licitacao_numero: "",
    secretaria_solicitante_id: "",
    parecer_conclusivo: "",
    recomendacao: "aprovar",
    data_solicitacao: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAnaliseContrato.mutateAsync(novaAnalise);
    setDialogOpen(false);
    setNovaAnalise({
      tipo_analise: "previa",
      objeto: "",
      valor_contrato: 0,
      licitacao_numero: "",
      secretaria_solicitante_id: "",
      parecer_conclusivo: "",
      recomendacao: "aprovar",
      data_solicitacao: new Date().toISOString().split("T")[0],
    });
  };

  const getRecomendacaoBadge = (rec: string) => {
    const configs: Record<string, { color: string; icon: any }> = {
      aprovar: { color: "bg-green-500", icon: CheckCircle },
      aprovar_com_ressalvas: { color: "bg-yellow-500", icon: AlertTriangle },
      reprovar: { color: "bg-red-500", icon: XCircle },
      solicitar_ajustes: { color: "bg-orange-500", icon: AlertTriangle },
    };
    const config = configs[rec] || { color: "bg-gray-500", icon: null };
    return <Badge className={config.color}>{rec?.replace(/_/g, " ")}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-500",
      em_analise: "bg-blue-500",
      concluido: "bg-green-500",
    };
    return <Badge className={colors[status] || "bg-gray-500"}>{status?.replace("_", " ")}</Badge>;
  };

  const filtered = analisesContratos.filter((a: any) =>
    a.objeto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.numero_parecer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {alertasVigencia.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Vigência ({alertasVigencia.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertasVigencia.slice(0, 3).map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm">{a.descricao}</span>
                  <Badge variant="outline">{a.contracts?.numero_contrato}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Análises</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analisesContratos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {analisesContratos.filter((a: any) => a.status === "pendente").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analisesContratos.filter((a: any) => a.recomendacao === "aprovar").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Com Ressalvas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analisesContratos.filter((a: any) => a.recomendacao === "aprovar_com_ressalvas").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Análises Jurídicas de Contratos</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar análise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Nova Análise</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Registrar Análise Jurídica</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Análise</Label>
                        <Select
                          value={novaAnalise.tipo_analise}
                          onValueChange={(v) => setNovaAnalise({ ...novaAnalise, tipo_analise: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="previa">Prévia (Minuta)</SelectItem>
                            <SelectItem value="aditivo">Aditivo</SelectItem>
                            <SelectItem value="rescisao">Rescisão</SelectItem>
                            <SelectItem value="renovacao">Renovação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Secretaria Solicitante</Label>
                        <Select
                          value={novaAnalise.secretaria_solicitante_id}
                          onValueChange={(v) => setNovaAnalise({ ...novaAnalise, secretaria_solicitante_id: v })}
                        >
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {secretarias.map((s: any) => (
                              <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Objeto do Contrato</Label>
                        <Textarea
                          value={novaAnalise.objeto}
                          onChange={(e) => setNovaAnalise({ ...novaAnalise, objeto: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor do Contrato (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novaAnalise.valor_contrato}
                          onChange={(e) => setNovaAnalise({ ...novaAnalise, valor_contrato: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nº Licitação</Label>
                        <Input
                          value={novaAnalise.licitacao_numero}
                          onChange={(e) => setNovaAnalise({ ...novaAnalise, licitacao_numero: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Parecer Conclusivo</Label>
                        <Textarea
                          value={novaAnalise.parecer_conclusivo}
                          onChange={(e) => setNovaAnalise({ ...novaAnalise, parecer_conclusivo: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Recomendação</Label>
                        <Select
                          value={novaAnalise.recomendacao}
                          onValueChange={(v) => setNovaAnalise({ ...novaAnalise, recomendacao: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aprovar">Aprovar</SelectItem>
                            <SelectItem value="aprovar_com_ressalvas">Aprovar com Ressalvas</SelectItem>
                            <SelectItem value="solicitar_ajustes">Solicitar Ajustes</SelectItem>
                            <SelectItem value="reprovar">Reprovar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createAnaliseContrato.isPending}>Registrar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAnalises ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Parecer</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Objeto</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Solicitante</TableHead>
                  <TableHead>Recomendação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((analise: any) => (
                  <TableRow key={analise.id}>
                    <TableCell className="font-medium">{analise.numero_parecer}</TableCell>
                    <TableCell className="capitalize">{analise.tipo_analise}</TableCell>
                    <TableCell className="max-w-xs truncate">{analise.objeto}</TableCell>
                    <TableCell>R$ {analise.valor_contrato?.toLocaleString()}</TableCell>
                    <TableCell>{analise.secretarias?.nome || "-"}</TableCell>
                    <TableCell>{getRecomendacaoBadge(analise.recomendacao)}</TableCell>
                    <TableCell>{getStatusBadge(analise.status)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhuma análise encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
