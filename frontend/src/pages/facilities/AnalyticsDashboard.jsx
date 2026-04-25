import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import analyticsService from '../../services/analyticsService';
import { LayoutGrid, CheckCircle, AlertOctagon, TrendingUp, BarChart3, PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const AnalyticsDashboard = () => {
    const [topResources, setTopResources] = useState([]);
    const [metrics, setMetrics] = useState({
        totalResources: 0,
        activeResources: 0,
        outOfServiceResources: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [topRes, summary] = await Promise.all([
                    analyticsService.getTopResources(),
                    analyticsService.getSummaryMetrics()
                ]);
                setTopResources(topRes);
                setMetrics(summary);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'];

    const summaryCards = [
        { title: 'Total Resources', value: metrics.totalResources, icon: LayoutGrid, color: 'bg-blue-500', shadow: 'shadow-blue-500/20' },
        { title: 'Active Facilities', value: metrics.activeResources, icon: CheckCircle, color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
        { title: 'Out of Service', value: metrics.outOfServiceResources, icon: AlertOctagon, color: 'bg-red-500', shadow: 'shadow-red-500/20' },
    ];

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

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen pt-4 pb-20">
            {/* Mesh Background (Shared) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] bg-blue-400/5 dark:bg-blue-400/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.header 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-blue-500" />
                        <span className="text-gradient">Usage Analytics</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium text-lg italic">Real-time resource utilization and facility performance insights</p>
                </motion.header>

                {/* Summary Cards */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                >
                    {summaryCards.map((card, idx) => (
                        <motion.div 
                            variants={itemVariants}
                            key={idx} 
                            className={`glass p-8 rounded-3xl border border-border transition-all hover:-translate-y-2 ${card.shadow}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-muted-foreground font-bold tracking-widest text-xs uppercase mb-1">{card.title}</p>
                                    <h3 className="text-5xl font-black text-foreground">{card.value}</h3>
                                </div>
                                <div className={`${card.color} p-4 rounded-3xl text-white shadow-lg`}>
                                    <card.icon className="w-8 h-8" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                >
                    {/* Bar Chart Section */}
                    <motion.div 
                        variants={itemVariants}
                        className="glass-glow rounded-3xl p-10 border border-border"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500 border border-blue-500/20">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-space text-foreground">Top 5 Most Booked Resources</h2>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topResources.slice(0, 5)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="resourceName" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'var(--muted-foreground)', fontSize: 13, fontWeight: 700 }}
                                        width={100}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: '1px solid var(--border)', 
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', 
                                            padding: '12px',
                                            backgroundColor: 'var(--background)',
                                            color: 'var(--foreground)'
                                        }}
                                    />
                                    <Bar dataKey="bookingCount" radius={[0, 10, 10, 0]} barSize={40}>
                                        {topResources.slice(0, 5).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Distribution Chart */}
                    <motion.div 
                        variants={itemVariants}
                        className="glass-glow rounded-3xl p-10 border border-border"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500 border border-purple-500/20">
                                <PieChartIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold font-space text-foreground">Booking Distribution</h2>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topResources.slice(0, 5)}
                                        dataKey="bookingCount"
                                        nameKey="resourceName"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={10}
                                    >
                                        {topResources.slice(0, 5).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: '1px solid var(--border)', 
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', 
                                            padding: '12px',
                                            backgroundColor: 'var(--background)',
                                            color: 'var(--foreground)'
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {topResources.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-sm font-bold text-muted-foreground truncate">{item.resourceName}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;