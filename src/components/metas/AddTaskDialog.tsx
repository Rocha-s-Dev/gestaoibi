
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

interface AddTaskDialogProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
}

export function AddTaskDialog({ goalId, open, onOpenChange, onTaskAdded }: AddTaskDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as TaskPriority,
    assignedUsers: [] as string[],
    dueDate: undefined as Date | undefined,
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
      // Primeiro, criar a tarefa
      const { data: task, error: taskError } = await (supabase
        .from("tasks" as any) as any)
        .insert({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          goal_id: goalId,
          due_date: formData.dueDate ? formData.dueDate.toISOString() : null,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Depois, criar as atribuições de usuários
      if (formData.assignedUsers.length > 0 && task) {
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
        title: "Tarefa criada com sucesso",
        description: "A nova tarefa foi adicionada à meta.",
      });

      onTaskAdded();
      onOpenChange(false);
      setFormData({
        title: "",
        description: "",
        priority: "medium" as TaskPriority,
        assignedUsers: [],
        dueDate: undefined,
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível criar a tarefa. Tente novamente.",
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
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>
            Adicione uma nova tarefa à meta.
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
              {isLoading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
