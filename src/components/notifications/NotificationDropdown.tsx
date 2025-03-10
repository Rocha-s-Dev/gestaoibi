
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NotificationItem } from "./NotificationItem";
import { Notification } from "@/types/messaging";
import { useToast } from "@/hooks/use-toast";

export const NotificationDropdown = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
      
      // Subscribe to changes in notifications table
      const subscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [session]);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      
      // Use direct fetch with the REST API to bypass TypeScript restrictions
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?user_id=eq.${session.user.id}&order=created_at.desc&limit=20`,
        {
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data as Notification[]);
      
      // Count unread notifications
      const unread = data?.filter((n: any) => !n.read_at).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Use direct fetch with REST API
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ 
            read_at: new Date().toISOString() 
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar notificação como lida",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!session?.user || notifications.length === 0) return;
    
    try {
      // Get IDs of unread notifications
      const unreadIds = notifications
        .filter(n => !n.read_at)
        .map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      // Use direct fetch with REST API and in filter
      const response = await fetch(
        `${supabase.supabaseUrl}/rest/v1/notifications?id=in.(${unreadIds.join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ 
            read_at: new Date().toISOString() 
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          !n.read_at ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar notificações como lidas",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-7"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-20">
              <p className="text-sm text-gray-500">Carregando...</p>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))
          ) : (
            <div className="flex justify-center items-center h-20">
              <p className="text-sm text-gray-500">Nenhuma notificação</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
