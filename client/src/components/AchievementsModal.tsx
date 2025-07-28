import { Trophy, X, Star, Lock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  gameState: any;
}

export default function AchievementsModal({ isOpen, onClose, userId, gameState }: AchievementsModalProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchAchievements();
    }
  }, [isOpen, userId]);

  const fetchAchievements = async () => {
    try {
      const [achievementsRes, userAchievementsRes] = await Promise.all([
        fetch('/api/achievements'),
        fetch(`/api/achievements/user/${userId}`)
      ]);
      
      if (achievementsRes.ok && userAchievementsRes.ok) {
        const [achievementsData, userAchievementsData] = await Promise.all([
          achievementsRes.json(),
          userAchievementsRes.json()
        ]);
        
        setAchievements(achievementsData);
        setUserAchievements(userAchievementsData);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasAchievement = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievementId === achievementId);
  };

  const canUnlockAchievement = (achievement: any) => {
    if (!gameState) return false;
    
    return gameState.totalClicks >= achievement.requiredClicks &&
           gameState.totalResets >= achievement.requiredResets &&
           (gameState.maxNumber || 0) >= achievement.requiredMaxNumber;
  };

  if (!isOpen) return null;

  const defaultAchievements = [
    {
      id: '1',
      name: 'Первые шаги',
      description: 'Сделайте 10 кликов',
      requiredClicks: 10,
      requiredResets: 0,
      requiredMaxNumber: 0,
      reward: '+5 кликов',
      icon: '🎯'
    },
    {
      id: '2', 
      name: 'Кликер-новичок',
      description: 'Сделайте 100 кликов',
      requiredClicks: 100,
      requiredResets: 0,
      requiredMaxNumber: 0,
      reward: '+25 кликов',
      icon: '👆'
    },
    {
      id: '3',
      name: 'Первый сброс',
      description: 'Испытайте первый сброс',
      requiredClicks: 0,
      requiredResets: 1,
      requiredMaxNumber: 0,
      reward: '+10 кликов',
      icon: '🔄'
    },
    {
      id: '4',
      name: 'Высотник',
      description: 'Достигните числа 50',
      requiredClicks: 0,
      requiredResets: 0,
      requiredMaxNumber: 50,
      reward: '+50 кликов',
      icon: '⬆️'
    },
    {
      id: '5',
      name: 'Упорство',
      description: 'Переживите 10 сбросов',
      requiredClicks: 0,
      requiredResets: 10,
      requiredMaxNumber: 0,
      reward: '+100 кликов, +2 сброса',
      icon: '💪'
    },
    {
      id: '6',
      name: 'Мастер кликов',
      description: 'Сделайте 1000 кликов',
      requiredClicks: 1000,
      requiredResets: 0,
      requiredMaxNumber: 0,
      reward: '+200 кликов',
      icon: '🏆'
    },
    {
      id: '7',
      name: 'Покоритель вершин',
      description: 'Достигните числа 100',
      requiredClicks: 0,
      requiredResets: 0,
      requiredMaxNumber: 100,
      reward: '+500 кликов',
      icon: '🏔️'
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="game-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="mr-2" size={24} />
              Достижения
            </h2>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Загрузка достижений...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultAchievements.map((achievement) => {
                  const isUnlocked = hasAchievement(achievement.id);
                  const canUnlock = canUnlockAchievement(achievement);
                  
                  return (
                    <div 
                      key={achievement.id} 
                      className={`
                        p-4 rounded-xl border transition-all duration-300
                        ${isUnlocked 
                          ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/50 shadow-lg' 
                          : canUnlock
                            ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-400/50'
                            : 'bg-gray-800/30 border-gray-700'
                        }
                      `}
                    >
                      <div className="text-center mb-3">
                        <div className={`text-4xl mb-2 ${isUnlocked ? 'filter-none' : 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <h3 className={`font-semibold ${isUnlocked ? 'text-yellow-400' : 'text-white'}`}>
                          {achievement.name}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-gray-300 text-center mb-3">
                        {achievement.description}
                      </p>
                      
                      <div className="text-xs text-center space-y-1 mb-3">
                        {achievement.requiredClicks > 0 && (
                          <div className={`${(gameState?.totalClicks || 0) >= achievement.requiredClicks ? 'text-green-400' : 'text-gray-400'}`}>
                            Клики: {gameState?.totalClicks || 0} / {achievement.requiredClicks}
                          </div>
                        )}
                        {achievement.requiredResets > 0 && (
                          <div className={`${(gameState?.totalResets || 0) >= achievement.requiredResets ? 'text-green-400' : 'text-gray-400'}`}>
                            Сбросы: {gameState?.totalResets || 0} / {achievement.requiredResets}
                          </div>
                        )}
                        {achievement.requiredMaxNumber > 0 && (
                          <div className={`${(gameState?.maxNumber || 0) >= achievement.requiredMaxNumber ? 'text-green-400' : 'text-gray-400'}`}>
                            Макс. число: {gameState?.maxNumber || 0} / {achievement.requiredMaxNumber}
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        {isUnlocked ? (
                          <div className="flex items-center justify-center text-green-400 text-sm">
                            <CheckCircle className="mr-1" size={14} />
                            Получено
                          </div>
                        ) : canUnlock ? (
                          <div className="text-purple-400 text-sm">
                            <Star className="inline mr-1" size={14} />
                            Готово к получению
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            <Lock className="inline mr-1" size={14} />
                            Заблокировано
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-center text-blue-300 mt-2">
                        Награда: {achievement.reward}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}