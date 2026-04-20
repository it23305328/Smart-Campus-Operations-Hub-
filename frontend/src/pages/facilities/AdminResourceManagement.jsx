import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import { Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';

const AdminResourceManagement = () => {
    const [resources, setResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        availabilityWindows: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources();
            setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'LECTURE_HALL',
            capacity: '',
            location: '',
            status: 'ACTIVE',
            availabilityWindows: ''
        });
        setEditingResource(null);
    };

    const openModal = (resource = null) => {
        if (resource) {
            setEditingResource(resource);
            setFormData({
                name: resource.name,
                type: resource.type,
                capacity: resource.capacity || '',
                location: resource.location || '',
                status: resource.status,
                availabilityWindows: resource.availabilityWindows || ''
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingResource) {
                await resourceService.updateResource(editingResource.id, formData);
            } else {
                await resourceService.addResource(formData);
            }
            fetchResources();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving resource:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this resource?')) {
            try {
                await resourceService.deleteResource(id);
                fetchResources();
            } catch (error) {
                console.error('Error deleting resource:', error);
            }
        }
    };

    const types = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Resource Management</h1>
                        <p className="text-slate-500 mt-1 font-medium">Manage campus assets and update availability</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Resource
                    </button>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Resource</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Details</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/80">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-20 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        </td>
                                    </tr>
                                ) : resources.map((resource) => (
                                    <tr key={resource.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                    {resource.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-lg">{resource.name}</div>
                                                    <div className="text-slate-400 font-semibold text-xs tracking-wider uppercase">{resource.type.replace('_', ' ')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center text-slate-600 font-medium">
                                                    <span className="text-slate-400 mr-2 text-sm font-bold opacity-50">LOCATION:</span>
                                                    {resource.location}
                                                </div>
                                                <div className="flex items-center text-slate-600 font-medium">
                                                    <span className="text-slate-400 mr-2 text-sm font-bold opacity-50">CAPACITY:</span>
                                                    {resource.capacity}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                                                resource.status === 'ACTIVE' 
                                                ? 'bg-emerald-100 text-emerald-700' 
                                                : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full mr-2 ${resource.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {resource.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(resource)}
                                                    className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(resource.id)}
                                                    className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-3xl overflow-hidden border border-slate-100 transform transition-all scale-100 animate-in fade-in zoom-in duration-300">
                        <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                {editingResource ? 'Update Resource' : 'Add New Resource'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors">
                                <X className="w-8 h-8" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Resource Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold"
                                        placeholder="e.g. Main Auditorium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold"
                                    >
                                        {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Capacity</label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold"
                                        placeholder="e.g. Ground Floor"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold transition-colors"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-slate-50">
                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg shadow-2xl active:scale-[0.98] transition-all"
                                >
                                    {editingResource ? 'Update Facility' : 'Save New Facility'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminResourceManagement;
