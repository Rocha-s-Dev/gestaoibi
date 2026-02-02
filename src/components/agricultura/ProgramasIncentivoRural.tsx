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
import { Plus, Search, Gift } from "lucide-react";
import { useAgricultura } from "@/hooks/useAgricultura";
import { format } from "date-fns";

export function ProgramasIncentivo() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { programas, loadingProgramas, createPrograma, beneficios, loadingBeneficios } = useAgricultura();

  const [novoPrograma, setNovoPrograma] = useState({
    nome: "",
    descricao: "",
    tipo: "sementes" as const,
    orcamento_total: 0,
    data_inicio: "",
    data_fim: "",
    criterios_elegibilidade: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPrograma.mutateAsync(novoPrograma);
    setDialogOpen(false);
    setNovoPrograma({
      nome: "",
      descricao: "",
      tipo: "sementes",
      orcamento_total: 0,
      data_inicio: "",
      data_fim: "",
      criterios_elegibilidade: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programas Ativos</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programas.filter((p: any) => p.ativo).length}
            </div>
            <p className="text-xs text-muted-foreground">em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefícios Concedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{beneficios.length}</div>
            <p className="text-xs text-muted-foreground">total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {programas.reduce((acc: number, p: any) => acc + (p.orcamento_total || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">investido</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Programas de Incentivo Rural</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar programa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Programa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Programa de Incentivo</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Nome do Programa</Label>
                        <Input
                          value={novoPrograma.nome}
                          onChange={(e) => setNovoPrograma({ ...novoPrograma, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Input
                          value={novoPrograma.tipo}
                          onChange={(e) => setNovoPrograma({ ...novoPrograma, tipo: e.target.value as any })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Orçamento Total (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novoPrograma.orcamento_total}
                          onChange={(e) => setNovoPrograma({ ...novoPrograma, orcamento_total: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Início</Label>
                        <Input
                          type="date"
                          value={novoPrograma.data_inicio}
                          onChange={(e) => setNovoPrograma({ ...novoPrograma, data_inicio: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Fim</Label>
                        <Input
                          type="date"
                          value={novoPrograma.data_fim}
                          onChange={(e) => setNovoPrograma({ ...novoPrograma, data_fim: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={novoPrograma.descricao}
                          onChange={(e) => setNovoPrograma({ ...novoPrograma, descricao: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Critérios de Elegibilidade</Label>
                        <Textarea
                          value={novoPrograma.criterios_elegibilidade}
                          onChange={(e) => setNovoPrograma({ ...novoPrograma, criterios_elegibilidade: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createPrograma.isPending}>
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
          {loadingProgramas ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programas.map((programa: any) => (
                  <TableRow key={programa.id}>
                    <TableCell className="font-medium">{programa.nome}</TableCell>
                    <TableCell className="capitalize">{programa.tipo}</TableCell>
                    <TableCell>R$ {programa.orcamento_total?.toLocaleString()}</TableCell>
                    <TableCell>
                      {programa.data_inicio && format(new Date(programa.data_inicio), "dd/MM/yyyy")}
                      {programa.data_fim && ` - ${format(new Date(programa.data_fim), "dd/MM/yyyy")}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant={programa.ativo ? "default" : "secondary"}>
                        {programa.ativo ? "Ativo" : "Encerrado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {programas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhum programa encontrado
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
