import axios from 'axios';
let baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Upgrade baseURL to HTTPS if the frontend is loaded via HTTPS (prevents Mixed Content warnings)
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseURL.startsWith('http://') && !baseURL.includes('localhost') && !baseURL.includes('127.0.0.1')) {
    baseURL = baseURL.replace('http://', 'https://');
}

// Ensure the baseURL ends with /api/v1 if the user forgot to add it in Vercel Env Vars
if (baseURL && !baseURL.endsWith('/api/v1') && !baseURL.endsWith('/api/v1/')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api/v1';
}

const api = axios.create({
    baseURL,
    withCredentials: true, // This is crucial for HTTP-only cookies to work across origins
    timeout: 10000, // 10 second timeout so the frontend doesn't hang forever if backend stalls
});

export default api;
