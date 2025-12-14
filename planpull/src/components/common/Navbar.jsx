import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch {
            console.error('Failed to log out');
        }
    };

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            marginBottom: '20px'
        }}>
            <div className="brand">
                <Link to="/" style={{ textDecoration: 'none', fontSize: '1.25rem', fontWeight: 'bold', color: '#333' }}>
                    PlanPull
                </Link>
            </div>
            <div className="menu">
                {currentUser ? (
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{currentUser.email}</span>
                        <Link to="/app">Dashboard</Link>
                        <button onClick={handleLogout} style={{ padding: '5px 10px', cursor: 'pointer' }}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
