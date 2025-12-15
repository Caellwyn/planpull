/**
 * Parse a row filter string into an array of row numbers.
 *
 * Supports:
 * - Single numbers: "5" → [5]
 * - Comma-separated: "5, 10" → [5, 10]
 * - Ranges: "10-15" → [10, 11, 12, 13, 14, 15]
 * - Mixed: "5, 10-15, 20" → [5, 10, 11, 12, 13, 14, 15, 20]
 *
 * @param {string} input - The filter string
 * @returns {number[]} Sorted, deduplicated array of row numbers
 */
export function parseRowFilter(input) {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const trimmed = input.trim();
  if (trimmed === '') {
    return [];
  }

  const result = new Set();

  // Split by comma
  const parts = trimmed.split(',');

  for (const part of parts) {
    const cleaned = part.trim();
    if (cleaned === '') continue;

    // Check if it's a range (contains "-")
    if (cleaned.includes('-')) {
      const rangeParts = cleaned.split('-');
      if (rangeParts.length === 2) {
        const start = parseInt(rangeParts[0].trim(), 10);
        const end = parseInt(rangeParts[1].trim(), 10);

        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            result.add(i);
          }
        }
      }
    } else {
      // Single number
      const num = parseInt(cleaned, 10);
      if (!isNaN(num) && num > 0) {
        result.add(num);
      }
    }
  }

  // Convert to sorted array
  return Array.from(result).sort((a, b) => a - b);
}

/**
 * Format an array of row numbers back into a compact string.
 * Useful for display or debugging.
 *
 * @param {number[]} rows - Array of row numbers
 * @returns {string} Formatted string
 */
export function formatRowFilter(rows) {
  if (!rows || rows.length === 0) return '';

  const sorted = [...rows].sort((a, b) => a - b);
  const ranges = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === rangeEnd + 1) {
      rangeEnd = sorted[i];
    } else {
      ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);
      rangeStart = sorted[i];
      rangeEnd = sorted[i];
    }
  }

  ranges.push(rangeStart === rangeEnd ? `${rangeStart}` : `${rangeStart}-${rangeEnd}`);

  return ranges.join(', ');
}
