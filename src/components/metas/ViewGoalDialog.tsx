import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tables } from "@/integrations/supabase/types";

interface ViewGoalDialogProps {
  goal: Tables<"goals">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewGoalDialog({ goal, open, onOpenChange }: ViewGoalDialogProps) {
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      in_progress: "Em Andamento",
      delayed: "Atrasada",
      completed: "Concluída",
      cancelled: "Cancelada",
    };
    return statusMap[status] || status;
  };

  const getTermDisplay = (term: string) => {
    const termMap: Record<string, string> = {
      short: "Curto Prazo",
      medium: "Médio Prazo",
      long: "Longo Prazo",
    };
    return termMap[term] || term;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Meta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Título</h4>
            <p className="text-sm text-gray-600">{goal.title}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Descrição</h4>
            <p className="text-sm text-gray-600">{goal.description || "Sem descrição"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Status</h4>
            <p className="text-sm text-gray-600">{getStatusDisplay(goal.status)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Prazo</h4>
            <p className="text-sm text-gray-600">{getTermDisplay(goal.term)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Criado em</h4>
            <p className="text-sm text-gray-600">
              {new Date(goal.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}