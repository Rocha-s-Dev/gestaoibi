import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, CalendarCheck } from "lucide-react";
import { useAgricultura } from "@/hooks/useAgricultura";
import { format } from "date-fns";

export function AssistenciaTecnica() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { visitas, loadingVisitas, createVisita, produtores, propriedades } = useAgricultura();

  const [novaVisita, setNovaVisita] = useState({
    produtor_id: "",
    propriedade_id: "",
    data_visita: new Date().toISOString().split("T")[0],
    tipo_visita: "orientacao",
    objetivo: "",
    observacoes: "",
    recomendacoes: "",
    proxima_visita: "",
    tecnico_responsavel: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVisita.mutateAsync(novaVisita);
    setDialogOpen(false);
    setNovaVisita({
      produtor_id: "",
      propriedade_id: "",
      data_visita: new Date().toISOString().split("T")[0],
      tipo_visita: "orientacao",
      objetivo: "",
      observacoes: "",
      recomendacoes: "",
      proxima_visita: "",
      tecnico_responsavel: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      agendada: "bg-blue-500",
      realizada: "bg-green-500",
      cancelada: "bg-red-500",
    };
    return <Badge className={colors[status] || "bg-gray-500"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas Realizadas</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitas.filter((v: any) => v.status === "realizada").length}
            </div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitas.filter((v: any) => v.status === "agendada").length}
            </div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitas.length}</div>
            <p className="text-xs text-muted-foreground">registradas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Visitas Técnicas</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Visita
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Agendar Visita Técnica</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Produtor</Label>
                        <Select
                          value={novaVisita.produtor_id}
                          onValueChange={(v) => setNovaVisita({ ...novaVisita, produtor_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {produtores.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Propriedade</Label>
                        <Select
                          value={novaVisita.propriedade_id}
                          onValueChange={(v) => setNovaVisita({ ...novaVisita, propriedade_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {propriedades.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data da Visita</Label>
                        <Input
                          type="date"
                          value={novaVisita.data_visita}
                          onChange={(e) => setNovaVisita({ ...novaVisita, data_visita: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={novaVisita.tipo_visita}
                          onValueChange={(v) => setNovaVisita({ ...novaVisita, tipo_visita: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="orientacao">Orientação</SelectItem>
                            <SelectItem value="acompanhamento">Acompanhamento</SelectItem>
                            <SelectItem value="laudo">Laudo Técnico</SelectItem>
                            <SelectItem value="emergencia">Emergência</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Técnico Responsável</Label>
                        <Input
                          value={novaVisita.tecnico_responsavel}
                          onChange={(e) => setNovaVisita({ ...novaVisita, tecnico_responsavel: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Próxima Visita</Label>
                        <Input
                          type="date"
                          value={novaVisita.proxima_visita}
                          onChange={(e) => setNovaVisita({ ...novaVisita, proxima_visita: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Objetivo</Label>
                        <Input
                          value={novaVisita.objetivo}
                          onChange={(e) => setNovaVisita({ ...novaVisita, objetivo: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Observações</Label>
                        <Textarea
                          value={novaVisita.observacoes}
                          onChange={(e) => setNovaVisita({ ...novaVisita, observacoes: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Recomendações</Label>
                        <Textarea
                          value={novaVisita.recomendacoes}
                          onChange={(e) => setNovaVisita({ ...novaVisita, recomendacoes: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createVisita.isPending}>
                        Agendar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingVisitas ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Produtor</TableHead>
                  <TableHead>Propriedade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Objetivo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visitas.map((visita: any) => (
                  <TableRow key={visita.id}>
                    <TableCell>{format(new Date(visita.data_visita), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{visita.produtores_rurais?.nome || "-"}</TableCell>
                    <TableCell>{visita.propriedades_rurais?.nome || "-"}</TableCell>
                    <TableCell className="capitalize">{visita.tipo_visita}</TableCell>
                    <TableCell className="max-w-xs truncate">{visita.objetivo || "-"}</TableCell>
                    <TableCell>{getStatusBadge(visita.status || "agendada")}</TableCell>
                  </TableRow>
                ))}
                {visitas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma visita registrada
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
