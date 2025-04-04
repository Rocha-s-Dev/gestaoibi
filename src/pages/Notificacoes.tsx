import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types/messaging";
import { useToast } from "@/hooks/use-toast";

// Define Supabase URL and key
const SUPABASE_URL = "https://rdxrwxjypqsyasunupqs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeHJ3eGp5cHFzeWFzdW51cHFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MDkwMjAsImV4cCI6MjA1NDI4NTAyMH0.ULExBcjgLWCpdpuwR9qiBhAChOtJFiZfsKp3K2qE4zo";

const Notificacoes = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchNotifications();
    }
  }, [session]);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    
    try {
      setLoading(true);
      
      // Use direct fetch with the REST API
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/notifications?user_id=eq.${session.user.id}&order=created_at.desc`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setNotifications(data as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      // Use direct fetch with REST API
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/notifications?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
        `${SUPABASE_URL}/rest/v1/notifications?id=in.(${unreadIds.join(',')})`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
    <Layout>
      <div className="p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Notificações</h1>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Todas as notificações</CardTitle>
              {notifications.some(n => !n.read_at) && (
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={markAllAsRead}
                >
                  Marcar todas como lidas
                </button>
              )}
            </CardHeader>
            <CardContent>
              <NotificationsList 
                notifications={notifications} 
                loading={loading} 
                onMarkAsRead={markAsRead}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Notificacoes;
