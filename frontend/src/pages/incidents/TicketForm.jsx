import React, { useState } from 'react';
import { Camera, Send, X, AlertTriangle, Paperclip } from 'lucide-react';
import ticketService from '../../services/ticketService';

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
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden transform transition-all hover:shadow-indigo-100/50">
            <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-amber-300" />
                        Report an Incident
                    </h2>
                    <p className="text-indigo-100 mt-1 font-medium opacity-80">Our technical team will review it immediately</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-900 tracking-widest uppercase opacity-40 ml-1">Issue Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-semibold"
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
                        <label className="text-sm font-black text-slate-900 tracking-widest uppercase opacity-40 ml-1">Priority Level</label>
                        <div className="flex gap-2">
                            {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${
                                        formData.priority === p 
                                        ? 'bg-slate-900 text-white shadow-lg' 
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 tracking-widest uppercase opacity-40 ml-1">Problem Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows="4"
                        placeholder="Describe what happened, where it is, and any other relevant details..."
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-semibold resize-none"
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-black text-slate-900 tracking-widest uppercase opacity-40 ml-1">Preferred Contact Method</label>
                    <input
                        type="text"
                        name="contactDetails"
                        value={formData.contactDetails}
                        onChange={handleInputChange}
                        required
                        placeholder="Phone number or Internal Extension"
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-semibold"
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-black text-slate-900 tracking-widest uppercase opacity-40 ml-1">Attachments (Max 3 Images)</label>
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-grow">
                            <Paperclip className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                value={currentImageUrl}
                                onChange={(e) => setCurrentImageUrl(e.target.value)}
                                placeholder="Paste image URL here..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all font-semibold"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addImageUrl}
                            className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-xl"
                        >
                            <Camera className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex gap-4 mt-4">
                        {formData.imageUrls.map((url, index) => (
                            <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-100 group">
                                <img src={url} alt="attachment" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImageUrl(index)}
                                    className="absolute top-1 right-1 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    <Send className={`w-6 h-6 ${isSubmitting ? 'animate-pulse' : ''}`} />
                    {isSubmitting ? 'Submitting Report...' : 'Submit Incident Report'}
                </button>
            </form>
        </div>
    );
};

export default TicketForm;
