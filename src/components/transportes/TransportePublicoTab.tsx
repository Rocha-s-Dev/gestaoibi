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
import { Plus, Search, Route, MapPin } from "lucide-react";
import { useTransportePublico } from "@/hooks/useTransportePublico";

export function TransportePublicoTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<"linhas" | "pontos">("linhas");
  
  const { linhas, loadingLinhas, createLinha, pontosParada, loadingPontos, createPontoParada } = useTransportePublico();

  const [novaLinha, setNovaLinha] = useState({
    codigo: "",
    nome: "",
    tipo: "urbana" as const,
    itinerario_ida: "",
    itinerario_volta: "",
    horario_inicio: "",
    horario_fim: "",
    intervalo_minutos: 30,
    tarifa: 0,
    ativa: true,
  });

  const handleSubmitLinha = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLinha.mutateAsync(novaLinha);
    setDialogOpen(false);
    setNovaLinha({
      codigo: "",
      nome: "",
      tipo: "urbana",
      itinerario_ida: "",
      itinerario_volta: "",
      horario_inicio: "",
      horario_fim: "",
      intervalo_minutos: 30,
      tarifa: 0,
      ativa: true,
    });
  };

  const filteredLinhas = linhas.filter(
    (l: any) =>
      l.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveView("linhas")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linhas</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linhas.length}</div>
            <p className="text-xs text-muted-foreground">linhas ativas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveView("pontos")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos de Parada</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pontosParada.length}</div>
            <p className="text-xs text-muted-foreground">cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarifa Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {linhas.length > 0
                ? `R$ ${(linhas.reduce((acc: number, l: any) => acc + (l.tarifa || 0), 0) / linhas.length).toFixed(2)}`
                : "R$ 0,00"}
            </div>
            <p className="text-xs text-muted-foreground">por viagem</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Linhas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Linhas de Transporte</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar linha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Linha
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Linha de Transporte</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmitLinha} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Código</Label>
                        <Input
                          value={novaLinha.codigo}
                          onChange={(e) => setNovaLinha({ ...novaLinha, codigo: e.target.value })}
                          placeholder="Ex: 001"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={novaLinha.nome}
                          onChange={(e) => setNovaLinha({ ...novaLinha, nome: e.target.value })}
                          placeholder="Ex: Centro - Terminal"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Horário Início</Label>
                        <Input
                          type="time"
                          value={novaLinha.horario_inicio}
                          onChange={(e) => setNovaLinha({ ...novaLinha, horario_inicio: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Horário Fim</Label>
                        <Input
                          type="time"
                          value={novaLinha.horario_fim}
                          onChange={(e) => setNovaLinha({ ...novaLinha, horario_fim: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Intervalo (min)</Label>
                        <Input
                          type="number"
                          value={novaLinha.intervalo_minutos}
                          onChange={(e) => setNovaLinha({ ...novaLinha, intervalo_minutos: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tarifa (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novaLinha.tarifa}
                          onChange={(e) => setNovaLinha({ ...novaLinha, tarifa: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Itinerário Ida</Label>
                        <Textarea
                          value={novaLinha.itinerario_ida}
                          onChange={(e) => setNovaLinha({ ...novaLinha, itinerario_ida: e.target.value })}
                          placeholder="Descreva o trajeto de ida..."
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Itinerário Volta</Label>
                        <Textarea
                          value={novaLinha.itinerario_volta}
                          onChange={(e) => setNovaLinha({ ...novaLinha, itinerario_volta: e.target.value })}
                          placeholder="Descreva o trajeto de volta..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createLinha.isPending}>
                        Cadastrar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingLinhas ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Intervalo</TableHead>
                  <TableHead>Tarifa</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinhas.map((linha: any) => (
                  <TableRow key={linha.id}>
                    <TableCell className="font-medium">{linha.codigo}</TableCell>
                    <TableCell>{linha.nome}</TableCell>
                    <TableCell className="capitalize">{linha.tipo}</TableCell>
                    <TableCell>
                      {linha.horario_inicio} - {linha.horario_fim}
                    </TableCell>
                    <TableCell>{linha.intervalo_minutos} min</TableCell>
                    <TableCell>R$ {linha.tarifa?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={linha.ativa ? "default" : "secondary"}>
                        {linha.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLinhas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhuma linha encontrada
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
