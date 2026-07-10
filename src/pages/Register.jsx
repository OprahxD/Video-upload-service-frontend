import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './Login.css'; // Reuse auth layout classes

const Register = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Registration form state
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!fullName.trim() || !username.trim() || !email.trim() || !password || !avatar) {
            setError("All fields, including an avatar, are required.");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('username', username.toLowerCase().trim());
            formData.append('email', email.trim());
            formData.append('password', password);
            formData.append('avatar', avatar);
            if (coverImage) {
                formData.append('coverImage', coverImage);
            }

            await api.post('/users/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // Redirect to login upon successful registration
            navigate('/login', { state: { message: "Registration successful! Please sign in." } });
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container py-12 px-4">
            <div className="glass-panel login-card max-w-lg w-full p-8 shadow-polaroid border border-archival-border bg-archival-bg-secondary">
                <h1 className="font-serif text-3xl mb-1 text-archival-accent">Create Account</h1>
                <p className="login-subtitle font-mono text-xs mb-6 text-archival-muted">Register to catalog your residues archive.</p>
                
                {error && <div className="error-message font-mono text-xs mb-4 text-red-400 border border-red-950 bg-red-950/20 p-2 text-center">{error}</div>}
                
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 font-mono text-sm text-left">
                    <div className="flex flex-col gap-1">
                        <label className="text-archival-muted uppercase tracking-wider text-[10px]">Full Name *</label>
                        <input 
                            type="text" 
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="bg-archival-bg border border-archival-border p-2 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                            placeholder="e.g. John Doe"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-archival-muted uppercase tracking-wider text-[10px]">Username *</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="bg-archival-bg border border-archival-border p-2 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                                placeholder="e.g. johndoe"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-archival-muted uppercase tracking-wider text-[10px]">Email *</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-archival-bg border border-archival-border p-2 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                                placeholder="e.g. john@example.com"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-archival-muted uppercase tracking-wider text-[10px]">Password *</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="bg-archival-bg border border-archival-border p-2 text-archival-text focus:outline-none focus:border-archival-accent transition-colors"
                            required
                        />
                    </div>

                    {/* File Upload Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {/* Avatar */}
                        <div className="flex flex-col gap-2">
                            <label className="text-archival-muted uppercase tracking-wider text-[10px]">Avatar (Required) *</label>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full border border-archival-border overflow-hidden bg-archival-bg flex items-center justify-center flex-shrink-0">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] text-archival-muted">No Image</span>
                                    )}
                                </div>
                                <label className="flex-grow cursor-pointer bg-archival-bg border border-dashed border-archival-border p-2 text-center text-xs text-archival-muted hover:border-archival-accent hover:text-archival-text transition-colors">
                                    Select Avatar
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        required
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div className="flex flex-col gap-2">
                            <label className="text-archival-muted uppercase tracking-wider text-[10px]">Cover Image (Optional)</label>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 border border-archival-border overflow-hidden bg-archival-bg flex items-center justify-center flex-shrink-0">
                                    {coverImagePreview ? (
                                        <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] text-archival-muted">No Image</span>
                                    )}
                                </div>
                                <label className="flex-grow cursor-pointer bg-archival-bg border border-dashed border-archival-border p-2 text-center text-xs text-archival-muted hover:border-archival-accent hover:text-archival-text transition-colors">
                                    Select Cover
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleCoverImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-archival-accent text-archival-bg py-2.5 uppercase tracking-widest font-bold disabled:opacity-50 hover:bg-opacity-90 transition-all text-xs mt-4"
                    >
                        {loading ? 'Registering...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-4 font-mono text-xs text-archival-muted text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-archival-accent hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
