import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  AlertCircle, 
  Bell, 
  Clock, 
  PlusCircle, 
  ArrowUpRight,
  User,
  History,
  CheckCircle2,
  Timer
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock live timer for a ticket
  const [ticketTime, setTicketTime] = useState(7265); // Seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTicketTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTicketTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen pt-4 pb-20">
      {/* Mesh Background (Shared) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] bg-blue-400/5 dark:bg-blue-400/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight">
              Welcome back, <span className="text-gradient">{user?.name || 'Academic'}</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 glass px-4 py-2 rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">System Status: Optimal</span>
          </div>
        </motion.div>

        {/* Bento Grid Layout */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Profile Card */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 glass-glow rounded-3xl p-6 border border-border flex flex-col items-center text-center group glow-border"
          >
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full border-2 border-blue-500/50 relative z-10" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-500/5 border-2 border-blue-500/30 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                  <User className="w-12 h-12 text-blue-500" />
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-background rounded-full z-20" />
            </div>
            <h2 className="text-xl font-bold font-space">{user?.name || 'User Name'}</h2>
            <p className="text-sm text-muted-foreground mb-4">{user?.email || 'user@campus.edu'}</p>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                {user?.role || 'STUDENT'}
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
                Active
              </span>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-2 glass-glow rounded-3xl p-8 border border-border flex flex-col justify-center gap-6 glow-border"
          >
            <h3 className="text-lg font-bold font-space flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-500" />
              Quick Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/facilities')}
                className="group relative p-6 bg-blue-600/10 hover:bg-blue-600 transition-all rounded-2xl border border-blue-500/20 text-left overflow-hidden shadow-lg shadow-blue-500/5"
              >
                <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                  <Calendar className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                  <Calendar className="w-8 h-8 text-blue-500 group-hover:text-white mb-4 transition-colors" />
                  <div className="text-lg font-bold group-hover:text-white transition-colors">Book a Hall/Lab</div>
                  <div className="text-xs text-muted-foreground group-hover:text-blue-100 transition-colors">Reserve campus facilities instantly</div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/incidents')}
                className="group relative p-6 bg-purple-600/10 hover:bg-purple-600 transition-all rounded-2xl border border-purple-500/20 text-left overflow-hidden shadow-lg shadow-purple-500/5"
              >
                <div className="absolute top-[-20%] right-[-10%] opacity-5 group-hover:opacity-10 transition-opacity">
                  <AlertCircle className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                  <AlertCircle className="w-8 h-8 text-purple-500 group-hover:text-white mb-4 transition-colors" />
                  <div className="text-lg font-bold group-hover:text-white transition-colors">Report an Issue</div>
                  <div className="text-xs text-muted-foreground group-hover:text-purple-100 transition-colors">Log facility or hardware faults</div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Stats Boxes */}
          <motion.div 
            variants={itemVariants}
            className="glass-glow rounded-3xl p-6 border border-blue-500/10 flex flex-col items-center justify-center text-center gap-2 group glow-border"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-2 border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Calendar className="text-blue-400 w-6 h-6" />
            </div>
            <div className="text-3xl font-bold font-space text-blue-400">08</div>
            <div className="text-[10px] font-bold text-blue-500/60 uppercase tracking-widest">Total Bookings</div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="glass-glow rounded-3xl p-6 border border-red-500/10 flex flex-col items-center justify-center text-center gap-2 group glow-border"
          >
            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center mb-2 border border-red-500/30 group-hover:scale-110 transition-transform">
              <AlertCircle className="text-red-400 w-6 h-6" />
            </div>
            <div className="text-3xl font-bold font-space text-red-400">02</div>
            <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Pending Tickets</div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="glass-glow rounded-3xl p-6 border border-amber-500/10 flex flex-col items-center justify-center text-center gap-2 group glow-border"
          >
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-2 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <Bell className="text-amber-400 w-6 h-6" />
            </div>
            <div className="text-3xl font-bold font-space text-amber-400">05</div>
            <div className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">Unread Notifications</div>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-3 glass-glow rounded-3xl p-8 border border-border glow-border"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold font-space flex items-center gap-2">
                <History className="w-6 h-6 text-blue-500" />
                Recent Activity
              </h3>
              <button className="text-sm font-bold text-blue-500 hover:text-blue-400 transition-colors">View Full History</button>
            </div>

            <div className="space-y-6">
              <TimelineItem 
                icon={<Calendar className="w-4 h-4 text-blue-500" />}
                title="Lab 04 Booking: Confirmed"
                time="2h ago"
                status="COMPLETED"
              />
              <TimelineItem 
                icon={<AlertCircle className="w-4 h-4 text-red-500" />}
                title="AC Fault - Lecture Hall 02"
                time="IN PROGRESS"
                status="PENDING"
                showTimer
                elapsedSeconds={ticketTime}
                formatFn={formatTicketTime}
              />
              <TimelineItem 
                icon={<Calendar className="w-4 h-4 text-emerald-500" />}
                title="Seminar Hall B Reservation"
                time="Yesterday"
                status="COMPLETED"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

const TimelineItem = ({ icon, title, time, status, showTimer, elapsedSeconds, formatFn }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-colors">
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold group-hover:text-blue-400 transition-colors">{title}</div>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-blue-500/50" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{time}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-6">
      {showTimer && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
          <Timer className="w-3 h-3 text-red-500 animate-pulse" />
          <span className="text-xs font-mono font-bold text-red-500">{formatFn(elapsedSeconds)}</span>
        </div>
      )}
      <div className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full ${
        status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
      }`}>
        {status}
      </div>
    </div>
  </div>
);

export default UserDashboard;
