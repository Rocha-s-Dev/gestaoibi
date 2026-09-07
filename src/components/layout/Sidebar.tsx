
import { useState, useEffect } from "react";
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
  Gavel,
  Crown,
  BookOpen,
  ClipboardList,
  Boxes

} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSecretariaContext } from "@/contexts/SecretariaContext";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Menu principal (sempre visível para quem tem acesso)
const mainMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Target, label: "Metas", path: "/metas" },
  { icon: BarChart, label: "Acompanhamento", path: "/acompanhamento-metas" },
  { icon: MessageSquare, label: "Mensagens", path: "/mensagens" },
  { icon: Bell, label: "Notificações", path: "/notificacoes" },
];

// Itens administrativos (admin_municipal, gestor_rh, auditor)
const adminMenuItems = [
  { icon: UserCog, label: "RH e Permissões", path: "/admin/rh" },
  { icon: Shield, label: "Auditoria", path: "/admin/auditoria" },
  { icon: Gavel, label: "Controladoria/Jurídico", path: "/controladoria" },
  { icon: Crown, label: "Gabinete do Prefeito", path: "/gabinete-prefeito" },
];

// Mapeamento: sigla da secretaria → itens de menu
// A sigla é usada como chave para mapear secretarias do banco aos menus
type SecretariaMenuConfig = {
  sigla: string;
  icon: any;
  label: string;
  basePath: string;
  submenu: { icon: any; label: string; path: string }[];
};

const secretariaMenuConfigs: SecretariaMenuConfig[] = [
  {
    sigla: "SMF",
    icon: DollarSign,
    label: "Financeiro",
    basePath: "/financeiro",
    submenu: [
      { icon: Landmark, label: "Gestão Financeira Pública", path: "/gestao-financeira-publica" },
      { icon: Scale, label: "Arrecadação Tributária", path: "/arrecadacao-tributaria" },
      { icon: FileText, label: "Relatórios Financeiros", path: "/financeiro/relatorios" },
      { icon: CalendarClock, label: "Pagamentos de Contratos", path: "/contratos/pagamentos" },
      { icon: ShoppingCart, label: "Compras e Licitações", path: "/compras/licitacoes" },
    ],
  },
  {
    sigla: "SMMA",
    icon: Factory,
    label: "Meio Ambiente",
    basePath: "/desenvolvimento",
    submenu: [
      { icon: Building, label: "Gestão de Empreendimentos", path: "/desenvolvimento/empresas" },
      { icon: Leaf, label: "Gestão Ambiental", path: "/desenvolvimento/ambiental" },
    ],
  },
  {
    sigla: "SMDS",
    icon: Heart,
    label: "Desenvolvimento Social",
    basePath: "/social",
    submenu: [
      { icon: Users, label: "Gestão de Programas Sociais", path: "/social/programas" },
    ],
  },
  {
    sigla: "SMCEL",
    icon: Palette,
    label: "Cultura, Esporte e Lazer",
    basePath: "/cultura",
    submenu: [
      { icon: FileText, label: "Gestão de Projetos e Eventos", path: "/cultura/projetos" },
      { icon: Target, label: "Programas de Incentivo", path: "/cultura/incentivos" },
      { icon: MapPin, label: "Infraestrutura Cultural", path: "/cultura/infraestrutura" },
      { icon: Route, label: "Turismo e Roteiros", path: "/turismo-cultura" },
    ],
  },
  {
    sigla: "SMTT",
    icon: Car,
    label: "Transportes e Trânsito",
    basePath: "/transportes",
    submenu: [],
  },
  {
    sigla: "SMAPA",
    icon: Tractor,
    label: "Agricultura",
    basePath: "/agricultura",
    submenu: [],
  },
  {
    sigla: "SMISP",
    icon: HardHat,
    label: "Infraestrutura e Serviços",
    basePath: "/infraestrutura",
    submenu: [
      { icon: Building, label: "Gestão de Obras", path: "/infraestrutura/obras" },
      { icon: Wrench, label: "Manutenção", path: "/infraestrutura/manutencao" },
      { icon: Boxes, label: "Patrimônio", path: "/patrimonio" },

    ],
  },
  {
    sigla: "SMS",
    icon: Stethoscope,
    label: "Saúde",
    basePath: "/saude",
    submenu: [
      { icon: Hospital, label: "Gestão de Saúde Pública", path: "/saude/gestao" },
      { icon: UserCheck, label: "Atendimento ao Paciente", path: "/saude/atendimento" },
    ],
  },
  {
    sigla: "SME",
    icon: GraduationCap,
    label: "Educação",
    basePath: "/educacao",
    submenu: [
      { icon: Users, label: "Gestão Administrativa", path: "/educacao/gestao" },
      { icon: BookOpen, label: "Coordenação Pedagógica", path: "/educacao/coordenacao" },
      { icon: ClipboardList, label: "Sistema Acadêmico", path: "/educacao/academico" },
    ],
  },
  {
    sigla: "SMG",
    icon: Scale,
    label: "Governo",
    basePath: "/governo",
    submenu: [
      { icon: FileText, label: "Gestão de Políticas Públicas", path: "/governo/politicas" },
      { icon: Eye, label: "Transparência", path: "/governo/transparencia" },
      { icon: MessageSquare, label: "Ouvidoria Municipal", path: "/governo/ouvidoria" },
    ],
  },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSecretarias, setOpenSecretarias] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { signOut } = useAuth();
  const { secretariasDisponiveis, isAdmin, isPrefeito, isGestorRH, loading } = useSecretariaContext();

  // Admin e Prefeito veem tudo; gestor_rh não vê secretarias
  const hasFullAccess = isAdmin || isPrefeito;
  const visibleSecretariaMenus = hasFullAccess
    ? secretariaMenuConfigs
    : isGestorRH
      ? [] // gestor_rh não tem acesso a secretarias
      : secretariaMenuConfigs.filter((config) =>
          secretariasDisponiveis.some((s) => s.sigla === config.sigla)
        );

  // Verificar se alguma rota das secretarias está ativa
  const isSecretariaRouteActive = visibleSecretariaMenus.some(
    (item) =>
      location.pathname === item.basePath ||
      location.pathname.startsWith(`${item.basePath}/`) ||
      item.submenu.some(
        (sub) =>
          location.pathname === sub.path ||
          location.pathname.startsWith(`${sub.path}/`)
      )
  );

  // Expandir automaticamente o menu se uma rota de secretaria estiver ativa
  useEffect(() => {
    if (isSecretariaRouteActive) {
      setOpenSecretarias(true);
      visibleSecretariaMenus.forEach((item) => {
        if (item.submenu.length > 0) {
          const isActive = item.submenu.some(
            (sub) =>
              location.pathname === sub.path ||
              location.pathname.startsWith(`${sub.path}/`)
          );
          if (isActive) {
            setOpenSubmenus((prev) => ({ ...prev, [item.label]: true }));
          }
        }
      });
    }
  }, [location.pathname]);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div
      className={cn(
        "h-screen bg-background border-r border-border transition-all duration-300 relative flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex-1 overflow-y-auto">
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
                  : "text-muted-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            </Link>
          ))}

          {/* Itens administrativos (admin, RH, auditoria, prefeito) */}
          {(isAdmin || isPrefeito || isGestorRH) &&
            adminMenuItems
              .filter((item) => {
                // Gestor RH only sees RH module
                if (isGestorRH && !isAdmin && !isPrefeito) {
                  return item.path === "/admin/rh";
                }
                // Prefeito and Admin see everything
                return true;
              })
              .map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg transition-colors",
                  "hover:bg-muted",
                  location.pathname === item.path ||
                    location.pathname.startsWith(`${item.path}/`)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon size={20} className="shrink-0" />
                {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
              </Link>
            ))}

          {/* Submenu de Secretarias */}
          {visibleSecretariaMenus.length > 0 && (
            <>
              <Collapsible
                open={openSecretarias && !collapsed}
                onOpenChange={setOpenSecretarias}
                className={cn("w-full", collapsed && "hidden")}
              >
                <CollapsibleTrigger
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors text-left",
                    "hover:bg-muted",
                    isSecretariaRouteActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                   <div className="flex items-center min-w-0">
                     <Building2 size={20} className="shrink-0" />
                     <span className="ml-3 truncate">Secretarias</span>
                  </div>
                  {openSecretarias ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {visibleSecretariaMenus.map((item) => (
                    <div key={item.basePath} className="mb-1">
                      {item.submenu.length > 0 ? (
                        <Collapsible
                          open={openSubmenus[item.label]}
                          onOpenChange={() => toggleSubmenu(item.label)}
                        >
                          <CollapsibleTrigger
                            className={cn(
                              "flex items-center justify-between w-full px-4 py-2 rounded-lg transition-colors text-left",
                              "hover:bg-muted",
                              item.submenu.some(
                                (sub) =>
                                  location.pathname === sub.path ||
                                  location.pathname.startsWith(`${sub.path}/`)
                              )
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                            )}
                          >
                            <div className="flex items-center min-w-0">
                              <item.icon size={18} className="shrink-0" />
                              <span className="ml-3 truncate">{item.label}</span>
                            </div>
                            {openSubmenus[item.label] ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 space-y-1 mt-1">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={cn(
                                  "flex items-center px-4 py-2 rounded-lg transition-colors",
                                  "hover:bg-muted",
                                  location.pathname === subItem.path ||
                                    location.pathname.startsWith(
                                      `${subItem.path}/`
                                    )
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                <subItem.icon size={16} className="shrink-0" />
                                <span className="ml-3 truncate">{subItem.label}</span>
                              </Link>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <Link
                          to={item.basePath}
                          className={cn(
                            "flex items-center px-4 py-2 rounded-lg transition-colors",
                            "hover:bg-muted",
                            location.pathname === item.basePath ||
                              location.pathname.startsWith(`${item.basePath}/`)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          <item.icon size={18} className="shrink-0" />
                          <span className="ml-3 truncate">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Ícone quando colapsado */}
              {collapsed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "w-full flex justify-center py-3 rounded-lg transition-colors",
                    isSecretariaRouteActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => {
                    setCollapsed(false);
                    setOpenSecretarias(true);
                  }}
                >
                  <Building2 size={20} />
                </Button>
              )}
            </>
          )}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <NotificationDropdown />
          <Button
            variant="ghost"
            className={cn(
              "flex-1 text-destructive hover:text-destructive hover:bg-destructive/10",
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
