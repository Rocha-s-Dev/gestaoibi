
import { Notification } from "@/types/messaging";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Bell, 
  MessageSquare, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem = ({ 
  notification, 
  onMarkAsRead 
}: NotificationItemProps) => {
  const navigate = useNavigate();

  const getIcon = () => {
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

  const handleClick = () => {
    // Mark as read
    onMarkAsRead(notification.id);
    
    // Navigate to the related page if there's a link
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div 
      className={`flex p-3 border-b hover:bg-gray-50 cursor-pointer ${!notification.read_at ? 'bg-blue-50' : ''}`}
      onClick={handleClick}
    >
      <div className="mr-3">
        {getIcon()}
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
    </div>
  );
};
