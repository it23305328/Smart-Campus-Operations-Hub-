import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  Zap, 
  Shield, 
  ChevronRight,
  LogIn,
  Search,
  CheckCircle2,
  Moon,
  Sun
} from 'lucide-react';

const GuestDashboard = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30 transition-colors duration-500">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-emerald-600/5 dark:bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-dark py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-space font-bold tracking-tight">
              Smart Campus <span className="text-gradient">Hub</span>
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 md:gap-6"
          >
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border transition-all group"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                  >
                    <Sun className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                  >
                    <Moon className="w-5 h-5 text-blue-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <button className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Public Catalog
            </button>
            <button 
              onClick={handleGetStarted}
              className="group relative flex items-center gap-2 bg-primary/10 dark:bg-white/5 hover:bg-primary/20 dark:hover:bg-white/10 border border-primary/20 dark:border-white/10 px-6 py-2.5 rounded-full transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <LogIn className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold">Login</span>
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center z-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Empowering Next-Gen Campuses
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-space font-bold leading-tight mb-6"
          >
            Experience the Future of <br />
            <span className="text-gradient">Campus Operations</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Seamless facility bookings, real-time incident tracking, and intelligent 
            campus management—all in one place. Built for speed, security, and scale.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={handleGetStarted}
              className="group relative w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/40 transition-all hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-2xl font-bold transition-all backdrop-blur-sm"
            >
              View Public Facilities
            </button>
          </motion.div>
        </div>

        {/* Hero Mockup Background */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 max-w-5xl mx-auto relative group"
        >
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] group-hover:bg-blue-600/30 transition-colors duration-500" />
          <div className="relative glass-dark rounded-3xl p-4 border border-white/10 shadow-2xl">
            <div className="aspect-video bg-slate-900/50 rounded-2xl overflow-hidden relative">
               <div className="absolute inset-0 mesh-gradient opacity-30" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                      {[1,2,3,4].map(i => (
                        <motion.div 
                          key={i}
                          animate={{ height: [20, 50, 30, 60, 20] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 rounded-full bg-blue-500"
                        />
                      ))}
                    </div>
                    <span className="text-slate-500 font-mono text-sm uppercase tracking-widest">System Online</span>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="px-6 -mt-10 mb-20 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto glass rounded-3xl p-8 border border-white/10 flex flex-wrap justify-between gap-8 md:gap-4"
        >
          <StatItem value="24" label="Active Labs" sub="State-of-the-art" />
          <div className="hidden md:block w-[1px] h-12 bg-white/10 self-center" />
          <StatItem value="150+" label="Daily Bookings" sub="High availability" />
          <div className="hidden md:block w-[1px] h-12 bg-white/10 self-center" />
          <StatItem value="2 hrs" label="Avg. Resolution" sub="Rapid response" />
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-space font-bold mb-4">Powerful Features for a <br /><span className="text-gradient">Smart Environment</span></h2>
            <p className="text-muted-foreground max-w-md">Everything you need to manage your campus operations with precision and ease.</p>
          </div>
          <button 
            onClick={handleGetStarted}
            className="flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors"
          >
            Explore All Features <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Box 1 (Large) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onClick={handleGetStarted}
            className="md:col-span-2 md:row-span-2 glass-dark rounded-[2.5rem] p-10 border border-white/5 flex flex-col justify-between group overflow-hidden relative cursor-pointer"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Calendar className="w-48 h-48 rotate-12" />
             </div>
             <div>
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <Calendar className="text-blue-500 w-7 h-7" />
                </div>
                <h3 className="text-3xl font-space font-bold mb-4">Smart Bookings</h3>
                <p className="text-muted-foreground text-lg max-w-sm mb-8">
                  Real-time synchronization across all facility centers. Book labs, halls, and equipment in seconds.
                </p>
             </div>
             <div className="glass rounded-2xl p-6 border border-white/10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-slate-500">April 2026</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                   {[...Array(14)].map((_, i) => (
                     <div key={i} className={`h-8 rounded-lg flex items-center justify-center text-xs ${i === 10 ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                        {i + 1}
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>

          {/* Box 2 (Square) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            onClick={handleGetStarted}
            className="glass-dark rounded-[2.5rem] p-8 border border-white/5 flex flex-col group cursor-pointer"
          >
             <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangle className="text-red-500 w-6 h-6" />
             </div>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-4 w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Rapid Response
             </div>
             <h3 className="text-2xl font-space font-bold mb-3">Instant Incident Reporting</h3>
             <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Automated ticketing system that routes reports directly to the nearest technician.
             </p>
             <div className="mt-auto flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                   <Shield className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs text-muted-foreground italic">24/7 Monitoring Active</span>
             </div>
          </motion.div>

          {/* Box 3 (Wide) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            onClick={handleGetStarted}
            className="glass-dark rounded-[2.5rem] p-8 border border-white/5 flex items-center justify-between group overflow-hidden cursor-pointer"
          >
             <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                  <ShieldCheck className="text-emerald-500 w-6 h-6" />
                </div>
                <h3 className="text-2xl font-space font-bold mb-3">Role-Based Access</h3>
                <div className="flex gap-2">
                   <Badge label="Admin" color="bg-blue-500" />
                   <Badge label="User" color="bg-emerald-500" />
                   <Badge label="Tech" color="bg-purple-500" />
                </div>
             </div>
             <div className="relative pointer-events-none">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                   className="absolute -right-20 -bottom-20 w-40 h-40 border-2 border-dashed border-white/5 rounded-full"
                />
                <Globe className="w-24 h-24 text-slate-800 group-hover:text-emerald-500/20 transition-colors duration-500" />
             </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="text-blue-500 w-5 h-5" />
            <span className="text-sm font-space font-bold tracking-tight">
              Smart Campus <span className="text-gradient">Hub</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 Group XX. All rights reserved. Built with precision for excellence.
          </p>
          <div className="flex gap-6">
             <FooterLink label="Terms" />
             <FooterLink label="Privacy" />
             <FooterLink label="GitHub" />
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ value, label, sub }) => (
  <div className="flex-1 text-center md:text-left">
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="text-4xl font-space font-bold text-foreground mb-1"
    >
      {value}
    </motion.div>
    <div className="text-sm font-bold text-blue-500 dark:text-blue-400 mb-0.5 uppercase tracking-wider">{label}</div>
    <div className="text-xs text-muted-foreground">{sub}</div>
  </div>
);

const Badge = ({ label, color }) => (
  <span className={`px-2 py-0.5 ${color}/10 border border-${color}/20 ${color} text-[10px] font-bold rounded-md uppercase tracking-tighter`}>
    {label}
  </span>
);

const FooterLink = ({ label }) => (
  <button className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer capitalize">
    {label}
  </button>
);

export default GuestDashboard;
