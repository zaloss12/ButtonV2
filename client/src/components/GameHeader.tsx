import { FolderSync, MousePointer, UserCircle } from "lucide-react";

interface GameHeaderProps {
  username: string;
  isConnected: boolean;
}

export default function GameHeader({ username, isConnected }: GameHeaderProps) {
  const handleSync = () => {
    window.location.reload();
  };

  return (
    <header className="game-card shadow-lg border-b border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold game-accent">
            <MousePointer className="inline mr-2" size={24} />
            Button Clicker
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-300">
              <UserCircle className="inline mr-1" size={16} />
              <span>{username}</span>
            </div>
            <button 
              onClick={handleSync}
              className="game-button hover:bg-blue-600 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <FolderSync className="inline mr-1" size={14} />
              FolderSync
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
