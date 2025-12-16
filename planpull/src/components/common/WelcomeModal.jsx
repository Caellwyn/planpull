import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeModal = ({ onClose }) => {
    const navigate = useNavigate();

    const handleReadInstructions = () => {
        onClose();
        navigate('/help');
    };

    const handleJumpIn = () => {
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '450px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
                <h2 style={{
                    color: '#2E5C43',
                    marginTop: 0,
                    marginBottom: '0.5rem',
                    fontSize: '1.5rem'
                }}>
                    Welcome to PlanPull!
                </h2>

                <p style={{
                    color: '#666',
                    marginBottom: '1.5rem',
                    fontSize: '1rem',
                    lineHeight: '1.5'
                }}>
                    Read the quick-start guide, or jump right in?
                    <br />
                    <span style={{ fontSize: '0.9rem', color: '#888' }}>
                        You can always find the guide in the Help menu.
                    </span>
                </p>

                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexDirection: 'column'
                }}>
                    <button
                        onClick={handleReadInstructions}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#2E5C43',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        Show Me How It Works
                    </button>

                    <button
                        onClick={handleJumpIn}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'transparent',
                            color: '#2E5C43',
                            border: '2px solid #2E5C43',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        I'll Figure It Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
