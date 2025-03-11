
import { Notification } from "@/types/messaging";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, MessageSquare, Calendar, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  onMarkAsRead: (id: string) => void;
}

export const NotificationsList = ({ 
  notifications, 
  loading, 
  onMarkAsRead 
}: NotificationsListProps) => {
  const navigate = useNavigate();

  const getIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'deadline':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'goal_alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read_at) {
      onMarkAsRead(notification.id);
    }
    
    // Navigate to the related page if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500">Carregando notificações...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Bell className="h-10 w-10 text-gray-400 mb-2" />
        <p className="text-gray-500">Você não tem notificações</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`py-4 flex items-start hover:bg-gray-50 cursor-pointer ${!notification.read_at ? 'bg-blue-50' : ''}`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="mr-4 mt-1">
            {getIcon(notification)}
          </div>
          <div className="flex-1">
            <h4 className={`text-sm font-medium ${!notification.read_at ? 'font-semibold' : ''}`}>
              {notification.title}
            </h4>
            <p className="text-sm text-gray-600">{notification.content}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(notification.created_at), { 
                addSuffix: true,
                locale: ptBR
              })}
            </p>
          </div>
          {!notification.read_at && (
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2"></div>
          )}
        </div>
      ))}
    </div>
  );
};
