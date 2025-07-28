import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN || "7982526701:AAFh_oI0yByuY53iW_FFI8W9jLL3fG37oY8";

export const bot = new TelegramBot(token, { polling: false });

export function initializeTelegramBot() {
  // Set webhook for production
  if (process.env.NODE_ENV === "production") {
    const webhookUrl = `${process.env.RAILWAY_STATIC_URL || process.env.REPLIT_DOMAINS?.split(",")[0]}/api/telegram/webhook`;
    bot.setWebHook(webhookUrl);
  }

  // Handle /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    
    if (!userId) return;

    const webAppUrl = process.env.NODE_ENV === "production" 
      ? `https://${process.env.RAILWAY_STATIC_URL || process.env.REPLIT_DOMAINS?.split(",")[0]}`
      : `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [[
          {
            text: "🎮 Play Button Clicker",
            web_app: { url: webAppUrl }
          }
        ]]
      }
    };

    await bot.sendMessage(chatId, 
      "🎮 Welcome to Button Clicker Game!\n\n" +
      "Click the button below to start playing. Your progress will be synchronized across all platforms!", 
      keyboard
    );
  });

  // Handle web app data
  bot.on("web_app_data", async (msg) => {
    const chatId = msg.chat.id;
    const data = msg.web_app_data?.data;
    
    if (data) {
      try {
        const gameData = JSON.parse(data);
        // Handle game data from web app
        console.log("Received game data from web app:", gameData);
      } catch (error) {
        console.error("Error parsing web app data:", error);
      }
    }
  });

  console.log("Telegram bot initialized");
}

export async function sendGameNotification(telegramId: string, message: string) {
  try {
    await bot.sendMessage(telegramId, message);
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
  }
}
