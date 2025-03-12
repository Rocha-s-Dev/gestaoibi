
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Users,
  BarChart,
  MessageSquare,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Funcionários", path: "/funcionarios" },
  { icon: Target, label: "Metas", path: "/metas" },
  { icon: BarChart, label: "Acompanhamento", path: "/acompanhamento-metas" },
  { icon: MessageSquare, label: "Mensagens", path: "/mensagens" },
  { icon: Bell, label: "Notificações", path: "/notificacoes" },
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div
      className={cn(
        "h-screen bg-white border-r border-gray-200 transition-all duration-300 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && <h1 className="text-xl font-bold">Gestão Municipal</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-colors",
                "hover:bg-muted",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700",
                collapsed && "justify-center"
              )}
            >
              <item.icon size={20} />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="flex items-center space-x-2">
          <NotificationDropdown />
          <Button
            variant="ghost"
            className={cn(
              "w-full mt-8 text-red-600 hover:text-red-700 hover:bg-red-50",
              collapsed && "px-0"
            )}
            onClick={signOut}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
