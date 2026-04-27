'use strict';

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const { BOT_TOKEN } = process.env;
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set. Please copy .env.example to .env and fill in your token.');
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Error handling for polling errors
bot.on('polling_error', (error) => {
  console.error('⚠️ Polling error:', error.code, error.message);
});

// General error handling
bot.on('error', (error) => {
  console.error('❌ Bot error:', error);
});

bot.setMyCommands([
  { command: '/menu', description: 'Mở menu quản lý chi tiêu' },
  { command: '/start', description: 'Khởi động lại bot' },
  { command: '/help', description: 'Xem hướng dẫn sử dụng' },
]);

module.exports = bot;

