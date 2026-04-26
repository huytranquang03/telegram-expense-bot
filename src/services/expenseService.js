'use strict';

const { getActiveMembers, getActiveExpenses } = require('./sessionService');

/**
 * Calculate net balance per member (positive = owed money back, negative = owes money).
 * @param {import('./sessionService').Session} session
 * @returns {Record<string, number>}
 */
function calculateBalances(session) {
  const members = getActiveMembers(session);
  const expenses = getActiveExpenses(session);
  const balance = {};

  members.forEach((m) => { balance[m] = 0; });

  for (const { payer, amount, participants, isSplitAll, customAmounts } of expenses) {
    // Use custom amounts if provided, otherwise split equally
    if (customAmounts && customAmounts.length > 0) {
      // Custom split: each person pays their specified amount
      customAmounts.forEach(({ name, amount: customAmount }) => {
        if (balance[name] === undefined) balance[name] = 0;
        balance[name] -= customAmount;
      });
    } else {
      // Equal split
      const actual = isSplitAll ? [...members] : participants;
      const share = amount / actual.length;

      actual.forEach((p) => {
        if (balance[p] === undefined) balance[p] = 0;
        balance[p] -= share;
      });
    }

    if (balance[payer] === undefined) balance[payer] = 0;
    balance[payer] += amount;
  }

  return balance;
}

/**
 * Minimize the number of transactions to settle all debts.
 * @param {Record<string, number>} balances
 * @returns {{ from: string, to: string, amount: number }[]}
 */
function minimizeTransactions(balances) {
  const creditors = [];
  const debtors = [];

  for (const [person, bal] of Object.entries(balances)) {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded > 0) creditors.push({ person, amount: rounded });
    else if (rounded < 0) debtors.push({ person, amount: -rounded });
  }

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i];
    const debt = debtors[j];
    const paid = Math.min(credit.amount, debt.amount);

    transactions.push({
      from: debt.person,
      to: credit.person,
      amount: Math.round(paid * 100) / 100,
    });

    credit.amount -= paid;
    debt.amount -= paid;
    if (credit.amount < 0.01) i++;
    if (debt.amount < 0.01) j++;
  }

  return transactions;
}

module.exports = { calculateBalances, minimizeTransactions };
