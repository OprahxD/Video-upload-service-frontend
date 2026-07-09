import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Credentials form state
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post('/users/google-login', {
                token: credentialResponse.credential,
            });
            login(res.data.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || "Google Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google Login was unsuccessful. Try again.");
    };

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        if (!identifier.trim() || !password) return;
        setLoading(true);
        setError("");
        try {
            const payload = {};
            if (identifier.includes('@')) {
                payload.email = identifier;
            } else {
                payload.username = identifier;
            }
            payload.password = password;

            const res = await api.post('/users/login', payload);
            login(res.data.data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || "Invalid username/email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="glass-panel login-card max-w-md w-full p-8 shadow-polaroid border border-archival-border bg-archival-bg-secondary">
                <h1 className="font-serif text-3xl mb-1 text-archival-accent">Creator Registry</h1>
                <p className="login-subtitle font-mono text-xs mb-6 text-archival-muted">Access your cataloged residues archive.</p>
                
                {error && <div className="error-message font-mono text-xs mb-4 text-red-400 border border-red-950 bg-red-950/20 p-2 text-center">{error}</div>}
                
                <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-4 font-mono text-sm text-left mb-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-archival-muted uppercase tracking-wider text-[10px]">Email / Username</label>
                        <input 
                            type="text" 
                            value={identifier}
                            onChange={e => setIdentifier(e.target.value)}
                            className="bg-archival-bg border border-archival-border p-2.5 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-archival-muted uppercase tracking-wider text-[10px]">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-archival-bg border border-archival-border p-2.5 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-archival-accent text-archival-bg py-2.5 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all text-xs"
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-2 text-archival-muted font-mono text-[10px] uppercase">
                    <span className="h-[1px] bg-archival-border flex-grow"></span>
                    <span>Or</span>
                    <span className="h-[1px] bg-archival-border flex-grow"></span>
                </div>
                
                <div className="google-auth-wrapper mt-4 flex justify-center">
                    {!loading && (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            theme="filled_black"
                            shape="pill"
                            size="large"
                            text="continue_with"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
