'use strict';

const bot = require('../bot');
const { getSession, saveData } = require('../services/sessionService');
const { buildInlineMenu } = require('../utils/menuBuilder');
const { buildResultsMessage, buildHistoryMessage } = require('../services/reportService');

const HELP_QUICK = `
⚡️ *HƯỚNG DẪN: SỔ QUỸ CHUNG (NHANH)*
━━━━━━━━━━━━━━━━━━
Mọi khoản chi tự động chia đều cho tất cả thành viên.

*Cú pháp:*
\`<Tên> <Số tiền> [Mô tả ngắn]\`

*Ví dụ:*
👉 \`Huy 150k\`
👉 \`Minh 200k nhậu\`
👉 \`Đăng 1.5M\`
`.trim();

const HELP_DETAILED = `
🌴 *HƯỚNG DẪN: SỔ DU LỊCH (CHI TIẾT)*
━━━━━━━━━━━━━━━━━━
Chỉ định chính xác ai xài món gì để tính công nợ chi tiết.

*Cú pháp:*
\`<Tên> <Số tiền> <Nội dung> [chia Tên1, Tên2]\`

*Ví dụ:*
👉 \`Huy 150k Bún bò\` — chia đều cả nhóm
👉 \`Minh 200k Taxi chia Minh Đăng\`
👉 \`An 100k Sinh tố chia An, Quang Huy\`
`.trim();

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const { data } = query;
  const session = getSession(chatId);

  bot.answerCallbackQuery(query.id);

  if (data === 'set_mode_quick' || data === 'set_mode_detailed') {
    const newMode = data === 'set_mode_quick' ? 'quick' : 'detailed';
    if (session.activeMode === newMode) return; // already in this mode

    session.activeMode = newMode;
    saveData();
    const modeName = newMode === 'quick' ? 'Quỹ chung (Ghi nhanh) ⚡️' : 'Du lịch (Chi tiết) 🌴';
    bot.editMessageReplyMarkup(buildInlineMenu(session).reply_markup, {
      chat_id: chatId,
      message_id: query.message.message_id,
    });
    bot.sendMessage(
      chatId,
      `✅ Đã chuyển sang sổ tay: *${modeName}*.\nCác khoản chi mới và báo cáo sẽ áp dụng riêng cho sổ tay này.`,
      { parse_mode: 'Markdown' },
    );

  } else if (data === 'show_results') {
    const msg = buildResultsMessage(session);
    bot.sendMessage(chatId, msg || '⚠️ Chưa có khoản chi tiêu nào trong sổ tay này.', { parse_mode: 'Markdown' });

  } else if (data === 'show_history') {
    const msg = buildHistoryMessage(session);
    bot.sendMessage(chatId, msg || '📋 Chưa có khoản chi nào trong sổ tay này.', { parse_mode: 'Markdown' });

  } else if (data === 'show_help_add') {
    bot.sendMessage(chatId, session.activeMode === 'quick' ? HELP_QUICK : HELP_DETAILED, { parse_mode: 'Markdown' });

  } else if (data === 'show_members') {
    const members = session.activeMode === 'quick' ? session.members_quick : session.members_detailed;
    if (members.size === 0) {
      bot.sendMessage(chatId, '👥 Sổ tay này chưa có thành viên. Gõ `+ Tên1, Tên2` để thêm.', { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(
        chatId,
        `👥 *Thành viên nhóm hiện tại:*\n${[...members].join(', ')}\n\n_(Gõ \`+ Tên\` để thêm người)_`,
        { parse_mode: 'Markdown' },
      );
    }

  } else if (data === 'reset_all') {
    if (session.activeMode === 'quick') {
      session.expenses_quick = [];
      session.members_quick = new Set();
    } else {
      session.expenses_detailed = [];
      session.members_detailed = new Set();
    }
    saveData();
    const modeName = session.activeMode === 'quick' ? 'Quỹ chung' : 'Du lịch';
    bot.sendMessage(
      chatId,
      `✅ Đã xóa toàn bộ dữ liệu của sổ tay *${modeName}*. Sổ còn lại không bị ảnh hưởng!`,
      { parse_mode: 'Markdown' },
    );
  }
});
