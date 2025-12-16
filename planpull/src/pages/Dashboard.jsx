import React, { useState, useRef, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import FileDropzone from '../components/dashboard/FileDropzone';
import ResultsGrid, { COLUMN_DEFS } from '../components/grid/ResultsGrid';
import ConsolidatedView from '../components/grid/ConsolidatedView';
import RowNumberFilter from '../components/grid/RowNumberFilter';
import ColumnPicker from '../components/grid/ColumnPicker';
import { useGridData } from '../hooks/useGridData';
import { extractPdf } from '../services/api';
import { exportWithSchema } from '../utils/schemaTransform';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [hasResults, setHasResults] = useState(false);
    const [viewMode, setViewMode] = useState('detail'); // 'detail' | 'consolidated'
    const [showDropzone, setShowDropzone] = useState(true);
    const [extractionMode, setExtractionMode] = useState('new'); // 'new' | 'add'
    const [totalPages, setTotalPages] = useState(0);
    const [rowNumberFilter, setRowNumberFilter] = useState(null);
    const [visibleColumns, setVisibleColumns] = useState(COLUMN_DEFS.map(c => c.field));
    const [schemas, setSchemas] = useState([]);
    const [selectedSchemaId, setSelectedSchemaId] = useState('');
    const gridRef = useRef(null);

    // Load available schemas
    useEffect(() => {
        const schemasRef = collection(db, 'schemas');
        const unsubscribe = onSnapshot(schemasRef, (snapshot) => {
            const allSchemas = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Filter to system schemas + user's schemas
            const filtered = allSchemas.filter(s =>
                s.scope === 'system' || s.ownerId === currentUser?.uid
            );
            setSchemas(filtered);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const {
        detailRows,
        consolidatedRows,
        groupByColumn,
        setGroupByColumn,
        groupableColumns,
        updateCell,
        deleteRows,
        verifyRows,
        setData,
        appendData
    } = useGridData([]);

    const handleFileSelect = async (file) => {
        setUploading(true);
        setError(null);

        try {
            const response = await extractPdf(file);
            const items = response.items || response.data?.items || [];
            const pageCount = response.pageCount || response.data?.pageCount || 0;

            if (extractionMode === 'new') {
                setData(items);
                setTotalPages(pageCount);
            } else {
                // Add to existing extraction - renumber rows
                appendData(items);
                setTotalPages(prev => prev + pageCount);
            }

            setHasResults(true);
            setShowDropzone(false); // Collapse dropzone after extraction
        } catch (err) {
            console.error(err);
            setError("Failed to extract PDF. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleStartNew = () => {
        setExtractionMode('new');
        setShowDropzone(true);
    };

    const handleAddToExtraction = () => {
        setExtractionMode('add');
        setShowDropzone(true);
    };

    const handleCancelDropzone = () => {
        setShowDropzone(false);
    };

    const handleCellValueChanged = (event) => {
        updateCell(event.data.rowNumber, event.colDef.field, event.newValue);
    };

    const handleSelectAll = () => {
        if (gridRef.current?.api) {
            gridRef.current.api.selectAll();
        }
    };

    const handleDeselectAll = () => {
        if (gridRef.current?.api) {
            gridRef.current.api.deselectAll();
        }
    };

    const handleVerifySelected = () => {
        if (gridRef.current?.api) {
            const selectedRows = gridRef.current.api.getSelectedRows();
            const rowNumbers = selectedRows.map(r => r.rowNumber);
            verifyRows(rowNumbers);
        }
    };

    const handleDeleteSelected = () => {
        if (gridRef.current?.api) {
            const selectedRows = gridRef.current.api.getSelectedRows();
            if (selectedRows.length === 0) return;
            if (window.confirm(`Delete ${selectedRows.length} selected row(s)?`)) {
                const rowNumbers = selectedRows.map(r => r.rowNumber);
                deleteRows(rowNumbers);
            }
        }
    };

    const handleExportCSV = () => {
        let rows;
        if (viewMode === 'detail') {
            // Apply row filter if active
            rows = rowNumberFilter && rowNumberFilter.length > 0
                ? detailRows.filter(r => rowNumberFilter.includes(r.rowNumber))
                : detailRows;
        } else {
            rows = consolidatedRows;
        }

        if (rows.length === 0) return;

        const selectedSchema = schemas.find(s => s.id === selectedSchemaId);
        let csv;

        if (viewMode === 'detail') {
            if (selectedSchema) {
                // Use schema transform
                csv = exportWithSchema(rows, selectedSchema);
            } else {
                // No schema - use visible columns
                const columnMap = {
                    rowNumber: '#',
                    item: 'Item',
                    quantity: 'Quantity',
                    unit: 'Unit',
                    area: 'Area',
                    page: 'Page',
                    verified: 'Verified'
                };
                const exportColumns = visibleColumns.filter(c => c !== 'verified');
                const headers = exportColumns.map(c => columnMap[c] || c);

                const csvRows = rows.map(r => {
                    return exportColumns.map(col => {
                        const val = r[col];
                        if (val === null || val === undefined) return '';
                        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
                        return val;
                    }).join(',');
                });
                csv = [headers.join(','), ...csvRows].join('\n');
            }
        } else {
            // Consolidated view
            if (selectedSchema) {
                // Apply schema to consolidated - use included columns for grouping info
                const includedColumns = selectedSchema.columns
                    .filter(col => col.include)
                    .sort((a, b) => a.order - b.order);

                // Build headers: Group column, Total Quantity, then breakdown columns from schema
                const groupHeader = groupByColumn.charAt(0).toUpperCase() + groupByColumn.slice(1);
                const breakdownHeaders = includedColumns
                    .filter(c => c.sourceField !== 'quantity') // quantity is totaled separately
                    .map(c => c.outputName || c.sourceField);

                const headers = [groupHeader, 'Total Quantity', ...breakdownHeaders.map(h => `Breakdown: ${h}`)];

                const escapeCSV = (val) => {
                    if (val === null || val === undefined) return '';
                    const str = String(val);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                const csvRows = consolidatedRows.map(r => {
                    const rowData = [escapeCSV(r.groupValue), r.totalQuantity];
                    // Add breakdown info for each included column
                    includedColumns
                        .filter(c => c.sourceField !== 'quantity')
                        .forEach(col => {
                            // Get unique values from breakdown for this field
                            const values = r.breakdown
                                .map(b => b[col.sourceField])
                                .filter((v, i, arr) => v && arr.indexOf(v) === i)
                                .join('; ');
                            rowData.push(escapeCSV(values));
                        });
                    return rowData.join(',');
                });
                csv = [headers.join(','), ...csvRows].join('\n');
            } else {
                // Default consolidated export - include unit when grouping by item
                const escapeCSV = (val) => {
                    if (val === null || val === undefined) return '';
                    const str = String(val);
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str.replace(/"/g, '""')}"`;
                    }
                    return str;
                };

                const groupHeader = groupByColumn.charAt(0).toUpperCase() + groupByColumn.slice(1);
                const headers = groupByColumn === 'item'
                    ? [groupHeader, 'Unit', 'Total Quantity', 'Breakdown']
                    : [groupHeader, 'Total Quantity', 'Breakdown'];

                const csvRows = consolidatedRows.map(r => {
                    if (groupByColumn === 'item') {
                        return [
                            escapeCSV(r.groupValue),
                            escapeCSV(r.unit),
                            r.totalQuantity,
                            escapeCSV(r.breakdownText)
                        ].join(',');
                    } else {
                        return [
                            escapeCSV(r.groupValue),
                            r.totalQuantity,
                            escapeCSV(r.breakdownText)
                        ].join(',');
                    }
                });
                csv = [headers.join(','), ...csvRows].join('\n');
            }
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const schemaName = selectedSchemaId ? schemas.find(s => s.id === selectedSchemaId)?.name?.replace(/\s+/g, '-') : viewMode;
        a.download = `extraction-${schemaName}-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0, color: '#333' }}>Dashboard</h1>
                {hasResults && !showDropzone && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleAddToExtraction} className="btn-secondary">
                            + Add Pages
                        </button>
                        <button onClick={handleStartNew} className="btn-primary">
                            Start New Extraction
                        </button>
                    </div>
                )}
            </div>

            {/* Dropzone - shown initially or when adding/starting new */}
            {showDropzone && (
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#2E5C43' }}>
                            {extractionMode === 'new' ? 'New Extraction' : 'Add Pages to Extraction'}
                        </h3>
                        {hasResults && (
                            <button
                                onClick={handleCancelDropzone}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    <FileDropzone onFileSelect={handleFileSelect} disabled={uploading} />
                    {uploading && (
                        <div style={{ marginTop: '15px', textAlign: 'center', color: '#666' }}>
                            Extracting... This may take a moment for multi-page PDFs.
                        </div>
                    )}
                    {error && (
                        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
                            {error}
                        </div>
                    )}
                </div>
            )}

            {hasResults && (
                <div className="card">
                    {/* AI Disclaimer */}
                    <div style={{
                        padding: '10px 15px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: '#856404'
                    }}>
                        <strong>Note:</strong> AI can make mistakes. Always double-check your extractions before using them in estimates.
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                        <h3 style={{ margin: 0, color: '#2E5C43' }}>
                            Extraction Results ({detailRows.length} items from {totalPages} page{totalPages !== 1 ? 's' : ''})
                        </h3>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {/* View Mode Toggle */}
                            <div style={{ display: 'flex', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => setViewMode('detail')}
                                    style={{
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: viewMode === 'detail' ? '#2E5C43' : '#fff',
                                        color: viewMode === 'detail' ? '#fff' : '#333',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Detail
                                </button>
                                <button
                                    onClick={() => setViewMode('consolidated')}
                                    style={{
                                        padding: '6px 12px',
                                        border: 'none',
                                        borderLeft: '1px solid #ddd',
                                        background: viewMode === 'consolidated' ? '#2E5C43' : '#fff',
                                        color: viewMode === 'consolidated' ? '#fff' : '#333',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Consolidated
                                </button>
                            </div>

                            {/* Group By Selector (only in consolidated view) */}
                            {viewMode === 'consolidated' && (
                                <select
                                    value={groupByColumn}
                                    onChange={(e) => setGroupByColumn(e.target.value)}
                                    style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    {groupableColumns.map(col => (
                                        <option key={col} value={col}>
                                            Group by: {col.charAt(0).toUpperCase() + col.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    {/* Export Section - Moved to top for visibility */}
                    <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        {schemas.length > 0 && (
                            <select
                                value={selectedSchemaId}
                                onChange={(e) => setSelectedSchemaId(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.95rem'
                                }}
                            >
                                <option value="">Export as {viewMode === 'detail' ? 'visible columns' : 'default format'}</option>
                                <optgroup label="System Schemas">
                                    {schemas.filter(s => s.scope === 'system').map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </optgroup>
                                {schemas.some(s => s.scope !== 'system') && (
                                    <optgroup label="My Schemas">
                                        {schemas.filter(s => s.scope !== 'system').map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        )}
                        <button onClick={handleExportCSV} className="btn-primary">
                            Export {viewMode === 'detail' ? 'Detail' : 'Consolidated'} CSV
                        </button>
                    </div>

                    {/* Grid Actions and Filters (only in detail view) */}
                    {viewMode === 'detail' && (
                        <>
                            {/* Filter Row */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                <RowNumberFilter
                                    onFilterChange={setRowNumberFilter}
                                    disabled={uploading}
                                />
                                <ColumnPicker
                                    columns={COLUMN_DEFS}
                                    visibleColumns={visibleColumns}
                                    onVisibilityChange={setVisibleColumns}
                                    disabled={uploading}
                                />
                            </div>
                            {/* Action Buttons Row */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                <button onClick={handleSelectAll} className="btn-secondary">Select All</button>
                                <button onClick={handleDeselectAll} className="btn-secondary">Deselect All</button>
                                <button onClick={handleVerifySelected} className="btn-secondary">Verify Selected</button>
                                <button onClick={handleDeleteSelected} className="btn-secondary" style={{ color: '#c62828' }}>Delete Selected</button>
                            </div>
                        </>
                    )}

                    {/* Results View */}
                    {viewMode === 'detail' ? (
                        <ResultsGrid
                            rowData={detailRows}
                            onCellValueChanged={handleCellValueChanged}
                            gridRef={gridRef}
                            rowNumberFilter={rowNumberFilter}
                            visibleColumns={visibleColumns}
                            selectedSchema={schemas.find(s => s.id === selectedSchemaId)}
                        />
                    ) : (
                        <ConsolidatedView
                            data={consolidatedRows}
                            groupByColumn={groupByColumn}
                        />
                    )}

                </div>
            )}
        </div>
    );
};

export default Dashboard;
