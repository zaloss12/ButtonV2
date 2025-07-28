import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error';
  message: string;
}

export default function GameNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: Notification['type'], message: string) => {
    const id = Date.now().toString();
    const notification = { id, type, message };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  useEffect(() => {
    // Listen for global notification events
    const handleNotification = (event: CustomEvent) => {
      addNotification(event.detail.type, event.detail.message);
    };

    window.addEventListener('gameNotification' as any, handleNotification);
    return () => window.removeEventListener('gameNotification' as any, handleNotification);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300
            ${index === notifications.length - 1 ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            ${notification.type === 'success' ? 'bg-[var(--game-success)]' :
              notification.type === 'warning' ? 'bg-[var(--game-warning)]' :
              'bg-red-500'}
            text-white
          `}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="inline mr-2" size={16} />
          ) : (
            <AlertTriangle className="inline mr-2" size={16} />
          )}
          {notification.message}
        </div>
      ))}
    </div>
  );
}

// Helper function to trigger notifications
export function showNotification(type: 'success' | 'warning' | 'error', message: string) {
  window.dispatchEvent(new CustomEvent('gameNotification', {
    detail: { type, message }
  }));
}
