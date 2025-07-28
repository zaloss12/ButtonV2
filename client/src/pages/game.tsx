import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { useWebSocket } from "@/hooks/useWebSocket";
import { initializeTelegramWebApp } from "@/lib/telegramWebApp";
import GameHeader from "@/components/GameHeader";
import GameStats from "@/components/GameStats";
import MainGameArea from "@/components/MainGameArea";
import UpgradesModal from "@/components/UpgradesModal";
import GameNotifications from "@/components/GameNotifications";
import GameStatusBar from "@/components/GameStatusBar";

export default function Game() {
  const [userId, setUserId] = useState<string | null>(null);
  const [upgradesModalOpen, setUpgradesModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'telegram'>('web');

  const { gameState, loading, clickButton, refetchGameState } = useGameState(userId);
  const { sendMessage } = useWebSocket(userId, (data) => {
    if (data.type === 'gameState') {
      refetchGameState();
    }
  });

  useEffect(() => {
    async function initializeApp() {
      try {
        // Check if running in Telegram
        const telegramData = initializeTelegramWebApp();
        
        if (telegramData) {
          setPlatform('telegram');
          // Login with Telegram data
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: telegramData.user?.username || `tg_${telegramData.user?.id}`,
              telegramId: telegramData.user?.id?.toString(),
              platform: 'telegram'
            })
          });
          
          if (response.ok) {
            const { user } = await response.json();
            setUserId(user.id);
          }
        } else {
          // Web app - generate or get user
          let storedUserId = localStorage.getItem('buttonClickerUserId');
          
          if (!storedUserId) {
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: `player_${Date.now()}`,
                platform: 'web'
              })
            });
            
            if (response.ok) {
              const { user } = await response.json();
              setUserId(user.id);
              localStorage.setItem('buttonClickerUserId', user.id);
            }
          } else {
            setUserId(storedUserId);
          }
        }
        
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    }

    initializeApp();
  }, []);

  if (!userId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--game-bg)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--game-accent)] mx-auto mb-4"></div>
          <p className="text-gray-300">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--game-bg)] text-white font-['Inter'] pb-16">
      <GameHeader 
        username={platform === 'telegram' ? 'Telegram Player' : 'Web Player'}
        isConnected={isConnected}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <GameStats gameState={gameState} />
        <MainGameArea 
          gameState={gameState}
          onButtonClick={() => clickButton()}
          onOpenUpgrades={() => setUpgradesModalOpen(true)}
        />
      </main>

      <UpgradesModal
        isOpen={upgradesModalOpen}
        onClose={() => setUpgradesModalOpen(false)}
        userId={userId}
        gameState={gameState}
        onUpgradePurchased={refetchGameState}
      />
      
      <GameNotifications />
      <GameStatusBar 
        isConnected={isConnected}
        platform={platform}
      />
    </div>
  );
}
