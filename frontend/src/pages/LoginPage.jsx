import React from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <h1 style={{ color: '#333' }}>Smart Campus Operations Hub</h1>
                <p style={{ marginBottom: '24px', color: '#666' }}>Secure Login for Campus Management</p>
                <button 
                    onClick={login}
                    style={{ 
                        padding: '12px 24px', 
                        fontSize: '16px', 
                        backgroundColor: '#4285F4', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#357ae8'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#4285F4'}
                >
                    Login with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
