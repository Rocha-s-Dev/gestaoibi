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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MessageSquare, FileText, Book } from "lucide-react";
import { useControladoria } from "@/hooks/useControladoria";
import { useSecretarias } from "@/hooks/useSecretarias";
import { format } from "date-fns";

export function ConsultoriaJuridica() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("consultas");
  
  const { consultas, loadingConsultas, createConsulta, pareceres, loadingPareceres, modelosParecer } = useControladoria();
  const { secretarias } = useSecretarias();

  const [novaConsulta, setNovaConsulta] = useState({
    assunto: "",
    descricao_consulta: "",
    tipo_consulta: "administrativo",
    prioridade: "normal",
    prazo_resposta: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createConsulta.mutateAsync(novaConsulta);
    setDialogOpen(false);
    setNovaConsulta({
      assunto: "",
      descricao_consulta: "",
      tipo_consulta: "administrativo",
      prioridade: "normal",
      prazo_resposta: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-500",
      em_analise: "bg-blue-500",
      respondida: "bg-green-500",
      arquivada: "bg-gray-500",
    };
    return <Badge className={colors[status] || "bg-gray-500"}>{status?.replace("_", " ")}</Badge>;
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

  const filteredConsultas = consultas.filter((c: any) =>
    c.numero_consulta?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.assunto?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPareceres = pareceres.filter((p: any) =>
    p.numero_parecer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ementa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultas.length}</div>
            <p className="text-xs text-muted-foreground">total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {consultas.filter((c: any) => c.status === "pendente").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pareceres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pareceres.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Modelos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{modelosParecer.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="consultas"><MessageSquare className="h-4 w-4 mr-1" />Consultas</TabsTrigger>
          <TabsTrigger value="pareceres"><FileText className="h-4 w-4 mr-1" />Pareceres</TabsTrigger>
          <TabsTrigger value="modelos"><Book className="h-4 w-4 mr-1" />Banco de Modelos</TabsTrigger>
        </TabsList>

        <TabsContent value="consultas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Consultas Jurídicas</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar consulta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" />Nova Consulta</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Solicitar Consulta Jurídica</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-2">
                            <Label>Assunto</Label>
                            <Input
                              value={novaConsulta.assunto}
                              onChange={(e) => setNovaConsulta({ ...novaConsulta, assunto: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de Consulta</Label>
                            <Select
                              value={novaConsulta.tipo_consulta}
                              onValueChange={(v) => setNovaConsulta({ ...novaConsulta, tipo_consulta: v })}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="administrativo">Administrativo</SelectItem>
                                <SelectItem value="trabalhista">Trabalhista</SelectItem>
                                <SelectItem value="contratual">Contratual</SelectItem>
                                <SelectItem value="licitacao">Licitação</SelectItem>
                                <SelectItem value="tributario">Tributário</SelectItem>
                                <SelectItem value="outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Prioridade</Label>
                            <Select
                              value={novaConsulta.prioridade}
                              onValueChange={(v) => setNovaConsulta({ ...novaConsulta, prioridade: v })}
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
                          <div className="space-y-2">
                            <Label>Prazo Desejado</Label>
                            <Input
                              type="date"
                              value={novaConsulta.prazo_resposta}
                              onChange={(e) => setNovaConsulta({ ...novaConsulta, prazo_resposta: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2 col-span-2">
                            <Label>Descrição da Consulta</Label>
                            <Textarea
                              value={novaConsulta.descricao_consulta}
                              onChange={(e) => setNovaConsulta({ ...novaConsulta, descricao_consulta: e.target.value })}
                              rows={5}
                              required
                              placeholder="Descreva detalhadamente sua dúvida ou situação..."
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                          <Button type="submit" disabled={createConsulta.isPending}>Enviar Consulta</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingConsultas ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Solicitante</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConsultas.map((consulta: any) => (
                      <TableRow key={consulta.id}>
                        <TableCell className="font-medium">{consulta.numero_consulta}</TableCell>
                        <TableCell className="max-w-xs truncate">{consulta.assunto}</TableCell>
                        <TableCell className="capitalize">{consulta.tipo_consulta}</TableCell>
                        <TableCell>{consulta.secretarias?.nome || consulta.solicitante_nome || "-"}</TableCell>
                        <TableCell>{getPrioridadeBadge(consulta.prioridade)}</TableCell>
                        <TableCell>{getStatusBadge(consulta.status)}</TableCell>
                        <TableCell>{format(new Date(consulta.created_at), "dd/MM/yyyy")}</TableCell>
                      </TableRow>
                    ))}
                    {filteredConsultas.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Nenhuma consulta encontrada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pareceres">
          <Card>
            <CardHeader>
              <CardTitle>Pareceres Emitidos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPareceres ? (
                <div className="text-center py-8">Carregando...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ementa</TableHead>
                      <TableHead>Consulta Ref.</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Reutilizável</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPareceres.map((parecer: any) => (
                      <TableRow key={parecer.id}>
                        <TableCell className="font-medium">{parecer.numero_parecer}</TableCell>
                        <TableCell className="capitalize">{parecer.tipo}</TableCell>
                        <TableCell className="max-w-xs truncate">{parecer.ementa || "-"}</TableCell>
                        <TableCell>{parecer.consultas_juridicas?.numero_consulta || "-"}</TableCell>
                        <TableCell>{format(new Date(parecer.data_parecer), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          {parecer.reutilizavel ? (
                            <Badge className="bg-green-500">Sim</Badge>
                          ) : (
                            <Badge variant="secondary">Não</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredPareceres.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Nenhum parecer encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modelos">
          <Card>
            <CardHeader>
              <CardTitle>Banco de Modelos de Parecer</CardTitle>
            </CardHeader>
            <CardContent>
              {modelosParecer.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum modelo de parecer cadastrado
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {modelosParecer.map((modelo: any) => (
                    <Card key={modelo.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{modelo.titulo}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Badge>{modelo.categoria}</Badge>
                          <p className="text-sm text-muted-foreground line-clamp-2">{modelo.ementa_modelo}</p>
                          <Button variant="outline" size="sm">Usar Modelo</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
