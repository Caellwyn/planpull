import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Login</h1>
            <p>Sign in to your account</p>
            {/* Auth form will go here later */}
            <div style={{ marginTop: '20px' }}>
                <Link to="/">Back to Home</Link>
            </div>
        </div>
    );
};

export default Login;
