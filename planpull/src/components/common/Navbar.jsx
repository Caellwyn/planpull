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
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Placeholder leaf icon */}
                <span style={{ fontSize: '1.5rem' }}>🍃</span>
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textDecoration: 'none'
                }}>
                    PlanPull
                </Link>
            </div>

            <div className="menu" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {currentUser ? (
                    <>
                        <Link to="/app" className="nav-link">Dashboard</Link>
                        <Link to="/app/schemas" className="nav-link">Schemas</Link>
                        <Link to="/app/account" className="nav-link">Account</Link>
                        <button onClick={handleLogout} style={{
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.5)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/pricing" className="nav-link">Pricing</Link>
                        <Link to="/login" style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            color: 'var(--primary-color)',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontWeight: '600'
                        }}>
                            Login
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
