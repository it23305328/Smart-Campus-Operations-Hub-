import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Filter, Search, ClipboardList, 
    MoreVertical, ArrowUpRight, MessageSquare, AlertCircle
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import TicketForm from './TicketForm';

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
            case 'HIGH': return 'text-rose-600 bg-rose-50';
            case 'MEDIUM': return 'text-amber-600 bg-amber-50';
            default: return 'text-sky-600 bg-sky-50';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Incident Center</h1>
                        <p className="text-slate-500 mt-1 font-medium">Track and manage campus support requests</p>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={() => setIsFormOpen(!isFormOpen)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            <Plus className="w-6 h-6" />
                            Report Issue
                        </button>
                    </div>
                </div>

                {isFormOpen && (
                    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                        <TicketForm onSuccess={() => { setIsFormOpen(false); fetchTickets(); }} />
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                                        filter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100 border border-slate-100'
                                    }`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" placeholder="Search ticket ID..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600/30 font-semibold text-sm" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Incidents</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    <tr><td colSpan="5" className="py-20 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></td></tr>
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket) => (
                                        <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group" onClick={() => navigate(`/incidents/${ticket.id}`)}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                                                        <ClipboardList className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">#{ticket.id.toString().padStart(4, '0')}</div>
                                                        <div className="text-slate-400 text-xs font-semibold truncate max-w-[200px]">{ticket.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-sm font-bold text-slate-600">{ticket.category}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${getPriorityColor(ticket.priority)}`}>
                                                    {ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${
                                                        ticket.status === 'OPEN' ? 'bg-blue-500' : 
                                                        ticket.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                                                        ticket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-slate-400'
                                                    }`}></div>
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{ticket.status.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                        <ArrowUpRight className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="5" className="py-20 text-center text-slate-400 font-bold">No tickets found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDashboard;
