/**
 * Apply a schema transformation to rows for export.
 *
 * @param {Array} rows - Array of data objects
 * @param {Object} schema - Schema object with columns array
 * @returns {Object} - { headers: string[], rows: Array }
 */
export function applySchema(rows, schema) {
  if (!schema || !schema.columns) {
    // No schema - return raw data
    return {
      headers: null,
      rows: rows
    };
  }

  // Get included columns, sorted by order
  const includedColumns = schema.columns
    .filter(col => col.include)
    .sort((a, b) => a.order - b.order);

  if (includedColumns.length === 0) {
    return { headers: [], rows: [] };
  }

  // Build headers from output names
  const headers = includedColumns.map(col => col.outputName || col.sourceField);

  // Transform each row
  const transformedRows = rows.map(row => {
    const newRow = {};
    includedColumns.forEach(col => {
      newRow[col.outputName || col.sourceField] = row[col.sourceField];
    });
    return newRow;
  });

  return {
    headers,
    rows: transformedRows
  };
}

/**
 * Convert transformed data to CSV string.
 *
 * @param {string[]} headers - Column headers
 * @param {Array} rows - Transformed rows
 * @returns {string} - CSV string
 */
export function toCSV(headers, rows) {
  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row =>
    headers.map(h => escapeCSV(row[h])).join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}

/**
 * Apply schema and convert to CSV in one step.
 *
 * @param {Array} rows - Raw data rows
 * @param {Object} schema - Schema object (or null for raw export)
 * @returns {string} - CSV string
 */
export function exportWithSchema(rows, schema) {
  if (!schema || !schema.columns) {
    // Raw export - use default columns
    const defaultHeaders = ['#', 'Item', 'Quantity', 'Unit', 'Area', 'Page'];
    const fieldMap = {
      '#': 'rowNumber',
      'Item': 'item',
      'Quantity': 'quantity',
      'Unit': 'unit',
      'Area': 'area',
      'Page': 'page'
    };

    const csvRows = rows.map(row =>
      defaultHeaders.map(h => {
        const val = row[fieldMap[h]];
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );

    return [defaultHeaders.join(','), ...csvRows].join('\n');
  }

  const { headers, rows: transformedRows } = applySchema(rows, schema);
  return toCSV(headers, transformedRows);
}
