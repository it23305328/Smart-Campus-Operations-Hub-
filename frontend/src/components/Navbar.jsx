import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 * Updated to link to the new Maintenance & Incident pages
 */
const Navbar = () => {
    const { user, logout } = useAuth();

    // Do not render the navbar if the user is not logged in
    if (!user) return null;

    return (
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 shadow-xl relative z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
                {/* Logo / Brand Name linking back to Dashboard */}
                <Link to="/dashboard">
                    <h1 className="text-3xl font-extrabold tracking-tight">
                        Smart Campus <span className="text-blue-300 font-light">Hub</span>
                    </h1>
                </Link>

                <nav className="flex space-x-6 text-sm font-medium items-center overflow-x-auto">
                    {/* Main Home Link */}
                    <Link to="/dashboard" className="hover:text-blue-300 transition">Dashboard</Link>

                    {/* USER Role: Links to Ticket Creation */}
                    {user.role === 'USER' && (
                        <>
                            <Link to="/bookings" className="hover:text-blue-300 transition">Bookings</Link>
                            <Link to="/create-ticket" className="hover:text-blue-300 transition text-orange-300 font-bold">Report Incident</Link>
                        </>
                    )}

                    {/* ADMIN Role: Links to the Management Incident Page */}
                    {user.role === 'ADMIN' && (
                        <>
                            <Link to="/admin/users" className="hover:text-blue-300 transition text-emerald-300">User Management</Link>
                            <Link to="/admin/incidents" className="text-white hover:text-blue-200 border-b border-white/30">Maintenance Hub</Link>
                            <Link to="/admin/bookings" className="hover:text-blue-300 transition">All Bookings</Link>
                            <Link to="/admin/notifications" className="hover:text-blue-300 transition">Notifications</Link>
                        </>
                    )}

                    {/* TECHNICIAN Role */}
                    {user.role === 'TECHNICIAN' && (
                        <>
                            <Link to="/technician/incidents" className="hover:text-blue-300 transition text-amber-300">My Work Orders</Link>
                        </>
                    )}

                    {/* User Profile & Logout Section */}
                    <div className="border-l border-white/20 pl-6 flex items-center gap-4">
                        <span className="text-blue-200 hidden sm:inline">
                            Welcome, <span className="font-bold text-white">{user.name}</span>
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded ml-2 uppercase tracking-widest">{user.role}</span>
                        </span>

                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition shadow-md font-semibold text-xs active:scale-95"
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