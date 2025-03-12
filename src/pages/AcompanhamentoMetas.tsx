import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ListTodo, BarChart2 } from "lucide-react";

type Goal = Tables<"goals">;
type Department = Tables<"departments">;
type GoalDepartment = Tables<"goal_departments">;
type Task = Tables<"tasks"> & {
  goal?: {
    title: string;
  } | null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_COLORS = {
  pending: "#FFBB28",      // Amarelo
  in_progress: "#0088FE",  // Azul
  delayed: "#FF8042",      // Laranja
  completed: "#00C49F",    // Verde
  cancelled: "#8884d8"     // Roxo
};

const STATUS_LABELS = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  delayed: "Atrasada",
  completed: "Concluída",
  cancelled: "Cancelada"
};

export default function AcompanhamentoMetas() {
  const [activeView, setActiveView] = useState<"goals" | "tasks">("goals");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [goalDepartments, setGoalDepartments] = useState<GoalDepartment[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [statusData, setStatusData] = useState<any[]>([]);
  const [taskStatusData, setTaskStatusData] = useState<any[]>([]);
  const [termData, setTermData] = useState<any[]>([]);
  const [departmentGoals, setDepartmentGoals] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
    checkUserRole();
    fetchGoalDepartments();
  }, []);

  useEffect(() => {
    fetchGoals();
    fetchTasks();
  }, [selectedDepartment, goalDepartments]);

  useEffect(() => {
    if (goals.length > 0) {
      prepareChartData();
    }
  }, [goals, departments, goalDepartments]);

  useEffect(() => {
    if (tasks.length > 0) {
      prepareTaskChartData();
    }
  }, [tasks]);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (error) throw error;
        
        // Assumindo que o prefeito tem o papel de "admin"
        setIsAdmin(data.role === "admin");
      }
    } catch (error) {
      console.error("Erro ao verificar papel do usuário:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Erro ao carregar departamentos:", error);
      toast({
        title: "Erro ao carregar departamentos",
        description: "Não foi possível carregar os departamentos. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const fetchGoalDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("goal_departments")
        .select("*");

      if (error) throw error;
      setGoalDepartments(data || []);
    } catch (error) {
      console.error("Erro ao carregar relações de metas e departamentos:", error);
    }
  };

  const fetchGoals = async () => {
    try {
      let query = supabase.from("goals").select("*");
      
      if (!isAdmin) {
        // Usuários não-admin só podem ver suas próprias metas
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          query = query.eq("created_by", user.id);
        }
      }
      
      const { data: allGoals, error } = await query;
      
      if (error) throw error;
      
      if (selectedDepartment !== "all" && allGoals) {
        // Filter goals by department using the goal_departments join table
        const filteredGoals = allGoals.filter(goal => 
          goalDepartments.some(gd => 
            gd.goal_id === goal.id && gd.department_id === selectedDepartment
          )
        );
        setGoals(filteredGoals || []);
      } else {
        setGoals(allGoals || []);
      }
    } catch (error) {
      console.error("Erro ao carregar metas:", error);
      toast({
        title: "Erro ao carregar metas",
        description: "Não foi possível carregar as metas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    try {
      let query = supabase
        .from("tasks")
        .select(`
          *,
          goal:goal_id (
            title
          )
        `);
      
      if (!isAdmin) {
        // Usuários não-admin só podem ver suas próprias tarefas
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Buscar tarefas atribuídas a este usuário
          const { data: assignments } = await supabase
            .from("task_assignments")
            .select("task_id")
            .eq("user_id", user.id);
          
          if (assignments && assignments.length > 0) {
            const taskIds = assignments.map(a => a.task_id);
            query = query.in('id', taskIds);
          } else {
            // Se não há tarefas atribuídas, retornar array vazio
            setTasks([]);
            return;
          }
        }
      }
      
      if (selectedDepartment !== "all") {
        // Filtrar tarefas por departamento
        // Primeiro, encontrar metas relacionadas a este departamento
        const deptGoalIds = goalDepartments
          .filter(gd => gd.department_id === selectedDepartment)
          .map(gd => gd.goal_id);
        
        if (deptGoalIds.length > 0) {
          query = query.in('goal_id', deptGoalIds);
        } else {
          // Se não há metas para este departamento, retornar array vazio
          setTasks([]);
          return;
        }
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTasks(data || []);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      toast({
        title: "Erro ao carregar tarefas",
        description: "Não foi possível carregar as tarefas. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const prepareChartData = () => {
    // Dados para o gráfico de pizza por status
    const statusCounts = goals.reduce((acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const newStatusData = Object.keys(statusCounts).map(status => ({
      name: STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status,
      value: statusCounts[status],
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#999999"
    }));
    setStatusData(newStatusData);

    // Dados para o gráfico de barras por prazo
    const termCounts = goals.reduce((acc, goal) => {
      acc[goal.term] = (acc[goal.term] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const newTermData = [
      { name: "Curto Prazo", value: termCounts["short"] || 0 },
      { name: "Médio Prazo", value: termCounts["medium"] || 0 },
      { name: "Longo Prazo", value: termCounts["long"] || 0 },
    ];
    setTermData(newTermData);

    // Dados para o gráfico de barras por departamento
    if (isAdmin && departments.length > 0) {
      const deptGoalCounts = departments.map(dept => {
        // Find all goal_departments entries for this department
        const deptGoalRelations = goalDepartments.filter(gd => gd.department_id === dept.id);
        
        // Get all goals for this department
        const deptGoals = goals.filter(goal => 
          deptGoalRelations.some(relation => relation.goal_id === goal.id)
        );
        
        const completed = deptGoals.filter(g => g.status === "completed").length;
        const total = deptGoals.length;
        
        return {
          name: dept.name,
          total: total,
          completed: completed,
          percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0
        };
      }).filter(dept => dept.total > 0); // Apenas departamentos com metas
      
      setDepartmentGoals(deptGoalCounts);
    }
  };

  const prepareTaskChartData = () => {
    // Dados para o gráfico de pizza por status de tarefas
    const taskStatusCounts = tasks.reduce((acc, task) => {
      const status = task.completed ? "completed" : "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const newTaskStatusData = [
      {
        name: "Concluídas",
        value: taskStatusCounts["completed"] || 0,
        color: STATUS_COLORS.completed
      },
      {
        name: "Pendentes",
        value: taskStatusCounts["pending"] || 0,
        color: STATUS_COLORS.pending
      }
    ];
    setTaskStatusData(newTaskStatusData);
  };

  const renderGoalStatusChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={statusData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} metas`, 'Quantidade']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderGoalTermChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={termData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} metas`, 'Quantidade']} />
        <Legend />
        <Bar dataKey="value" name="Metas" fill="#0088FE" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderDepartmentProgressChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={departmentGoals}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} />
        <YAxis type="category" dataKey="name" width={150} />
        <Tooltip formatter={(value) => [`${value}%`, 'Conclusão']} />
        <Legend />
        <Bar dataKey="percentComplete" name="% Concluído" fill="#00C49F" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderTaskStatusChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={taskStatusData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {taskStatusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} tarefas`, 'Quantidade']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Acompanhamento de {activeView === "goals" ? "Metas" : "Tarefas"}
            </h1>
            <div className="flex gap-2">
              <Button 
                variant={activeView === "goals" ? "default" : "outline"} 
                onClick={() => setActiveView("goals")}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Metas
              </Button>
              <Button 
                variant={activeView === "tasks" ? "default" : "outline"} 
                onClick={() => setActiveView("tasks")}
              >
                <ListTodo className="mr-2 h-4 w-4" />
                Tarefas
              </Button>
            </div>
          </div>

          {isAdmin && (
            <div className="mb-6">
              <div className="max-w-xs">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Secretaria
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as Secretarias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Secretarias</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeView === "goals" ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status das Metas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {statusData.length > 0 ? renderGoalStatusChart() : (
                      <p className="text-center text-gray-500 py-10">Nenhuma meta encontrada</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Metas por Prazo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {termData.length > 0 ? renderGoalTermChart() : (
                      <p className="text-center text-gray-500 py-10">Nenhuma meta encontrada</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {isAdmin && departmentGoals.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Progresso por Secretaria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderDepartmentProgressChart()}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Resumo das Metas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left border">Status</th>
                          <th className="p-2 text-left border">Quantidade</th>
                          <th className="p-2 text-left border">Percentual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statusData.map((status) => (
                          <tr key={status.name} className="border-b">
                            <td className="p-2 border">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: status.color }}
                                ></div>
                                {status.name}
                              </div>
                            </td>
                            <td className="p-2 border">{status.value}</td>
                            <td className="p-2 border">
                              {((status.value / goals.length) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="p-2 border">Total</td>
                          <td className="p-2 border">{goals.length}</td>
                          <td className="p-2 border">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Status das Tarefas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {taskStatusData.length > 0 ? renderTaskStatusChart() : (
                      <p className="text-center text-gray-500 py-10">Nenhuma tarefa encontrada</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  {tasks.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">Nenhuma tarefa encontrada</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 text-left border">Tarefa</th>
                            <th className="p-2 text-left border">Meta</th>
                            <th className="p-2 text-left border">Status</th>
                            <th className="p-2 text-left border">Prioridade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.map((task) => (
                            <tr key={task.id} className="border-b">
                              <td className="p-2 border">{task.title}</td>
                              <td className="p-2 border">{task.goal?.title || "N/A"}</td>
                              <td className="p-2 border">
                                <div className="flex items-center">
                                  <div 
                                    className="w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: task.completed ? STATUS_COLORS.completed : STATUS_COLORS.pending }}
                                  ></div>
                                  {task.completed ? "Concluída" : "Pendente"}
                                </div>
                              </td>
                              <td className="p-2 border">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  task.priority === "low" 
                                    ? "bg-green-100 text-green-800" 
                                    : task.priority === "medium" 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {task.priority === "low"
                                    ? "Baixa"
                                    : task.priority === "medium"
                                    ? "Média"
                                    : "Alta"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
