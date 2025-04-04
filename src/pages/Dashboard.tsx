
import { Activity, Users, FileText, TrendingUp } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";

const Dashboard = () => {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Projetos Ativos"
            value="12"
            icon={<Activity />}
            description="2 projetos concluídos este mês"
          />
          <DashboardCard
            title="Funcionários"
            value="148"
            icon={<Users />}
            description="12 novos este mês"
          />
          <DashboardCard
            title="Processos"
            value="1,284"
            icon={<FileText />}
            description="89 processos hoje"
          />
          <DashboardCard
            title="Metas Alcançadas"
            value="78%"
            icon={<TrendingUp />}
            description="Aumento de 12% este mês"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Placeholder para futuros gráficos e tabelas */}
          <div className="bg-white p-6 rounded-lg shadow animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
            <p className="text-gray-600">
              Dados de atividade serão exibidos aqui
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow animate-fadeIn">
            <h2 className="text-xl font-semibold mb-4">Metas do Trimestre</h2>
            <p className="text-gray-600">
              Progresso das metas será exibido aqui
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
