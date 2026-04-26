import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { 
    FaTools, FaUserEdit, FaCommentAlt, FaClock, 
    FaCheckCircle, FaTimesCircle, FaSpinner, 
    FaChevronRight, FaImages
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const IncidentPage = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [technicians, setTechnicians] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
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
            case 'OPEN': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'CLOSED': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'REJECTED': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
            <FaSpinner className="text-4xl animate-spin mb-4 text-blue-500" />
            <p className="font-bold tracking-widest uppercase text-xs">Loading Hub Data...</p>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight flex items-center gap-3">
                            <FaTools className="text-blue-500" /> 
                            <span className="text-gradient">Maintenance Hub</span>
                        </h1>
                        <p className="text-muted-foreground mt-1 font-medium">Manage campus incidents and resource health.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {currentUser?.role === 'USER' && (
                            <button 
                                onClick={() => navigate('/create-ticket')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-blue-500/20"
                            >
                                Report New Incident
                            </button>
                        )}
                        <div className="glass px-6 py-3 rounded-2xl border border-border flex items-center gap-6">
                            <div className="text-center border-r border-border pr-6">
                                <div className="text-2xl font-bold text-red-500">
                                    {tickets.filter(t => t.status === 'OPEN' && (currentUser?.role !== 'USER' || t.createdBy === currentUser.name)).length}
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Open</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-500">
                                    {currentUser?.role === 'USER' ? tickets.filter(t => t.createdBy === currentUser.name).length : tickets.length}
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {currentUser?.role === 'USER' ? 'My Reports' : 'Total'}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search Bar Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 relative max-w-2xl"
                >
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input 
                        type="text"
                        placeholder="Search by Title, ID, Category or Description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full glass border border-border rounded-[2rem] py-5 pl-16 pr-6 font-bold text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all shadow-xl"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </motion.div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* Tickets List */}
                    <div className={`${selectedTicket ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4 transition-all duration-300`}>
                        {tickets
                            .filter(t => currentUser?.role !== 'USER' || t.createdBy === currentUser.name || t.createdBy === currentUser.email)
                            .filter(t => 
                                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                t.id.toString().includes(searchTerm)
                            )
                            .map((t) => (
                            <motion.div 
                                variants={itemVariants}
                                key={t.id}
                                onClick={() => setSelectedTicket(t)}
                                className={`group cursor-pointer p-6 rounded-3xl border-2 transition-all duration-300 transform hover:-translate-y-1
                                    ${selectedTicket?.id === t.id 
                                        ? 'bg-blue-500/5 border-blue-500/50 shadow-lg' 
                                        : 'glass border-transparent hover:border-border'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(t.status)}`}>
                                        {t.status}
                                    </span>
                                    <span className="text-muted-foreground text-xs font-mono">#{t.id}</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-1">{t.title}</h3>
                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 font-medium leading-relaxed">{t.description}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-4 text-muted-foreground">
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
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tech:</span>
                                        <span className="text-[10px] font-bold text-foreground bg-white/5 px-2 py-0.5 rounded uppercase border border-border">
                                            {t.assignedTechnician || 'Unassigned'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Selected Ticket Details */}
                    {selectedTicket && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-7"
                        >
                            <div className="glass-glow rounded-3xl border border-border overflow-hidden sticky top-8">
                                <div className="p-8 md:p-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-3xl font-bold font-space text-foreground tracking-tight uppercase leading-none">{selectedTicket.title}</h2>
                                        <button 
                                            onClick={() => setSelectedTicket(null)}
                                            className="text-muted-foreground hover:text-foreground transition text-2xl"
                                        >×</button>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mb-4">
                                        <div className="bg-blue-500/10 px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-500/20">
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Reported By:</span>
                                            <span className="text-xs font-bold text-blue-500">{selectedTicket.createdBy || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 mb-8">
                                        <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-border">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category:</span>
                                            <span className="text-xs font-bold text-foreground">{selectedTicket.category || 'N/A'}</span>
                                        </div>
                                        <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-border">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Priority:</span>
                                            <span className={`text-xs font-bold ${selectedTicket.priority === 'URGENT' || selectedTicket.priority === 'HIGH' ? 'text-red-500' : 'text-foreground'}`}>
                                                {selectedTicket.priority || 'NORMAL'}
                                            </span>
                                        </div>
                                        <div className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-border">
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Contact:</span>
                                            <span className="text-xs font-bold text-foreground">{selectedTicket.contactDetails || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        {/* Status & Assignment Controls */}
                                        {currentUser?.role !== 'USER' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white/5 p-6 rounded-3xl border border-border">
                                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Update Progress</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'].map(s => (
                                                            <button
                                                                key={s}
                                                                onClick={() => handleUpdateStatus(selectedTicket.id, s)}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border
                                                                    ${selectedTicket.status === s 
                                                                        ? 'bg-blue-600 border-blue-500/20 text-white shadow-lg shadow-blue-500/20' 
                                                                        : 'bg-white/5 border-border text-muted-foreground hover:border-blue-500/50'}`}
                                                            >
                                                                {s}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="bg-white/5 p-6 rounded-3xl border border-border">
                                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Assign Professional</label>
                                                    <select 
                                                        className="w-full bg-white/5 border border-border rounded-2xl p-3 text-sm font-bold text-foreground outline-none focus:border-blue-500 transition-all"
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
                                        )}

                                        {/* Images Section */}
                                        {selectedTicket.imageUrls?.length > 0 && (
                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Evidence Gallery</label>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {selectedTicket.imageUrls.map((url, i) => (
                                                        <a 
                                                            key={i} 
                                                            href={`http://localhost:8080${url}`} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="aspect-video rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-border"
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
                                            <div className="bg-blue-500/5 p-8 rounded-3xl border border-blue-500/20">
                                                <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Incident Report Details</label>
                                                <p className="text-foreground text-lg font-medium leading-relaxed italic">
                                                    "{selectedTicket.description}"
                                                </p>
                                            </div>

                                            {selectedTicket.status === 'RESOLVED' && selectedTicket.resolutionNotes && (
                                                <div className="bg-emerald-500/5 p-8 rounded-3xl border border-emerald-500/20">
                                                    <label className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3">Resolution Notes</label>
                                                    <p className="text-emerald-500 text-lg font-bold leading-relaxed italic">
                                                        "{selectedTicket.resolutionNotes}"
                                                    </p>
                                                </div>
                                            )}

                                            {selectedTicket.status === 'REJECTED' && selectedTicket.rejectionReason && (
                                                <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/20">
                                                    <label className="block text-[10px] font-black text-red-400 uppercase tracking-widest mb-3">Rejection Reason</label>
                                                    <p className="text-red-500 text-lg font-bold leading-relaxed">
                                                        {selectedTicket.rejectionReason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Comments Section */}
                                        <div className="pt-8 border-t border-border">
                                            <div className="flex items-center gap-2 mb-6">
                                                <FaCommentAlt className="text-blue-500" />
                                                <h4 className="text-xl font-bold font-space text-foreground tracking-tight uppercase">Update Logs</h4>
                                            </div>
                                            
                                            <div className="space-y-4 mb-8">
                                                {selectedTicket.comments?.map((c, i) => (
                                                    <div key={i} className="flex gap-4 group/comment">
                                                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-muted-foreground shrink-0 border border-border">
                                                            {c.author.charAt(0)}
                                                        </div>
                                                        <div className="bg-white/5 p-4 rounded-2xl border border-border w-full relative">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-foreground text-sm">{c.author}</span>
                                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(c.timestamp).toLocaleString()}</span>
                                                                </div>
                                                                {currentUser.name === c.author && (
                                                                    <button 
                                                                        onClick={() => handleDeleteComment(c.id)}
                                                                        className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover/comment:opacity-100"
                                                                    >
                                                                        <FaTimesCircle className="text-xs" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-muted-foreground text-sm font-medium">{c.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <form onSubmit={handleAddComment} className="relative group">
                                                <textarea 
                                                    className="w-full bg-white/5 border border-border rounded-3xl p-6 pr-24 text-sm font-medium text-foreground outline-none focus:border-blue-500 focus:bg-white/10 transition-all h-24 placeholder:text-muted-foreground"
                                                    placeholder="Type an update or request clarification..."
                                                    value={commentText}
                                                    onChange={(e) => setCommentText(e.target.value)}
                                                />
                                                <button 
                                                    type="submit"
                                                    className="absolute right-4 bottom-4 bg-blue-600 text-white px-6 py-2 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 border border-blue-500/20"
                                                >
                                                    Post Update
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {tickets.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 glass rounded-3xl border-2 border-dashed border-border"
                    >
                        <div className="text-6xl mb-4 text-muted-foreground">📭</div>
                        <h3 className="text-2xl font-bold text-muted-foreground uppercase tracking-widest">No reports found</h3>
                        <p className="text-muted-foreground font-medium">Campus facilities are currently operating normally.</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default IncidentPage;