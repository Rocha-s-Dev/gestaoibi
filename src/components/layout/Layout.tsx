import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { SecretariaSelector } from "@/components/secretaria/SecretariaSelector";
import { SecretariaBadge } from "@/components/secretaria/SecretariaBadge";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com seletor de secretaria e notificações */}
        <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 shrink-0">
          <SecretariaBadge showFullName={false} />
          <div className="flex items-center gap-3">
            <SecretariaSelector />
            <NotificationDropdown />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
