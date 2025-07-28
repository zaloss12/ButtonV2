import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

interface TelegramLoginSuggestionProps {
  user: any;
}

export default function TelegramLoginSuggestion({ user }: TelegramLoginSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Only show for web users who haven't linked Telegram
  if (!isVisible || user?.platform !== 'web' || user?.telegramId) {
    return null;
  }

  const handleConnectTelegram = () => {
    // Open Telegram bot in new tab
    window.open('https://t.me/your_bot_username', '_blank');
  };

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-lg border border-blue-500/30 z-40">
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 bg-blue-500 p-2 rounded-full">
          <MessageCircle size={20} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Войдите через Telegram
          </h3>
          <p className="text-xs text-blue-100 mb-3">
            Играйте в Telegram и отображайте свой username в лидерборде!
          </p>
          
          <button
            onClick={handleConnectTelegram}
            className="bg-white text-blue-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-50 transition-colors w-full"
          >
            Открыть в Telegram
          </button>
        </div>
      </div>
    </div>
  );
}