import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    if (!user) return null;

    return (
        <header className="glass-glow sticky top-0 z-50 border-b border-blue-500/10 backdrop-blur-3xl transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-space font-bold tracking-tight">
                        Smart Campus <span className="text-gradient font-black">Hub</span>
                    </h1> */}
                </Link>
                
                <nav className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center space-x-6 text-sm font-medium mr-4">
                        <NavLink to="/dashboard" label="Dashboard" />
                        {user.role === 'USER' && (
                            <>
                                <NavLink to="/mybookings" label="Bookings" />
                                <NavLink to="/incidents" label="Incidents" />
                            </>
                        )}
                        {user.role === 'ADMIN' && (
                            <>
                                <NavLink to="/admin/users" label="Users" className="text-blue-500" />
                                <NavLink to="/admin/bookings" label="All Bookings" />
                                <NavLink to="/admin/analytics" label="Analytics" />
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-3 border-l border-border pl-6">
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all"
                        >
                            <AnimatePresence mode="wait">
                                {theme === 'dark' ? (
                                    <motion.div key="sun" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Sun className="w-4 h-4 text-yellow-500" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="moon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                        <Moon className="w-4 h-4 text-blue-600" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>

                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-xs font-bold text-foreground leading-none">{user.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter bg-secondary px-1.5 py-0.5 rounded">
                                {user.role}
                            </span>
                        </div>

                        <button 
                            onClick={logout} 
                            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 sm:px-4 sm:py-2 rounded-xl transition-all border border-red-500/20 font-bold text-xs"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

const NavLink = ({ to, label, className = "" }) => (
    <Link 
        to={to} 
        className={`text-muted-foreground hover:text-foreground transition-colors relative group py-2 ${className}`}
    >
        {label}
        <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 transition-all group-hover:w-full" />
    </Link>
);

export default Navbar;
