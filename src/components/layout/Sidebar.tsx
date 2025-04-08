
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
  DollarSign,
  Building2,
  ChevronDown,
  ChevronUp,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Lista principal de itens do menu
const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Target, label: "Metas", path: "/metas" },
  { icon: BarChart, label: "Acompanhamento", path: "/acompanhamento-metas" },
  { icon: MessageSquare, label: "Mensagens", path: "/mensagens" },
  { icon: Bell, label: "Notificações", path: "/notificacoes" },
  { icon: Users, label: "Funcionários", path: "/funcionarios" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

// Lista de secretarias
const secretariasItems = [
  { icon: DollarSign, label: "Financeiro", path: "/financeiro" },
  { icon: FileText, label: "Relatórios Financeiros", path: "/financeiro/relatorios" },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [secretariasOpen, setSecretariasOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  // Verificar se alguma rota das secretarias está ativa para expandir automaticamente
  const isSecretariaRouteActive = secretariasItems.some(
    item => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
  );

  // Expandir automaticamente o menu de secretarias se uma rota de secretaria estiver ativa
  useState(() => {
    if (isSecretariaRouteActive) {
      setSecretariasOpen(true);
    }
  });

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
          {/* Menu principal */}
          {mainMenuItems.map((item) => (
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

          {/* Submenu de Secretarias */}
          <Collapsible
            open={secretariasOpen && !collapsed}
            onOpenChange={setSecretariasOpen}
            className={cn(
              "w-full",
              collapsed && "hidden" // Esconde o componente quando colapsado
            )}
          >
            <CollapsibleTrigger
              className={cn(
                "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-left",
                "hover:bg-muted",
                isSecretariaRouteActive ? "text-primary font-medium" : "text-gray-700",
              )}
            >
              <div className="flex items-center">
                <Building2 size={20} />
                <span className="ml-3">Secretarias</span>
              </div>
              {secretariasOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 space-y-1 mt-1">
              {secretariasItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-2 rounded-lg transition-colors",
                    "hover:bg-muted",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700"
                  )}
                >
                  <item.icon size={18} />
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Versão com ícones quando a sidebar estiver colapsada */}
          {collapsed && (
            <div>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full flex justify-center py-3 rounded-lg transition-colors",
                  isSecretariaRouteActive ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-muted"
                )}
                onClick={() => {
                  setCollapsed(false);
                  setSecretariasOpen(true);
                }}
              >
                <Building2 size={20} />
              </Button>
            </div>
          )}
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
