import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePacientes, Paciente } from "@/hooks/useSaude";
import { PacienteDialog } from "./PacienteDialog";
import { Search, Plus, User, Phone, MapPin, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CadastroPacientes() {
  const { pacientes, loading, createPaciente, updatePaciente, deletePaciente } = usePacientes();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [viewMode, setViewMode] = useState(false);

  const filteredPacientes = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf?.includes(searchTerm) ||
      p.cartao_sus?.includes(searchTerm)
  );

  const handleCreate = () => {
    setSelectedPaciente(null);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleEdit = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setViewMode(false);
    setDialogOpen(true);
  };

  const handleView = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setViewMode(true);
    setDialogOpen(true);
  };

  const handleDelete = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPaciente) return;
    try {
      await deletePaciente(selectedPaciente.id);
      toast.success("Paciente excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir paciente");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedPaciente(null);
    }
  };

  const handleSubmit = async (data: Partial<Paciente>) => {
    try {
      if (selectedPaciente) {
        await updatePaciente(selectedPaciente.id, data);
        toast.success("Paciente atualizado com sucesso");
      } else {
        await createPaciente(data as Omit<Paciente, "id" | "created_at" | "updated_at">);
        toast.success("Paciente cadastrado com sucesso");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao salvar paciente");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      ativo: { label: "Ativo", variant: "default" },
      inativo: { label: "Inativo", variant: "secondary" },
      falecido: { label: "Falecido", variant: "destructive" },
      mudou: { label: "Mudou", variant: "outline" },
    };
    const config = statusConfig[status] || statusConfig.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calcularIdade = (dataNascimento: string | null) => {
    if (!dataNascimento) return "-";
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return `${idade} anos`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pacientes</p>
                <p className="text-2xl font-bold">{pacientes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{pacientes.filter((p) => p.status === "ativo").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Cartão SUS</p>
                <p className="text-2xl font-bold">{pacientes.filter((p) => p.cartao_sus).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <User className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Condições Crônicas</p>
                <p className="text-2xl font-bold">
                  {pacientes.filter((p) => p.condicoes_cronicas && p.condicoes_cronicas.length > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de pesquisa e ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou Cartão SUS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Tabela de pacientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cartão SUS</TableHead>
                <TableHead>Idade</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nenhum paciente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredPacientes.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">{paciente.nome}</TableCell>
                    <TableCell>{paciente.cpf || "-"}</TableCell>
                    <TableCell>{paciente.cartao_sus || "-"}</TableCell>
                    <TableCell>{calcularIdade(paciente.data_nascimento)}</TableCell>
                    <TableCell>{paciente.telefone || "-"}</TableCell>
                    <TableCell>{getStatusBadge(paciente.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(paciente)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(paciente)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(paciente)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de cadastro/edição */}
      <PacienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paciente={selectedPaciente}
        onSubmit={handleSubmit}
        viewMode={viewMode}
      />

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o paciente "{selectedPaciente?.nome}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
