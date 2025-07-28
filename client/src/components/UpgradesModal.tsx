import { useState, useEffect } from "react";
import { X, Gift, ShoppingCart, Check, Lock, MousePointer, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UpgradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  gameState: any;
  onUpgradePurchased: () => void;
}

export default function UpgradesModal({ 
  isOpen, 
  onClose, 
  userId, 
  gameState, 
  onUpgradePurchased 
}: UpgradesModalProps) {
  const [upgrades, setUpgrades] = useState<any[]>([]);
  const [userUpgrades, setUserUpgrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUpgrades();
      fetchUserUpgrades();
    }
  }, [isOpen, userId]);

  const fetchUpgrades = async () => {
    try {
      const response = await fetch('/api/upgrades');
      if (response.ok) {
        const data = await response.json();
        setUpgrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch upgrades:', error);
    }
  };

  const fetchUserUpgrades = async () => {
    try {
      const response = await fetch(`/api/upgrades/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserUpgrades(data);
      }
    } catch (error) {
      console.error('Failed to fetch user upgrades:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchaseUpgrade = async (upgradeId: string) => {
    try {
      const response = await fetch(`/api/upgrades/purchase/${userId}/${upgradeId}`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Upgrade Purchased!",
          description: `Successfully purchased ${data.upgrade.name}`,
        });
        onUpgradePurchased();
        fetchUserUpgrades();
      } else {
        const error = await response.json();
        toast({
          title: "Purchase Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred while purchasing the upgrade",
        variant: "destructive"
      });
    }
  };

  const checkRequirements = (upgrade: any) => {
    if (!gameState) return false;
    return gameState.totalClicks >= upgrade.requiredClicks && 
           gameState.totalResets >= upgrade.requiredResets;
  };

  const canAfford = (upgrade: any) => {
    if (!gameState) return false;
    return gameState.totalClicks >= upgrade.clickCost && 
           gameState.totalResets >= upgrade.resetCost;
  };

  const hasUpgrade = (upgradeId: string) => {
    return userUpgrades.some(uu => uu.upgradeId === upgradeId);
  };

  if (!isOpen) return null;

  const recommendedUpgrades = upgrades.filter(u => u.type === 'recommended');
  const purchasableUpgrades = upgrades.filter(u => u.type === 'purchasable');

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="game-card rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-600 shadow-2xl">
          {/* Modal Header */}
          <div className="bg-[var(--game-bg)] px-6 py-4 border-b border-gray-600 flex items-center justify-between">
            <h2 className="text-2xl font-bold game-accent">
              <svg className="inline mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              Upgrades
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--game-accent)] mx-auto mb-4"></div>
                <p className="text-gray-300">Loading upgrades...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recommended Upgrades Column */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 game-success flex items-center">
                    <Gift className="mr-2" size={20} />
                    Recommended Upgrades (Free)
                  </h3>
                  
                  <div className="space-y-4">
                    {recommendedUpgrades.map((upgrade) => {
                      const meetsRequirements = checkRequirements(upgrade);
                      const alreadyHas = hasUpgrade(upgrade.id);
                      
                      return (
                        <div key={upgrade.id} className="bg-[var(--game-bg)] p-4 rounded-xl border border-green-500/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-white">{upgrade.name}</h4>
                              <p className="game-success text-sm">{upgrade.description}</p>
                            </div>
                            <button 
                              onClick={() => purchaseUpgrade(upgrade.id)}
                              disabled={!meetsRequirements || alreadyHas}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                alreadyHas 
                                  ? 'bg-gray-600 cursor-not-allowed' 
                                  : meetsRequirements 
                                    ? 'bg-[var(--game-success)] hover:bg-green-600' 
                                    : 'bg-gray-600 cursor-not-allowed'
                              }`}
                            >
                              {alreadyHas ? (
                                <>
                                  <Check className="inline mr-1" size={14} />
                                  Owned
                                </>
                              ) : meetsRequirements ? (
                                <>
                                  <Check className="inline mr-1" size={14} />
                                  Claim
                                </>
                              ) : (
                                <>
                                  <Lock className="inline mr-1" size={14} />
                                  Locked
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-sm text-gray-300">
                            <div className="flex items-center mb-1">
                              <MousePointer className="mr-2 game-success" size={14} />
                              <span>Required: {upgrade.requiredClicks.toLocaleString()} Clicks</span>
                              <span className={`ml-auto ${gameState?.totalClicks >= upgrade.requiredClicks ? 'game-success' : 'text-red-400'}`}>
                                {gameState?.totalClicks >= upgrade.requiredClicks ? '✓' : '✗'}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <RotateCcw className="mr-2 game-warning" size={14} />
                              <span>Required: {upgrade.requiredResets} Resets</span>
                              <span className={`ml-auto ${gameState?.totalResets >= upgrade.requiredResets ? 'game-success' : 'text-red-400'}`}>
                                {gameState?.totalResets >= upgrade.requiredResets ? '✓' : '✗'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Purchasable Upgrades Column */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 game-accent flex items-center">
                    <ShoppingCart className="mr-2" size={20} />
                    Purchasable Upgrades
                  </h3>
                  
                  <div className="space-y-4">
                    {purchasableUpgrades.map((upgrade) => {
                      const affordable = canAfford(upgrade);
                      const alreadyHas = hasUpgrade(upgrade.id) && !upgrade.isRepeatable;
                      
                      return (
                        <div key={upgrade.id} className="bg-[var(--game-bg)] p-4 rounded-xl border border-blue-500/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-white">{upgrade.name}</h4>
                              <p className="game-accent text-sm">{upgrade.description}</p>
                            </div>
                            <button 
                              onClick={() => purchaseUpgrade(upgrade.id)}
                              disabled={!affordable || alreadyHas}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                alreadyHas 
                                  ? 'bg-gray-600 cursor-not-allowed' 
                                  : affordable 
                                    ? 'bg-[var(--game-accent)] hover:bg-blue-600' 
                                    : 'bg-gray-600 cursor-not-allowed'
                              }`}
                            >
                              {alreadyHas ? (
                                <>
                                  <Check className="inline mr-1" size={14} />
                                  Owned
                                </>
                              ) : affordable ? (
                                <>
                                  <ShoppingCart className="inline mr-1" size={14} />
                                  Buy
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="inline mr-1" size={14} />
                                  Expensive
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-sm text-gray-300">
                            {upgrade.clickCost > 0 && (
                              <div className="flex items-center mb-1">
                                <MousePointer className="mr-2 game-accent" size={14} />
                                <span>Cost: {upgrade.clickCost.toLocaleString()} Clicks</span>
                              </div>
                            )}
                            {upgrade.resetCost > 0 && (
                              <div className="flex items-center">
                                <RotateCcw className="mr-2 game-warning" size={14} />
                                <span>Cost: {upgrade.resetCost} Resets</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
