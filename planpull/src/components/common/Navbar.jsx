import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            setMenuOpen(false);
        } catch {
            console.error('Failed to log out');
        }
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative'
        }}>
            <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>🍃</span>
                <Link to="/" style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    textDecoration: 'none'
                }} onClick={closeMenu}>
                    PlanPull
                </Link>
            </div>

            {/* Hamburger button - visible on mobile */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                    display: 'none',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '4px 8px'
                }}
                className="hamburger-btn"
                aria-label="Toggle menu"
            >
                {menuOpen ? '✕' : '☰'}
            </button>

            {/* Desktop menu */}
            <div className="desktop-menu" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {currentUser ? (
                    <>
                        <Link to="/app" className="nav-link">Dashboard</Link>
                        <Link to="/app/schemas" className="nav-link">Schemas</Link>
                        <Link to="/app/account" className="nav-link">Account</Link>
                        <Link to="/help" className="nav-link">Help</Link>
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
                        <Link to="/help" className="nav-link">Help</Link>
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

            {/* Mobile menu dropdown */}
            {menuOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--primary-color)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000
                }} className="mobile-menu">
                    {currentUser ? (
                        <>
                            <Link to="/app" className="nav-link" onClick={closeMenu} style={{ padding: '8px 0' }}>Dashboard</Link>
                            <Link to="/app/schemas" className="nav-link" onClick={closeMenu} style={{ padding: '8px 0' }}>Schemas</Link>
                            <Link to="/app/account" className="nav-link" onClick={closeMenu} style={{ padding: '8px 0' }}>Account</Link>
                            <Link to="/help" className="nav-link" onClick={closeMenu} style={{ padding: '8px 0' }}>Help</Link>
                            <button onClick={handleLogout} style={{
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.5)',
                                color: 'white',
                                padding: '8px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textAlign: 'left'
                            }}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/pricing" className="nav-link" onClick={closeMenu} style={{ padding: '8px 0' }}>Pricing</Link>
                            <Link to="/help" className="nav-link" onClick={closeMenu} style={{ padding: '8px 0' }}>Help</Link>
                            <Link to="/login" onClick={closeMenu} style={{
                                padding: '8px 16px',
                                backgroundColor: 'white',
                                color: 'var(--primary-color)',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
                                Login
                            </Link>
                        </>
                    )}
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .hamburger-btn {
                        display: block !important;
                    }
                    .desktop-menu {
                        display: none !important;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-menu {
                        display: none !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
