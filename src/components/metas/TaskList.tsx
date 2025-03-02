
import { useState } from "react";
import { Plus, CheckCircle, Circle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskListProps {
  goalId: string;
}

// Updated Task type to properly match Supabase's response structure
type Task = Tables<"tasks"> & {
  task_assignments?: {
    user_id: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  }[];
  due_date?: string | null;
  completed?: boolean;
};

export function TaskList({ goalId }: TaskListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: tasks, refetch } = useQuery({
    queryKey: ["tasks", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          task_assignments(
            user_id,
            profiles(
              first_name,
              last_name
            )
          )
        `)
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Cast the result as unknown first to satisfy TypeScript
      return (data as unknown) as Task[];
    },
  });

  const getPriorityColor = (priority: string) => {
    const colorMap: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return colorMap[priority] || "bg-gray-100 text-gray-800";
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id);
      
      if (error) throw error;
      
      refetch();
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const formatDueDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Tarefas</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      <div className="space-y-4">
        {tasks?.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskCompletion(task);
                  }}
                  className="text-gray-500 hover:text-green-600 transition-colors"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h4>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority === "low"
                  ? "Baixa"
                  : task.priority === "medium"
                  ? "Média"
                  : "Alta"}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            
            {task.due_date && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Prazo:</span> {formatDueDate(task.due_date)}
              </p>
            )}
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {task.task_assignments?.map((assignment) => (
                  <span
                    key={assignment.user_id}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsEditDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedTask(task);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        goalId={goalId}
        onTaskAdded={refetch}
      />

      {selectedTask && (
        <>
          <EditTaskDialog
            task={selectedTask}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onTaskUpdated={refetch}
          />
          <DeleteTaskDialog
            task={selectedTask}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onTaskDeleted={refetch}
          />
        </>
      )}
    </div>
  );
}
