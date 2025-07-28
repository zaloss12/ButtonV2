import { MousePointer, RotateCcw, Percent } from "lucide-react";
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="game-card rounded-xl p-6 text-center border border-gray-700">
        <div className="text-3xl font-bold game-success mb-2">
          {gameState.totalClicks?.toLocaleString() || 0}
        </div>
        <div className="text-gray-300 font-medium">
          <MousePointer className="inline mr-2" size={16} />
          Total Clicks
        </div>
      </div>
      
      <div className="game-card rounded-xl p-6 text-center border border-gray-700">
        <div className="text-3xl font-bold game-warning mb-2">
          {gameState.totalResets?.toLocaleString() || 0}
        </div>
        <div className="text-gray-300 font-medium">
          <RotateCcw className="inline mr-2" size={16} />
          Total Resets
        </div>
      </div>
      
      <div className="game-card rounded-xl p-6 text-center border border-gray-700">
        <div className="text-2xl font-bold game-accent mb-2">
          {(resetChance * 100).toFixed(1)}%
        </div>
        <div className="text-gray-300 font-medium">
          <Percent className="inline mr-2" size={16} />
          Reset Chance
        </div>
      </div>
    </div>
  );
}
