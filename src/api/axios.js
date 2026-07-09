import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true, // This is crucial for HTTP-only cookies to work across origins
    timeout: 10000, // 10 second timeout so the frontend doesn't hang forever if backend stalls
});

export default api;
