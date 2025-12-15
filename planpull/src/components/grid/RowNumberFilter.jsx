import React, { useState } from 'react';
import { parseRowFilter } from '../../utils/rowFilterParser';

const RowNumberFilter = ({ onFilterChange, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleApply = () => {
    const rowNumbers = parseRowFilter(inputValue);
    onFilterChange(rowNumbers.length > 0 ? rowNumbers : null);
  };

  const handleClear = () => {
    setInputValue('');
    onFilterChange(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <label style={{ fontSize: '13px', color: '#666', whiteSpace: 'nowrap' }}>
        Rows:
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 5, 10-15, 20"
        disabled={disabled}
        style={{
          padding: '6px 10px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '13px',
          width: '150px'
        }}
      />
      <button
        onClick={handleApply}
        disabled={disabled || !inputValue.trim()}
        className="btn-small"
        style={{
          padding: '6px 12px',
          fontSize: '13px',
          backgroundColor: '#2E5C43',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: disabled || !inputValue.trim() ? 'not-allowed' : 'pointer',
          opacity: disabled || !inputValue.trim() ? 0.5 : 1
        }}
      >
        Apply
      </button>
      <button
        onClick={handleClear}
        disabled={disabled}
        className="btn-small"
        style={{
          padding: '6px 12px',
          fontSize: '13px',
          backgroundColor: '#f5f5f5',
          color: '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default RowNumberFilter;
