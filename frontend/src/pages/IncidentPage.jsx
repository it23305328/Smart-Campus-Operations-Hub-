import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { 
    FaTools, FaUserEdit, FaCommentAlt, FaClock, 
    FaCheckCircle, FaTimesCircle, FaSpinner, 
    FaChevronRight, FaImages
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const IncidentPage = () => {
    const { user: currentUser } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [commentText, setCommentText] = useState("");

    const fetchTickets = useCallback(async () => {
        try {
            const res = await api.get('/api/tickets');
            setTickets(res.data);
        } catch (err) {
            console.error("Error fetching tickets:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTechnicians = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/users');
            const techs = res.data.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN');
            setTechnicians(techs);
        } catch (err) {
            console.error("Error fetching technicians:", err);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
        fetchTechnicians();
    }, [fetchTickets, fetchTechnicians]);

    const handleUpdateStatus = async (id, newStatus) => {
        let payload = { status: newStatus };
        if (newStatus === 'REJECTED') {
            const reason = prompt("Enter rejection reason:");
            if (!reason) return;
            payload.rejectionReason = reason;
        }
        if (newStatus === 'RESOLVED') {
            const notes = prompt("Enter resolution notes (what was done?):");
            if (!notes) return;
            payload.resolutionNotes = notes;
        }
        try {
            await api.patch(`/api/tickets/${id}/status`, payload);
            fetchTickets();
            if (selectedTicket?.id === id) {
                setSelectedTicket(prev => ({ 
                    ...prev, 
                    status: newStatus, 
                    rejectionReason: payload.rejectionReason,
                    resolutionNotes: payload.resolutionNotes 
                }));
            }
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleAssign = async (id, techName) => {
        try {
            await api.patch(`/api/tickets/${id}/assign`, { technician: techName });
            fetchTickets();
            if (selectedTicket?.id === id) {
                setSelectedTicket(prev => ({ ...prev, assignedTechnician: techName }));
            }
        } catch (err) {
            alert("Failed to assign technician");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await api.delete(`/api/tickets/${selectedTicket.id}/comments/${commentId}`);
            const res = await api.get('/api/tickets');
            const updated = res.data.find(t => t.id === selectedTicket.id);
            setTickets(res.data);
            setSelectedTicket(updated);
        } catch (err) {
            alert("Failed to delete comment");
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            await api.post(`/api/tickets/${selectedTicket.id}/comments`, {
                text: commentText,
                author: currentUser.name
            });
            setCommentText("");
            // Refresh ticket details to show new comment
            const res = await api.get('/api/tickets');
            const updated = res.data.find(t => t.id === selectedTicket.id);
            setTickets(res.data);
            setSelectedTicket(updated);
        } catch (err) {
            alert("Failed to add comment");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-rose-100 text-rose-600 border-rose-200';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
            case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'REJECTED': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-blue-100 text-blue-600 border-blue-200';
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
            <FaSpinner className="text-4xl animate-spin mb-4 text-blue-500" />
            <p className="font-bold tracking-widest uppercase text-xs">Loading Hub Data...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FaTools className="text-blue-600" /> Maintenance Hub
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage campus incidents and resource health.</p>
                </div>
                <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
                    <div className="text-center border-r border-slate-100 pr-6">
                        <div className="text-2xl font-black text-rose-500">{tickets.filter(t => t.status === 'OPEN').length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Open</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-blue-600">{tickets.length}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tickets List */}
                <div className={`${selectedTicket ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4 transition-all duration-300`}>
                    {tickets.map((t) => (
                        <div 
                            key={t.id}
                            onClick={() => setSelectedTicket(t)}
                            className={`group cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-1
                                ${selectedTicket?.id === t.id 
                                    ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-900/5' 
                                    : 'bg-white border-transparent hover:border-slate-200 shadow-xl shadow-slate-900/5'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(t.status)}`}>
                                    {t.status}
                                </span>
                                <span className="text-slate-300 text-xs font-mono">#{t.id}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight line-clamp-1">{t.title}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2 font-medium leading-relaxed">{t.description}</p>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <FaClock className="text-[10px]" />
                                        <span className="text-[10px] font-bold">{new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {t.imageUrls?.length > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <FaImages className="text-[10px]" />
                                            <span className="text-[10px] font-bold">{t.imageUrls.length}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tech:</span>
                                    <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                                        {t.assignedTechnician || 'Unassigned'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selected Ticket Details */}
                {selectedTicket && (
                    <div className="lg:col-span-7 animate-in slide-in-from-right duration-500">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden sticky top-8">
                            <div className="p-8 md:p-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">{selectedTicket.title}</h2>
                                    <button 
                                        onClick={() => setSelectedTicket(null)}
                                        className="text-slate-300 hover:text-slate-600 transition text-2xl"
                                    >×</button>
                                </div>

                                <div className="flex flex-wrap gap-4 mb-8">
                                    <div className="bg-slate-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category:</span>
                                        <span className="text-xs font-bold text-slate-700">{selectedTicket.category || 'N/A'}</span>
                                    </div>
                                    <div className="bg-slate-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority:</span>
                                        <span className={`text-xs font-black ${selectedTicket.priority === 'URGENT' || selectedTicket.priority === 'HIGH' ? 'text-rose-500' : 'text-slate-700'}`}>
                                            {selectedTicket.priority || 'NORMAL'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact:</span>
                                        <span className="text-xs font-bold text-slate-700">{selectedTicket.contactDetails || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    {/* Status & Assignment Controls */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Update Progress</label>
                                            <div className="flex flex-wrap gap-2">
                                                {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleUpdateStatus(selectedTicket.id, s)}
                                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border
                                                            ${selectedTicket.status === s 
                                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                                                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assign Professional</label>
                                            <select 
                                                className="w-full bg-white border-2 border-slate-200 rounded-2xl p-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all"
                                                value={selectedTicket.assignedTechnician || ""}
                                                onChange={(e) => handleAssign(selectedTicket.id, e.target.value)}
                                            >
                                                <option value="">Choose Technician...</option>
                                                {technicians.map(tech => (
                                                    <option key={tech.id} value={tech.name}>{tech.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Images Section */}
                                    {selectedTicket.imageUrls?.length > 0 && (
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evidence Gallery</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {selectedTicket.imageUrls.map((url, i) => (
                                                    <a 
                                                        key={i} 
                                                        href={`http://localhost:8080${url}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="aspect-video rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-100"
                                                    >
                                                        <img 
                                                            src={`http://localhost:8080${url}`} 
                                                            alt="incident" 
                                                            className="w-full h-full object-cover transition duration-500 hover:scale-110" 
                                                        />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description and Rejection */}
                                    <div className="space-y-4">
                                        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                                            <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Incident Report Details</label>
                                            <p className="text-slate-700 text-lg font-medium leading-relaxed italic">
                                                "{selectedTicket.description}"
                                            </p>
                                        </div>

                                        {selectedTicket.status === 'RESOLVED' && selectedTicket.resolutionNotes && (
                                            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
                                                <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Resolution Notes</label>
                                                <p className="text-emerald-700 text-lg font-bold leading-relaxed italic">
                                                    "{selectedTicket.resolutionNotes}"
                                                </p>
                                            </div>
                                        )}

                                        {selectedTicket.status === 'REJECTED' && selectedTicket.rejectionReason && (
                                            <div className="bg-rose-50 p-8 rounded-3xl border border-rose-100">
                                                <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">Rejection Reason</label>
                                                <p className="text-rose-700 text-lg font-bold leading-relaxed">
                                                    {selectedTicket.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments Section */}
                                    <div className="pt-8 border-t border-slate-100">
                                        <div className="flex items-center gap-2 mb-6">
                                            <FaCommentAlt className="text-blue-500" />
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Update Logs</h4>
                                        </div>
                                        
                                        <div className="space-y-4 mb-8">
                                            {selectedTicket.comments?.map((c, i) => (
                                                <div key={i} className="flex gap-4 group/comment">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0">
                                                        {c.author.charAt(0)}
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full relative">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-800 text-sm">{c.author}</span>
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(c.timestamp).toLocaleString()}</span>
                                                            </div>
                                                            {currentUser.name === c.author && (
                                                                <button 
                                                                    onClick={() => handleDeleteComment(c.id)}
                                                                    className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/comment:opacity-100"
                                                                >
                                                                    <FaTimesCircle className="text-xs" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-600 text-sm font-medium">{c.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <form onSubmit={handleAddComment} className="relative group">
                                            <textarea 
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 pr-24 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all h-24 shadow-inner"
                                                placeholder="Type an update or request clarification..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                            />
                                            <button 
                                                type="submit"
                                                className="absolute right-4 bottom-4 bg-blue-600 text-white px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                                            >
                                                Post Update
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {tickets.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="text-6xl mb-4 text-slate-200">📭</div>
                    <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">No reports found</h3>
                    <p className="text-slate-400 font-medium">Campus facilities are currently operating normally.</p>
                </div>
            )}
        </div>
    );
};

export default IncidentPage;