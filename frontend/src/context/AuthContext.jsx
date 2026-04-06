import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            const response = await api.get('/api/user/me');
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

<<<<<<< HEAD
    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            setUser(response.data);
            window.location.href = '/dashboard';
            return true;
        } catch (error) {
            console.error('Login error', error);
            return false;
        }
    };

    const loginWithGoogle = () => {
        window.location.href = 'http://localhost:8083/oauth2/authorization/google';
=======
    const login = () => {
        // Redirect to Spring Boot's OAuth2 login endpoint
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
    };

    const logout = async () => {
        try {
<<<<<<< HEAD
            await api.post('/api/auth/logout');
=======
            await api.post('/logout'); // Default Spring logout endpoint
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
<<<<<<< HEAD
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, checkUser }}>
=======
        <AuthContext.Provider value={{ user, loading, login, logout, checkUser }}>
>>>>>>> 7f3907bf64a4c1b587692adcc08578fd19d8c4a3
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
