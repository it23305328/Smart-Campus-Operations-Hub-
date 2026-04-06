import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
    baseURL: 'http://localhost:8083',
=======
    baseURL: 'http://localhost:8080',
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
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
