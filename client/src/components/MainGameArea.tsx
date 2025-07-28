import { useState, useEffect } from "react";
import { Clock, X } from "lucide-react";
import { getRemainingCooldown } from "../../../server/services/gameLogic";

interface MainGameAreaProps {
  gameState: any;
  onButtonClick: () => void;
  onOpenUpgrades: () => void;
}

export default function MainGameArea({ gameState, onButtonClick, onOpenUpgrades }: MainGameAreaProps) {
  const [showRipple, setShowRipple] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    if (!gameState?.lastClick) return;

    const updateCooldown = () => {
      const remaining = getRemainingCooldown(
        new Date(gameState.lastClick), 
        gameState.buttonCooldown || 1.0
      );
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 100);
    return () => clearInterval(interval);
  }, [gameState?.lastClick, gameState?.buttonCooldown]);

  const handleButtonClick = () => {
    if (cooldownRemaining > 0) return;
    
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 300);
    onButtonClick();
  };

  const isOnCooldown = cooldownRemaining > 0;

  return (
    <div className="text-center mb-8">
      {/* Main Clicker Button */}
      <div className="relative inline-block mb-6">
        <button 
          onClick={handleButtonClick}
          disabled={isOnCooldown}
          className={`
            w-48 h-48 rounded-full shadow-2xl transform transition-all duration-200 
            font-bold text-4xl text-white border-4 relative overflow-hidden
            main-click-button
            ${isOnCooldown ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
          <div className="relative z-10">
            <div className="text-6xl font-black mb-2">
              {gameState?.currentNumber || 0}
            </div>
          </div>
          
          {/* Ripple Effect */}
          <div 
            className={`
              absolute inset-0 rounded-full bg-white/30 transform transition-all duration-500
              ${showRipple ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          />
        </button>
        
        {/* Button Cooldown Indicator */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="game-card px-3 py-1 rounded-full text-sm font-medium border border-gray-600">
            <Clock className="inline mr-1" size={12} />
            <span>
              {isOnCooldown ? `${cooldownRemaining.toFixed(1)}s` : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Click Multiplier Display */}
      <div className="text-lg text-gray-300 mb-4">
        <X className="inline mr-1" size={16} />
        <span>{gameState?.clickMultiplier || 1}</span>x Click Multiplier
        {gameState?.rageMode && (
          <span className="ml-2 text-red-400 font-bold">🔥 RAGE MODE</span>
        )}
      </div>

      {/* Upgrades Button */}
      <button 
        onClick={onOpenUpgrades}
        className="btn-game-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg border border-blue-500"
      >
        <svg className="inline mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
        Upgrades
      </button>
    </div>
  );
}
