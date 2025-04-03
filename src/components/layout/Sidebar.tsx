
import {
  LayoutDashboard,
  Settings,
  Users,
  Calendar,
  FileText,
  Target,
  KanbanSquare,
  ListChecks,
  BadgeInfo,
  Mailbox,
  LucideIcon,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface NavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  category: string;
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const links: NavLinkProps[] = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      category: "geral",
    },
    {
      href: "/funcionarios",
      label: "Funcionários",
      icon: Users,
      category: "geral",
    },
    {
      href: "/secretarias",
      label: "Secretarias",
      icon: BadgeInfo,
      category: "geral",
    },
    {
      href: "/cadastro",
      label: "Cadastro",
      icon: Users,
      category: "geral",
    },
    {
      href: "/tarefas",
      label: "Tarefas",
      icon: ListChecks,
      category: "gestao",
    },
    {
      href: "/projetos",
      label: "Projetos",
      icon: KanbanSquare,
      category: "gestao",
    },
    {
      href: "/calendario",
      label: "Calendário",
      icon: Calendar,
      category: "gestao",
    },
    {
      href: "/mensagens",
      label: "Mensagens",
      icon: Mailbox,
      category: "comunicacao",
    },
    {
      href: "/relatorios-financeiros",
      label: "Relatórios",
      icon: FileText,
      category: "financas",
    },
    {
      href: "/metas-financeiras",
      label: "Metas Financeiras",
      icon: Target,
      category: "financas",
    },
    {
      href: "/configuracoes",
      label: "Configurações",
      icon: Settings,
      category: "sistema",
    },
  ];

  return (
    <aside className="border-r flex flex-col h-screen w-64 bg-gray-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold">Painel Admin</h1>
        {user && (
          <p className="text-sm text-gray-500 mt-1">
            Olá, {user.first_name || user.email}
          </p>
        )}
      </div>
      <Separator />
      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map((link) => (
          <div key={link.href}>
            {link.category === "geral" && user?.role === "admin" && (
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${
                    isActive ? "bg-gray-200 font-semibold" : ""
                  }`
                }
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </NavLink>
            )}
            {link.category === "gestao" &&
              (user?.role === "admin" || user?.role === "gestor") && (
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${
                      isActive ? "bg-gray-200 font-semibold" : ""
                    }`
                  }
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </NavLink>
              )}
            {link.category === "comunicacao" &&
              (user?.role === "admin" ||
                user?.role === "gestor" ||
                user?.role === "colaborador") && (
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${
                      isActive ? "bg-gray-200 font-semibold" : ""
                    }`
                  }
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </NavLink>
              )}
            {link.category === "financas" &&
              (user?.role === "admin" || user?.role === "financeiro") && (
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${
                      isActive ? "bg-gray-200 font-semibold" : ""
                    }`
                  }
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </NavLink>
              )}
            {link.category === "sistema" && user?.role === "admin" && (
              <NavLink
                to={link.href}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 ${
                    isActive ? "bg-gray-200 font-semibold" : ""
                  }`
                }
              >
                <link.icon className="mr-2 h-4 w-4" />
                {link.label}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
      {user && (
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center" 
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      )}
    </aside>
  );
}
