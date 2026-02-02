
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
  FileText,
  CalendarClock,
  ShoppingCart,
  Factory,
  Building,
  Leaf,
  Heart,
  Palette,
  MapPin,
  HardHat,
  Wrench,
  Stethoscope,
  Hospital,
  UserCheck,
  Scale,
  Eye,
  GraduationCap,
  UserCog,
  Shield,
  Landmark,
  Car,
  Tractor,
  Route,
  Handshake
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
  { icon: UserCog, label: "RH e Permissões", path: "/admin/rh" },
  { icon: Shield, label: "Auditoria", path: "/admin/auditoria" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
];

// Lista de secretarias
const secretariasItems = [
  // Secretaria de Administração e Finanças
  { 
    icon: DollarSign, 
    label: "Financeiro", 
    path: "/financeiro",
    submenu: [
      { icon: Landmark, label: "Gestão Financeira Pública", path: "/gestao-financeira-publica" },
      { icon: Scale, label: "Arrecadação Tributária", path: "/arrecadacao-tributaria" },
      { icon: FileText, label: "Relatórios Financeiros", path: "/financeiro/relatorios" },
      { icon: CalendarClock, label: "Pagamentos de Contratos", path: "/contratos/pagamentos" },
      { icon: ShoppingCart, label: "Compras e Licitações", path: "/compras/licitacoes" },
    ]
  },
  // Secretaria de Desenvolvimento Econômico e Meio Ambiente
  {
    icon: Factory,
    label: "Meio Ambiente",
    path: "/desenvolvimento",
    submenu: [
      { icon: Building, label: "Gestão de Empreendimentos", path: "/desenvolvimento/empresas" },
      { icon: Leaf, label: "Gestão Ambiental", path: "/desenvolvimento/ambiental" },
    ]
  },
  // Secretaria de Desenvolvimento Social
  {
    icon: Heart,
    label: "Desenvolvimento Social",
    path: "/social",
    submenu: [
      { icon: Users, label: "Gestão de Programas Sociais", path: "/social/programas" },
    ]
  },
  // Secretaria de Cultura, Esporte e Lazer
  {
    icon: Palette,
    label: "Cultura, Esporte e Lazer",
    path: "/cultura",
    submenu: [
      { icon: FileText, label: "Gestão de Projetos e Eventos", path: "/cultura/projetos" },
      { icon: Target, label: "Programas de Incentivo", path: "/cultura/incentivos" },
      { icon: MapPin, label: "Infraestrutura Cultural", path: "/cultura/infraestrutura" },
      { icon: Route, label: "Turismo e Roteiros", path: "/turismo-cultura" },
    ]
  },
  // Secretaria de Transportes e Trânsito
  {
    icon: Car,
    label: "Transportes e Trânsito",
    path: "/transportes",
    submenu: []
  },
  // Secretaria de Agricultura
  {
    icon: Tractor,
    label: "Agricultura",
    path: "/agricultura",
    submenu: []
  },
  // Secretaria Municipal de Infraestrutura e Serviços Públicos
  {
    icon: HardHat,
    label: "Infraestrutura e Serviços",
    path: "/infraestrutura",
    submenu: [
      { icon: Building, label: "Gestão de Obras", path: "/infraestrutura/obras" },
      { icon: Wrench, label: "Manutenção", path: "/infraestrutura/manutencao" },
    ]
  },
  // Secretaria Municipal de Saúde
  {
    icon: Stethoscope,
    label: "Saúde",
    path: "/saude",
    submenu: [
      { icon: Hospital, label: "Gestão de Saúde Pública", path: "/saude/gestao" },
      { icon: UserCheck, label: "Atendimento ao Paciente", path: "/saude/atendimento" },
    ]
  },
  // Secretaria Municipal de Educação
  {
    icon: GraduationCap,
    label: "Educação",
    path: "/educacao",
    submenu: [
      { icon: Users, label: "Gestão Administrativa", path: "/educacao/gestao" },
    ]
  },
  // Secretaria de Governo
  {
    icon: Scale,
    label: "Governo",
    path: "/governo",
    submenu: [
      { icon: FileText, label: "Gestão de Políticas Públicas", path: "/governo/politicas" },
      { icon: Eye, label: "Transparência", path: "/governo/transparencia" },
    ]
  },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSecretarias, setOpenSecretarias] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { signOut } = useAuth();

  // Verificar se alguma rota das secretarias está ativa para expandir automaticamente
  const isSecretariaRouteActive = secretariasItems.some(
    item => location.pathname === item.path || 
    location.pathname.startsWith(`${item.path}/`) || 
    (item.submenu && item.submenu.some(subItem => location.pathname === subItem.path || location.pathname.startsWith(`${subItem.path}/`)))
  );

  // Expandir automaticamente o menu de secretarias se uma rota de secretaria estiver ativa
  useState(() => {
    if (isSecretariaRouteActive) {
      setOpenSecretarias(true);
      
      // Check which submenu should be open
      secretariasItems.forEach(item => {
        if (item.submenu) {
          const isActive = item.submenu.some(
            subItem => location.pathname === subItem.path || location.pathname.startsWith(`${subItem.path}/`)
          );
          if (isActive) {
            setOpenSubmenus(prev => ({ ...prev, [item.label]: true }));
          }
        }
      });
    }
  });

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

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
            open={openSecretarias && !collapsed}
            onOpenChange={setOpenSecretarias}
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
              {openSecretarias ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 space-y-1 mt-1">
              {secretariasItems.map((item) => (
                <div key={item.path} className="mb-1">
                  {/* Secretaria com submenu */}
                  {item.submenu ? (
                    <Collapsible
                      open={openSubmenus[item.label]}
                      onOpenChange={() => toggleSubmenu(item.label)}
                    >
                      <CollapsibleTrigger
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors text-left",
                          "hover:bg-muted",
                          item.submenu.some(subItem => location.pathname === subItem.path || location.pathname.startsWith(`${subItem.path}/`))
                            ? "text-primary font-medium"
                            : "text-gray-700"
                        )}
                      >
                        <div className="flex items-center">
                          <item.icon size={18} />
                          <span className="ml-3">{item.label}</span>
                        </div>
                        {openSubmenus[item.label] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-6 space-y-1 mt-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={cn(
                              "flex items-center px-4 py-2 rounded-lg transition-colors",
                              "hover:bg-muted",
                              location.pathname === subItem.path || location.pathname.startsWith(`${subItem.path}/`)
                                ? "bg-primary text-primary-foreground"
                                : "text-gray-700"
                            )}
                          >
                            <subItem.icon size={16} />
                            <span className="ml-3">{subItem.label}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    /* Secretaria sem submenu */
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center px-4 py-2 rounded-lg transition-colors",
                        "hover:bg-muted",
                        location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)
                          ? "bg-primary text-primary-foreground"
                          : "text-gray-700"
                      )}
                    >
                      <item.icon size={18} />
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  )}
                </div>
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
                  setOpenSecretarias(true);
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
