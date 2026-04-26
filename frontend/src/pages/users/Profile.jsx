import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Camera, Save, Globe } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

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
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
                    <div className="h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 relative">
                        <div className="absolute -bottom-16 left-12">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-xl shadow-indigo-100 rotate-3">
                                <div className="w-full h-full rounded-[2rem] bg-slate-800 flex items-center justify-center text-white font-black text-4xl -rotate-3 overflow-hidden">
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
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile?.name}</h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black tracking-widest uppercase">
                                        <Shield className="w-3 h-3" />
                                        {profile?.role}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase ${profile?.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {profile?.status}
                                    </span>
                                </div>
                            </div>
                            
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:scale-95"
                                >
                                    Edit Details
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleUpdate}
                                        disabled={updating}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 transition-all hover:bg-indigo-700 flex items-center gap-2"
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
                                    <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Email Address</label>
                                    <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <Mail className="w-5 h-5 text-indigo-400" />
                                        <span className="font-bold text-slate-600">{profile?.email}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Contact Phone</label>
                                    {isEditing ? (
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
                                            <input 
                                                type="text" 
                                                value={phoneNumber} 
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full pl-14 pr-5 py-5 bg-white border-2 border-indigo-100 rounded-2xl focus:border-indigo-600 outline-none transition-all font-bold"
                                                placeholder="Enter phone number..."
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                            <Phone className="w-5 h-5 text-indigo-400" />
                                            <span className="font-bold text-slate-600">{profile?.phoneNumber || 'No phone set'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase ml-1">Security Audit</label>
                                    <div className="p-8 bg-slate-900 text-white rounded-3xl space-y-6">
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                            <span className="text-xs font-bold text-slate-400">Last Login IP</span>
                                            <span className="text-xs font-black text-indigo-300">{profile?.ipAddress || 'Not recorded'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                                            <span className="text-xs font-bold text-slate-400">Last Activity</span>
                                            <span className="text-xs font-black text-indigo-300">
                                                {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 p-4 rounded-xl">
                                            <Globe className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Active Session Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
