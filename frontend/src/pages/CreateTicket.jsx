import React, { useState } from 'react';
import api from '../services/api';
import { FaTicketAlt, FaUpload, FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const CreateTicket = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('NORMAL');
    const [contact, setContact] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert("You can only upload 3 images!");
            e.target.value = null;
            return;
        }
        setImages(files);
        
        // Generate previews
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = "Title is required";
        if (!category) newErrors.category = "Category is required";
        if (!priority) newErrors.priority = "Priority is required";
        if (!contact.trim()) newErrors.contact = "Contact details are required";
        if (!description.trim()) newErrors.description = "Detailed description is required";
        if (description.length < 10) newErrors.description = "Description must be at least 10 characters";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            alert("Please fill in all required fields correctly.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('priority', priority);
        formData.append('contactDetails', contact);
        formData.append('description', description);
        formData.append('createdBy', user?.name || user?.email || 'Anonymous');
        images.forEach((img) => formData.append('images', img));

        try {
            await api.post('/api/tickets', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert("Incident Report Submitted Successfully!");
            setTitle(''); 
            setCategory('');
            setPriority('NORMAL');
            setContact('');
            setDescription(''); 
            setImages([]);
            setPreviews([]);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
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

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.button 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center text-muted-foreground hover:text-blue-500 transition mb-6 font-medium"
                >
                    <FaChevronLeft className="mr-2" /> Back to Dashboard
                </motion.button>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-glow rounded-3xl overflow-hidden border border-border"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/10">
                                <FaTicketAlt className="text-2xl" />
                            </div>
                            <h2 className="text-3xl font-bold font-space tracking-tight">Report Incident</h2>
                        </div>
                        <p className="text-blue-100 opacity-90">Help us improve the campus by reporting facility issues.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Issue Title</label>
                            <input 
                                type="text" 
                                placeholder="e.g., Broken projector in Hall B" 
                                className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground ${
                                    errors.title 
                                        ? 'border-red-500 bg-red-500/5' 
                                        : 'border-border focus:border-blue-500 focus:bg-white/10'
                                }`}
                                value={title} 
                                onChange={(e) => { setTitle(e.target.value); setErrors(p => ({...p, title: ''})); }} 
                                required 
                            />
                            {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 tracking-widest">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Category</label>
                                <select 
                                    className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all text-foreground font-medium appearance-none ${
                                        errors.category 
                                            ? 'border-red-500 bg-red-500/5' 
                                            : 'border-border focus:border-blue-500 focus:bg-white/10'
                                    }`}
                                    value={category}
                                    onChange={(e) => { setCategory(e.target.value); setErrors(p => ({...p, category: ''})); }}
                                    required
                                >
                                    <option value="">Select Category...</option>
                                    <option value="IT">IT & Systems</option>
                                    <option value="ELECTRIC">Electrical</option>
                                    <option value="PLUMBING">Plumbing</option>
                                    <option value="FURNITURE">Furniture</option>
                                    <option value="OTHER">Other</option>
                                </select>
                                {errors.category && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 tracking-widest">{errors.category}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Priority</label>
                                <select 
                                    className="w-full p-4 bg-white/5 border border-border rounded-2xl focus:border-blue-500 focus:bg-white/10 outline-none transition-all text-foreground font-medium appearance-none"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    required
                                >
                                    <option value="LOW">Low</option>
                                    <option value="NORMAL">Normal</option>
                                    <option value="HIGH">High</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Preferred Contact Details</label>
                            <input 
                                type="text" 
                                placeholder="Phone number or WhatsApp" 
                                className={`w-full p-4 bg-white/5 border rounded-2xl outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground ${
                                    errors.contact 
                                        ? 'border-red-500 bg-red-500/5' 
                                        : 'border-border focus:border-blue-500 focus:bg-white/10'
                                }`}
                                value={contact} 
                                onChange={(e) => { setContact(e.target.value); setErrors(p => ({...p, contact: ''})); }} 
                                required 
                            />
                            {errors.contact && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 tracking-widest">{errors.contact}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Detailed Description</label>
                            <textarea 
                                placeholder="Please provide specific details about the problem..." 
                                className={`w-full p-4 bg-white/5 border rounded-2xl h-40 outline-none transition-all text-foreground font-medium placeholder:text-muted-foreground resize-none ${
                                    errors.description 
                                        ? 'border-red-500 bg-red-500/5' 
                                        : 'border-border focus:border-blue-500 focus:bg-white/10'
                                }`}
                                value={description} 
                                onChange={(e) => { setDescription(e.target.value); setErrors(p => ({...p, description: ''})); }} 
                                required 
                            />
                            {errors.description && <p className="text-red-500 text-[10px] font-bold uppercase mt-2 tracking-widest">{errors.description}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Evidence Photos (Max 3)</label>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                {previews.map((src, index) => (
                                    <div key={index} className="aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/20 relative group">
                                        <img src={src} alt="preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                                            Photo {index + 1}
                                        </div>
                                    </div>
                                ))}
                                {previews.length < 3 && (
                                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-white/5 cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
                                        <FaUpload className="text-2xl text-muted-foreground group-hover:text-blue-500 transition-colors mb-2" />
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-blue-500">Upload</span>
                                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`w-full py-4 rounded-2xl font-bold text-lg tracking-wide transition-all shadow-lg border
                                ${loading 
                                    ? "bg-white/5 text-muted-foreground cursor-not-allowed border-border" 
                                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-1 border-blue-500/20"
                                }`}
                        >
                            {loading ? "PROCESSING..." : "SUBMIT REPORT"}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateTicket;