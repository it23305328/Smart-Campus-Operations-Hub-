import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Filter, Search, ClipboardList, 
    MoreVertical, ArrowUpRight, MessageSquare, AlertCircle
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import TicketForm from './TicketForm';
import TicketTimer from '../../components/incidents/TicketTimer';
import { motion } from 'framer-motion';

const TechnicianDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getAllTickets();
            setTickets(data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = filter === 'ALL' 
        ? tickets 
        : tickets.filter(t => t.status === filter);

    const getPriorityColor = (p) => {
        switch (p) {
            case 'HIGH': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'MEDIUM': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        }
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
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight">
                            <span className="text-gradient">Incident Center</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 font-medium">Track and manage campus support requests</p>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => setIsFormOpen(!isFormOpen)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 border border-blue-500/20"
                        >
                            <Plus className="w-6 h-6" />
                            Report Issue
                        </button>
                    </div>
                </motion.div>

                {isFormOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <TicketForm onSuccess={() => { setIsFormOpen(false); fetchTickets(); }} />
                    </motion.div>
                )}

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-glow rounded-3xl border border-border overflow-hidden"
                >
                    <div className="p-8 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5">
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                                        filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 text-muted-foreground hover:bg-white/20 border border-border'
                                    }`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <input type="text" placeholder="Search ticket ID..." className="w-full pl-10 pr-4 py-2 bg-white/5 border border-border rounded-xl outline-none focus:border-blue-500 font-semibold text-sm text-foreground placeholder:text-muted-foreground" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Incidents</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Priority</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-20 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></td></tr>
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket) => (
                                        <motion.tr 
                                            variants={itemVariants}
                                            key={ticket.id} 
                                            className="hover:bg-white/5 transition-colors cursor-pointer group" 
                                            onClick={() => navigate(`/incidents/${ticket.id}`)}
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground flex-shrink-0 border border-border">
                                                        <ClipboardList className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground group-hover:text-blue-400 transition-colors">#{ticket.id.toString().padStart(4, '0')}</div>
                                                        <div className="text-muted-foreground text-xs font-semibold truncate max-w-[200px]">{ticket.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-foreground">{ticket.category}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest border ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            ticket.status === 'OPEN' ? 'bg-blue-500' : 
                                                            ticket.status === 'IN_PROGRESS' ? 'bg-amber-500 animate-pulse' :
                                                            ticket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-gray-400'
                                                        }`}></div>
                                                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{ticket.status.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="transform scale-75 origin-left">
                                                        <TicketTimer createdAt={ticket.createdAt} resolvedAt={ticket.resolvedAt} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg border border-transparent hover:border-blue-500/20">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="py-20 text-center text-muted-foreground font-bold">No tickets found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;