
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectRegistration } from "./ProjectRegistration";

interface ProjectFormValues {
  id?: string;
  name: string;
  category: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  partners: string[];
  description: string;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectFormValues) => void;
  defaultValues?: ProjectFormValues;
  isEditing?: boolean;
}

export function ProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  isEditing = false,
}: ProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Projeto" : "Novo Projeto de Desenvolvimento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Altere os dados do projeto nos campos abaixo."
              : "Preencha os dados para cadastrar um novo projeto de desenvolvimento."}
          </DialogDescription>
        </DialogHeader>
        <ProjectRegistration 
          onProjectAdded={(data) => onSubmit(data as ProjectFormValues)}
          defaultValues={defaultValues}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
}
