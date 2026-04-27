"use strict";

const { formatMoney } = require("../utils/formatters");
const { calculateBalances, minimizeTransactions } = require("./expenseService");
const { getActiveMembers, getActiveExpenses } = require("./sessionService");

/**
 * Build the full debt summary message, or null if no expenses.
 * @param {import('./sessionService').Session} session
 * @returns {string|null}
 */
function buildResultsMessage(session) {
  const members = getActiveMembers(session);
  const expenses = getActiveExpenses(session);
  if (expenses.length === 0) return null;

  const balances = calculateBalances(session);
  const transactions = minimizeTransactions(balances);

  const totalPaid = {};
  const itemizedShares = {};
  members.forEach((m) => { totalPaid[m] = 0; itemizedShares[m] = []; });

  let totalGroupExpense = 0;
  expenses.forEach((exp) => {
    totalGroupExpense += exp.amount;
    totalPaid[exp.payer] = (totalPaid[exp.payer] || 0) + exp.amount;

    // Use custom amounts if provided, otherwise split equally
    if (exp.customAmounts && exp.customAmounts.length > 0) {
      exp.customAmounts.forEach(({ name, amount: customAmount }) => {
        if (!itemizedShares[name]) itemizedShares[name] = [];
        itemizedShares[name].push({ desc: exp.description, share: customAmount });
      });
    } else {
      const actual = exp.isSplitAll ? [...members] : exp.participants;
      const share = exp.amount / actual.length;

      members.forEach((p) => {
        if (!itemizedShares[p]) itemizedShares[p] = [];
        const isParticipant = actual.some((a) => a.toLowerCase() === p.toLowerCase());
        itemizedShares[p].push({ desc: exp.description, share: isParticipant ? share : 0 });
      });
    }
  });

  let msg = "📈 *TỔNG KẾT CÔNG NỢ*\n━━━━━━━━━━━━━━━━━━\n";
  msg += `*Tổng chi tiêu:* ${formatMoney(totalGroupExpense)}\n\n`;
  msg += "■ *CHI TIẾT CÁ NHÂN*\n";

  for (const [person, bal] of Object.entries(balances)) {
    const paid = totalPaid[person] || 0;
    const rounded = Math.round(bal * 100) / 100;

    msg += `*${person}*\n`;
    msg += `• Đã chi: ${formatMoney(paid)}\n`;

    const shares = itemizedShares[person] || [];
    if (shares.length > 0) {
      let totalConsumed = 0;
      msg += "• Chi tiết sử dụng:\n";
      shares.forEach((s) => {
        const r = Math.round(s.share * 100) / 100;
        totalConsumed += r;
        msg += `  - ${s.desc}: ${formatMoney(r)}\n`;
      });
      msg += `  👉 Tổng dùng: *${formatMoney(totalConsumed)}*\n`;
    } else {
      msg += "• Tổng dùng: 0 đ\n";
    }

    if (rounded > 0) msg += `• Trạng thái: NHẬN LẠI ${formatMoney(rounded)} 🟢\n\n`;
    else if (rounded < 0) msg += `• Trạng thái: CẦN ĐÓNG ${formatMoney(-rounded)} 🔴\n\n`;
    else msg += "• Trạng thái: ĐÃ XONG ⚪️\n\n";
  }

  msg += "■ *HƯỚNG DẪN THANH TOÁN*\n";
  if (transactions.length === 0) {
    msg += "Tất cả đã xong xuôi, không ai nợ ai! 🎉";
  } else {
    transactions.forEach((t) => {
      msg += `[${t.from}] chuyển cho [${t.to}] ➔ *${formatMoney(t.amount)}*\n`;
    });
  }

  return msg;
}

/**
 * Build the transaction history message, or null if no expenses.
 * @param {import('./sessionService').Session} session
 * @returns {string|null}
 */
function buildHistoryMessage(session) {
  const members = getActiveMembers(session);
  const expenses = getActiveExpenses(session);
  if (expenses.length === 0) return null;

  let msg = "🧾 *LỊCH SỬ GIAO DỊCH*\n━━━━━━━━━━━━━━━━━━\n";
  let total = 0;

  expenses.forEach((exp, idx) => {
    const actual = exp.isSplitAll ? [...members] : exp.participants;
    const splitText = exp.isSplitAll ? "Cả nhóm" : actual.join(", ");
    msg += `*#${idx + 1}. ${exp.description}*\n`;
    msg += `• Người chi: ${exp.payer}\n`;
    msg += `• Số tiền: ${formatMoney(exp.amount)}\n`;

    if (exp.customAmounts && exp.customAmounts.length > 0) {
      msg += "• Chia tùy chỉnh:\n";
      exp.customAmounts.forEach(({ name, amount }) => {
        msg += `  - ${name}: ${formatMoney(amount)}\n`;
      });
    } else {
      msg += `• Chia cho: ${splitText}\n`;
    }
    msg += "\n";
    total += exp.amount;
  });

  msg += `━━━━━━━━━━━━━━━━━━\n*Tổng cộng: ${formatMoney(total)}*`;
  return msg;
}

module.exports = { buildResultsMessage, buildHistoryMessage };
