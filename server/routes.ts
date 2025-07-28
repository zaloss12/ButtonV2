import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { initializeDatabase } from "./services/turso.js";
import { initializeTelegramBot, bot } from "./services/telegram.js";
import { 
  calculateResetChance, 
  shouldReset, 
  calculateClicksToAdd, 
  isButtonOnCooldown, 
  getRemainingCooldown,
  applyUpgradeEffect,
  checkRageModeExpiry,
  calculatePrestigeCost,
  calculatePrestigePoints,
  getPrestigeBonus,
  canPrestige
} from "./services/gameLogic.js";
import { insertUserSchema, insertGameStateSchema } from "@shared/schema.js";

interface WebSocketClient extends WebSocket {
  userId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize services
  await initializeDatabase();
  initializeTelegramBot();

  // WebSocket server for real-time sync
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocketClient>();

  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'auth' && data.userId) {
          ws.userId = data.userId;
          clients.set(data.userId, ws);
          
          // Send current game state
          const gameState = await storage.getGameState(data.userId);
          if (gameState) {
            ws.send(JSON.stringify({
              type: 'gameState',
              data: checkRageModeExpiry(gameState)
            }));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
      }
    });
  });

  function broadcastToUser(userId: string, data: any) {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, telegramId, platform } = req.body;
      
      let user;
      if (telegramId) {
        user = await storage.getUserByTelegramId(telegramId);
      } else {
        user = await storage.getUserByUsername(username);
      }

      if (!user) {
        const userData = insertUserSchema.parse({
          username: username || `user_${Date.now()}`,
          telegramId,
          platform: platform || 'web'
        });
        user = await storage.createUser(userData);
        
        // Create initial game state
        const gameStateData = insertGameStateSchema.parse({
          userId: user.id,
          lastClick: null
        });
        await storage.createGameState(gameStateData);
      }

      res.json({ user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Game routes
  app.get("/api/game/state/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let gameState = await storage.getGameState(userId);
      
      if (!gameState) {
        const gameStateData = insertGameStateSchema.parse({
          userId,
          lastClick: null
        });
        gameState = await storage.createGameState(gameStateData);
      }

      res.json(checkRageModeExpiry(gameState));
    } catch (error) {
      console.error('Get game state error:', error);
      res.status(500).json({ message: "Failed to get game state" });
    }
  });

  app.post("/api/game/click/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let gameState = await storage.getGameState(userId);
      
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }

      gameState = checkRageModeExpiry(gameState);

      // Check cooldown
      const lastClickDate = gameState.lastClick ? new Date(gameState.lastClick) : null;
      if (isButtonOnCooldown(lastClickDate, gameState.buttonCooldown)) {
        const remaining = getRemainingCooldown(lastClickDate, gameState.buttonCooldown);
        return res.status(429).json({ 
          message: "Button on cooldown",
          remainingCooldown: remaining
        });
      }

      const prestigeBonus = getPrestigeBonus(gameState.prestigeLevel || 0);
      const totalMultiplier = gameState.clickMultiplier + prestigeBonus.clickMultiplier;
      const totalResetReduction = gameState.resetChanceReduction + prestigeBonus.resetChanceReduction;
      
      const clicksToAdd = calculateClicksToAdd(1, totalMultiplier, gameState.rageMode);
      const newNumber = gameState.currentNumber + clicksToAdd;
      const newTotalClicks = gameState.totalClicks + clicksToAdd;
      const newMaxNumber = Math.max(gameState.maxNumber || 0, newNumber);

      // Check for reset
      let resetOccurred = false;
      let finalNumber = newNumber;
      let newTotalResets = gameState.totalResets;
      let newLuckyStreakProtection = gameState.luckyStreakProtection;

      if (shouldReset(newNumber, totalResetReduction, gameState.luckyStreakProtection)) {
        resetOccurred = true;
        
        // Check reset insurance
        if (gameState.resetInsuranceActive && Math.random() < 0.5) {
          // Insurance saved us, keep 50% of the number
          finalNumber = Math.floor(newNumber / 2);
        } else {
          finalNumber = 0;
          newTotalResets += 1;
          
          // Use lucky streak protection
          if (gameState.luckyStreakProtection > 0) {
            newLuckyStreakProtection -= 1;
          }
        }
      }

      // Validate all values before saving
      const updateData = {
        currentNumber: isFinite(finalNumber) ? Math.floor(finalNumber) : 0,
        maxNumber: isFinite(newMaxNumber) ? Math.floor(newMaxNumber) : 0,
        totalClicks: isFinite(newTotalClicks) ? Math.floor(newTotalClicks) : 0,
        totalResets: isFinite(newTotalResets) ? Math.floor(newTotalResets) : 0,
        luckyStreakProtection: isFinite(newLuckyStreakProtection) ? Math.floor(newLuckyStreakProtection) : 0,
        lastClick: new Date().toISOString()
      };

      const updatedGameState = await storage.updateGameState(userId, updateData);

      // Broadcast to WebSocket clients
      broadcastToUser(userId, {
        type: 'gameState',
        data: updatedGameState
      });

      res.json({
        gameState: updatedGameState,
        clicksAdded: clicksToAdd,
        resetOccurred,
        resetChance: calculateResetChance(newNumber, gameState.resetChanceReduction)
      });
    } catch (error) {
      console.error('Click error:', error);
      res.status(500).json({ message: "Click failed" });
    }
  });

  // Upgrade routes
  app.get("/api/upgrades", async (req, res) => {
    try {
      const upgrades = await storage.getAllUpgrades();
      res.json(upgrades);
    } catch (error) {
      console.error('Get upgrades error:', error);
      res.status(500).json({ message: "Failed to get upgrades" });
    }
  });

  app.get("/api/upgrades/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userUpgrades = await storage.getUserUpgrades(userId);
      res.json(userUpgrades);
    } catch (error) {
      console.error('Get user upgrades error:', error);
      res.status(500).json({ message: "Failed to get user upgrades" });
    }
  });

  app.post("/api/upgrades/purchase/:userId/:upgradeId", async (req, res) => {
    try {
      const { userId, upgradeId } = req.params;
      
      const gameState = await storage.getGameState(userId);
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }

      const upgrades = await storage.getAllUpgrades();
      const upgrade = upgrades.find(u => u.id === upgradeId);
      if (!upgrade) {
        return res.status(404).json({ message: "Upgrade not found" });
      }

      // Check requirements for recommended upgrades
      if (upgrade.type === 'recommended') {
        if (gameState.totalClicks < upgrade.requiredClicks || gameState.totalResets < upgrade.requiredResets) {
          return res.status(400).json({ message: "Requirements not met" });
        }
      }

      // Check costs for purchasable upgrades
      if (upgrade.type === 'purchasable') {
        if (gameState.totalClicks < upgrade.clickCost || gameState.totalResets < upgrade.resetCost) {
          return res.status(400).json({ message: "Insufficient resources" });
        }
      }

      // Apply upgrade effect
      const effect = JSON.parse(upgrade.effect);
      let updatedGameState = applyUpgradeEffect(gameState, effect);

      // Deduct costs for purchasable upgrades
      if (upgrade.type === 'purchasable') {
        updatedGameState.totalClicks -= upgrade.clickCost;
        updatedGameState.totalResets -= upgrade.resetCost;
      }

      // Save game state and purchase record
      const finalGameState = await storage.updateGameState(userId, updatedGameState);
      await storage.purchaseUpgrade(userId, upgradeId);

      // Broadcast to WebSocket clients
      broadcastToUser(userId, {
        type: 'gameState',
        data: finalGameState
      });

      res.json({
        gameState: finalGameState,
        upgrade
      });
    } catch (error) {
      console.error('Purchase upgrade error:', error);
      res.status(500).json({ message: "Purchase failed" });
    }
  });

  // Prestige routes
  app.post("/api/game/prestige/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const gameState = await storage.getGameState(userId);
      
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }

      if (!canPrestige(gameState)) {
        const cost = calculatePrestigeCost(gameState.prestigeLevel || 0);
        return res.status(400).json({ 
          message: `Insufficient resets. Need ${cost} resets for prestige.`,
          required: cost,
          current: gameState.totalResets
        });
      }

      const cost = calculatePrestigeCost(gameState.prestigeLevel || 0);
      const newPrestigeLevel = (gameState.prestigeLevel || 0) + 1;
      const newPrestigePoints = calculatePrestigePoints(newPrestigeLevel);

      const updatedGameState = await storage.updateGameState(userId, {
        currentNumber: 0,
        totalClicks: 0,
        totalResets: gameState.totalResets - cost,
        prestigeLevel: newPrestigeLevel,
        prestigePoints: (gameState.prestigePoints || 0) + newPrestigePoints,
        clickMultiplier: 1,
        buttonCooldown: 1.0,
        resetChanceReduction: 0.0,
        isAutoClickerActive: false,
        resetInsuranceActive: false,
        luckyStreakProtection: 0,
        rageMode: false,
        rageModeEndTime: null,
        lastClick: null
      });

      // Broadcast to WebSocket clients
      broadcastToUser(userId, {
        type: 'gameState',
        data: updatedGameState
      });

      res.json({
        gameState: updatedGameState,
        prestigePointsGained: newPrestigePoints
      });
    } catch (error) {
      console.error('Prestige error:', error);
      res.status(500).json({ message: "Prestige failed" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      let leaderboard;
      switch (type) {
        case 'maxNumber':
          leaderboard = await storage.getLeaderboardByMaxNumber(limit);
          break;
        case 'resets':
          leaderboard = await storage.getLeaderboardByResets(limit);
          break;
        case 'prestige':
          leaderboard = await storage.getLeaderboardByPrestige(limit);
          break;
        case 'clicks':
        default:
          leaderboard = await storage.getLeaderboard(limit);
          break;
      }

      res.json(leaderboard);
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  // Telegram webhook
  app.post("/api/telegram/webhook", (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  // Auto-clicker interval
  setInterval(async () => {
    try {
      // This would need to be implemented with better performance for production
      // For now, this is a simple implementation
    } catch (error) {
      console.error('Auto-clicker error:', error);
    }
  }, 2000);

  return httpServer;
}
