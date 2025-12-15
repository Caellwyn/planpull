/**
 * Consolidate rows by a specified column, summing quantities.
 *
 * @param {Array} rows - Detail rows (source of truth)
 * @param {string} groupByColumn - Column to group by (e.g., 'item', 'area', 'unit')
 * @returns {Array} Consolidated rows with totals and breakdowns
 */
export function consolidateRows(rows, groupByColumn = 'item') {
  if (!rows || rows.length === 0) return [];

  const groups = {};

  rows.forEach(row => {
    const key = row[groupByColumn] || '(empty)';

    if (!groups[key]) {
      groups[key] = {
        groupValue: key,
        groupByColumn: groupByColumn,
        totalQuantity: 0,
        breakdown: [],
        rowNumbers: [],
        unit: row.unit || ''
      };
    }

    groups[key].totalQuantity += Number(row.quantity) || 0;
    groups[key].rowNumbers.push(row.rowNumber);

    // Build breakdown string showing contributing items
    const breakdownItem = groupByColumn === 'item'
      ? `${row.area || 'No area'} (${row.quantity})`
      : `${row.item} (${row.quantity})`;
    groups[key].breakdown.push(breakdownItem);
  });

  // Convert to array and format breakdown as string
  return Object.values(groups).map((group, index) => ({
    ...group,
    rowNumber: index + 1,
    breakdownText: group.breakdown.join(', ')
  }));
}

/**
 * Get available columns for grouping (excludes non-groupable fields)
 */
export function getGroupableColumns(rows) {
  if (!rows || rows.length === 0) return ['item'];

  const exclude = ['rowNumber', 'quantity', 'verified', 'estimated', 'source', 'page'];
  const firstRow = rows[0];

  return Object.keys(firstRow).filter(key =>
    !exclude.includes(key) && firstRow[key] !== undefined
  );
}
