import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Clock, Shield, User, MapPin, 
    CheckCircle2, XCircle, PlayCircle, Check,
    ChevronRight, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import CommentSection from '../../components/incidents/CommentSection';
import TicketTimer from '../../components/incidents/TicketTimer';
import { motion } from 'framer-motion';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusNotes, setStatusNotes] = useState('');

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const data = await ticketService.getTicketById(id);
            setTicket(data);
        } catch (error) {
            console.error('Error fetching ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        if (!statusNotes.trim() && (newStatus === 'REJECTED' || newStatus === 'RESOLVED')) {
            alert('Please provide notes for this status change.');
            return;
        }

        try {
            await ticketService.updateStatus(id, newStatus, statusNotes);
            setStatusNotes('');
            fetchTicket();
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error.response?.data?.message || 'Failed to update status.');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!ticket) return <div className="p-10 text-center font-bold text-muted-foreground">Ticket not found</div>;

    const isAdmin = user?.role === 'ADMIN';
    const isTechnician = user?.role === 'TECHNICIAN';
    const isOwner = user?.id === ticket.reporter?.id;

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'CLOSED': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            case 'REJECTED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
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

            <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 relative z-10">
                <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Tickets
                </motion.button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 space-y-8"
                    >
                        <div className="glass-glow rounded-3xl p-10 border border-border">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex flex-col gap-2">
                                    <span className={`w-fit px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    <TicketTimer createdAt={ticket.createdAt} resolvedAt={ticket.resolvedAt} />
                                </div>
                                <span className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {new Date(ticket.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <h1 className="text-4xl font-black font-space text-foreground mb-6">{ticket.category}</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-10">{ticket.description}</p>

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Evidence & Attachments
                                    </h4>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {ticket.attachments.map((img, idx) => (
                                            <a key={idx} href={img.imageUrl} target="_blank" rel="noreferrer" className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-border flex-shrink-0 hover:shadow-xl hover:border-blue-500/50 transition-all">
                                                <img src={img.imageUrl} alt="evidence" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="glass-glow rounded-3xl p-10 border border-border">
                            <CommentSection 
                                ticketId={ticket.id} 
                                comments={ticket.comments} 
                                onCommentUpdate={fetchTicket} 
                            />
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        <div className="glass rounded-3xl p-8 border border-border">
                            <h3 className="text-xl font-bold font-space text-foreground mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-400" />
                                Case Details
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-muted-foreground tracking-widest uppercase">Reporter</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500 border border-blue-500/20">
                                            {ticket.reporter?.name?.charAt(0)}
                                        </div>
                                        <p className="font-bold text-foreground">{ticket.reporter?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-muted-foreground tracking-widest uppercase">Staff Assigned</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-500 border border-blue-500/20">
                                            {ticket.technician ? ticket.technician.name.charAt(0) : '?'}
                                        </div>
                                        <p className="font-bold text-foreground">{ticket.technician ? ticket.technician.name : 'Unassigned'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-muted-foreground tracking-widest uppercase">Priority</p>
                                    <p className="font-bold text-amber-400">{ticket.priority}</p>
                                </div>
                            </div>
                        </div>

                        {/* Workflow Actions */}
                        {(isAdmin || isTechnician) && (
                            <div className="glass rounded-3xl p-8 border border-border space-y-6">
                                <h3 className="text-lg font-bold font-space text-foreground">Workflow Actions</h3>
                                
                                <textarea
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                    placeholder="Add notes for rejection or resolution..."
                                    className="w-full px-5 py-4 bg-white/5 border border-border rounded-2xl focus:border-blue-500 outline-none transition-all text-sm font-semibold text-foreground placeholder:text-muted-foreground"
                                    rows="3"
                                ></textarea>

                                <div className="grid grid-cols-1 gap-3">
                                    {ticket.status === 'OPEN' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 border border-blue-500/20">
                                                <PlayCircle className="w-5 h-5" /> Start Work
                                            </button>
                                            {isAdmin && (
                                                <button onClick={() => handleStatusUpdate('REJECTED')} className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-4 rounded-2xl font-bold hover:bg-red-500/20 transition-all border border-red-500/20">
                                                    <XCircle className="w-5 h-5" /> Reject Ticket
                                                </button>
                                            )}
                                        </>
                                    )}
                                    
                                    {ticket.status === 'IN_PROGRESS' && (
                                        <button onClick={() => handleStatusUpdate('RESOLVED')} className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 border border-emerald-500/20">
                                            <CheckCircle2 className="w-5 h-5" /> Mark as Resolved
                                        </button>
                                    )}

                                    {(ticket.status === 'RESOLVED' && (isAdmin || isOwner)) && (
                                        <button onClick={() => handleStatusUpdate('CLOSED')} className="flex items-center justify-center gap-2 bg-foreground text-background py-4 rounded-2xl font-bold hover:bg-foreground/90 transition-all shadow-lg border border-border">
                                            <Check className="w-5 h-5" /> Close Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;