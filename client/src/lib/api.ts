import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// 1. Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 2. Handle unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');

            // Only redirect if NOT already on the login or register pages
            if (
                typeof window !== 'undefined' &&
                !window.location.pathname.startsWith('/login') &&
                !window.location.pathname.startsWith('/register')
            ) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
export default api;