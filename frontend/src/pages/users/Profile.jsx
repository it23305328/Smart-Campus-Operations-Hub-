import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Camera, Save, Globe } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/users/profile');
            setProfile(response.data);
            setPhoneNumber(response.data.phoneNumber || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setUpdating(true);
            const response = await api.put('/api/users/profile', { phoneNumber });
            setProfile(response.data);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update phone number.');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-glow rounded-3xl overflow-hidden border border-border"
                >
                    <div className="h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative">
                        <div className="absolute -bottom-16 left-12">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-background p-2 shadow-xl shadow-blue-500/20 rotate-3 border border-border">
                                <div className="w-full h-full rounded-[2rem] bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-4xl -rotate-3 overflow-hidden border border-blue-500/20">
                                    {authUser?.picture ? (
                                        <img src={authUser.picture} alt="profile" className="w-full h-full object-cover" />
                                    ) : (
                                        authUser?.name?.charAt(0)
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 px-12 pb-16">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl font-black font-space text-foreground tracking-tight">{profile?.name}</h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-black tracking-widest uppercase border border-blue-500/20">
                                        <Shield className="w-3 h-3" />
                                        {profile?.role}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${
                                        profile?.status === 'ACTIVE' 
                                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                        {profile?.status}
                                    </span>
                                </div>
                            </div>
                            
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 border border-blue-500/20"
                                >
                                    Edit Details
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-4 bg-white/10 text-foreground rounded-2xl font-bold text-sm transition-all border border-border hover:bg-white/20"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleUpdate}
                                        disabled={updating}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-700 flex items-center gap-2 border border-blue-500/20"
                                    >
                                        <Save className="w-4 h-4" />
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase ml-1">Email Address</label>
                                    <div className="flex items-center gap-4 p-5 bg-white/5 border border-border rounded-2xl">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                        <span className="font-bold text-foreground">{profile?.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase ml-1">Contact Phone</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
                                            <input 
                                                type="text" 
                                                value={phoneNumber} 
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full pl-14 pr-5 py-5 bg-white/5 border-2 border-blue-500/20 rounded-2xl focus:border-blue-500 outline-none transition-all font-bold text-foreground placeholder:text-muted-foreground"
                                                placeholder="Enter phone number..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-5 bg-white/5 border border-border rounded-2xl">
                                            <Phone className="w-5 h-5 text-blue-400" />
                                            <span className="font-bold text-foreground">{profile?.phoneNumber || 'No phone set'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase ml-1">Security Audit</label>
                                    <div className="p-8 bg-foreground/5 text-foreground rounded-3xl space-y-6 border border-border">
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-border">
                                            <span className="text-xs font-bold text-muted-foreground">Last Login IP</span>
                                            <span className="text-xs font-bold text-blue-400">{profile?.ipAddress || 'Not recorded'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-border">
                                            <span className="text-xs font-bold text-muted-foreground">Last Activity</span>
                                            <span className="text-xs font-bold text-blue-400">
                                                {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                            <Globe className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Active Session Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;