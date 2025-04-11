
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BidForm, BidFormValues } from "./BidForm";

interface BidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BidFormValues) => void;
  defaultValues?: Partial<BidFormValues>;
  isEditing?: boolean;
}

export function BidDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: BidDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Licitação" : "Nova Licitação"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados da licitação nos campos abaixo."
              : "Preencha os dados para cadastrar uma nova licitação."}
          </DialogDescription>
        </DialogHeader>
        <BidForm 
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          isEditing={isEditing}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
