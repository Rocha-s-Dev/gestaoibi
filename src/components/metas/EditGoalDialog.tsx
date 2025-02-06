import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Database, Tables } from "@/integrations/supabase/types";

type GoalTerm = Database["public"]["Enums"]["goal_term"];
type GoalStatus = Database["public"]["Enums"]["goal_status"];

interface EditGoalDialogProps {
  goal: Tables<"goals">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalUpdated: () => void;
}

export function EditGoalDialog({ goal, open, onOpenChange, onGoalUpdated }: EditGoalDialogProps) {
  const [formData, setFormData] = useState({
    title: goal.title,
    description: goal.description || "",
    term: goal.term as GoalTerm,
    status: goal.status as GoalStatus,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("goals")
        .update({
          title: formData.title,
          description: formData.description,
          term: formData.term,
          status: formData.status,
        })
        .eq("id", goal.id);

      if (error) throw error;

      toast({
        title: "Meta atualizada com sucesso",
        description: "As alterações foram salvas.",
      });

      onGoalUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating goal:", error);
      toast({
        title: "Erro ao atualizar meta",
        description: "Não foi possível atualizar a meta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Select
            value={formData.term}
            onValueChange={(value: GoalTerm) => setFormData({ ...formData, term: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Curto Prazo</SelectItem>
              <SelectItem value="medium">Médio Prazo</SelectItem>
              <SelectItem value="long">Longo Prazo</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={formData.status}
            onValueChange={(value: GoalStatus) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="delayed">Atrasada</SelectItem>
              <SelectItem value="completed">Concluída</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}