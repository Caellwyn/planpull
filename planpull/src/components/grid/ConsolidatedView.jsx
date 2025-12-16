import React from 'react';

const ConsolidatedView = ({ data, groupByColumn }) => {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No data to consolidate</div>;
  }

  // Capitalize column name for header
  const groupHeader = groupByColumn.charAt(0).toUpperCase() + groupByColumn.slice(1);

  // Show unit column when grouping by item (since item+unit are grouped together)
  const showUnitColumn = groupByColumn === 'item';

  return (
    <div className="consolidated-view" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '12px', textAlign: 'left' }}>{groupHeader}</th>
            {showUnitColumn && (
              <th style={{ padding: '12px', textAlign: 'left', width: '80px' }}>Unit</th>
            )}
            <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Total Qty</th>
            <th style={{ padding: '12px', textAlign: 'left' }}>Breakdown</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid #eee',
                backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
              }}
            >
              <td style={{ padding: '10px 12px', fontWeight: '500' }}>{row.groupValue}</td>
              {showUnitColumn && (
                <td style={{ padding: '10px 12px' }}>{row.unit}</td>
              )}
              <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '600' }}>{row.totalQuantity}</td>
              <td style={{ padding: '10px 12px', color: '#666', fontSize: '13px' }}>{row.breakdownText}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConsolidatedView;
