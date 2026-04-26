import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import analyticsService from '../../services/analyticsService';
import { LayoutGrid, CheckCircle, AlertOctagon, TrendingUp, BarChart3, PieChartIcon } from 'lucide-react';

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

    const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

    const summaryCards = [
        { title: 'Total Resources', value: metrics.totalResources, icon: LayoutGrid, color: 'bg-indigo-500', shadow: 'shadow-indigo-200' },
        { title: 'Active Facilities', value: metrics.activeResources, icon: CheckCircle, color: 'bg-emerald-500', shadow: 'shadow-emerald-200' },
        { title: 'Out of Service', value: metrics.outOfServiceResources, icon: AlertOctagon, color: 'bg-rose-500', shadow: 'shadow-rose-200' },
    ];

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <TrendingUp className="w-10 h-10 text-indigo-600" />
                        Usage Analytics
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium text-lg italic">Real-time resource utilization and facility performance insights</p>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {summaryCards.map((card, idx) => (
                        <div key={idx} className={`bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl ${card.shadow} transition-all hover:-translate-y-2`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-1">{card.title}</p>
                                    <h3 className="text-5xl font-black text-slate-900">{card.value}</h3>
                                </div>
                                <div className={`${card.color} p-4 rounded-3xl text-white shadow-lg`}>
                                    <card.icon className="w-8 h-8" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Bar Chart Section */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Top 5 Most Booked Resources</h2>
                        </div>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topResources.slice(0, 5)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="resourceName" 
                                        type="category" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                                        width={100}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    />
                                    <Bar dataKey="bookingCount" radius={[0, 10, 10, 0]} barSize={40}>
                                        {topResources.slice(0, 5).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="bg-fuchsia-50 p-3 rounded-2xl text-fuchsia-600">
                                <PieChartIcon className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900">Booking Distribution</h2>
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
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {topResources.slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                    <span className="text-sm font-bold text-slate-600 truncate">{item.resourceName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
