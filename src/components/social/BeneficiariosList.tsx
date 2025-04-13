
import { useState } from "react";
import { PlusCircle, Search, FileEdit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BeneficiarioDialog } from "./BeneficiarioDialog";
import { DeleteBeneficiarioDialog } from "./DeleteBeneficiarioDialog";

// Mock data for beneficiários
const mockBeneficiarios = [
  { 
    id: "1", 
    nome: "Maria Silva", 
    cpf: "123.456.789-00", 
    dataNascimento: "1980-05-12", 
    endereco: "Rua das Flores, 123", 
    bairro: "Centro", 
    telefone: "(11) 98765-4321", 
    programas: ["Bolsa Família", "Auxílio Moradia"],
    ultimoAtendimento: "2025-03-20"
  },
  { 
    id: "2", 
    nome: "João Santos", 
    cpf: "987.654.321-00", 
    dataNascimento: "1975-10-30", 
    endereco: "Av. Principal, 456", 
    bairro: "Vila Nova", 
    telefone: "(11) 91234-5678", 
    programas: ["Auxílio Alimentação"],
    ultimoAtendimento: "2025-04-05"
  },
  { 
    id: "3", 
    nome: "Ana Oliveira", 
    cpf: "456.789.123-00", 
    dataNascimento: "1990-02-15", 
    endereco: "Rua dos Pinheiros, 789", 
    bairro: "Jardim Europa", 
    telefone: "(11) 94567-8901", 
    programas: ["Bolsa Família", "Capacitação Profissional"],
    ultimoAtendimento: "2025-04-10"
  },
];

interface Beneficiario {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  bairro: string;
  telefone: string;
  programas: string[];
  ultimoAtendimento: string;
}

interface BeneficiariosListProps {
  refreshTrigger: number;
  onBeneficiarioAdded: () => void;
}

export function BeneficiariosList({ refreshTrigger, onBeneficiarioAdded }: BeneficiariosListProps) {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>(mockBeneficiarios);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBeneficiario, setEditingBeneficiario] = useState<Beneficiario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState<Beneficiario | null>(null);

  const filteredBeneficiarios = beneficiarios.filter(
    (beneficiario) =>
      beneficiario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beneficiario.cpf.includes(searchTerm) ||
      beneficiario.bairro.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddDialog = () => {
    setEditingBeneficiario(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (beneficiario: Beneficiario) => {
    setEditingBeneficiario(beneficiario);
    setDialogOpen(true);
  };

  const handleOpenDeleteDialog = (beneficiario: Beneficiario) => {
    setBeneficiarioToDelete(beneficiario);
    setDeleteDialogOpen(true);
  };

  const handleSaveBeneficiario = (beneficiario: Beneficiario) => {
    if (editingBeneficiario) {
      setBeneficiarios(
        beneficiarios.map((b) => (b.id === beneficiario.id ? beneficiario : b))
      );
    } else {
      const newBeneficiario = {
        ...beneficiario,
        id: Math.random().toString(36).substr(2, 9),
      };
      setBeneficiarios([...beneficiarios, newBeneficiario]);
      onBeneficiarioAdded();
    }
    setDialogOpen(false);
  };

  const handleDeleteBeneficiario = () => {
    if (beneficiarioToDelete) {
      setBeneficiarios(
        beneficiarios.filter((b) => b.id !== beneficiarioToDelete.id)
      );
      setDeleteDialogOpen(false);
      setBeneficiarioToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou bairro..."
            className="h-9 md:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAddDialog} size="sm" className="h-9">
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Beneficiário
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead className="hidden md:table-cell">Bairro</TableHead>
              <TableHead className="hidden md:table-cell">Programas</TableHead>
              <TableHead className="hidden md:table-cell">Último Atendimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBeneficiarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum beneficiário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredBeneficiarios.map((beneficiario) => (
                <TableRow key={beneficiario.id}>
                  <TableCell className="font-medium">{beneficiario.nome}</TableCell>
                  <TableCell>{beneficiario.cpf}</TableCell>
                  <TableCell className="hidden md:table-cell">{beneficiario.bairro}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {beneficiario.programas.join(", ")}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(beneficiario.ultimoAtendimento).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenEditDialog(beneficiario)}
                      >
                        <FileEdit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleOpenDeleteDialog(beneficiario)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <BeneficiarioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        beneficiario={editingBeneficiario}
        onSave={handleSaveBeneficiario}
      />

      {beneficiarioToDelete && (
        <DeleteBeneficiarioDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteBeneficiario}
          beneficiarioNome={beneficiarioToDelete.nome}
        />
      )}
    </div>
  );
}
