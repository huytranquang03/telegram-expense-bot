"use strict";

const bot = require("../bot");
const {
	getSession,
	saveData,
	getActiveMembers,
	getActiveExpenses,
} = require("../services/sessionService");
const {
	formatMoney,
	formatName,
	parseMoney,
	parseNameList,
	parseCustomSplit,
} = require("../utils/formatters");
const { buildInlineMenu } = require("../utils/menuBuilder");
const {
	buildResultsMessage,
	buildHistoryMessage,
} = require("../services/reportService");

const WELCOME_MSG = `⚡️ *QUẢN LÝ CHI TIÊU NHÓM*
━━━━━━━━━━━━━━━━━━
Mọi tính năng đã được tự động hoá. Bạn chỉ cần gõ tin nhắn vào nhóm, bot sẽ tự hiểu!

Bấm vào menu bên dưới để kiểm tra sổ sách:`;

bot.on("message", async (msg) => {
	const chatId = msg.chat.id;
	const text = msg.text ? msg.text.trim() : "";
	const session = await getSession(chatId);

	// Auto-add the message sender to the active member list
	if (msg.from?.first_name) {
		const name = formatName(msg.from.first_name);
		const members = getActiveMembers(session);
		const exists = members.find((m) => m.toLowerCase() === name.toLowerCase());
		if (!exists) {
			members.push(name);
			await saveData(session);
		}
	}

	if (!text) return;

	// ── Bill flow (detailed mode only) ───────────────────────────────────────────
	if (session.activeMode === "detailed") {
		// bill <Payer> <Amount> → start bill session
		const billMatch = text.match(/^bill\s+(.+?)\s+([0-9.,]+[kK]?)$/i);
		if (billMatch) {
			const payerCandidate = formatName(billMatch[1]);
			const amount = parseMoney(billMatch[2]);

			if (isNaN(amount) || amount <= 0) {
				return await bot.sendMessage(chatId, "⚠️ Số tiền không hợp lệ.");
			}

			const members = getActiveMembers(session);
			const existingPayer = members.find(
				(m) => m.toLowerCase() === payerCandidate.toLowerCase(),
			);
			if (!existingPayer) {
				members.push(payerCandidate);
				await saveData(session);
			}
			const actualPayer = members.find(
				(m) => m.toLowerCase() === payerCandidate.toLowerCase(),
			);

			session.pendingBill = {
				payer: actualPayer,
				totalPaid: amount,
				items: [],
			};
			await saveData(session);

			return await bot.sendMessage(
				chatId,
				`🧾 *Đang nhập bill*\n━━━━━━━━━━━━━━━━━━\n• Người trả: ${actualPayer}\n• Tổng tiền: ${formatMoney(amount)}\n\nGõ "món <tên> <số tiền>[: người1 người2]" để thêm món.\nGõ "xong" để lưu, "hủy" để bỏ.`,
				{ parse_mode: "Markdown" },
			);
		}

		// món <desc> <amount>[: Names] → add dish to pending bill
		if (session.pendingBill && text.toLowerCase().startsWith("món ")) {
			const dishText = text.substring(4).trim();
			const dishMatch = dishText.match(
				/^(.+?)\s+([0-9.,]+[kK]?)(?:\s*[:\s]\s*(.*))?$/i,
			);

			if (!dishMatch) {
				return await bot.sendMessage(
					chatId,
					"⚠️ Cú pháp món: món <tên> <số tiền>[: người1 người2]",
				);
			}

			const description = dishMatch[1].trim();
			const amount = parseMoney(dishMatch[2]);
			const participantsStr = dishMatch[3] ? dishMatch[3].trim() : "";

			if (isNaN(amount) || amount <= 0) {
				return await bot.sendMessage(chatId, "⚠️ Số tiền món không hợp lệ.");
			}

			const participants = [];
			if (participantsStr) {
				const names = parseNameList(participantsStr);
				const members = getActiveMembers(session);
				for (const n of names) {
					const match = members.find(
						(m) => m.toLowerCase() === n.toLowerCase(),
					);
					if (match) {
						participants.push(match);
					} else {
						members.push(n);
						participants.push(n);
					}
				}
			}

			session.pendingBill.items.push({ description, amount, participants });
			await saveData(session);

			const participantText =
				participants.length > 0 ? participants.join(", ") : "Cả nhóm";
			return await bot.sendMessage(
				chatId,
				`✅ Đã thêm món: *${description}*\n━━━━━━━━━━━━━━━━━━\n• Giá: ${formatMoney(amount)}\n• Dùng bởi: ${participantText}\n\nĐã có ${session.pendingBill.items.length} món. Gõ "xong" để lưu.`,
				{ parse_mode: "Markdown" },
			);
		}

		// xong → finalize bill
		if (session.pendingBill && text.toLowerCase() === "xong") {
			const { payer, totalPaid, items } = session.pendingBill;
			const expenses = getActiveExpenses(session);
			const members = getActiveMembers(session);

			if (items.length === 0) {
				session.pendingBill = null;
				await saveData(session);
				return await bot.sendMessage(
					chatId,
					"⚠️ Chưa có món nào. Đã hủy bill.",
				);
			}

			// Calculate total from items
			const totalFromItems = items.reduce((sum, item) => sum + item.amount, 0);

			// Add each item as a separate expense
			items.forEach((item) => {
				const itemParticipants =
					item.participants.length > 0 ? item.participants : [...members];
				expenses.push({
					payer,
					amount: item.amount,
					description: item.description,
					participants: itemParticipants,
					isSplitAll: item.participants.length === 0,
				});
			});

			session.pendingBill = null;
			await saveData(session);

			const warning =
				totalFromItems !== totalPaid
					? `\n⚠️ Lưu ý: Tổng món (${formatMoney(totalFromItems)}) khác tổng bill (${formatMoney(totalPaid)})`
					: "";

			return await bot.sendMessage(
				chatId,
				`✅ *Đã lưu bill của ${payer}*\n━━━━━━━━━━━━━━━━━━\n• Tổng bill: ${formatMoney(totalPaid)}\n• Số món: ${items.length}${warning}\n\nGõ "?" để xem kết quả.`,
				{ parse_mode: "Markdown" },
			);
		}

		// hủy → cancel bill
		if (session.pendingBill && text.toLowerCase() === "hủy") {
			session.pendingBill = null;
			await saveData(session);
			return await bot.sendMessage(chatId, "❌ Đã hủy bill.");
		}
	}

	// ── Commands ──────────────────────────────────────────────────────────────
	if (["/start", "/menu", "/help"].includes(text)) {
		return await bot.sendMessage(chatId, WELCOME_MSG, {
			parse_mode: "Markdown",
			...buildInlineMenu(session),
		});
	}

	if (["?", "kq"].includes(text.toLowerCase())) {
		const result = buildResultsMessage(session);
		return await bot.sendMessage(
			chatId,
			result || "⚠️ Chưa có khoản chi tiêu nào trong sổ tay này.",
			{ parse_mode: "Markdown" },
		);
	}

	if (text.toLowerCase() === "ls") {
		const history = buildHistoryMessage(session);
		return await bot.sendMessage(
			chatId,
			history || "📋 Chưa có khoản chi nào trong sổ tay này.",
			{ parse_mode: "Markdown" },
		);
	}

	// ── Add members manually: + Tên1, Tên2 ───────────────────────────────────
	if (text.startsWith("+")) {
		const names = parseNameList(text.substring(1));
		const members = getActiveMembers(session);
		if (names.length > 0) {
			names.forEach((n) => {
				const exists = members.find((m) => m.toLowerCase() === n.toLowerCase());
				if (!exists) members.push(n);
			});
			await saveData(session);
			return await bot.sendMessage(
				chatId,
				`✅ Đã thêm: *${names.join(", ")}*`,
				{ parse_mode: "Markdown" },
			);
		}
		return;
	}

	// ── Record expense: <Payer> <Amount> [Description] [chia Name1, Name2] ───
	let textWithoutChia = text;
	let splitStr = "";
	const chiaMatch = text.match(/\s+chia\s+(.*)$/i);
	if (chiaMatch) {
		splitStr = chiaMatch[1];
		textWithoutChia = text.substring(0, chiaMatch.index);
	}

	const expenseMatch = textWithoutChia.match(
		/^(.*?)\s+([0-9.,]+[kK]?)(?:\s+(.*))?$/i,
	);
	if (!expenseMatch) return;

	const payerCandidate = formatName(expenseMatch[1]);
	const amountStr = expenseMatch[2];
	let description = expenseMatch[3]
		? expenseMatch[3].trim()
		: "Đóng góp quỹ chung";

	const members = getActiveMembers(session);

	// Auto-add payer if not already a member
	const existingPayer = members.find(
		(m) => m.toLowerCase() === payerCandidate.toLowerCase(),
	);
	if (!existingPayer) {
		members.push(payerCandidate);
		await saveData(session);
	}
	const actualPayer = members.find(
		(m) => m.toLowerCase() === payerCandidate.toLowerCase(),
	);
	if (!actualPayer) return;

	const amount = parseMoney(amountStr);
	if (isNaN(amount) || amount <= 0) return;

	let participants = [];
	let isSplitAll = false;
	let customAmounts = null;

	// Check for custom split amounts (Name Amount or Name:Amount format)
	if (splitStr) {
		customAmounts = parseCustomSplit(splitStr);

		if (customAmounts && customAmounts.length > 0) {
			// Validate and add custom amount participants
			const totalCustom = customAmounts.reduce(
				(sum, { amount: ca }) => sum + ca,
				0,
			);

			// Add all custom amount participants to members
			for (const { name } of customAmounts) {
				const match = members.find(
					(m) => m.toLowerCase() === name.toLowerCase(),
				);
				if (!match) {
					members.push(name);
				}
			}
			await saveData(session);

			// Warn if totals don't match
			if (Math.abs(totalCustom - amount) > 1) {
				await bot.sendMessage(
					chatId,
					`⚠️ Cảnh báo: Tổng chia tùy chỉnh (${formatMoney(totalCustom)}) khác số tiền (${formatMoney(amount)}). Vẫn ghi nhận theo yêu cầu.`,
					{ parse_mode: "Markdown" },
				);
			}
		}
	}

	// Regular split (equal or by name list)
	if ((!customAmounts || customAmounts.length === 0) && splitStr) {
		const names = parseNameList(splitStr);
		for (const n of names) {
			const match = members.find((m) => m.toLowerCase() === n.toLowerCase());
			if (match) {
				participants.push(match);
			} else {
				members.push(n);
				participants.push(n);
			}
		}
	} else if (!customAmounts) {
		participants = [...members];
		isSplitAll = true;
	}

	// Quick mode: always split all with a generic description
	if (session.activeMode === "quick") {
		participants = [...members];
		isSplitAll = true;
		customAmounts = null;
		description = "Đóng góp chung";
	}

	if (!customAmounts && participants.length < 1) {
		return await bot.sendMessage(chatId, "⚠️ Không tìm thấy ai để chia tiền.");
	}

	const expenses = getActiveExpenses(session);
	expenses.push({
		payer: actualPayer,
		amount,
		description,
		participants,
		isSplitAll,
		customAmounts,
	});
	await saveData(session);

	// Build response message
	let responseMsg = `✅ *Đã ghi nhận: ${description}*\n━━━━━━━━━━━━━━━━━━\n• Người chi: ${actualPayer} (${formatMoney(amount)})\n`;

	if (customAmounts && customAmounts.length > 0) {
		responseMsg += "• Chia tùy chỉnh:\n";
		customAmounts.forEach(({ name, amount: customAmount }) => {
			responseMsg += `  - ${name}: ${formatMoney(customAmount)}\n`;
		});
	} else {
		const actualCount = isSplitAll ? members.length : participants.length;
		const perPerson = Math.round((amount / actualCount) * 100) / 100;
		responseMsg += `• Chia cho: ${isSplitAll ? "Cả nhóm" : participants.join(", ")}\n• Mỗi người: ${formatMoney(perPerson)}`;
	}
	return await bot.sendMessage(chatId, responseMsg, { parse_mode: "Markdown" });
});
