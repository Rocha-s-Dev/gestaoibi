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
import { Plus, Search } from "lucide-react";
import { useAgricultura } from "@/hooks/useAgricultura";

export function PropriedadesRurais() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { propriedades, loadingPropriedades, createPropriedade, produtores } = useAgricultura();

  const [novaPropriedade, setNovaPropriedade] = useState({
    produtor_id: "",
    nome: "",
    tipo: "pequena" as const,
    area_total_ha: 0,
    area_produtiva_ha: 0,
    localizacao: "",
    car_numero: "",
    itr_numero: "",
    fonte_agua: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPropriedade.mutateAsync(novaPropriedade);
    setDialogOpen(false);
    setNovaPropriedade({
      produtor_id: "",
      nome: "",
      tipo: "pequena",
      area_total_ha: 0,
      area_produtiva_ha: 0,
      localizacao: "",
      car_numero: "",
      itr_numero: "",
      fonte_agua: "",
    });
  };

  const filteredPropriedades = propriedades.filter(
    (p: any) => p.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Propriedades Rurais</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar propriedade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Propriedade
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Propriedade Rural</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Produtor</Label>
                        <Select
                          value={novaPropriedade.produtor_id}
                          onValueChange={(v) => setNovaPropriedade({ ...novaPropriedade, produtor_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o produtor" />
                          </SelectTrigger>
                          <SelectContent>
                            {produtores.map((p: any) => (
                              <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nome da Propriedade</Label>
                        <Input
                          value={novaPropriedade.nome}
                          onChange={(e) => setNovaPropriedade({ ...novaPropriedade, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={novaPropriedade.tipo}
                          onValueChange={(v: any) => setNovaPropriedade({ ...novaPropriedade, tipo: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pequena">Pequena</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="grande">Grande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Área Total (ha)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novaPropriedade.area_total_ha}
                          onChange={(e) => setNovaPropriedade({ ...novaPropriedade, area_total_ha: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Área Produtiva (ha)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novaPropriedade.area_produtiva_ha}
                          onChange={(e) => setNovaPropriedade({ ...novaPropriedade, area_produtiva_ha: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número CAR</Label>
                        <Input
                          value={novaPropriedade.car_numero}
                          onChange={(e) => setNovaPropriedade({ ...novaPropriedade, car_numero: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número ITR</Label>
                        <Input
                          value={novaPropriedade.itr_numero}
                          onChange={(e) => setNovaPropriedade({ ...novaPropriedade, itr_numero: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Localização</Label>
                        <Input
                          value={novaPropriedade.localizacao}
                          onChange={(e) => setNovaPropriedade({ ...novaPropriedade, localizacao: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createPropriedade.isPending}>
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
          {loadingPropriedades ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Produtor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Área Total</TableHead>
                  <TableHead>Área Produtiva</TableHead>
                  <TableHead>CAR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPropriedades.map((prop: any) => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-medium">{prop.nome}</TableCell>
                    <TableCell>{prop.produtores_rurais?.nome || "-"}</TableCell>
                    <TableCell className="capitalize">{prop.tipo}</TableCell>
                    <TableCell>{prop.area_total_ha} ha</TableCell>
                    <TableCell>{prop.area_produtiva_ha} ha</TableCell>
                    <TableCell>{prop.car_numero || "-"}</TableCell>
                  </TableRow>
                ))}
                {filteredPropriedades.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma propriedade encontrada
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
