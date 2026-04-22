import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    Home, Users, Map, 
    Calendar, BarChart, Bell, 
    User, AlertTriangle, ClipboardList,
    LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const role = user?.role || 'USER';

    const menuItems = {
        ADMIN: [
            { icon: Home, label: 'Dashboard', path: '/' },
            { icon: Users, label: 'User Management', path: '/admin/users' },
            { icon: Map, label: 'Facilities', path: '/admin/facilities' },
            { icon: Calendar, label: 'Bookings Requests', path: '/admin/bookings' },
            { icon: BarChart, label: 'Analytics', path: '/admin/analytics' },
            { icon: Bell, label: 'Notifications', path: '/notifications' },
            { icon: User, label: 'Profile', path: '/profile' },
        ],
        USER: [
            { icon: Home, label: 'Dashboard', path: '/' },
            { icon: Calendar, label: 'My Bookings', path: '/bookings' },
            { icon: Map, label: 'Facilities', path: '/facilities' },
            { icon: AlertTriangle, label: 'Report Incident', path: '/incidents' },
            { icon: Map, label: 'Catalogue', path: '/catalogue' },
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
        <div className="w-80 h-full bg-slate-900 text-white flex flex-col shadow-2xl overflow-y-auto">
            <div className="p-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-indigo-500 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                        <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tighter">SMART CAMPUS</h2>
                        <p className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase opacity-60">Operations Hub</p>
                    </div>
                </div>

                <nav className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-5 ml-2">Navigation</p>
                    {currentMenu.map((item, idx) => (
                        <NavLink
                            key={idx}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm transition-all duration-300
                                ${isActive 
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-x-1' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-10 border-t border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-indigo-400">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-black text-xs truncate uppercase tracking-wider">{user?.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate">{user?.role}</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
