import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ViewUserDialogProps {
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    department: string | null;
    role: string;
    email?: string;
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Funcionário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Nome Completo</h4>
            <p className="text-sm text-gray-600">
              {user.first_name} {user.last_name}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Departamento</h4>
            <p className="text-sm text-gray-600">
              {user.department || "Não definido"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Cargo</h4>
            <p className="text-sm text-gray-600">{getRoleDisplay(user.role)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};