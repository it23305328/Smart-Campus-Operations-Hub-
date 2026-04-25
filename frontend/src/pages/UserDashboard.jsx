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
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {/* Profile Card - Enhanced */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 glass-glow rounded-[2rem] p-8 border border-white/10 flex flex-col items-center text-center group relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-2xl -z-10 group-hover:opacity-100 opacity-50 transition-opacity" />
            
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-all duration-500 scale-125" />
              <div className="relative w-28 h-28 p-1 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-500 z-10 animate-spin-slow">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden p-1">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-blue-500/5 flex items-center justify-center">
                      <User className="w-12 h-12 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-slate-900 rounded-full z-20 shadow-lg" />
            </div>
            
            <h2 className="text-2xl font-black font-space tracking-tight mb-1 text-slate-900 dark:text-white">{user?.name || 'Academic'}</h2>
            <p className="text-sm text-muted-foreground font-medium mb-6">{user?.email || 'user@campus.edu'}</p>
            
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-4 py-1.5 bg-blue-600 shadow-lg shadow-blue-600/30 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                {user?.role || 'STUDENT'}
              </span>
              <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                ACTIVE
              </span>
            </div>
          </motion.div> 

          {/* Quick Actions - Revamped */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-3 glass-glow rounded-[2rem] p-8 border border-white/5 flex flex-col justify-center gap-8 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black font-space flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <PlusCircle className="w-5 h-5 text-blue-500" />
                </div>
                Quick Operations
              </h3>
              <div className="text-xs font-bold text-blue-500 uppercase tracking-widest cursor-pointer hover:text-blue-400 transition-colors">Configure Layout</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button 
                onClick={() => navigate('/facilities')}
                className="group relative p-8 rounded-3xl bg-slate-900 border border-white/5 text-left overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                  <Calendar className="w-40 h-40 text-blue-500" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 shadow-inner">
                    <Calendar className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold text-white mb-2">Book a Hall/Lab</div>
                  <p className="text-sm text-slate-400 font-medium max-w-[200px]">Reserve premium campus facilities with instant confirmation.</p>
                  <ArrowUpRight className="absolute top-8 right-8 w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
              </button>

              <button 
                onClick={() => navigate('/incidents')}
                className="group relative p-8 rounded-3xl bg-slate-900 border border-white/5 text-left overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 blur opacity-0 group-hover:opacity-20 transition duration-500" />
                <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                  <AlertCircle className="w-40 h-40 text-purple-500" />
                </div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30 shadow-inner">
                    <AlertCircle className="w-7 h-7 text-purple-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-xl font-bold text-white mb-2">Report an Issue</div>
                  <p className="text-sm text-slate-400 font-medium max-w-[200px]">Fast-track technical support and facility requests.</p>
                  <ArrowUpRight className="absolute top-8 right-8 w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
              </button>
            </div>
          </motion.div>

          {/* Key Metrics - Vertical Style */}
          <div className="md:col-span-1 grid grid-cols-1 gap-6">
            <MetricCard 
              icon={<Calendar className="w-5 h-5" />} 
              label="TOTAL BOOKINGS" 
              value="08" 
              color="blue" 
              variants={itemVariants}
            />
            <MetricCard 
              icon={<AlertCircle className="w-5 h-5" />} 
              label="PENDING TICKETS" 
              value="02" 
              color="rose" 
              variants={itemVariants}
            />
            <MetricCard 
              icon={<Bell className="w-5 h-5" />} 
              label="UNREAD NOTIFS" 
              value="05" 
              color="amber" 
              variants={itemVariants}
            />
          </div>

          {/* Activity Timeline - Expanded */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-3 glass-glow rounded-[2rem] p-8 border border-white/5 relative shadow-inner h-full"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-black font-space flex items-center gap-3 text-slate-900 dark:text-white">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <History className="w-5 h-5 text-blue-500" />
                </div>
                Activity Stream
              </h3>
              <button className="px-5 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-black text-blue-500 tracking-widest transition-all">
                ARCHIVE
              </button>
            </div>

            <div className="space-y-4">
              <TimelineItem 
                icon={<Calendar className="w-4 h-4 text-blue-400" />}
                title="Lab 04 Booking: Confirmed"
                description="Your hall reservation for Tomorrow at 10:00 AM has been granted."
                time="2h ago"
                status="COMPLETED"
              />
              <TimelineItem 
                icon={<AlertCircle className="w-4 h-4 text-rose-400" />}
                title="AC Fault - Lecture Hall 02"
                description="Technical team is on the way to resolve the connectivity/cooling issue."
                time="RUNNING"
                status="PENDING"
                showTimer
                elapsedSeconds={ticketTime}
                formatFn={formatTicketTime}
              />
              <TimelineItem 
                icon={<Calendar className="w-4 h-4 text-emerald-400" />}
                title="Seminar Hall B Reservation"
                description="Past event which was successfully hosted with 50+ participants."
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

const MetricCard = ({ icon, label, value, color, variants }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  return (
    <motion.div 
      variants={variants}
      className="glass-glow rounded-[1.5rem] p-6 border border-white/5 flex flex-col justify-between group relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-20 h-20 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity ${color === 'blue' ? 'bg-blue-500' : color === 'rose' ? 'bg-rose-500' : 'bg-amber-500'}`} />
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="text-[10px] font-black tracking-[0.2em] opacity-60 dark:text-white">{label}</div>
      </div>
      <div className={`text-4xl font-black font-space ${colorClasses[color].split(' ')[0]}`}>{value}</div>
    </motion.div>
  );
};

const TimelineItem = ({ icon, title, description, time, status, showTimer, elapsedSeconds, formatFn }) => (
  <div className="flex items-center justify-between p-5 bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl transition-all group">
    <div className="flex items-start gap-5">
      <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-blue-500/30 transition-all shadow-lg shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors mb-0.5">{title}</div>
        <p className="text-xs text-muted-foreground line-clamp-1 mb-2 font-medium">{description}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-md border border-white/5">
            <Clock className="w-3 h-3 text-blue-500/60" />
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{time}</span>
          </div>
          {showTimer && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md">
              <Timer className="w-3 h-3 text-rose-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-rose-500">{formatFn(elapsedSeconds)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="hidden sm:block">
      <div className={`text-[9px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full border shadow-lg ${
        status === 'COMPLETED' 
          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5' 
          : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5'
      }`}>
        {status}
      </div>
    </div>
  </div>
);

export default UserDashboard;
