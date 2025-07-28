import { type User, type InsertUser, type GameState, type InsertGameState, type Upgrade, type UserUpgrade, type InsertUserUpgrade } from "@shared/schema";
import { db } from "./services/turso.js";
import { users, gameState, upgrades, userUpgrades } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game state methods
  getGameState(userId: string): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(userId: string, updates: Partial<GameState>): Promise<GameState>;
  
  // Upgrade methods
  getAllUpgrades(): Promise<Upgrade[]>;
  getUserUpgrades(userId: string): Promise<UserUpgrade[]>;
  purchaseUpgrade(userId: string, upgradeId: string): Promise<UserUpgrade>;
  
  // Stats methods
  getLeaderboard(limit?: number): Promise<Array<{ user: User; gameState: GameState }>>;
}

export class TursoStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getGameState(userId: string): Promise<GameState | undefined> {
    const result = await db.select().from(gameState).where(eq(gameState.userId, userId)).limit(1);
    return result[0];
  }

  async createGameState(insertGameState: InsertGameState): Promise<GameState> {
    const result = await db.insert(gameState).values(insertGameState).returning();
    return result[0];
  }

  async updateGameState(userId: string, updates: Partial<GameState>): Promise<GameState> {
    const result = await db
      .update(gameState)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(gameState.userId, userId))
      .returning();
    return result[0];
  }

  async getAllUpgrades(): Promise<Upgrade[]> {
    return await db.select().from(upgrades);
  }

  async getUserUpgrades(userId: string): Promise<UserUpgrade[]> {
    return await db.select().from(userUpgrades).where(eq(userUpgrades.userId, userId));
  }

  async purchaseUpgrade(userId: string, upgradeId: string): Promise<UserUpgrade> {
    const result = await db.insert(userUpgrades).values({
      userId,
      upgradeId
    }).returning();
    return result[0];
  }

  async getLeaderboard(limit: number = 10): Promise<Array<{ user: User; gameState: GameState }>> {
    const result = await db
      .select({
        user: users,
        gameState: gameState
      })
      .from(users)
      .innerJoin(gameState, eq(users.id, gameState.userId))
      .orderBy(gameState.totalClicks)
      .limit(limit);
    
    return result;
  }
}

export const storage = new TursoStorage();
