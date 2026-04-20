import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Clock, Shield, User, MapPin, 
    CheckCircle2, XCircle, PlayCircle, DoneAll,
    ChevronRight, ArrowLeft, Image as ImageIcon
} from 'lucide-react';
import ticketService from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import CommentSection from '../../components/incidents/CommentSection';
import TicketTimer from '../../components/incidents/TicketTimer';

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!ticket) return <div className="p-10 text-center font-bold text-slate-400">Ticket not found</div>;

    const isAdmin = user?.role === 'ADMIN';
    const isTechnician = user?.role === 'TECHNICIAN';
    const isOwner = user?.id === ticket.reporter?.id;

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700';
            case 'CLOSED': return 'bg-slate-100 text-slate-700';
            case 'REJECTED': return 'bg-rose-100 text-rose-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-5xl mx-auto px-6 pt-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-8 transition-colors group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Tickets
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex flex-col gap-2">
                                    <span className={`w-fit px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    <TicketTimer createdAt={ticket.createdAt} resolvedAt={ticket.resolvedAt} />
                                </div>
                                <span className="text-sm font-bold text-slate-400 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {new Date(ticket.createdAt).toLocaleString()}
                                </span>
                            </div>

                            <h1 className="text-4xl font-black text-slate-900 mb-6">{ticket.category}</h1>
                            <p className="text-slate-600 text-lg leading-relaxed mb-10">{ticket.description}</p>

                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Evidence & Attachments
                                    </h4>
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {ticket.attachments.map((img, idx) => (
                                            <a key={idx} href={img.imageUrl} target="_blank" rel="noreferrer" className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-slate-50 flex-shrink-0 hover:shadow-xl transition-shadow">
                                                <img src={img.imageUrl} alt="evidence" className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
                            <CommentSection 
                                ticketId={ticket.id} 
                                comments={ticket.comments} 
                                onCommentUpdate={fetchTicket} 
                            />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-200">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-indigo-400" />
                                Case Details
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-indigo-300 tracking-widest uppercase opacity-60">Reporter</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xs font-bold">
                                            {ticket.reporter?.name?.charAt(0)}
                                        </div>
                                        <p className="font-bold">{ticket.reporter?.name}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-indigo-300 tracking-widest uppercase opacity-60">Staff Assigned</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xs font-bold">
                                            {ticket.technician ? ticket.technician.name.charAt(0) : '?'}
                                        </div>
                                        <p className="font-bold">{ticket.technician ? ticket.technician.name : 'Unassigned'}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-indigo-300 tracking-widest uppercase opacity-60">Priority</p>
                                    <p className="font-bold text-amber-400">{ticket.priority}</p>
                                </div>
                            </div>
                        </div>

                        {/* Workflow Actions */}
                        {(isAdmin || isTechnician) && (
                            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
                                <h3 className="text-lg font-black text-slate-800">Workflow Actions</h3>
                                
                                <textarea
                                    value={statusNotes}
                                    onChange={(e) => setStatusNotes(e.target.value)}
                                    placeholder="Add notes for rejection or resolution..."
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-600/30 outline-none transition-all text-sm font-semibold"
                                    rows="3"
                                ></textarea>

                                <div className="grid grid-cols-1 gap-3">
                                    {ticket.status === 'OPEN' && (
                                        <>
                                            <button onClick={() => handleStatusUpdate('IN_PROGRESS')} className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                                                <PlayCircle className="w-5 h-5" /> Start Work
                                            </button>
                                            {isAdmin && (
                                                <button onClick={() => handleStatusUpdate('REJECTED')} className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold hover:bg-rose-100 transition-all">
                                                    <XCircle className="w-5 h-5" /> Reject Ticket
                                                </button>
                                            )}
                                        </>
                                    )}
                                    
                                    {ticket.status === 'IN_PROGRESS' && (
                                        <button onClick={() => handleStatusUpdate('RESOLVED')} className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all">
                                            <CheckCircle2 className="w-5 h-5" /> Mark as Resolved
                                        </button>
                                    )}

                                    {(ticket.status === 'RESOLVED' && (isAdmin || isOwner)) && (
                                        <button onClick={() => handleStatusUpdate('CLOSED')} className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
                                            <DoneAll className="w-5 h-5" /> Close Ticket
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
