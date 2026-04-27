"use strict";

/**
 * Build the inline keyboard menu for a given session.
 * @param {import('../services/sessionService').Session} session
 * @returns {{ reply_markup: object }}
 */
function buildInlineMenu(session) {
  const isQuick = session.activeMode === "quick";

  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `Trạng thái: Đang ở chế độ ${isQuick ? "Nhanh ⚡️" : "Chi tiết 🌴"}`,
            callback_data: "ignore",
          },
        ],
        [
          {
            text: isQuick ? "🟢 Chế độ Nhanh" : "⚪️ Chế độ Nhanh",
            callback_data: "set_mode_quick",
          },
          {
            text: !isQuick ? "🟢 Chế độ Chi tiết" : "⚪️ Chế độ Chi tiết",
            callback_data: "set_mode_detailed",
          },
        ],
        [
          { text: "📊 Xem kết quả", callback_data: "show_results" },
          { text: "📋 Xem lịch sử", callback_data: "show_history" },
        ],
        [
          { text: "➕ Hướng dẫn thêm chi", callback_data: "show_help_add" },
          { text: "👥 Danh sách nhóm", callback_data: "show_members" },
        ],
        [{ text: "🗑️ Xóa sổ tay hiện tại", callback_data: "reset_all" }],
      ],
    },
  };
}

module.exports = { buildInlineMenu };
