'use strict';

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/db.json');

/**
 * @typedef {Object} Expense
 * @property {string} payer
 * @property {number} amount
 * @property {string} description
 * @property {string[]} participants
 * @property {boolean} isSplitAll
 * @property {Array<{name: string, amount: number}>} [customAmounts]
 */

/**
 * @typedef {Object} Session
 * @property {'quick'|'detailed'} activeMode
 * @property {Set<string>} members_quick
 * @property {Set<string>} members_detailed
 * @property {Expense[]} expenses_quick
 * @property {Expense[]} expenses_detailed
 * @property {{payer: string, totalPaid: number, items: Array<{description: string, amount: number, participants: string[]}>}|null} [pendingBill]
 */

/** @type {Record<string, Session>} */
const sessions = _loadFromDisk();

function _loadFromDisk() {
  if (!fs.existsSync(DB_PATH)) return {};

  try {
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

    for (const chatId in parsed) {
      const s = parsed[chatId];

      // Migration: old single `members` → split by mode
      if (s.members) {
        s.members_quick = new Set(s.members);
        s.members_detailed = new Set(s.members);
        delete s.members;
      } else {
        s.members_quick = new Set(s.members_quick || []);
        s.members_detailed = new Set(s.members_detailed || []);
      }

      // Migration: old single `expenses` → detailed
      if (s.expenses) {
        s.expenses_detailed = s.expenses;
        delete s.expenses;
      }

      s.expenses_quick = s.expenses_quick || [];
      s.expenses_detailed = s.expenses_detailed || [];
      s.activeMode = s.activeMode || 'quick';
    }

    return parsed;
  } catch (err) {
    console.error('[sessionService] Failed to load DB:', err.message);
    return {};
  }
}

function saveData() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const toSave = {};
    for (const chatId in sessions) {
      const s = sessions[chatId];
      toSave[chatId] = {
        activeMode: s.activeMode,
        members_quick: [...s.members_quick],
        members_detailed: [...s.members_detailed],
        expenses_quick: s.expenses_quick,
        expenses_detailed: s.expenses_detailed,
      };
    }

    fs.writeFileSync(DB_PATH, JSON.stringify(toSave, null, 2));
  } catch (err) {
    console.error('[sessionService] Failed to save DB:', err.message);
  }
}

/**
 * Get or create a session for a chat.
 * @param {string|number} chatId
 * @returns {Session}
 */
function getSession(chatId) {
  const id = String(chatId);
  if (!sessions[id]) {
    sessions[id] = {
      activeMode: 'quick',
      members_quick: new Set(),
      members_detailed: new Set(),
      expenses_quick: [],
      expenses_detailed: [],
    };
    saveData();
  }
  return sessions[id];
}

/**
 * Get the active members Set for a session.
 * @param {Session} session
 * @returns {Set<string>}
 */
function getActiveMembers(session) {
  return session.activeMode === 'quick' ? session.members_quick : session.members_detailed;
}

/**
 * Get the active expenses array for a session.
 * @param {Session} session
 * @returns {Expense[]}
 */
function getActiveExpenses(session) {
  return session.activeMode === 'quick' ? session.expenses_quick : session.expenses_detailed;
}

module.exports = { sessions, getSession, saveData, getActiveMembers, getActiveExpenses };
