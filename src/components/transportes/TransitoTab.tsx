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
import { Plus, Search, AlertTriangle, TrafficCone } from "lucide-react";
import { useTransportePublico } from "@/hooks/useTransportePublico";
import { format } from "date-fns";

export function TransitoTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<"ocorrencias" | "sinalizacao">("ocorrencias");
  
  const { 
    ocorrencias, 
    loadingOcorrencias, 
    createOcorrencia,
    sinalizacao,
    loadingSinalizacao,
    createSinalizacao 
  } = useTransportePublico();

  const [novaOcorrencia, setNovaOcorrencia] = useState({
    tipo: "acidente",
    descricao: "",
    logradouro: "",
    bairro: "",
    data_ocorrencia: new Date().toISOString().split("T")[0],
    hora_ocorrencia: "",
    envolvidos: 0,
    vitimas_fatais: 0,
    vitimas_feridas: 0,
    providencias: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOcorrencia.mutateAsync(novaOcorrencia);
    setDialogOpen(false);
    setNovaOcorrencia({
      tipo: "acidente",
      descricao: "",
      logradouro: "",
      bairro: "",
      data_ocorrencia: new Date().toISOString().split("T")[0],
      hora_ocorrencia: "",
      envolvidos: 0,
      vitimas_fatais: 0,
      vitimas_feridas: 0,
      providencias: "",
    });
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      acidente: "bg-red-500",
      colisao: "bg-orange-500",
      atropelamento: "bg-purple-500",
      outros: "bg-gray-500",
    };
    return <Badge className={colors[tipo] || "bg-gray-500"}>{tipo}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveView("ocorrencias")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocorrências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ocorrencias.length}</div>
            <p className="text-xs text-muted-foreground">registradas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveView("sinalizacao")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sinalização</CardTitle>
            <TrafficCone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sinalizacao.length}</div>
            <p className="text-xs text-muted-foreground">itens cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vítimas Fatais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {ocorrencias.reduce((acc: number, o: any) => acc + (o.vitimas_fatais || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ocorrências */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ocorrências de Trânsito</CardTitle>
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
                    Nova Ocorrência
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Registrar Ocorrência de Trânsito</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={novaOcorrencia.tipo}
                          onValueChange={(v) => setNovaOcorrencia({ ...novaOcorrencia, tipo: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="acidente">Acidente</SelectItem>
                            <SelectItem value="colisao">Colisão</SelectItem>
                            <SelectItem value="atropelamento">Atropelamento</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={novaOcorrencia.data_ocorrencia}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, data_ocorrencia: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hora</Label>
                        <Input
                          type="time"
                          value={novaOcorrencia.hora_ocorrencia}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, hora_ocorrencia: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Logradouro</Label>
                        <Input
                          value={novaOcorrencia.logradouro}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, logradouro: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input
                          value={novaOcorrencia.bairro}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, bairro: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Envolvidos</Label>
                        <Input
                          type="number"
                          min="0"
                          value={novaOcorrencia.envolvidos}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, envolvidos: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vítimas Feridas</Label>
                        <Input
                          type="number"
                          min="0"
                          value={novaOcorrencia.vitimas_feridas}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, vitimas_feridas: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vítimas Fatais</Label>
                        <Input
                          type="number"
                          min="0"
                          value={novaOcorrencia.vitimas_fatais}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, vitimas_fatais: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={novaOcorrencia.descricao}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, descricao: e.target.value })}
                          placeholder="Descreva a ocorrência..."
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Providências Tomadas</Label>
                        <Textarea
                          value={novaOcorrencia.providencias}
                          onChange={(e) => setNovaOcorrencia({ ...novaOcorrencia, providencias: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createOcorrencia.isPending}>
                        Registrar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingOcorrencias ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Envolvidos</TableHead>
                  <TableHead>Feridos</TableHead>
                  <TableHead>Fatais</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ocorrencias.map((ocorrencia: any) => (
                  <TableRow key={ocorrencia.id}>
                    <TableCell>
                      {format(new Date(ocorrencia.data_ocorrencia), "dd/MM/yyyy")}
                      {ocorrencia.hora_ocorrencia && ` ${ocorrencia.hora_ocorrencia}`}
                    </TableCell>
                    <TableCell>{getTipoBadge(ocorrencia.tipo)}</TableCell>
                    <TableCell>
                      {ocorrencia.logradouro}
                      {ocorrencia.bairro && ` - ${ocorrencia.bairro}`}
                    </TableCell>
                    <TableCell>{ocorrencia.envolvidos || 0}</TableCell>
                    <TableCell>{ocorrencia.vitimas_feridas || 0}</TableCell>
                    <TableCell>
                      <span className={ocorrencia.vitimas_fatais > 0 ? "text-red-500 font-medium" : ""}>
                        {ocorrencia.vitimas_fatais || 0}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {ocorrencias.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma ocorrência registrada
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
