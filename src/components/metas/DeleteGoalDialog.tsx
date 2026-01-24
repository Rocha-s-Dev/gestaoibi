import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
}

interface DeleteGoalDialogProps {
  goal: Goal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalDeleted: () => void;
}

export function DeleteGoalDialog({
  goal,
  open,
  onOpenChange,
  onGoalDeleted,
}: DeleteGoalDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase.from("goals").delete().eq("id", goal.id);

      if (error) throw error;

      toast({
        title: "Meta excluída com sucesso",
        description: "A meta foi removida do sistema.",
      });

      onGoalDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: "Erro ao excluir meta",
        description: "Não foi possível excluir a meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Meta</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a meta "{goal.title}"? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
