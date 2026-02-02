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
import { Plus, Search, AlertCircle } from "lucide-react";
import { useMotoristas } from "@/hooks/useMotoristas";
import { format } from "date-fns";

export function GestaoMotoristas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { motoristas, isLoading, createMotorista, alertasCNH } = useMotoristas();

  const [novoMotorista, setNovoMotorista] = useState({
    nome: "",
    cpf: "",
    cnh_numero: "",
    cnh_categoria: "B",
    cnh_validade: "",
    cnh_pontos: 0,
    telefone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMotorista.mutateAsync(novoMotorista);
    setDialogOpen(false);
    setNovoMotorista({
      nome: "",
      cpf: "",
      cnh_numero: "",
      cnh_categoria: "B",
      cnh_validade: "",
      cnh_pontos: 0,
      telefone: "",
      email: "",
    });
  };

  const filteredMotoristas = motoristas.filter(
    (m: any) =>
      m.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.cpf?.includes(searchTerm)
  );

  const isCNHVencendo = (validade: string) => {
    const dataValidade = new Date(validade);
    const hoje = new Date();
    const diasRestantes = Math.floor((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30;
  };

  return (
    <div className="space-y-6">
      {/* Alertas de CNH */}
      {alertasCNH.length > 0 && (
        <Card className="border-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertCircle className="h-5 w-5" />
              CNH Vencendo ({alertasCNH.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertasCNH.map((alerta: any) => (
                <div key={alerta.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm">{alerta.nome}</span>
                  <Badge variant="destructive">
                    Vence em {format(new Date(alerta.cnh_validade), "dd/MM/yyyy")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Motoristas Habilitados</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar motorista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Motorista
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Motorista</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Nome Completo</Label>
                        <Input
                          value={novoMotorista.nome}
                          onChange={(e) => setNovoMotorista({ ...novoMotorista, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input
                          value={novoMotorista.cpf}
                          onChange={(e) => setNovoMotorista({ ...novoMotorista, cpf: e.target.value })}
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={novoMotorista.telefone}
                          onChange={(e) => setNovoMotorista({ ...novoMotorista, telefone: e.target.value })}
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número CNH</Label>
                        <Input
                          value={novoMotorista.cnh_numero}
                          onChange={(e) => setNovoMotorista({ ...novoMotorista, cnh_numero: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Categoria CNH</Label>
                        <Select
                          value={novoMotorista.cnh_categoria}
                          onValueChange={(v) => setNovoMotorista({ ...novoMotorista, cnh_categoria: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">A - Motos</SelectItem>
                            <SelectItem value="B">B - Carros</SelectItem>
                            <SelectItem value="AB">AB - Motos e Carros</SelectItem>
                            <SelectItem value="C">C - Caminhões</SelectItem>
                            <SelectItem value="D">D - Ônibus</SelectItem>
                            <SelectItem value="E">E - Carretas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Validade CNH</Label>
                        <Input
                          type="date"
                          value={novoMotorista.cnh_validade}
                          onChange={(e) => setNovoMotorista({ ...novoMotorista, cnh_validade: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pontos na CNH</Label>
                        <Input
                          type="number"
                          min="0"
                          max="40"
                          value={novoMotorista.cnh_pontos}
                          onChange={(e) => setNovoMotorista({ ...novoMotorista, cnh_pontos: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={novoMotorista.email}
                          onChange={(e) => setNovoMotorista({ ...novoMotorista, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMotorista.isPending}>
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
          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Pontos</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMotoristas.map((motorista: any) => (
                  <TableRow key={motorista.id}>
                    <TableCell className="font-medium">{motorista.nome}</TableCell>
                    <TableCell>{motorista.cpf}</TableCell>
                    <TableCell>{motorista.cnh_numero}</TableCell>
                    <TableCell>{motorista.cnh_categoria}</TableCell>
                    <TableCell>
                      <span className={isCNHVencendo(motorista.cnh_validade) ? "text-red-500 font-medium" : ""}>
                        {motorista.cnh_validade ? format(new Date(motorista.cnh_validade), "dd/MM/yyyy") : "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={motorista.cnh_pontos > 20 ? "destructive" : "secondary"}>
                        {motorista.cnh_pontos} pontos
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={motorista.ativo ? "default" : "secondary"}>
                        {motorista.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMotoristas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum motorista encontrado
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
