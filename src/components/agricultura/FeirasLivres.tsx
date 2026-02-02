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
import { Plus, Search, Store } from "lucide-react";
import { useFeirasLivres } from "@/hooks/useFeirasLivres";

export function FeirasLivres() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { feiras, loadingFeiras, createFeira, permissionarios } = useFeirasLivres();

  const [novaFeira, setNovaFeira] = useState({
    nome: "",
    local: "",
    dias_funcionamento: "",
    horario_inicio: "",
    horario_fim: "",
    capacidade_barracas: 0,
    responsavel: "",
    telefone_contato: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFeira.mutateAsync(novaFeira);
    setDialogOpen(false);
    setNovaFeira({
      nome: "",
      local: "",
      dias_funcionamento: "",
      horario_inicio: "",
      horario_fim: "",
      capacidade_barracas: 0,
      responsavel: "",
      telefone_contato: "",
    });
  };

  const filteredFeiras = feiras.filter(
    (f: any) => f.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feiras Ativas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feiras.filter((f: any) => f.ativa).length}
            </div>
            <p className="text-xs text-muted-foreground">em funcionamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissionários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissionarios.length}</div>
            <p className="text-xs text-muted-foreground">cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidade Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feiras.reduce((acc: number, f: any) => acc + (f.capacidade_barracas || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">barracas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Feiras Livres e Mercados</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar feira..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Feira
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Feira Livre</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Nome da Feira</Label>
                        <Input
                          value={novaFeira.nome}
                          onChange={(e) => setNovaFeira({ ...novaFeira, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Local</Label>
                        <Input
                          value={novaFeira.local}
                          onChange={(e) => setNovaFeira({ ...novaFeira, local: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dias de Funcionamento</Label>
                        <Input
                          value={novaFeira.dias_funcionamento}
                          onChange={(e) => setNovaFeira({ ...novaFeira, dias_funcionamento: e.target.value })}
                          placeholder="Ex: Sábados e Domingos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Capacidade (barracas)</Label>
                        <Input
                          type="number"
                          value={novaFeira.capacidade_barracas}
                          onChange={(e) => setNovaFeira({ ...novaFeira, capacidade_barracas: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Horário Início</Label>
                        <Input
                          type="time"
                          value={novaFeira.horario_inicio}
                          onChange={(e) => setNovaFeira({ ...novaFeira, horario_inicio: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Horário Fim</Label>
                        <Input
                          type="time"
                          value={novaFeira.horario_fim}
                          onChange={(e) => setNovaFeira({ ...novaFeira, horario_fim: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável</Label>
                        <Input
                          value={novaFeira.responsavel}
                          onChange={(e) => setNovaFeira({ ...novaFeira, responsavel: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone Contato</Label>
                        <Input
                          value={novaFeira.telefone_contato}
                          onChange={(e) => setNovaFeira({ ...novaFeira, telefone_contato: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createFeira.isPending}>
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
          {loadingFeiras ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeiras.map((feira: any) => (
                  <TableRow key={feira.id}>
                    <TableCell className="font-medium">{feira.nome}</TableCell>
                    <TableCell>{feira.local}</TableCell>
                    <TableCell>{feira.dias_funcionamento || "-"}</TableCell>
                    <TableCell>
                      {feira.horario_inicio} - {feira.horario_fim}
                    </TableCell>
                    <TableCell>{feira.capacidade_barracas} barracas</TableCell>
                    <TableCell>
                      <Badge variant={feira.ativa ? "default" : "secondary"}>
                        {feira.ativa ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredFeiras.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma feira encontrada
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
