// ─── Minimal Telegram Bot Mock ──────────────────────────────────────────────
class TelegramBotMock {
  constructor() {
    this.handlers = {};
    TelegramBotMock.instance = this;
  }
  on(event, cb) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(cb);
  }
  setMyCommands() {}
  sendMessage(_chatId, text) {
    console.log(`[BOT]: ${text}\n${'─'.repeat(50)}`);
  }
  editMessageReplyMarkup() {}
  answerCallbackQuery() {}

  simulateMessage(text, fromName) {
    console.log(`\n[USER "${fromName}"]: ${text}`);
    const msg = { chat: { id: 'test_chat' }, text, from: { first_name: fromName } };
    (this.handlers['message'] || []).forEach((cb) => cb(msg));
  }

  simulateCallback(data) {
    console.log(`\n[BUTTON]: ${data}`);
    const query = { id: 'q1', message: { chat: { id: 'test_chat' }, message_id: 1 }, data };
    (this.handlers['callback_query'] || []).forEach((cb) => cb(query));
  }
}

// ─── Intercept requires before loading main modules ──────────────────────────
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
  if (id === 'node-telegram-bot-api') return TelegramBotMock;
  return originalRequire.apply(this, arguments);
};

// Reset DB for a clean test run
const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
fs.writeFileSync(path.join(dataDir, 'db.json'), '{}');

require('./index.js');
const bot = TelegramBotMock.instance;

// ─── Test Scenarios ──────────────────────────────────────────────────────────
setTimeout(() => {
  // ── Scenario 1: Quick mode (split-all) ──────────────────────────────────
  console.log('\n\n🚀 === KỊCH BẢN 1: CHẾ ĐỘ QUỸ CHUNG (NHANH) ===');
  bot.simulateMessage('+ Huy, An, Minh', 'Huy');
  bot.simulateMessage('Huy 300k ăn nhậu', 'Huy');
  bot.simulateMessage('An 150k', 'An');
  bot.simulateMessage('?', 'Huy');

  // ── Scenario 2: Detailed mode ────────────────────────────────────────────
  console.log('\n\n🚀 === KỊCH BẢN 2: CHẾ ĐỘ DU LỊCH (CHI TIẾT) ===');
  bot.simulateCallback('set_mode_detailed');
  bot.simulateMessage('+ Huy, Đăng, Minh', 'Huy');
  bot.simulateMessage('Huy 150k Bún bò chia Minh, Huy', 'Huy');
  bot.simulateMessage('Đăng 200k Taxi', 'Đăng');
  bot.simulateMessage('Minh 50 Cafe', 'Minh');
  bot.simulateMessage('?', 'Huy');

  // ── Scenario 3: Reset detailed, check quick survives ─────────────────────
  console.log('\n\n🚀 === KỊCH BẢN 3: XOÁ SỔ CHI TIẾT, KIỂM TRA SỔ NHANH ===');
  bot.simulateCallback('reset_all');
  bot.simulateCallback('set_mode_quick');
  bot.simulateMessage('?', 'Huy');

  console.log('\n\n✅ Tất cả kịch bản đã chạy xong.\n');
  process.exit(0);
}, 300);
