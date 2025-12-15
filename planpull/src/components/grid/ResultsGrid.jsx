import React, { useMemo, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';

// Column definitions - exported for use by ColumnPicker
export const COLUMN_DEFS = [
  {
    field: 'rowNumber',
    headerName: '#',
    width: 70,
    editable: false,
    pinned: 'left',
  },
  {
    field: 'item',
    headerName: 'Item',
    flex: 2,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'quantity',
    headerName: 'Qty',
    width: 100,
    filter: 'agNumberColumnFilter',
    valueParser: params => Number(params.newValue),
  },
  {
    field: 'unit',
    headerName: 'Unit',
    width: 100,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'area',
    headerName: 'Area',
    flex: 1,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'page',
    headerName: 'Page',
    width: 80,
    editable: false,
    filter: 'agNumberColumnFilter',
  },
  {
    field: 'verified',
    headerName: '\u2713',
    width: 60,
    pinned: 'right',
    editable: false,
    cellRenderer: params => (
      <input
        type="checkbox"
        checked={params.value || false}
        onChange={(e) => {
          params.node.setDataValue('verified', e.target.checked);
        }}
        style={{ cursor: 'pointer' }}
      />
    ),
  },
];

const ResultsGrid = ({
  rowData,
  onCellValueChanged,
  onSelectionChanged,
  gridRef,
  rowNumberFilter,
  visibleColumns
}) => {
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    editable: true,
  }), []);

  // Apply column visibility
  const columnDefs = useMemo(() => {
    if (!visibleColumns || visibleColumns.length === 0) {
      return COLUMN_DEFS;
    }
    return COLUMN_DEFS.map(col => ({
      ...col,
      hide: !visibleColumns.includes(col.field)
    }));
  }, [visibleColumns]);

  // New v32+ row selection config
  const rowSelection = useMemo(() => ({
    mode: 'multiRow',
    headerCheckbox: true,
    enableClickSelection: false,
  }), []);

  // External filter for row numbers
  const isExternalFilterPresent = useCallback(() => {
    return rowNumberFilter !== null && rowNumberFilter !== undefined && rowNumberFilter.length > 0;
  }, [rowNumberFilter]);

  const doesExternalFilterPass = useCallback((node) => {
    if (!rowNumberFilter || rowNumberFilter.length === 0) return true;
    return rowNumberFilter.includes(node.data.rowNumber);
  }, [rowNumberFilter]);

  // Trigger filter update when rowNumberFilter changes
  useEffect(() => {
    if (gridRef?.current?.api) {
      gridRef.current.api.onFilterChanged();
    }
  }, [rowNumberFilter, gridRef]);

  const handleCellValueChanged = useCallback((event) => {
    if (onCellValueChanged) {
      onCellValueChanged(event);
    }
  }, [onCellValueChanged]);

  const handleSelectionChanged = useCallback(() => {
    if (onSelectionChanged && gridRef?.current?.api) {
      const selectedRows = gridRef.current.api.getSelectedRows();
      onSelectionChanged(selectedRows);
    }
  }, [onSelectionChanged, gridRef]);

  return (
    <div style={{ height: 500, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        theme={themeQuartz}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowSelection={rowSelection}
        onCellValueChanged={handleCellValueChanged}
        onSelectionChanged={handleSelectionChanged}
        animateRows={true}
        isExternalFilterPresent={isExternalFilterPresent}
        doesExternalFilterPass={doesExternalFilterPass}
      />
    </div>
  );
};

export default ResultsGrid;
