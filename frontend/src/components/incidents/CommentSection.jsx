import React, { useState } from 'react';
import { MessageSquare, Trash2, Send, CornerDownRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ticketService from '../../services/ticketService';

const CommentSection = ({ ticketId, comments, onCommentUpdate }) => {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            setSubmitting(true);
            await ticketService.addComment(ticketId, commentText);
            setCommentText('');
            if (onCommentUpdate) onCommentUpdate();
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (window.confirm('Delete this comment?')) {
            try {
                await ticketService.deleteComment(commentId);
                if (onCommentUpdate) onCommentUpdate();
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-indigo-500" />
                Discussion & Updates
            </h3>

            <div className="space-y-6">
                {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold flex-shrink-0">
                                {comment.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-grow">
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none relative border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-bold text-slate-900">{comment.user?.name}</span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">{comment.commentText}</p>
                                    
                                    {(user?.id === comment.user?.id || user?.role === 'ADMIN') && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="absolute -right-2 -top-2 bg-white text-rose-500 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 border border-slate-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-sm">No comments yet. Start the conversation!</p>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type your update or question..."
                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-3xl focus:border-indigo-600/50 outline-none transition-all font-semibold resize-none pr-16"
                    rows="2"
                ></textarea>
                <button
                    disabled={submitting || !commentText.trim()}
                    className="absolute right-3 bottom-3 bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all disabled:opacity-30 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-200"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default CommentSection;
