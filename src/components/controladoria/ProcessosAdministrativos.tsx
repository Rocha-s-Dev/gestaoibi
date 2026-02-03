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
import { Plus, Search, FileText, Clock, AlertTriangle } from "lucide-react";
import { useControladoria } from "@/hooks/useControladoria";
import { useSecretarias } from "@/hooks/useSecretarias";
import { format, differenceInDays } from "date-fns";

export function ProcessosAdministrativos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { processos, loadingProcessos, createProcesso } = useControladoria();
  const { secretarias } = useSecretarias();

  const [novoProcesso, setNovoProcesso] = useState({
    tipo: "sindicancia",
    assunto: "",
    descricao: "",
    secretaria_origem_id: "",
    prazo_dias: 30,
    prioridade: "normal",
    fundamentacao_legal: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataPrazo = new Date();
    dataPrazo.setDate(dataPrazo.getDate() + novoProcesso.prazo_dias);
    
    await createProcesso.mutateAsync({
      ...novoProcesso,
      data_prazo: dataPrazo.toISOString().split("T")[0],
    });
    setDialogOpen(false);
    setNovoProcesso({
      tipo: "sindicancia",
      assunto: "",
      descricao: "",
      secretaria_origem_id: "",
      prazo_dias: 30,
      prioridade: "normal",
      fundamentacao_legal: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      em_andamento: "bg-blue-500",
      suspenso: "bg-yellow-500",
      arquivado: "bg-gray-500",
      concluido: "bg-green-500",
    };
    return <Badge className={colors[status] || "bg-gray-500"}>{status.replace("_", " ")}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const colors: Record<string, string> = {
      baixa: "bg-gray-400",
      normal: "bg-blue-400",
      alta: "bg-orange-500",
      urgente: "bg-red-500",
    };
    return <Badge className={colors[prioridade] || "bg-gray-400"}>{prioridade}</Badge>;
  };

  const getDiasRestantes = (dataPrazo: string) => {
    const dias = differenceInDays(new Date(dataPrazo), new Date());
    if (dias < 0) return <span className="text-red-500 font-medium">Vencido ({Math.abs(dias)}d)</span>;
    if (dias <= 5) return <span className="text-orange-500 font-medium">{dias} dias</span>;
    return <span>{dias} dias</span>;
  };

  const processosVencendo = processos.filter((p: any) => 
    p.status === "em_andamento" && 
    p.data_prazo && 
    differenceInDays(new Date(p.data_prazo), new Date()) <= 5
  );

  const filtered = processos.filter((p: any) =>
    p.numero_processo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.assunto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {processosVencendo.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Processos com Prazo Próximo ({processosVencendo.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {processosVencendo.slice(0, 3).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm font-medium">{p.numero_processo}</span>
                  <span className="text-sm">{p.assunto}</span>
                  {getDiasRestantes(p.data_prazo)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processos.length}</div>
            <p className="text-xs text-muted-foreground">processos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {processos.filter((p: any) => p.status === "em_andamento").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {processos.filter((p: any) => p.status === "concluido").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {processos.filter((p: any) => p.prioridade === "urgente").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Processos Administrativos</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar processo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Novo Processo</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Instaurar Processo Administrativo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Processo</Label>
                        <Select
                          value={novoProcesso.tipo}
                          onValueChange={(v) => setNovoProcesso({ ...novoProcesso, tipo: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sindicancia">Sindicância</SelectItem>
                            <SelectItem value="pad">PAD - Processo Administrativo Disciplinar</SelectItem>
                            <SelectItem value="inquerito">Inquérito Administrativo</SelectItem>
                            <SelectItem value="tomada_contas">Tomada de Contas</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Secretaria de Origem</Label>
                        <Select
                          value={novoProcesso.secretaria_origem_id}
                          onValueChange={(v) => setNovoProcesso({ ...novoProcesso, secretaria_origem_id: v })}
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
                        <Label>Assunto</Label>
                        <Input
                          value={novoProcesso.assunto}
                          onChange={(e) => setNovoProcesso({ ...novoProcesso, assunto: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prazo (dias)</Label>
                        <Input
                          type="number"
                          value={novoProcesso.prazo_dias}
                          onChange={(e) => setNovoProcesso({ ...novoProcesso, prazo_dias: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select
                          value={novoProcesso.prioridade}
                          onValueChange={(v) => setNovoProcesso({ ...novoProcesso, prioridade: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="urgente">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={novoProcesso.descricao}
                          onChange={(e) => setNovoProcesso({ ...novoProcesso, descricao: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Fundamentação Legal</Label>
                        <Textarea
                          value={novoProcesso.fundamentacao_legal}
                          onChange={(e) => setNovoProcesso({ ...novoProcesso, fundamentacao_legal: e.target.value })}
                          placeholder="Lei, artigo, decreto..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={createProcesso.isPending}>Instaurar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingProcessos ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((processo: any) => (
                  <TableRow key={processo.id}>
                    <TableCell className="font-medium">{processo.numero_processo}</TableCell>
                    <TableCell className="capitalize">{processo.tipo?.replace("_", " ")}</TableCell>
                    <TableCell className="max-w-xs truncate">{processo.assunto}</TableCell>
                    <TableCell>{processo.secretarias?.nome || "-"}</TableCell>
                    <TableCell>{processo.data_prazo ? getDiasRestantes(processo.data_prazo) : "-"}</TableCell>
                    <TableCell>{getPrioridadeBadge(processo.prioridade)}</TableCell>
                    <TableCell>{getStatusBadge(processo.status)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum processo encontrado
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
