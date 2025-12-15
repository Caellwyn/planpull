import { useState, useMemo, useCallback } from 'react';
import { consolidateRows, getGroupableColumns } from '../utils/consolidation';

export function useGridData(initialData = []) {
  const [detailRows, setDetailRows] = useState(initialData);
  const [groupByColumn, setGroupByColumn] = useState('item');

  // Consolidated view computed from detail rows (recalculates on any change)
  const consolidatedRows = useMemo(() => {
    return consolidateRows(detailRows, groupByColumn);
  }, [detailRows, groupByColumn]);

  // Available columns for grouping
  const groupableColumns = useMemo(() => {
    return getGroupableColumns(detailRows);
  }, [detailRows]);

  // Update a cell in detail view
  const updateCell = useCallback((rowNumber, field, value) => {
    setDetailRows(prev => prev.map(row =>
      row.rowNumber === rowNumber
        ? { ...row, [field]: value }
        : row
    ));
  }, []);

  // Delete rows
  const deleteRows = useCallback((rowNumbers) => {
    setDetailRows(prev => prev.filter(row =>
      !rowNumbers.includes(row.rowNumber)
    ));
  }, []);

  // Verify rows
  const verifyRows = useCallback((rowNumbers) => {
    setDetailRows(prev => prev.map(row =>
      rowNumbers.includes(row.rowNumber)
        ? { ...row, verified: true }
        : row
    ));
  }, []);

  // Unverify rows
  const unverifyRows = useCallback((rowNumbers) => {
    setDetailRows(prev => prev.map(row =>
      rowNumbers.includes(row.rowNumber)
        ? { ...row, verified: false }
        : row
    ));
  }, []);

  // Reset with new data (after new extraction)
  const setData = useCallback((newData) => {
    setDetailRows(newData || []);
  }, []);

  // Append new data (for "Add to extraction" feature)
  const appendData = useCallback((newItems) => {
    if (!newItems || newItems.length === 0) return;

    setDetailRows(prev => {
      // Find the highest current row number
      const maxRowNumber = prev.length > 0
        ? Math.max(...prev.map(r => r.rowNumber))
        : 0;

      // Renumber new items starting after the current max
      const renumberedItems = newItems.map((item, index) => ({
        ...item,
        rowNumber: maxRowNumber + index + 1
      }));

      return [...prev, ...renumberedItems];
    });
  }, []);

  return {
    detailRows,           // Source of truth - render in Detail view
    consolidatedRows,     // Computed - render in Consolidated view
    groupByColumn,
    setGroupByColumn,
    groupableColumns,
    updateCell,
    deleteRows,
    verifyRows,
    unverifyRows,
    setData,
    appendData            // For adding pages to existing extraction
  };
}
