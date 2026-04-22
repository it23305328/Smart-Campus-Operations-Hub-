import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            // First check localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            
            // Then verify with backend
            const response = await api.get('/api/users/me');
            const userData = response.data;
            
            // Store complete user data in localStorage
            const userInfo = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            setUser(userData);
        } catch (error) {
            setUser(null);
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const userData = response.data;
            
            // Store user data in localStorage
            const userInfo = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role
            };
            localStorage.setItem('user', JSON.stringify(userInfo));
            
            setUser(userData);
            window.location.href = '/dashboard';
            return true;
        } catch (error) {
            console.error('Login error', error);
            return false;
        }
    };
    
    const loginWithGoogle = () => {
        window.location.href = 'http://localhost:8083/oauth2/authorization/google';
    };
    
    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
            setUser(null);
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
            setUser(null);
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, checkUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);