import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../shared/schema.js";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "libsql://button-zaloss11.aws-eu-west-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN || "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM2OTE2MTgsImlkIjoiNTcxZDVjZmItZmM2Ni00NjllLThkMTEtZDQ0NTJiNDUyOGVhIiwicmlkIjoiYWVmNmM0YTAtMDc5Ni00ZDg3LTliNTMtZWI2NTkyY2MzYjAwIn0.kCoMctJlkJbwGQuZ-mSDmKK5rbYVI3Hy4q7LVgdWZcOKAZyb9f123k8M9Pw_3G-6tLeu5My_ylIm0b1UdjmxBw"
});

export const db = drizzle(client, { schema });

export async function initializeDatabase() {
  try {
    // Create tables if they don't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        username TEXT NOT NULL,
        telegram_id TEXT UNIQUE,
        platform TEXT NOT NULL DEFAULT 'web',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS game_state (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL REFERENCES users(id),
        current_number INTEGER NOT NULL DEFAULT 0,
        total_clicks INTEGER NOT NULL DEFAULT 0,
        total_resets INTEGER NOT NULL DEFAULT 0,
        click_multiplier INTEGER NOT NULL DEFAULT 1,
        button_cooldown REAL NOT NULL DEFAULT 1.0,
        reset_chance_reduction REAL NOT NULL DEFAULT 0.0,
        is_auto_clicker_active BOOLEAN NOT NULL DEFAULT FALSE,
        reset_insurance_active BOOLEAN NOT NULL DEFAULT FALSE,
        lucky_streak_protection INTEGER NOT NULL DEFAULT 0,
        rage_mode BOOLEAN NOT NULL DEFAULT FALSE,
        rage_mode_end_time DATETIME,
        last_click DATETIME,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS upgrades (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        effect TEXT NOT NULL,
        click_cost INTEGER NOT NULL DEFAULT 0,
        reset_cost INTEGER NOT NULL DEFAULT 0,
        required_clicks INTEGER NOT NULL DEFAULT 0,
        required_resets INTEGER NOT NULL DEFAULT 0,
        is_repeatable BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS user_upgrades (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL REFERENCES users(id),
        upgrade_id TEXT NOT NULL REFERENCES upgrades(id),
        purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        times_used INTEGER NOT NULL DEFAULT 1
      )
    `);

    // Insert default upgrades
    await initializeDefaultUpgrades();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function initializeDefaultUpgrades() {
  const defaultUpgrades = [
    // Recommended upgrades (free with requirements)
    {
      name: "Decrease Reset Chance",
      description: "+0.01 reduction",
      type: "recommended",
      effect: JSON.stringify({ resetChanceReduction: 0.01 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 10000,
      requiredResets: 10,
      isRepeatable: true
    },
    {
      name: "Click Multiplier Boost",
      description: "+1 clicks per button press",
      type: "recommended",
      effect: JSON.stringify({ clickMultiplier: 1 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 50000,
      requiredResets: 100,
      isRepeatable: true
    },
    {
      name: "Lucky Streak Protection",
      description: "Immunity to next 3 resets",
      type: "recommended",
      effect: JSON.stringify({ luckyStreakProtection: 3 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 100000,
      requiredResets: 500,
      isRepeatable: false
    },
    // Purchasable upgrades
    {
      name: "Reduce Button Cooldown",
      description: "-0.05 seconds",
      type: "purchasable",
      effect: JSON.stringify({ buttonCooldown: -0.05 }),
      clickCost: 3000,
      resetCost: 5,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Auto-Clicker",
      description: "1 click every 2 seconds",
      type: "purchasable",
      effect: JSON.stringify({ autoClicker: true }),
      clickCost: 25000,
      resetCost: 50,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: false
    },
    {
      name: "Reset Insurance",
      description: "50% chance to keep number on reset",
      type: "purchasable",
      effect: JSON.stringify({ resetInsurance: true }),
      clickCost: 15000,
      resetCost: 25,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: false
    },
    {
      name: "Click Rage Mode",
      description: "Double clicks for 30 seconds",
      type: "purchasable",
      effect: JSON.stringify({ rageMode: 30 }),
      clickCost: 8000,
      resetCost: 15,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    }
  ];

  for (const upgrade of defaultUpgrades) {
    await client.execute(`
      INSERT OR IGNORE INTO upgrades (name, description, type, effect, click_cost, reset_cost, required_clicks, required_resets, is_repeatable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      upgrade.name,
      upgrade.description,
      upgrade.type,
      upgrade.effect,
      upgrade.clickCost,
      upgrade.resetCost,
      upgrade.requiredClicks,
      upgrade.requiredResets,
      upgrade.isRepeatable
    ]);
  }
}
