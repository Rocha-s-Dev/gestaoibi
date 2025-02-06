import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Database, Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

type TaskPriority = Database["public"]["Enums"]["task_priority"];
type Task = Tables<"tasks">;

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated: () => void;
}

export function EditTaskDialog({ task, open, onOpenChange, onTaskUpdated }: EditTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority as TaskPriority,
    assignedUsers: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: taskError } = await supabase
        .from("tasks")
        .update({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        })
        .eq("id", task.id);

      if (taskError) throw taskError;

      if (formData.assignedUsers.length > 0) {
        // Primeiro, remover todas as atribuições existentes
        await supabase
          .from("task_assignments")
          .delete()
          .eq("task_id", task.id);

        // Depois, criar as novas atribuições
        const assignments = formData.assignedUsers.map((userId) => ({
          task_id: task.id,
          user_id: userId,
        }));

        const { error: assignmentError } = await supabase
          .from("task_assignments")
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      toast({
        title: "Tarefa atualizada com sucesso",
        description: "As alterações foram salvas.",
      });

      onTaskUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar a tarefa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>
            Atualize os detalhes da tarefa.
          </DialogDescription>
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
            value={formData.priority}
            onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={formData.assignedUsers[0] || ""}
            onValueChange={(value) => setFormData({ ...formData, assignedUsers: [value] })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
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