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

type Goal = Tables<"goals">;
type Department = Tables<"departments">;
type GoalDepartment = Tables<"goal_departments">;

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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [goalDepartments, setGoalDepartments] = useState<GoalDepartment[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [statusData, setStatusData] = useState<any[]>([]);
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
  }, [selectedDepartment, goalDepartments]);

  useEffect(() => {
    if (goals.length > 0) {
      prepareChartData();
    }
  }, [goals, departments, goalDepartments]);

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Acompanhamento de Metas
          </h1>

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
        </div>
      </main>
    </div>
  );
}
