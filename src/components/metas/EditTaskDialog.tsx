
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TaskPriority = "low" | "medium" | "high";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string;
  status?: string;
  goal_id?: string;
  due_date?: string | null;
}

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
    priority: (task.priority || "medium") as TaskPriority,
    assignedUsers: [] as string[],
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("profiles" as any) as any)
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as any[];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error: taskError } = await (supabase
        .from("tasks" as any) as any)
        .update({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.dueDate ? formData.dueDate.toISOString() : null,
        })
        .eq("id", task.id);

      if (taskError) throw taskError;

      if (formData.assignedUsers.length > 0) {
        // Primeiro, remover todas as atribuições existentes
        await (supabase
          .from("task_assignments" as any) as any)
          .delete()
          .eq("task_id", task.id);

        // Depois, criar as novas atribuições
        const assignments = formData.assignedUsers.map((userId) => ({
          task_id: task.id,
          user_id: userId,
        }));

        const { error: assignmentError } = await (supabase
          .from("task_assignments" as any) as any)
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de vencimento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? (
                    format(formData.dueDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
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
              {users?.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
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
