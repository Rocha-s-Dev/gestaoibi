
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BusinessRegistration } from "./BusinessRegistration";

interface BusinessFormValues {
  id?: string;
  name: string;
  cnpj: string;
  businessType: string;
  address: string;
  contact: string;
  email: string;
  phone: string;
  taxIncentives?: string[];
  notes?: string;
}

interface BusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BusinessFormValues) => void;
  defaultValues?: BusinessFormValues;
  isEditing?: boolean;
}

export function BusinessDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: BusinessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados da empresa nos campos abaixo."
              : "Preencha os dados para cadastrar uma nova empresa."}
          </DialogDescription>
        </DialogHeader>
        <BusinessRegistration 
          onBusinessAdded={() => onSubmit(defaultValues as BusinessFormValues)}
          defaultValues={defaultValues}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}
