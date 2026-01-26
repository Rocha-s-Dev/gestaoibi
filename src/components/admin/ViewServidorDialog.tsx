import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  department: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

interface ViewServidorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servidor?: Profile;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  mayor: "Prefeito",
  secretary: "Secretário",
  employee: "Funcionário",
};

export function ViewServidorDialog({
  open,
  onOpenChange,
  servidor,
}: ViewServidorDialogProps) {
  if (!servidor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Servidor</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Nome Completo</h4>
              <p className="text-sm text-muted-foreground">
                {servidor.name || "Não informado"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Email</h4>
              <p className="text-sm text-muted-foreground">
                {servidor.email || "Não informado"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Departamento</h4>
              <p className="text-sm text-muted-foreground">
                {servidor.department || "Não definido"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Cargo</h4>
              <p className="text-sm text-muted-foreground">
                {roleLabels[servidor.role] || servidor.role}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
