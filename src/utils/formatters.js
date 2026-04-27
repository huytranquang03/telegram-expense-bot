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
 * Supports: 150k, 1.5k, 150K, 1.5M, 2M, 150.000, 150,000
 * Bare integers < 1000 are auto-multiplied by 1000.
 * @param {string} inputStr
 * @returns {number}
 */
function parseMoney(inputStr) {
  let str = inputStr.toLowerCase().trim();

  if (str.endsWith('m')) {
    const num = parseFloat(str.slice(0, -1).replace(',', '.'));
    return isNaN(num) ? 0 : num * 1000000;
  }

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
  return parts
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    // Filter out parts that look like money (starts with digit or ends with k/m)
    .filter((p) => !/^[0-9]/.test(p) && !p.toLowerCase().endsWith('k') && !p.toLowerCase().endsWith('m'))
    .map(formatName);
}

/**
 * Parse custom split amounts like "Huy 100k An 150k Minh 50k"
 * Format: Name Amount (space-separated, no colon needed)
 * @param {string} inputStr
 * @returns {Array<{name: string, amount: number}>}
 */
function parseCustomSplit(inputStr) {
  const raw = inputStr.trim();
  if (!raw) return [];

  // Remove colons if they exist to normalize
  const normalized = raw.replace(/:/g, ' ');
  const parts = normalized.split(/\s+/);
  const result = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    // Use parseMoney to check if it's an amount
    // We only consider it an amount if it actually contains a number
    const hasDigit = /[0-9]/.test(part);
    const amount = hasDigit ? parseMoney(part) : 0;

    if (amount > 0 && i > 0) {
      const prevPart = parts[i - 1];
      // Previous part must NOT be an amount itself
      if (!/[0-9]/.test(prevPart)) {
        const name = formatName(prevPart);
        if (name) {
          result.push({ name, amount });
        }
      }
    }
  }

  return result;
}

module.exports = { formatMoney, formatName, parseMoney, parseNameList, parseCustomSplit };
