import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  username: text("username").notNull(),
  telegramId: text("telegram_id").unique(),
  platform: text("platform").notNull().default("web"), // 'web' or 'telegram'
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const gameState = sqliteTable("game_state", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => users.id),
  currentNumber: integer("current_number").notNull().default(0),
  maxNumber: integer("max_number").notNull().default(0),
  totalClicks: integer("total_clicks").notNull().default(0),
  totalResets: integer("total_resets").notNull().default(0),
  prestigeLevel: integer("prestige_level").notNull().default(0),
  prestigePoints: integer("prestige_points").notNull().default(0),
  clickMultiplier: integer("click_multiplier").notNull().default(1),
  buttonCooldown: real("button_cooldown").notNull().default(1.0), // seconds
  resetChanceReduction: real("reset_chance_reduction").notNull().default(0.0),
  isAutoClickerActive: integer("is_auto_clicker_active", { mode: "boolean" }).notNull().default(false),
  resetInsuranceActive: integer("reset_insurance_active", { mode: "boolean" }).notNull().default(false),
  luckyStreakProtection: integer("lucky_streak_protection").notNull().default(0),
  rageMode: integer("rage_mode", { mode: "boolean" }).notNull().default(false),
  rageModeEndTime: text("rage_mode_end_time"),
  lastClick: text("last_click"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const upgrades = sqliteTable("upgrades", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'recommended' or 'purchasable'
  effect: text("effect").notNull(), // JSON string with effect details
  clickCost: integer("click_cost").notNull().default(0),
  resetCost: integer("reset_cost").notNull().default(0),
  requiredClicks: integer("required_clicks").notNull().default(0),
  requiredResets: integer("required_resets").notNull().default(0),
  isRepeatable: integer("is_repeatable", { mode: "boolean" }).notNull().default(false),
});

export const userUpgrades = sqliteTable("user_upgrades", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => users.id),
  upgradeId: text("upgrade_id").notNull().references(() => upgrades.id),
  purchasedAt: text("purchased_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  timesUsed: integer("times_used").notNull().default(1),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGameStateSchema = createInsertSchema(gameState).omit({
  id: true,
  updatedAt: true,
});

export const insertUpgradeSchema = createInsertSchema(upgrades).omit({
  id: true,
});

export const insertUserUpgradeSchema = createInsertSchema(userUpgrades).omit({
  id: true,
  purchasedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameState.$inferSelect;
export type InsertUpgrade = z.infer<typeof insertUpgradeSchema>;
export type Upgrade = typeof upgrades.$inferSelect;
export type InsertUserUpgrade = z.infer<typeof insertUserUpgradeSchema>;
export type UserUpgrade = typeof userUpgrades.$inferSelect;
