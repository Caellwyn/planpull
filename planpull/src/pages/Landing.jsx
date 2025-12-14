import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>PlanPull</h1>
            <p>Automated Quantity Takeoffs for Landscaping</p>
            <div style={{ marginTop: '20px' }}>
                <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                <Link to="/app">Dashboard (Protected)</Link>
            </div>
        </div>
    );
};

export default Landing;
