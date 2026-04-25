import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, 
    Calendar, 
    AlertCircle, 
    MessageSquare, 
    CheckCheck, 
    Clock, 
    X,
    ChevronRight,
    BellOff 
} from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';

const NotificationPanel = () => {
    const { notifications, unreadCount, clearUnread } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef(null);

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const typeConfig = {
        'BOOKING': {
            icon: Calendar,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        'TICKET': {
            icon: AlertCircle,
            color: 'text-red-500',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20'
        },
        'COMMENT': {
            icon: MessageSquare,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        }
    };

    const formatTimestamp = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Icon & Badge */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all duration-300 ${
                    isOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105' : 'bg-secondary hover:bg-secondary/80 border border-border text-muted-foreground hover:text-foreground'
                }`}
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 && !isOpen ? 'animate-bell-ring' : ''}`} />
                
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-background shadow-sm"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 glass-glow rounded-3xl border border-blue-500/10 shadow-2xl overflow-hidden backdrop-blur-3xl z-50"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-border flex items-center justify-between bg-white/5">
                            <h3 className="font-space font-bold text-lg flex items-center gap-2">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full uppercase tracking-widest font-black">
                                        New
                                    </span>
                                )}
                            </h3>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-border/30">
                                    {notifications.map((notification, index) => {
                                        const config = typeConfig[notification.type] || typeConfig['COMMENT'];
                                        const TypeIcon = config.icon;
                                        
                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                key={notification.id}
                                                className={`p-4 flex items-start gap-4 transition-all hover:bg-white/5 cursor-pointer group ${
                                                    !notification.isRead ? 'bg-blue-500/5' : ''
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-2xl ${config.bg} flex-shrink-0 flex items-center justify-center border ${config.border} group-hover:scale-110 transition-transform`}>
                                                    <TypeIcon className={`w-5 h-5 ${config.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">{notification.type}</span>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-bold">
                                                            <Clock className="w-3 h-3" /> {formatTimestamp(notification.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm leading-relaxed truncate-2-lines ${!notification.isRead ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0">
                                                        View details <ChevronRight className="w-3 h-3" />
                                                    </div>
                                                </div>
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-16 flex flex-col items-center justify-center text-center opacity-50 px-8">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-border">
                                        <BellOff className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h4 className="font-bold text-foreground">No notifications yet</h4>
                                    <p className="text-sm text-muted-foreground mt-1">We'll alert you when something important happens on campus.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-white/5 border-t border-border flex items-center justify-between">
                            <button 
                                onClick={clearUnread}
                                className="text-[11px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-2 transition-colors group px-3 py-2 rounded-xl hover:bg-blue-500/5"
                            >
                                <CheckCheck className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                Mark all as read
                            </button>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                                View All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx="true">{`
                .truncate-2-lines {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                @keyframes bell-ring {
                    0%, 100% { transform: rotate(0); }
                    10%, 30%, 50%, 70%, 90% { transform: rotate(10deg); }
                    20%, 40%, 60%, 80% { transform: rotate(-10deg); }
                }
                .animate-bell-ring {
                    animation: bell-ring 1s infinite ease-in-out;
                    transform-origin: center top;
                }
            `}</style>
        </div>
    );
};

export default NotificationPanel;
