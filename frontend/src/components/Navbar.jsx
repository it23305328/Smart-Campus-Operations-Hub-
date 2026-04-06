import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-xl relative z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
                <Link to="/dashboard">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Smart Campus <span className="text-blue-300 font-light">Hub</span>
                    </h1>
                </Link>
                
                <nav className="flex space-x-6 text-sm font-medium items-center overflow-x-auto">
                    {/* Common link for all authenticated users to go back home */}
                    <Link to="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>
                    
                    {/* Role Based Navigation Links */}
                    {user.role === 'USER' && (
                        <>
                            <Link to="/bookings" className="hover:text-blue-300 transition">Bookings</Link>
                            <Link to="/incidents" className="hover:text-blue-300 transition">Incident Reporting</Link>
                        </>
                    )}

                    {user.role === 'ADMIN' && (
                        <>
                            <Link to="/admin/users" className="hover:text-blue-300 transition text-emerald-300">User Management</Link>
                            <Link to="/admin/bookings" className="hover:text-blue-300 transition">All Bookings</Link>
                            <Link to="/admin/notifications" className="hover:text-blue-300 transition">Notification Settings</Link>
                        </>
                    )}

                    {user.role === 'TECHNICIAN' && (
                        <>
                            <Link to="/technician/incidents" className="hover:text-blue-300 transition text-amber-300">My Tickets</Link>
                        </>
                    )}

                    <div className="border-l border-white/20 pl-6 flex items-center gap-4">
                        <span className="text-blue-200">
                            Welcome, <span className="font-bold text-white">{user.name}</span> <span className="text-xs bg-white/20 px-2 py-1 rounded ml-1">{user.role}</span>
                        </span>
                        <button 
                            onClick={logout} 
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition shadow-md font-semibold text-xs"
                        >
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
