
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { format } from "date-fns";

interface ViewUserDialogProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    department_id: string | null;
    role: string;
    email?: string;
    endereco?: string | null;
    numero_endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    pais?: string | null;
    cpf?: string | null;
    rg?: string | null;
    data_nascimento?: string | null;
  };
}

export const ViewUserDialog = ({ user }: ViewUserDialogProps) => {
  const [open, setOpen] = useState(false);

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrador",
      mayor: "Prefeito",
      secretary: "Secretário",
      employee: "Funcionário",
    };
    return roleMap[role] || role;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não informado";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Funcionário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Nome Completo</h4>
              <p className="text-sm text-gray-600">
                {user.first_name} {user.last_name}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Departamento</h4>
              <p className="text-sm text-gray-600">
                {user.department_id || "Não definido"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Cargo</h4>
              <p className="text-sm text-gray-600">{getRoleDisplay(user.role)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Email</h4>
              <p className="text-sm text-gray-600">{user.email || "Não informado"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">CPF</h4>
              <p className="text-sm text-gray-600">{user.cpf || "Não informado"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">RG</h4>
              <p className="text-sm text-gray-600">{user.rg || "Não informado"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Data de Nascimento</h4>
              <p className="text-sm text-gray-600">{formatDate(user.data_nascimento)}</p>
            </div>
          </div>
          
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Informações de Endereço</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Endereço</h4>
                <p className="text-sm text-gray-600">{user.endereco || "Não informado"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Número</h4>
                <p className="text-sm text-gray-600">{user.numero_endereco || "Não informado"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Bairro</h4>
                <p className="text-sm text-gray-600">{user.bairro || "Não informado"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Cidade</h4>
                <p className="text-sm text-gray-600">{user.cidade || "Não informado"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Estado</h4>
                <p className="text-sm text-gray-600">{user.estado || "Não informado"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">País</h4>
                <p className="text-sm text-gray-600">{user.pais || "Brasil"}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
