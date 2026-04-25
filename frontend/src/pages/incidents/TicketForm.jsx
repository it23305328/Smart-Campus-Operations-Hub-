import React, { useState } from 'react';
import { Camera, Send, X, AlertTriangle, Paperclip } from 'lucide-react';
import ticketService from '../../services/ticketService';
import { motion } from 'framer-motion';

const TicketForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        priority: 'MEDIUM',
        contactDetails: '',
        imageUrls: []
    });
    const [currentImageUrl, setCurrentImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addImageUrl = () => {
        if (currentImageUrl && formData.imageUrls.length < 3) {
            setFormData({
                ...formData,
                imageUrls: [...formData.imageUrls, currentImageUrl]
            });
            setCurrentImageUrl('');
        }
    };

    const removeImageUrl = (index) => {
        const newImages = formData.imageUrls.filter((_, i) => i !== index);
        setFormData({ ...formData, imageUrls: newImages });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await ticketService.createTicket(formData);
            setFormData({
                category: '',
                description: '',
                priority: 'MEDIUM',
                contactDetails: '',
                imageUrls: []
            });
            if (onSuccess) onSuccess();
            alert('Ticket reported successfully!');
        } catch (error) {
            console.error('Error creating ticket:', error);
            alert('Failed to report issue. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-glow rounded-3xl border border-border overflow-hidden"
        >
            <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black font-space tracking-tight flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-amber-300" />
                        Report an Incident
                    </h2>
                    <p className="text-blue-100 mt-1 font-medium opacity-80">Our technical team will review it immediately</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-muted-foreground tracking-widest uppercase ml-1">Issue Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-white/5 border border-border rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-foreground"
                        >
                            <option value="">Select Category</option>
                            <option value="ELECTRICAL">Electrical/Lighting</option>
                            <option value="PLUMBING">Plumbing/Water</option>
                            <option value="IT_EQUIPMENT">IT Equipment/WiFi</option>
                            <option value="FURNITURE">Furniture/Assets</option>
                            <option value="CLEANING">Cleaning/Janitorial</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black text-muted-foreground tracking-widest uppercase ml-1">Priority Level</label>
                        <div className="flex gap-2">
                            {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all border ${
                                        formData.priority === p 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 border-blue-500/20' 
                                        : 'bg-white/5 text-muted-foreground hover:bg-white/10 border-border'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground tracking-widest uppercase ml-1">Problem Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        placeholder="Describe what happened, where it is, and any other relevant details..."
                        className="w-full px-6 py-4 bg-white/5 border border-border rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold resize-none text-foreground placeholder:text-muted-foreground"
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground tracking-widest uppercase ml-1">Preferred Contact Method</label>
                    <input
                        type="text"
                        name="contactDetails"
                        value={formData.contactDetails}
                        onChange={handleInputChange}
                        required
                        placeholder="Phone number or Internal Extension"
                        className="w-full px-6 py-4 bg-white/5 border border-border rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-black text-muted-foreground tracking-widest uppercase ml-1">Attachments (Max 3 Images)</label>
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-grow">
                            <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <input
                                type="text"
                                value={currentImageUrl}
                                onChange={(e) => setCurrentImageUrl(e.target.value)}
                                placeholder="Paste image URL here..."
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-border rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addImageUrl}
                            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/20 border border-blue-500/20"
                        >
                            <Camera className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex gap-4 mt-4">
                        {formData.imageUrls.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500/20 group">
                                <img src={url} alt="attachment" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImageUrl(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-bold text-xl shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-blue-500/20"
                >
                    <Send className={`w-6 h-6 ${isSubmitting ? 'animate-pulse' : ''}`} />
                    {isSubmitting ? 'Submitting Report...' : 'Submit Incident Report'}
                </button>
            </form>
        </motion.div>
    );
};

export default TicketForm;