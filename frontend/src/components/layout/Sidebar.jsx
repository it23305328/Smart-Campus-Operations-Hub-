import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
    Home, Users, Map, 
    Calendar, BarChart, Bell, 
    User, AlertTriangle, ClipboardList,
    LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const role = user?.role || 'USER';
    const [isExpanded, setIsExpanded] = useState(true);

    const menuItems = {
        ADMIN: [
            { icon: Home, label: 'Dashboard', path: '/' },
            { icon: Users, label: 'User Management', path: '/admin/users' },
            { icon: Map, label: 'Facilities', path: '/admin/facilities' },
            { icon: Calendar, label: 'Bookings Requests', path: '/admin/bookings' },
            { icon: BarChart, label: 'Analytics', path: '/admin/analytics' },
            // { icon: Bell, label: 'Notifications', path: '/notifications' },
            { icon: User, label: 'Profile', path: '/profile' },
        ],
        USER: [
            { icon: Home, label: 'Dashboard', path: '/' },
            { icon: Calendar, label: 'My Bookings', path: '/mybookings' },
            { icon: Map, label: 'Facilities', path: '/facilities' },
            { icon: AlertTriangle, label: 'Report Incident', path: '/create-ticket' },
            // { icon: Map, label: 'Catalogue', path: '/catalogue' },
            { icon: User, label: 'Profile', path: '/profile' },
        ],
        TECHNICIAN: [
            { icon: Home, label: 'Dashboard', path: '/' },
            { icon: ClipboardList, label: 'Assigned Incidents', path: '/incidents' },
            { icon: User, label: 'Profile', path: '/profile' },
        ]
    };

    const currentMenu = menuItems[role] || menuItems.USER;

    return (
        <div 
            className={`h-screen sticky top-0 bg-background border-r border-border flex flex-col shadow-2xl transition-all duration-300 ease-in-out overflow-y-auto ${
                isExpanded ? 'w-80' : 'w-20'
            }`}
        >
            <div className="p-6">
                <div className={`flex items-center gap-4 mb-10 ${!isExpanded && 'justify-center'}`}>
                    <div className="w-10 h-10 bg-blue-500 rounded-xl rotate-3 flex items-center justify-center shadow-lg shadow-blue-500/50 flex-shrink-0">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                    {isExpanded && (
                        <div>
                            <h2 className="text-xl font-black font-space tracking-tighter text-foreground">SMART CAMPUS</h2>
                            <p className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase">Operations Hub</p>
                        </div>
                    )}
                </div>

                <nav className="space-y-3">
                    {isExpanded && (
                        <p className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase mb-5 ml-2">Navigation</p>
                    )}
                    {currentMenu.map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300
                                ${isExpanded ? 'justify-start' : 'justify-center'}
                                ${isActive 
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}
                            `}
                            title={!isExpanded ? item.label : ''}
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {isExpanded && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className={`mt-auto p-6 border-t border-border bg-white/5 ${!isExpanded && 'flex flex-col items-center'}`}>
                <div className={`flex items-center gap-4 mb-8 ${!isExpanded && 'justify-center'}`}>
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-500 flex-shrink-0 border border-blue-500/20">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    {isExpanded && (
                        <div className="overflow-hidden">
                            <p className="font-bold text-xs truncate uppercase tracking-wider text-foreground">{user?.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground truncate">{user?.role}</p>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={logout}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20 ${!isExpanded && 'justify-center'}`}
                    title={!isExpanded ? 'Sign Out' : ''}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {isExpanded && <span>Sign Out</span>}
                </button>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="absolute -right-3 top-20 bg-background rounded-full p-1 border border-border hover:bg-blue-600 transition-colors shadow-lg"
                >
                    {isExpanded ? (
                        <ChevronLeft className="w-4 h-4 text-foreground" />
                    ) : (
                        <ChevronRight className="w-4 h-4 text-foreground" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
