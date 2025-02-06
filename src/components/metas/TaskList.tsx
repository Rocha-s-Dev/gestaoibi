import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { AddTaskDialog } from "./AddTaskDialog";
import { EditTaskDialog } from "./EditTaskDialog";
import { DeleteTaskDialog } from "./DeleteTaskDialog";

interface TaskListProps {
  goalId: string;
}

type Task = Tables<"tasks">;

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
      return data;
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
              <h4 className="font-medium">{task.title}</h4>
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
            <p className="text-sm text-gray-600 mb-4">{task.description}</p>
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