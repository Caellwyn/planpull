import React from 'react';

const ColumnMapper = ({ columns, sourceFields, onChange }) => {
  const handleIncludeChange = (sourceField, include) => {
    const updated = columns.map(col =>
      col.sourceField === sourceField ? { ...col, include } : col
    );
    onChange(updated);
  };

  const handleOutputNameChange = (sourceField, outputName) => {
    const updated = columns.map(col =>
      col.sourceField === sourceField ? { ...col, outputName } : col
    );
    onChange(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...columns];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Update order property
    updated.forEach((col, i) => col.order = i);
    onChange(updated);
  };

  const handleMoveDown = (index) => {
    if (index === columns.length - 1) return;
    const updated = [...columns];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // Update order property
    updated.forEach((col, i) => col.order = i);
    onChange(updated);
  };

  // Sort by order before rendering
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  // Get label for source field
  const getSourceLabel = (field) => {
    const source = sourceFields.find(s => s.field === field);
    return source?.label || field;
  };

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 1fr 80px',
        gap: '10px',
        marginBottom: '10px',
        padding: '8px 0',
        borderBottom: '1px solid #eee',
        fontWeight: '600',
        fontSize: '0.9rem',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>Use</div>
        <div>Source Field</div>
        <div>Export Name</div>
        <div style={{ textAlign: 'center' }}>Order</div>
      </div>

      {sortedColumns.map((col, index) => (
        <div
          key={col.sourceField}
          style={{
            display: 'grid',
            gridTemplateColumns: '40px 1fr 1fr 80px',
            gap: '10px',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0',
            alignItems: 'center',
            opacity: col.include ? 1 : 0.5
          }}
        >
          {/* Include Checkbox */}
          <div style={{ textAlign: 'center' }}>
            <input
              type="checkbox"
              checked={col.include}
              onChange={(e) => handleIncludeChange(col.sourceField, e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          {/* Source Field (read-only) */}
          <div style={{ color: '#333' }}>
            {getSourceLabel(col.sourceField)}
          </div>

          {/* Output Name (editable) */}
          <div>
            <input
              type="text"
              value={col.outputName}
              onChange={(e) => handleOutputNameChange(col.sourceField, e.target.value)}
              disabled={!col.include}
              placeholder={getSourceLabel(col.sourceField)}
              style={{
                width: '100%',
                padding: '6px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.95rem',
                backgroundColor: col.include ? '#fff' : '#f5f5f5'
              }}
            />
          </div>

          {/* Order Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
            <button
              onClick={() => handleMoveUp(index)}
              disabled={index === 0}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: index === 0 ? 'not-allowed' : 'pointer',
                opacity: index === 0 ? 0.4 : 1
              }}
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={() => handleMoveDown(index)}
              disabled={index === columns.length - 1}
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fff',
                cursor: index === columns.length - 1 ? 'not-allowed' : 'pointer',
                opacity: index === columns.length - 1 ? 0.4 : 1
              }}
              title="Move down"
            >
              ↓
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: '1rem', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <strong style={{ fontSize: '0.9rem', color: '#666' }}>Preview: </strong>
        <span style={{ fontSize: '0.9rem', color: '#333' }}>
          {sortedColumns
            .filter(c => c.include)
            .map(c => c.outputName || getSourceLabel(c.sourceField))
            .join(' → ')}
        </span>
      </div>
    </div>
  );
};

export default ColumnMapper;
