import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, AlertTriangle, Info, MessageSquare, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotificacoesEducacionais, NotificacaoEducacional } from "@/hooks/useNotificacoesEducacionais";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const tipoConfig: Record<NotificacaoEducacional['tipo'], { icon: React.ReactNode; color: string; bgColor: string }> = {
  alerta_critico: { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  alerta_warning: { 
    icon: <AlertTriangle className="h-4 w-4" />, 
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  comunicado: { 
    icon: <MessageSquare className="h-4 w-4" />, 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  lembrete: { 
    icon: <Clock className="h-4 w-4" />, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  },
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notificacoes, naoLidas, loading, tableExists, marcarComoLida, marcarTodasComoLidas } = useNotificacoesEducacionais();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNotificationClick = async (notificacao: NotificacaoEducacional) => {
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
    }
  };

  if (!tableExists) {
    return null; // Don't show bell if table doesn't exist
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />
        {naoLidas > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs"
          >
            {naoLidas > 99 ? '99+' : naoLidas}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Notificações</h3>
              {naoLidas > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {naoLidas} nova{naoLidas > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {naoLidas > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={marcarTodasComoLidas}
                  className="text-xs h-7"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Ler todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[400px]">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <div className="animate-pulse">Carregando...</div>
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Nenhuma notificação</p>
                <p className="text-sm">Você será notificado sobre alertas importantes</p>
              </div>
            ) : (
              <div>
                {notificacoes.map((notificacao, index) => {
                  const config = tipoConfig[notificacao.tipo];
                  return (
                    <div key={notificacao.id}>
                      <button
                        onClick={() => handleNotificationClick(notificacao)}
                        className={cn(
                          "w-full text-left p-4 hover:bg-accent/50 transition-colors",
                          !notificacao.lida && "bg-accent/30"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn("p-2 rounded-full shrink-0", config.bgColor)}>
                            <span className={config.color}>{config.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn(
                                "font-medium text-sm truncate",
                                !notificacao.lida && "font-semibold"
                              )}>
                                {notificacao.titulo}
                              </p>
                              {!notificacao.lida && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                              {notificacao.mensagem}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notificacao.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      </button>
                      {index < notificacoes.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div className="p-2 border-t bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // Could navigate to full notifications page
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
