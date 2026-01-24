import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";

type GoalTerm = "short" | "medium" | "long";
type GoalStatus = "pending" | "in_progress" | "delayed" | "completed" | "cancelled";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  term: string;
  status: string;
  due_date: string | null;
}

interface EditGoalDialogProps {
  goal: Goal;
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
    dueDate: goal.due_date ? new Date(goal.due_date) : undefined,
  });
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (open && goal) {
      setFormData({
        title: goal.title,
        description: goal.description || "",
        term: goal.term as GoalTerm,
        status: goal.status as GoalStatus,
        dueDate: goal.due_date ? new Date(goal.due_date) : undefined,
      });
      
      // Fetch the departments associated with this goal
      const fetchGoalDepartments = async () => {
        const { data, error } = await supabase
          .from("goal_departments")
          .select("department_id")
          .eq("goal_id", goal.id);
        
        if (error) {
          console.error("Error fetching goal departments:", error);
          return;
        }
        
        if (data) {
          const departmentIds = data.map((item: any) => item.department_id);
          setSelectedDepartments(departmentIds);
        }
      };
      
      fetchGoalDepartments();
    }
  }, [open, goal]);

  const handleToggleDepartment = (departmentId: string) => {
    setSelectedDepartments(prev => {
      if (prev.includes(departmentId)) {
        return prev.filter(id => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update the goal information
      const { error: goalError } = await supabase
        .from("goals")
        .update({
          title: formData.title,
          description: formData.description,
          term: formData.term,
          status: formData.status,
          due_date: formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : null,
        } as any)
        .eq("id", goal.id);

      if (goalError) throw goalError;

      // Remove all existing department associations
      const { error: deleteError } = await supabase
        .from("goal_departments")
        .delete()
        .eq("goal_id", goal.id);

      if (deleteError) throw deleteError;

      // Create new department associations if any departments are selected
      if (selectedDepartments.length > 0) {
        const departmentAssociations = selectedDepartments.map(departmentId => ({
          goal_id: goal.id,
          department_id: departmentId
        }));

        const { error: insertError } = await supabase
          .from("goal_departments")
          .insert(departmentAssociations as any);

        if (insertError) throw insertError;
      }

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
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
          
          <div className="space-y-2">
            <Label htmlFor="departments">Secretarias (selecione uma ou mais)</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {departments?.map((department: any) => (
                  <div key={department.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`department-${department.id}`}
                      checked={selectedDepartments.includes(department.id)}
                      onCheckedChange={() => handleToggleDepartment(department.id)}
                    />
                    <Label
                      htmlFor={`department-${department.id}`}
                      className="cursor-pointer"
                    >
                      {department.name}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
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
