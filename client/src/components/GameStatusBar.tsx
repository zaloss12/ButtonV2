import { Circle, FolderSync, Monitor, Smartphone } from "lucide-react";

interface GameStatusBarProps {
  isConnected: boolean;
  platform: 'web' | 'telegram';
}

export default function GameStatusBar({ isConnected, platform }: GameStatusBarProps) {
  const lastSync = new Date().toLocaleTimeString();

  return (
    <div className="fixed bottom-0 left-0 right-0 game-card border-t border-gray-700 px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-gray-300">
        <div className="flex items-center space-x-4">
          <div>
            <Circle 
              className={`inline mr-1 ${isConnected ? 'text-[var(--game-success)]' : 'text-red-400'}`} 
              size={12} 
              fill="currentColor"
            />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div>
            <FolderSync className="inline mr-1" size={12} />
            <span>Synced {lastSync}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div>
            {platform === 'web' ? (
              <Monitor className="inline mr-1" size={12} />
            ) : (
              <Smartphone className="inline mr-1" size={12} />
            )}
            <span>{platform === 'web' ? 'Web App' : 'Telegram Mini App'}</span>
          </div>
          <div>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
