import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, loginWithGoogle, currentUser } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            navigate('/app');
        }
    }, [currentUser, navigate]);

    function getFriendlyErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-credential':
                return 'Incorrect email or password. Please try again.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'An account already exists with this email.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in cancelled.';
            default:
                return 'An error occurred. Please try again.';
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            if (isLogin) {
                await login(email, password);
                navigate('/app');
            } else {
                const { isNewUser } = await signup(email, password);
                navigate('/app', { state: { showWelcome: isNewUser } });
            }
        } catch (err) {
            console.error(err);
            // Use helper if available, otherwise fallback to message or generic error
            const message = err.code ? getFriendlyErrorMessage(err.code) : err.message;
            setError(message);
        }
        setLoading(false);
    }

    async function handleGoogleSignIn() {
        try {
            setError('');
            setLoading(true);
            const { isNewUser } = await loginWithGoogle();
            navigate('/app', { state: { showWelcome: isNewUser } });
        } catch (err) {
            console.error(err);
            const message = err.code ? getFriendlyErrorMessage(err.code) : err.message;
            setError(message);
        }
        setLoading(false);
    }

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isLogin ? 'Log In' : 'Sign Up'}</h2>

            {error && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button disabled={loading} type="submit" style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isLogin ? 'Log In' : 'Sign Up'}
                </button>
            </form>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>OR</div>

            <button onClick={handleGoogleSignIn} disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#db4437', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Sign in with Google
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {isLogin ? "Need an account? " : "Already have an account? "}
                <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>
                    {isLogin ? 'Sign Up' : 'Log In'}
                </span>
            </div>

            <div style={{ marginTop: '15px', textAlign: 'center' }}>
                <Link to="/" style={{ color: '#6c757d', textDecoration: 'none' }}>Back to Home</Link>
            </div>
        </div>
    );
};

export default Login;
