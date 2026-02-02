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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Car, Wrench, Fuel, AlertTriangle } from "lucide-react";
import { useFrotaMunicipal } from "@/hooks/useFrotaMunicipal";

export function GestaoFrota() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeView, setActiveView] = useState<"veiculos" | "manutencoes" | "abastecimentos">("veiculos");
  
  const {
    veiculos,
    loadingVeiculos,
    createVeiculo,
    manutencoes,
    loadingManutencoes,
    createManutencao,
    abastecimentos,
    loadingAbastecimentos,
    createAbastecimento,
    alertas,
  } = useFrotaMunicipal();

  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: "",
    chassi: "",
    renavam: "",
    modelo: "",
    marca: "",
    ano_fabricacao: new Date().getFullYear(),
    ano_modelo: new Date().getFullYear(),
    tipo: "leve" as const,
    situacao: "ativo" as const,
    tipo_combustivel: "gasolina",
    km_atual: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createVeiculo.mutateAsync(novoVeiculo);
    setDialogOpen(false);
    setNovoVeiculo({
      placa: "",
      chassi: "",
      renavam: "",
      modelo: "",
      marca: "",
      ano_fabricacao: new Date().getFullYear(),
      ano_modelo: new Date().getFullYear(),
      tipo: "leve",
      situacao: "ativo",
      tipo_combustivel: "gasolina",
      km_atual: 0,
    });
  };

  const filteredVeiculos = veiculos.filter(
    (v: any) =>
      v.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSituacaoBadge = (situacao: string) => {
    const colors: Record<string, string> = {
      ativo: "bg-green-500",
      manutencao: "bg-yellow-500",
      baixado: "bg-red-500",
      reserva: "bg-blue-500",
    };
    return <Badge className={colors[situacao] || "bg-gray-500"}>{situacao}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alertas.length > 0 && (
        <Card className="border-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Alertas da Frota ({alertas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertas.slice(0, 3).map((alerta: any) => (
                <div key={alerta.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">{alerta.descricao}</span>
                  <Badge variant="outline">{alerta.veiculos_frota?.placa}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveView("veiculos")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Veículos</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{veiculos.length}</div>
            <p className="text-xs text-muted-foreground">na frota municipal</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveView("manutencoes")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manutenções</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manutencoes.length}</div>
            <p className="text-xs text-muted-foreground">registradas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setActiveView("abastecimentos")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abastecimentos</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{abastecimentos.length}</div>
            <p className="text-xs text-muted-foreground">este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas.length}</div>
            <p className="text-xs text-muted-foreground">pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Veículos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {activeView === "veiculos" && "Veículos da Frota"}
              {activeView === "manutencoes" && "Manutenções"}
              {activeView === "abastecimentos" && "Abastecimentos"}
            </CardTitle>
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
                    Novo Veículo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Veículo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Placa</Label>
                        <Input
                          value={novoVeiculo.placa}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })}
                          placeholder="ABC-1234"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={novoVeiculo.tipo}
                          onValueChange={(v: any) => setNovoVeiculo({ ...novoVeiculo, tipo: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="leve">Leve</SelectItem>
                            <SelectItem value="pesado">Pesado</SelectItem>
                            <SelectItem value="onibus">Ônibus</SelectItem>
                            <SelectItem value="maquina">Máquina</SelectItem>
                            <SelectItem value="motocicleta">Motocicleta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Marca</Label>
                        <Input
                          value={novoVeiculo.marca}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, marca: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Modelo</Label>
                        <Input
                          value={novoVeiculo.modelo}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ano Fabricação</Label>
                        <Input
                          type="number"
                          value={novoVeiculo.ano_fabricacao}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano_fabricacao: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ano Modelo</Label>
                        <Input
                          type="number"
                          value={novoVeiculo.ano_modelo}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano_modelo: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Chassi</Label>
                        <Input
                          value={novoVeiculo.chassi}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, chassi: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>RENAVAM</Label>
                        <Input
                          value={novoVeiculo.renavam}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, renavam: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Combustível</Label>
                        <Select
                          value={novoVeiculo.tipo_combustivel}
                          onValueChange={(v) => setNovoVeiculo({ ...novoVeiculo, tipo_combustivel: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gasolina">Gasolina</SelectItem>
                            <SelectItem value="etanol">Etanol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="flex">Flex</SelectItem>
                            <SelectItem value="eletrico">Elétrico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>KM Atual</Label>
                        <Input
                          type="number"
                          value={novoVeiculo.km_atual}
                          onChange={(e) => setNovoVeiculo({ ...novoVeiculo, km_atual: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createVeiculo.isPending}>
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
          {loadingVeiculos ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>KM</TableHead>
                  <TableHead>Situação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVeiculos.map((veiculo: any) => (
                  <TableRow key={veiculo.id}>
                    <TableCell className="font-medium">{veiculo.placa}</TableCell>
                    <TableCell>{veiculo.marca} {veiculo.modelo}</TableCell>
                    <TableCell className="capitalize">{veiculo.tipo}</TableCell>
                    <TableCell>{veiculo.ano_modelo}</TableCell>
                    <TableCell>{veiculo.km_atual?.toLocaleString()} km</TableCell>
                    <TableCell>{getSituacaoBadge(veiculo.situacao)}</TableCell>
                  </TableRow>
                ))}
                {filteredVeiculos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum veículo encontrado
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
