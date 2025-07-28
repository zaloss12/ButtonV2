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
        max_number INTEGER NOT NULL DEFAULT 0,
        total_clicks INTEGER NOT NULL DEFAULT 0,
        total_resets INTEGER NOT NULL DEFAULT 0,
        prestige_level INTEGER NOT NULL DEFAULT 0,
        prestige_points INTEGER NOT NULL DEFAULT 0,
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

    await client.execute(`
      CREATE TABLE IF NOT EXISTS daily_bonuses (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL REFERENCES users(id),
        streak_day INTEGER NOT NULL DEFAULT 1,
        bonus_amount INTEGER NOT NULL,
        reset_bonus INTEGER NOT NULL,
        claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default upgrades
    await initializeDefaultUpgrades();
    
    // Add migration for new columns if they don't exist
    try {
      await client.execute(`ALTER TABLE game_state ADD COLUMN max_number INTEGER DEFAULT 0`);
    } catch (error) {
      // Column might already exist, ignore error
    }
    
    try {
      await client.execute(`ALTER TABLE game_state ADD COLUMN prestige_level INTEGER DEFAULT 0`);
    } catch (error) {
      // Column might already exist, ignore error
    }
    
    try {
      await client.execute(`ALTER TABLE game_state ADD COLUMN prestige_points INTEGER DEFAULT 0`);
    } catch (error) {
      // Column might already exist, ignore error
    }

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
      name: "Снижение шанса сброса",
      description: "Уменьшает шанс сброса на 1%",
      type: "recommended",
      effect: JSON.stringify({ resetChanceReduction: 0.01 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 100,
      requiredResets: 5,
      isRepeatable: true
    },
    {
      name: "Усиление кликов",
      description: "Каждый клик считается как 2 клика",
      type: "recommended",
      effect: JSON.stringify({ clickMultiplier: 1 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 250,
      requiredResets: 10,
      isRepeatable: true
    },
    {
      name: "Защита от неудач",
      description: "Иммунитет к следующим 3 сбросам",
      type: "recommended",
      effect: JSON.stringify({ luckyStreakProtection: 3 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 500,
      requiredResets: 20,
      isRepeatable: false
    },
    {
      name: "Быстрые пальцы",
      description: "Уменьшает задержку кнопки на 0.1 секунды",
      type: "recommended",
      effect: JSON.stringify({ buttonCooldown: -0.1 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 50,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Мастер точности",
      description: "Дополнительно снижает шанс сброса на 2%",
      type: "recommended",
      effect: JSON.stringify({ resetChanceReduction: 0.02 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 1000,
      requiredResets: 50,
      isRepeatable: true
    },
    {
      name: "Тройная сила",
      description: "Каждый клик считается как 3 клика",
      type: "recommended",
      effect: JSON.stringify({ clickMultiplier: 2 }),
      clickCost: 0,
      resetCost: 0,
      requiredClicks: 2000,
      requiredResets: 100,
      isRepeatable: false
    },
    // Purchasable upgrades
    {
      name: "Ускорение кнопки",
      description: "Уменьшает задержку на 0.05 секунды",
      type: "purchasable",
      effect: JSON.stringify({ buttonCooldown: -0.05 }),
      clickCost: 50,
      resetCost: 1,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Авто-кликер",
      description: "Автоматически кликает каждые 2 секунды",
      type: "purchasable",
      effect: JSON.stringify({ autoClicker: true }),
      clickCost: 500,
      resetCost: 10,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: false
    },
    {
      name: "Страховка от сброса",
      description: "50% шанс сохранить число при сбросе",
      type: "purchasable",
      effect: JSON.stringify({ resetInsurance: true }),
      clickCost: 300,
      resetCost: 5,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: false
    },
    {
      name: "Режим ярости",
      description: "Двойные клики в течение 30 секунд",
      type: "purchasable",
      effect: JSON.stringify({ rageMode: 30 }),
      clickCost: 200,
      resetCost: 3,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Мега-кликер",
      description: "Автоматически кликает каждую секунду в течение 60 секунд",
      type: "purchasable",
      effect: JSON.stringify({ megaAutoClicker: 60 }),
      clickCost: 1000,
      resetCost: 20,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Щит чемпиона",
      description: "Полная защита от следующих 5 сбросов",
      type: "purchasable",
      effect: JSON.stringify({ championShield: 5 }),
      clickCost: 800,
      resetCost: 15,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Временное замедление",
      description: "Следующие 20 кликов имеют задержку 0.1 секунды",
      type: "purchasable",
      effect: JSON.stringify({ timeSlowClicks: 20 }),
      clickCost: 400,
      resetCost: 8,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Удвоитель очков",
      description: "Следующие 30 кликов дают двойные очки",
      type: "purchasable",
      effect: JSON.stringify({ doublePointsClicks: 30 }),
      clickCost: 600,
      resetCost: 12,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    },
    {
      name: "Возрождение феникса",
      description: "При сбросе возвращает 75% текущего числа",
      type: "purchasable",
      effect: JSON.stringify({ phoenixRevival: 0.75 }),
      clickCost: 1500,
      resetCost: 30,
      requiredClicks: 0,
      requiredResets: 0,
      isRepeatable: true
    }
  ];

  // Clear user_upgrades first, then upgrades to respect FK constraint
  await client.execute('DELETE FROM user_upgrades');
  await client.execute('DELETE FROM upgrades');
  
  for (const upgrade of defaultUpgrades) {
    await client.execute(`
      INSERT INTO upgrades (name, description, type, effect, click_cost, reset_cost, required_clicks, required_resets, is_repeatable)
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
