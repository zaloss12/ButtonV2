import { Gift, X, Calendar, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface DailyBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onBonusClaimed: () => void;
}

export default function DailyBonusModal({ isOpen, onClose, userId, onBonusClaimed }: DailyBonusModalProps) {
  const [dailyBonus, setDailyBonus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchDailyBonus();
    }
  }, [isOpen, userId]);

  const fetchDailyBonus = async () => {
    try {
      const response = await fetch(`/api/daily-bonus/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDailyBonus(data);
      }
    } catch (error) {
      console.error('Failed to fetch daily bonus:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyBonus = async () => {
    try {
      const response = await fetch(`/api/daily-bonus/claim/${userId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Ежедневный бонус получен!",
          description: `Получено: ${data.bonusAmount} кликов и ${data.resetBonus} сбросов`,
        });
        onBonusClaimed();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to claim daily bonus:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить ежедневный бонус",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="game-card rounded-2xl max-w-md w-full border border-green-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Gift className="mr-2" size={20} />
              Ежедневный бонус
            </h2>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-300">Загрузка...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-green-400" size={32} />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  День {dailyBonus?.streakDay || 1}
                </h3>
                
                <p className="text-gray-300 mb-6">
                  Ваша серия: {dailyBonus?.streakDay || 1} дней подряд
                </p>

                <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                  <div className="text-2xl font-bold text-green-400 mb-2">
                    +{dailyBonus?.bonusAmount || 50} кликов
                  </div>
                  <div className="text-lg text-yellow-400">
                    +{dailyBonus?.resetBonus || 2} сбросов
                  </div>
                  {dailyBonus?.streakBonus && (
                    <div className="text-sm text-purple-400 mt-2">
                      Бонус серии: +{dailyBonus.streakBonus}%
                    </div>
                  )}
                </div>

                {dailyBonus?.canClaim ? (
                  <button
                    onClick={claimDailyBonus}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    <Gift className="inline mr-2" size={16} />
                    Получить бонус
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="inline-flex items-center text-gray-400 bg-gray-700 px-4 py-2 rounded-lg">
                      <Check className="mr-2" size={16} />
                      Уже получено на сегодня
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Следующий бонус через: {dailyBonus?.nextBonusIn || '24:00:00'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}