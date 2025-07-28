export function calculateResetChance(currentNumber: number, resetChanceReduction: number = 0): number {
  // Validate inputs
  if (!isFinite(currentNumber) || isNaN(currentNumber) || currentNumber < 0) {
    return 0.001;
  }
  if (!isFinite(resetChanceReduction) || isNaN(resetChanceReduction)) {
    resetChanceReduction = 0;
  }
  
  // Base reset chance increases exponentially with current number
  const baseChance = Math.min(0.95, Math.pow(currentNumber / 100, 1.5) * 0.1);
  const reducedChance = Math.max(0.001, baseChance - resetChanceReduction);
  return reducedChance;
}

export function shouldReset(currentNumber: number, resetChanceReduction: number = 0, luckyStreakProtection: number = 0): boolean {
  if (luckyStreakProtection > 0) {
    return false; // Protected from reset
  }
  
  const resetChance = calculateResetChance(currentNumber, resetChanceReduction);
  return Math.random() < resetChance;
}

export function calculateClicksToAdd(baseClicks: number, multiplier: number = 1, rageMode: boolean = false): number {
  // Validate inputs
  if (!isFinite(baseClicks) || isNaN(baseClicks) || baseClicks < 0) {
    baseClicks = 1;
  }
  if (!isFinite(multiplier) || isNaN(multiplier) || multiplier < 1) {
    multiplier = 1;
  }
  
  const clicks = baseClicks * multiplier;
  const result = rageMode ? clicks * 2 : clicks;
  
  // Ensure result is finite
  return isFinite(result) ? Math.floor(result) : 1;
}

export function isButtonOnCooldown(lastClick: Date | string | null, cooldown: number): boolean {
  if (!lastClick) return false;
  
  const now = new Date();
  const lastClickDate = typeof lastClick === 'string' ? new Date(lastClick) : lastClick;
  const timeSinceLastClick = (now.getTime() - lastClickDate.getTime()) / 1000;
  return timeSinceLastClick < cooldown;
}

export function getRemainingCooldown(lastClick: Date | string | null, cooldown: number): number {
  if (!lastClick) return 0;
  
  const now = new Date();
  const lastClickDate = typeof lastClick === 'string' ? new Date(lastClick) : lastClick;
  const timeSinceLastClick = (now.getTime() - lastClickDate.getTime()) / 1000;
  const remaining = cooldown - timeSinceLastClick;
  return Math.max(0, remaining);
}

export function calculatePrestigeCost(currentPrestige: number): number {
  const baseCost = 100;
  return Math.floor(baseCost * Math.pow(1.2, currentPrestige));
}

export function calculatePrestigePoints(prestigeLevel: number): number {
  return prestigeLevel * 10; // 10 очков престижа за уровень
}

export function getPrestigeBonus(prestigeLevel: number): {
  clickMultiplier: number;
  resetChanceReduction: number;
  prestigePointsMultiplier: number;
} {
  return {
    clickMultiplier: Math.floor(prestigeLevel * 0.5), // +0.5 множителя за престиж
    resetChanceReduction: prestigeLevel * 0.01, // -1% шанса сброса за престиж
    prestigePointsMultiplier: 1 + (prestigeLevel * 0.1) // +10% очков престижа за уровень
  };
}

export function canPrestige(gameState: any): boolean {
  const cost = calculatePrestigeCost(gameState.prestigeLevel || 0);
  return (gameState.totalResets || 0) >= cost;
}

export function applyUpgradeEffect(gameState: any, effect: any) {
  const updatedState = { ...gameState };
  
  if (effect.resetChanceReduction) {
    updatedState.resetChanceReduction += effect.resetChanceReduction;
  }
  
  if (effect.clickMultiplier) {
    updatedState.clickMultiplier += effect.clickMultiplier;
  }
  
  if (effect.buttonCooldown) {
    updatedState.buttonCooldown = Math.max(0.1, updatedState.buttonCooldown + effect.buttonCooldown);
  }
  
  if (effect.autoClicker) {
    updatedState.isAutoClickerActive = true;
  }
  
  if (effect.resetInsurance) {
    updatedState.resetInsuranceActive = true;
  }
  
  if (effect.luckyStreakProtection) {
    updatedState.luckyStreakProtection += effect.luckyStreakProtection;
  }
  
  if (effect.rageMode) {
    updatedState.rageMode = true;
    updatedState.rageModeEndTime = new Date(Date.now() + effect.rageMode * 1000).toISOString();
  }
  
  return updatedState;
}

export function checkRageModeExpiry(gameState: any): any {
  if (gameState.rageMode && gameState.rageModeEndTime) {
    const now = new Date();
    const endTime = typeof gameState.rageModeEndTime === 'string' 
      ? new Date(gameState.rageModeEndTime) 
      : gameState.rageModeEndTime;
    
    if (now > endTime) {
      return {
        ...gameState,
        rageMode: false,
        rageModeEndTime: null
      };
    }
  }
  return gameState;
}
