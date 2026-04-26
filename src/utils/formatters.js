'use strict';

/**
 * Format a number as Vietnamese currency string.
 * @param {number} amount
 * @returns {string}
 */
function formatMoney(amount) {
  return amount.toLocaleString('vi-VN') + ' đ';
}

/**
 * Capitalize the first Unicode letter of a name string.
 * @param {string} name
 * @returns {string}
 */
function formatName(name) {
  if (!name) return '';
  return name.trim().replace(/\p{L}/u, (ch) => ch.toUpperCase());
}

/**
 * Parse a Vietnamese money string.
 * Supports: 150k, 1.5k, 150K, 150.000, 150,000
 * Bare integers < 1000 are auto-multiplied by 1000.
 * @param {string} inputStr
 * @returns {number}
 */
function parseMoney(inputStr) {
  let str = inputStr.toLowerCase().trim();

  if (str.endsWith('k')) {
    const num = parseFloat(str.slice(0, -1).replace(',', '.'));
    return isNaN(num) ? 0 : num * 1000;
  }

  const original = str;
  str = str.replace(/[.,]/g, '').replace(/[^0-9]/g, '');
  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  if (!original.includes('.') && !original.includes(',') && num > 0 && num < 1000) {
    return num * 1000;
  }
  return num;
}

/**
 * Split a comma- or space-separated name string into formatted names.
 * @param {string} inputStr
 * @returns {string[]}
 */
function parseNameList(inputStr) {
  const raw = inputStr.trim();
  if (!raw) return [];
  const parts = raw.includes(',') ? raw.split(',') : raw.split(/\s+/);
  return parts.map(formatName).filter((n) => n.length > 0);
}

/**
 * Parse custom split amounts like "Huy:100k An:150k Minh:50k"
 * @param {string} inputStr
 * @returns {Array<{name: string, amount: number}>}
 */
function parseCustomSplit(inputStr) {
  const raw = inputStr.trim();
  if (!raw) return [];

  const parts = raw.includes(',') ? raw.split(',') : raw.split(/\s+/);
  const result = [];

  for (const part of parts) {
    const match = part.match(/^(.+?):([0-9.,]+[kK]?)$/);
    if (match) {
      const name = formatName(match[1]);
      const amount = parseMoney(match[2]);
      if (name && amount > 0) {
        result.push({ name, amount });
      }
    }
  }

  return result;
}

module.exports = { formatMoney, formatName, parseMoney, parseNameList, parseCustomSplit };
