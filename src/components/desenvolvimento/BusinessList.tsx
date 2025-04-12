
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Factory } from "lucide-react";
import { BusinessDialog } from "./BusinessDialog";
import { DeleteBusinessDialog } from "./DeleteBusinessDialog";
import { Badge } from "@/components/ui/badge";

// Mock data for businesses
const MOCK_BUSINESSES = [
  {
    id: "1",
    name: "Tech Solutions Ltda",
    cnpj: "12.345.678/0001-90",
    businessType: "Tecnologia",
    address: "Avenida Principal, 1000, Centro",
    contact: "João Silva",
    email: "contato@techsolutions.com",
    phone: "(11) 98765-4321",
    taxIncentives: ["Redução de ISSQN", "Isenção de IPTU"],
    notes: "Empresa especializada em desenvolvimento de software",
  },
  {
    id: "2",
    name: "Mercado Central",
    cnpj: "98.765.432/0001-10",
    businessType: "Comércio",
    address: "Rua do Comércio, 123, Setor Comercial",
    contact: "Maria Oliveira",
    email: "contato@mercadocentral.com",
    phone: "(11) 91234-5678",
    taxIncentives: ["Programa de Desenvolvimento Local"],
    notes: "Mercado de alimentos e produtos diversos",
  },
  {
    id: "3",
    name: "Fábrica Ecológica S.A.",
    cnpj: "45.678.901/0001-23",
    businessType: "Indústria",
    address: "Distrito Industrial, Lote 45, Setor 2",
    contact: "Pedro Santos",
    email: "contato@fabricaeco.com",
    phone: "(11) 97654-3210",
    taxIncentives: ["Incentivo à Exportação", "Redução de Taxas Municipais"],
    notes: "Indústria de produtos sustentáveis",
  },
];

interface BusinessListProps {
  refreshTrigger?: number;
}

export function BusinessList({ refreshTrigger }: BusinessListProps) {
  const [businesses, setBusinesses] = useState(MOCK_BUSINESSES);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBusiness, setEditingBusiness] = useState<typeof MOCK_BUSINESSES[0] | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<typeof MOCK_BUSINESSES[0] | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.businessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.cnpj.includes(searchTerm)
  );

  const handleEdit = (business: typeof MOCK_BUSINESSES[0]) => {
    setEditingBusiness(business);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (business: typeof MOCK_BUSINESSES[0]) => {
    setBusinessToDelete(business);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setBusinesses(businesses.filter((business) => business.id !== id));
    setIsDeleteDialogOpen(false);
  };

  const handleUpdateBusiness = (updatedBusiness: typeof MOCK_BUSINESSES[0]) => {
    setBusinesses(
      businesses.map((business) =>
        business.id === updatedBusiness.id ? updatedBusiness : business
      )
    );
    setIsEditDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Buscar por nome, tipo ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-8"
          />
        </div>
      </div>

      {filteredBusinesses.length === 0 ? (
        <div className="text-center py-10">
          <Factory className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">Nenhuma empresa encontrada</h3>
          <p className="text-sm text-muted-foreground">
            Tente ajustar sua busca ou cadastre uma nova empresa.
          </p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead className="hidden md:table-cell">CNPJ</TableHead>
                <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                <TableHead className="hidden lg:table-cell">Contato</TableHead>
                <TableHead className="hidden xl:table-cell">Incentivos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell className="font-medium">
                    {business.name}
                    <div className="md:hidden text-xs text-muted-foreground mt-1">
                      {business.cnpj}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{business.cnpj}</TableCell>
                  <TableCell className="hidden lg:table-cell">{business.businessType}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {business.contact}
                    <div className="text-xs text-muted-foreground">{business.phone}</div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {business.taxIncentives.map((incentive) => (
                        <Badge key={incentive} variant="outline" className="text-xs">
                          {incentive.length > 20 
                            ? `${incentive.substring(0, 20)}...` 
                            : incentive}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(business)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(business)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <BusinessDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateBusiness}
        defaultValues={editingBusiness || undefined}
        isEditing={true}
      />

      <DeleteBusinessDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => businessToDelete && confirmDelete(businessToDelete.id)}
        businessName={businessToDelete?.name || ""}
      />
    </div>
  );
}
