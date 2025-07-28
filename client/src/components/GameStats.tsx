import { MousePointer, RotateCcw, Percent, Crown, Star } from "lucide-react";
import { calculateResetChance } from "../../../server/services/gameLogic";

interface GameStatsProps {
  gameState: any;
}

export default function GameStats({ gameState }: GameStatsProps) {
  if (!gameState) return null;

  const resetChance = calculateResetChance(
    gameState.currentNumber, 
    gameState.resetChanceReduction
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="game-card rounded-xl p-6 text-center border border-gray-700">
          <div className="text-3xl font-bold game-success mb-2">
            {gameState.totalClicks?.toLocaleString() || 0}
          </div>
          <div className="text-gray-300 font-medium">
            <MousePointer className="inline mr-2" size={16} />
            Всего кликов
          </div>
        </div>
        
        <div className="game-card rounded-xl p-6 text-center border border-gray-700">
          <div className="text-3xl font-bold game-warning mb-2">
            {gameState.totalResets?.toLocaleString() || 0}
          </div>
          <div className="text-gray-300 font-medium">
            <RotateCcw className="inline mr-2" size={16} />
            Всего сбросов
          </div>
        </div>
        
        <div className="game-card rounded-xl p-6 text-center border border-gray-700">
          <div className="text-2xl font-bold game-accent mb-2">
            {(resetChance * 100).toFixed(1)}%
          </div>
          <div className="text-gray-300 font-medium">
            <Percent className="inline mr-2" size={16} />
            Шанс сброса
          </div>
        </div>
      </div>

      {/* Престиж и рекорды */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="game-card rounded-xl p-6 text-center border border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-amber-500/5">
          <div className="text-3xl font-bold text-yellow-400 mb-2">
            {gameState.prestigeLevel || 0}
          </div>
          <div className="text-gray-300 font-medium">
            <Crown className="inline mr-2" size={16} />
            Уровень престижа
          </div>
          {(gameState.prestigePoints || 0) > 0 && (
            <div className="text-sm text-yellow-300 mt-1">
              {gameState.prestigePoints} очков престижа
            </div>
          )}
        </div>

        <div className="game-card rounded-xl p-6 text-center border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
          <div className="text-3xl font-bold text-purple-400 mb-2">
            {gameState.maxNumber?.toLocaleString() || 0}
          </div>
          <div className="text-gray-300 font-medium">
            <Star className="inline mr-2" size={16} />
            Максимальное число
          </div>
        </div>
      </div>
    </div>
  );
}
