-- Добавить last_daily_bonus_claim и streak_day в таблицу game_state
ALTER TABLE game_state ADD COLUMN last_daily_bonus_claim TEXT;
ALTER TABLE game_state ADD COLUMN streak_day INTEGER NOT NULL DEFAULT 1;
