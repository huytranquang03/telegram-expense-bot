'use strict';

const db = require('./databaseService');

/**
 * Get or create a session for a chat.
 * @param {string|number} chatId
 * @returns {Promise<Session>}
 */
async function getSession(chatId) {
  return await db.getSession(String(chatId));
}

/**
 * Save session changes.
 * @param {Session} session
 * @returns {Promise<Session>}
 */
async function saveData(session) {
  return await db.saveSession(session);
}

/**
 * Get the active members array for a session.
 * @param {Session} session
 * @returns {string[]}
 */
function getActiveMembers(session) {
  return session.activeMode === 'quick' ? session.members_quick : session.members_detailed;
}

/**
 * Get the active expenses array for a session.
 * @param {Session} session
 * @returns {Array}
 */
function getActiveExpenses(session) {
  return session.activeMode === 'quick' ? session.expenses_quick : session.expenses_detailed;
}

module.exports = { getSession, saveData, getActiveMembers, getActiveExpenses };
