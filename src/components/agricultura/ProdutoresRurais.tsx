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
import { Plus, Search } from "lucide-react";
import { useAgricultura } from "@/hooks/useAgricultura";

export function ProdutoresRurais() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { produtores, loadingProdutores, createProdutor } = useAgricultura();

  const [novoProdutor, setNovoProdutor] = useState({
    nome: "",
    cpf_cnpj: "",
    tipo_pessoa: "fisica" as const,
    telefone: "",
    email: "",
    endereco: "",
    dap_numero: "",
    dap_validade: "",
    associacao: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProdutor.mutateAsync(novoProdutor);
    setDialogOpen(false);
    setNovoProdutor({
      nome: "",
      cpf_cnpj: "",
      tipo_pessoa: "fisica",
      telefone: "",
      email: "",
      endereco: "",
      dap_numero: "",
      dap_validade: "",
      associacao: "",
    });
  };

  const filteredProdutores = produtores.filter(
    (p: any) =>
      p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf_cnpj?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtores Rurais</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produtor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Produtor Rural</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label>Nome Completo</Label>
                        <Input
                          value={novoProdutor.nome}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF/CNPJ</Label>
                        <Input
                          value={novoProdutor.cpf_cnpj}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, cpf_cnpj: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={novoProdutor.telefone}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, telefone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={novoProdutor.email}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Número DAP</Label>
                        <Input
                          value={novoProdutor.dap_numero}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, dap_numero: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Validade DAP</Label>
                        <Input
                          type="date"
                          value={novoProdutor.dap_validade}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, dap_validade: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Associação/Cooperativa</Label>
                        <Input
                          value={novoProdutor.associacao}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, associacao: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>Endereço</Label>
                        <Input
                          value={novoProdutor.endereco}
                          onChange={(e) => setNovoProdutor({ ...novoProdutor, endereco: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createProdutor.isPending}>
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
          {loadingProdutores ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>DAP</TableHead>
                  <TableHead>Associação</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProdutores.map((produtor: any) => (
                  <TableRow key={produtor.id}>
                    <TableCell className="font-medium">{produtor.nome}</TableCell>
                    <TableCell>{produtor.cpf_cnpj}</TableCell>
                    <TableCell>{produtor.telefone || "-"}</TableCell>
                    <TableCell>{produtor.dap_numero || "-"}</TableCell>
                    <TableCell>{produtor.associacao || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={produtor.ativo !== false ? "default" : "secondary"}>
                        {produtor.ativo !== false ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProdutores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum produtor encontrado
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
