import React, { useState, useRef, useEffect } from 'react';

const ColumnPicker = ({ columns, visibleColumns, onVisibilityChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (columnId) => {
    const newVisible = visibleColumns.includes(columnId)
      ? visibleColumns.filter(id => id !== columnId)
      : [...visibleColumns, columnId];
    onVisibilityChange(newVisible);
  };

  // Columns that should always be visible
  const alwaysVisible = ['rowNumber', 'verified'];

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          padding: '6px 12px',
          fontSize: '13px',
          backgroundColor: '#f5f5f5',
          color: '#333',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        Columns
        <span style={{ fontSize: '10px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '150px',
            padding: '8px 0'
          }}
        >
          {columns.map(col => {
            const isAlwaysVisible = alwaysVisible.includes(col.field);
            const isVisible = visibleColumns.includes(col.field);

            return (
              <label
                key={col.field}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 12px',
                  cursor: isAlwaysVisible ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  color: isAlwaysVisible ? '#999' : '#333',
                  backgroundColor: 'transparent',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!isAlwaysVisible) e.target.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={() => handleToggle(col.field)}
                  disabled={isAlwaysVisible}
                  style={{ marginRight: '8px' }}
                />
                {col.headerName}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ColumnPicker;
