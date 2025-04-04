
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AddGoalDialog } from "@/components/metas/AddGoalDialog";
import { ViewGoalDialog } from "@/components/metas/ViewGoalDialog";
import { EditGoalDialog } from "@/components/metas/EditGoalDialog";
import { DeleteGoalDialog } from "@/components/metas/DeleteGoalDialog";
import { Layout } from "@/components/layout/Layout";
import { Tables } from "@/integrations/supabase/types";

type Goal = Tables<"goals">;

export default function Metas() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
    
    // Subscribe to notifications for goal status updates
    const subscription = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'goals',
          filter: `status=eq.delayed`
        },
        (payload) => {
          // Show toast notification for delayed goals
          if (payload.new && payload.old && payload.new.status === 'delayed' && payload.old.status !== 'delayed') {
            toast({
              title: "Meta em Risco",
              description: `A meta "${payload.new.title}" está em risco de não ser alcançada.`,
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Erro ao carregar metas",
        description: "Não foi possível carregar as metas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

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

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      delayed: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const filteredGoals = goals?.filter((goal) =>
    goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStatusDisplay(goal.status).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTermDisplay(goal.term).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <main className="p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Metas</h1>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Meta
            </Button>
          </div>

          <div className="mb-6">
            <Input
              placeholder="Buscar metas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedGoal(goal);
                  setIsViewDialogOpen(true);
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {goal.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      goal.status
                    )}`}
                  >
                    {getStatusDisplay(goal.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {goal.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {getTermDisplay(goal.term)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedGoal(goal);
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
                        setSelectedGoal(goal);
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
        </div>
      </main>

      <AddGoalDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onGoalAdded={fetchGoals}
      />

      {selectedGoal && (
        <>
          <ViewGoalDialog
            goal={selectedGoal}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
          <EditGoalDialog
            goal={selectedGoal}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            onGoalUpdated={fetchGoals}
          />
          <DeleteGoalDialog
            goal={selectedGoal}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onGoalDeleted={fetchGoals}
          />
        </>
      )}
    </Layout>
  );
}
