import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{
            padding: '40px 20px',
            backgroundColor: '#1a3a2a',
            color: 'rgba(255,255,255,0.7)',
            textAlign: 'center'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/pricing" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 15px' }}>Pricing</Link>
                    <Link to="/help" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 15px' }}>Help</Link>
                    <Link to="/login" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 15px' }}>Login</Link>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '10px'
                }}>
                    <img
                        src="/images/Ai_guy_transparent.png"
                        alt="The AI Guy"
                        style={{
                            height: '40px',
                            width: 'auto'
                        }}
                    />
                    <a
                        href="https://www.theaiguy.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: 'rgba(255,255,255,0.9)',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        The AI Guy
                    </a>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    © {new Date().getFullYear()} PlanPull by{' '}
                    <a
                        href="https://www.theaiguy.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}
                    >
                        The AI Guy
                    </a>
                    . All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
