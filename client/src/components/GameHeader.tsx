import { FolderSync, MousePointer, UserCircle, Crown, Trophy, Gift, Star } from "lucide-react";

interface GameHeaderProps {
  username: string;
  isConnected: boolean;
  onOpenPrestige?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenDailyBonus?: () => void;
  onOpenAchievements?: () => void;
}

export default function GameHeader({ username, isConnected, onOpenPrestige, onOpenLeaderboard, onOpenDailyBonus, onOpenAchievements }: GameHeaderProps) {
  const handleSync = () => {
    window.location.reload();
  };

  return (
    <header className="game-card shadow-lg border-b border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold game-accent">
            <MousePointer className="inline mr-2" size={24} />
            Кликер Кнопки
          </h1>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-300">
              <UserCircle className="inline mr-1" size={16} />
              <span>{username}</span>
            </div>
            <button 
              onClick={onOpenPrestige}
              className="game-button hover:bg-yellow-600 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Crown className="inline mr-1" size={14} />
              Престиж
            </button>
            <button 
              onClick={onOpenLeaderboard}
              className="game-button hover:bg-purple-600 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Trophy className="inline mr-1" size={14} />
              Лидеры
            </button>
            <button 
              onClick={onOpenDailyBonus}
              className="game-button hover:bg-green-600 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Gift className="inline mr-1" size={14} />
              Бонус
            </button>
            <button 
              onClick={onOpenAchievements}
              className="game-button hover:bg-indigo-600 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Star className="inline mr-1" size={14} />
              Достижения
            </button>
            <button 
              onClick={handleSync}
              className="game-button hover:bg-blue-600 px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <FolderSync className="inline mr-1" size={14} />
              Синхр
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
