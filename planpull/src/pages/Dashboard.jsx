import React from 'react';

const Dashboard = () => {
    return (
        <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Extraction Results</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Placeholder for View Toggle */}
                    <div style={{ background: '#e0e0e0', padding: '4px', borderRadius: '4px', display: 'flex', gap: '4px' }}>
                        <span style={{ background: '#2E5C43', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '0.8rem' }}>Detail</span>
                        <span style={{ padding: '4px 12px', color: '#666', fontSize: '0.8rem' }}>Consolidated</span>
                    </div>
                </div>
            </div>

            <div className="card">
                <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                    No extractions yet. Upload a PDF to get started.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
