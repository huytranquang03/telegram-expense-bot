const Session = require('../models/Session');

class DatabaseService {
  async getSession(chatId) {
    let session = await Session.findOne({ chatId });
    if (!session) {
      session = await Session.create({
        chatId,
        activeMode: 'quick',
        members_quick: [],
        members_detailed: [],
        expenses_quick: [],
        expenses_detailed: [],
      });
    }
    return session;
  }

  async saveSession(session) {
    return await session.save();
  }

  async updateSession(chatId, updates) {
    return await Session.findOneAndUpdate(
      { chatId },
      updates,
      { upsert: true, new: true }
    );
  }

  async addExpense(chatId, mode, expense) {
    const field = mode === 'quick' ? 'expenses_quick' : 'expenses_detailed';
    return await Session.findOneAndUpdate(
      { chatId },
      { $push: { [field]: expense } },
      { upsert: true, new: true }
    );
  }

  async resetSession(chatId, mode) {
    const updates = mode === 'quick'
      ? { expenses_quick: [], members_quick: [] }
      : { expenses_detailed: [], members_detailed: [] };

    return await Session.findOneAndUpdate(
      { chatId },
      updates,
      { new: true }
    );
  }
}

module.exports = new DatabaseService();
