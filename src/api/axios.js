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

// Helper function to recursively search for and upgrade http Cloudinary URLs to https
const upgradeCloudinaryUrls = (data) => {
    if (data === null || data === undefined) return data;
    if (typeof data === 'string') {
        if (data.startsWith('http://res.cloudinary.com')) {
            return data.replace('http://', 'https://');
        }
        return data;
    }
    if (Array.isArray(data)) {
        return data.map(upgradeCloudinaryUrls);
    }
    if (typeof data === 'object') {
        const copy = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                copy[key] = upgradeCloudinaryUrls(data[key]);
            }
        }
        return copy;
    }
    return data;
};

// Response interceptor to fix mixed content warnings automatically for all retrieved media
api.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = upgradeCloudinaryUrls(response.data);
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
