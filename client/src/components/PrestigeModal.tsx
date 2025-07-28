import { Crown, X, AlertTriangle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  gameState: any;
  onPrestige: () => void;
}

export default function PrestigeModal({ isOpen, onClose, userId, gameState, onPrestige }: PrestigeModalProps) {
  const { toast } = useToast();

  if (!isOpen) return null;

  const calculatePrestigeCost = (level: number) => {
    return Math.floor(100 * Math.pow(1.2, level));
  };

  const calculatePrestigePoints = (level: number) => {
    return level * 10;
  };

  const prestigeCost = calculatePrestigeCost(gameState?.prestigeLevel || 0);
  const canAffordPrestige = (gameState?.totalResets || 0) >= prestigeCost;
  const pointsToGain = calculatePrestigePoints((gameState?.prestigeLevel || 0) + 1);

  const handlePrestige = async () => {
    try {
      const response = await fetch(`/api/game/prestige/${userId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Престиж достигнут!",
          description: `Получено ${data.prestigePointsGained} очков престижа. Добро пожаловать в престиж ${data.gameState.prestigeLevel}!`,
        });
        onPrestige();
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Ошибка престижа",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Prestige failed:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при попытке достичь престижа",
        variant: "destructive"
      });
    }
  };

  const getPrestigeBonus = (level: number) => {
    return {
      clickMultiplier: Math.floor(level * 0.5),
      resetChanceReduction: level * 0.01,
      prestigePointsMultiplier: 1 + (level * 0.1)
    };
  };

  const currentBonus = getPrestigeBonus(gameState?.prestigeLevel || 0);
  const nextBonus = getPrestigeBonus((gameState?.prestigeLevel || 0) + 1);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="game-card rounded-2xl max-w-2xl w-full border border-yellow-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-yellow-900/50 to-amber-900/50 px-6 py-4 border-b border-yellow-500/30 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-yellow-400 flex items-center">
              <Crown className="mr-2" size={24} />
              Престиж
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Current Status */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                Престиж {gameState?.prestigeLevel || 0}
              </div>
              <div className="text-lg text-gray-300">
                Очки престижа: {gameState?.prestigePoints || 0}
              </div>
            </div>

            {/* Current Bonuses */}
            {(gameState?.prestigeLevel || 0) > 0 && (
              <div className="mb-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Текущие бонусы</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-green-400">+{currentBonus.clickMultiplier}</div>
                    <div className="text-gray-300">Множитель кликов</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-blue-400">-{(currentBonus.resetChanceReduction * 100).toFixed(1)}%</div>
                    <div className="text-gray-300">Шанс сброса</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-purple-400">+{((currentBonus.prestigePointsMultiplier - 1) * 100).toFixed(0)}%</div>
                    <div className="text-gray-300">Очки престижа</div>
                  </div>
                </div>
              </div>
            )}

            {/* Prestige Info */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Следующий престиж</h3>
                <div className="text-2xl font-bold text-yellow-400">
                  Престиж {(gameState?.prestigeLevel || 0) + 1}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Стоимость:</span>
                  <span className="font-bold text-red-400">{prestigeCost.toLocaleString()} сбросов</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">У вас:</span>
                  <span className={`font-bold ${canAffordPrestige ? 'text-green-400' : 'text-red-400'}`}>
                    {(gameState?.totalResets || 0).toLocaleString()} сбросов
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Получите очков:</span>
                  <span className="font-bold text-yellow-400">+{pointsToGain}</span>
                </div>
              </div>
            </div>

            {/* Next Level Bonuses */}
            <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-400 mb-3">Новые бонусы</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-400">+{nextBonus.clickMultiplier}</div>
                  <div className="text-gray-300">Множитель кликов</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-400">-{(nextBonus.resetChanceReduction * 100).toFixed(1)}%</div>
                  <div className="text-gray-300">Шанс сброса</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-400">+{((nextBonus.prestigePointsMultiplier - 1) * 100).toFixed(0)}%</div>
                  <div className="text-gray-300">Очки престижа</div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="mb-6 p-4 bg-red-500/10 rounded-lg border border-red-500/30 flex items-start">
              <AlertTriangle className="text-red-400 mr-3 flex-shrink-0 mt-1" size={20} />
              <div className="text-sm text-gray-300">
                <strong className="text-red-400">Внимание!</strong> Престиж сбросит ваш прогресс (число на кнопке, клики), 
                но вы получите постоянные бонусы и очки престижа. Купленные улучшения будут потеряны.
              </div>
            </div>

            {/* Prestige Button */}
            <div className="text-center">
              <button
                onClick={handlePrestige}
                disabled={!canAffordPrestige}
                className={`
                  px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg border-2
                  ${canAffordPrestige 
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 border-yellow-400 text-white hover:scale-105' 
                    : 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Crown className="inline mr-2" size={20} />
                {canAffordPrestige ? 'Достичь престижа' : 'Недостаточно сбросов'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}