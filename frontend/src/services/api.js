import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true, // Crucial for session-based OAuth2
});

// Interceptor to handle tokens if needed (placeholder)
api.interceptors.request.use((config) => {
    // If you used JWT, you'd add it here:
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor for 401 response - redirect to login
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response && error.response.status === 401) {
        // Handle session expiry or unauthorized
        // window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default api;
