/**
 * Consolidate rows by a specified column, summing quantities.
 * When grouping by 'item', also groups by unit to prevent mixing different units.
 *
 * @param {Array} rows - Detail rows (source of truth)
 * @param {string} groupByColumn - Column to group by (e.g., 'item', 'area', 'unit')
 * @returns {Array} Consolidated rows with totals and breakdowns
 */
export function consolidateRows(rows, groupByColumn = 'item') {
  if (!rows || rows.length === 0) return [];

  const groups = {};

  rows.forEach(row => {
    const primaryValue = row[groupByColumn] || '(empty)';
    const unit = row.unit || '';

    // When grouping by 'item', include unit in the key to prevent mixing units
    // e.g., "gravel|lb" vs "gravel|cuft" stay separate
    const key = groupByColumn === 'item'
      ? `${primaryValue}|${unit}`
      : primaryValue;

    if (!groups[key]) {
      groups[key] = {
        groupValue: primaryValue,
        groupByColumn: groupByColumn,
        totalQuantity: 0,
        breakdown: [],
        rowNumbers: [],
        unit: unit
      };
    }

    groups[key].totalQuantity += Number(row.quantity) || 0;
    groups[key].rowNumbers.push(row.rowNumber);

    // Store full row data in breakdown for schema export support
    groups[key].breakdown.push({
      ...row,
      breakdownText: groupByColumn === 'item'
        ? `${row.area || 'No area'} (${row.quantity})`
        : `${row.item} (${row.quantity})`
    });
  });

  // Convert to array and format breakdown as string
  return Object.values(groups).map((group, index) => ({
    ...group,
    rowNumber: index + 1,
    breakdownText: group.breakdown.map(b => b.breakdownText).join(', ')
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
