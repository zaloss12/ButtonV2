import { Trophy, X, Medal, Star, Zap, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LeaderboardType = 'clicks' | 'maxNumber' | 'resets' | 'prestige';

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('clicks');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard', activeTab],
    enabled: isOpen
  });

  if (!isOpen) return null;

  const tabs = [
    { id: 'clicks' as LeaderboardType, label: 'Клики', icon: Zap },
    { id: 'maxNumber' as LeaderboardType, label: 'Макс. число', icon: Star },
    { id: 'resets' as LeaderboardType, label: 'Сбросы', icon: Medal },
    { id: 'prestige' as LeaderboardType, label: 'Престиж', icon: Crown },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="text-yellow-400" size={20} />;
    if (rank === 2) return <Medal className="text-gray-400" size={20} />;
    if (rank === 3) return <Medal className="text-amber-600" size={20} />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  const getStatValue = (entry: any) => {
    switch (activeTab) {
      case 'clicks':
        return entry.gameState.totalClicks.toLocaleString();
      case 'maxNumber':
        return entry.gameState.maxNumber?.toLocaleString() || '0';
      case 'resets':
        return entry.gameState.totalResets.toLocaleString();
      case 'prestige':
        return `Уровень ${entry.gameState.prestigeLevel || 0}`;
      default:
        return '0';
    }
  };

  const getStatSubValue = (entry: any) => {
    switch (activeTab) {
      case 'clicks':
        return `${entry.gameState.totalResets} сбросов`;
      case 'maxNumber':
        return `${entry.gameState.totalClicks.toLocaleString()} кликов`;
      case 'resets':
        return `${entry.gameState.totalClicks.toLocaleString()} кликов`;
      case 'prestige':
        return `${entry.gameState.prestigePoints || 0} очков`;
      default:
        return '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="game-card rounded-2xl max-w-4xl w-full border border-yellow-500/30 shadow-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 px-6 py-4 border-b border-yellow-500/30 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-yellow-400 flex items-center">
              <Trophy className="mr-2" size={24} />
              Лидерборд
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-800/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 px-4 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2
                    ${activeTab === tab.id 
                      ? 'border-yellow-400 text-yellow-400 bg-yellow-500/10' 
                      : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse text-gray-400">Загрузка...</div>
              </div>
            ) : leaderboard && Array.isArray(leaderboard) && leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((entry: any, index: number) => (
                  <div 
                    key={entry.user.id}
                    className={`
                      p-4 rounded-lg border transition-colors
                      ${index < 3 
                        ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30' 
                        : 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {getRankIcon(index + 1)}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center">
                            {entry.user.telegramId ? (
                              <>
                                <span className="text-blue-400 mr-1">@</span>
                                {entry.user.username.startsWith('tg_') ? 
                                  entry.user.username.replace('tg_', '') : 
                                  entry.user.username
                                }
                                <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                                  TG
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-300">{entry.user.username}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {getStatSubValue(entry)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-400">
                          {getStatValue(entry)}
                        </div>
                        {entry.gameState.prestigeLevel > 0 && (
                          <div className="text-sm text-purple-400 flex items-center gap-1">
                            <Crown size={14} />
                            Престиж {entry.gameState.prestigeLevel}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Пока нет данных для отображения
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}