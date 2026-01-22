
import { useState } from "react";
import { Plus, CheckCircle, Circle, CalendarIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TaskListProps {
  goalId: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string;
  status?: string;
  goal_id?: string;
  due_date?: string | null;
  completed?: boolean;
  created_at?: string;
  task_assignments?: {
    user_id: string;
    profiles?: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  }[];
}

export function TaskList({ goalId }: TaskListProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: tasks, refetch } = useQuery({
    queryKey: ["tasks", goalId],
    queryFn: async () => {
      console.log("Fetching tasks for goal ID:", goalId);
      
      // Primeiro, vamos buscar as tarefas básicas
      const { data: tasksData, error: tasksError } = await (supabase
        .from("tasks" as any) as any)
        .select("*")
        .eq("goal_id", goalId)
        .order("created_at", { ascending: false });

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }
      
      console.log("Basic tasks fetched:", tasksData);
      
      // Para cada tarefa, vamos buscar as atribuições de usuários separadamente
      const tasksWithAssignments = await Promise.all(
        (tasksData as any[]).map(async (task: any) => {
          // Buscar todas as atribuições para esta tarefa
          const { data: assignmentsData, error: assignmentsError } = await (supabase
            .from("task_assignments" as any) as any)
            .select("user_id")
            .eq("task_id", task.id);
            
          if (assignmentsError) {
            console.error("Error fetching assignments for task:", task.id, assignmentsError);
            return {
              ...task,
              task_assignments: []
            };
          }
          
          // Se temos atribuições, buscar o perfil de cada usuário separadamente
          let assignmentsWithProfiles: any[] = [];
          if (assignmentsData && assignmentsData.length > 0) {
            assignmentsWithProfiles = await Promise.all(
              (assignmentsData as any[]).map(async (assignment: any) => {
                const { data: profileData, error: profileError } = await (supabase
                  .from("profiles" as any) as any)
                  .select("first_name, last_name")
                  .eq("id", assignment.user_id)
                  .single();
                
                if (profileError) {
                  console.error("Error fetching profile for user:", assignment.user_id, profileError);
                  return {
                    user_id: assignment.user_id,
                    profiles: null
                  };
                }
                
                return {
                  user_id: assignment.user_id,
                  profiles: profileData
                };
              })
            );
          }
          
          console.log("Assignments with profiles for task", task.id, ":", assignmentsWithProfiles);
          
          return {
            ...task,
            task_assignments: assignmentsWithProfiles || []
          };
        })
      );
      
      console.log("Tasks with assignments:", tasksWithAssignments);
      return tasksWithAssignments as Task[];
    },
  });

  const getPriorityColor = (priority: string | undefined) => {
    const colorMap: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    return colorMap[priority || "medium"] || "bg-gray-100 text-gray-800";
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      const { error } = await (supabase
        .from('tasks' as any) as any)
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

  console.log("Current tasks:", tasks);

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
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma tarefa encontrada. Clique em "Nova Tarefa" para adicionar.
          </div>
        ) : (
          tasks.map((task) => (
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
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="font-medium">Prazo:</span> {formatDueDate(task.due_date)}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {task.task_assignments?.map((assignment, index) => (
                    <span
                      key={`${assignment.user_id}_${index}`}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTask(task);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
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
