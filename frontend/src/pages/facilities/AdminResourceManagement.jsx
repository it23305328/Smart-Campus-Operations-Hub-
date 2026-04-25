// AdminResourceManagement.jsx
import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import { Plus, Edit2, Trash2, X, Eye, Clock } from 'lucide-react';
import ResourceDetailsModal from './ResourceDetailsModal';

const AdminResourceManagement = () => {
    const [resources, setResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        type: 'LECTURE_HALL',
        capacity: '',
        location: '',
        status: 'ACTIVE',
        availableFrom: '08:00',
        availableTo: '20:00',
        availabilityWindows: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources();
            console.log('Fetched resources:', data);
            setResources(data || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            
            // Auto-set meeting room defaults
            if (name === 'type' && value === 'MEETING_ROOM') {
                newData.availableFrom = '09:00';
                newData.availableTo = '19:00';
            } else if (name === 'type' && value !== 'MEETING_ROOM') {
                // Keep existing times or set defaults
                if (!prev.availableFrom || prev.availableFrom === '09:00') {
                    newData.availableFrom = '08:00';
                }
                if (!prev.availableTo || prev.availableTo === '19:00') {
                    newData.availableTo = '20:00';
                }
            }
            
            return newData;
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'LECTURE_HALL',
            capacity: '',
            location: '',
            status: 'ACTIVE',
            availableFrom: '08:00',
            availableTo: '20:00',
            availabilityWindows: ''
        });
        setEditingResource(null);
    };

    const formatTimeForDisplay = (timeStr) => {
        if (!timeStr) return '-';
        try {
            // Handle both "08:00:00" and "08:00" formats
            const parts = timeStr.split(':');
            if (parts.length >= 2) {
                const hours = parseInt(parts[0]);
                const minutes = parts[1];
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                return `${displayHours}:${minutes} ${ampm}`;
            }
            return timeStr;
        } catch (e) {
            return timeStr || '-';
        }
    };

    const formatTimeForInput = (timeStr) => {
        if (!timeStr) return '08:00';
        try {
            // Extract HH:MM from various formats
            const parts = timeStr.split(':');
            if (parts.length >= 2) {
                return `${parts[0].padStart(2, '0')}:${parts[1]}`;
            }
            return '08:00';
        } catch (e) {
            return '08:00';
        }
    };

    const openModal = (resource = null) => {
        if (resource) {
            setEditingResource(resource);
            console.log('Editing resource:', resource);
            setFormData({
                name: resource.name || '',
                type: resource.type || 'LECTURE_HALL',
                capacity: resource.capacity || '',
                location: resource.location || '',
                status: resource.status || 'ACTIVE',
                availableFrom: formatTimeForInput(resource.availableFrom),
                availableTo: formatTimeForInput(resource.availableTo),
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
            const submitData = {
                name: formData.name,
                type: formData.type,
                capacity: formData.capacity ? parseInt(formData.capacity) : null,
                location: formData.location,
                status: formData.status,
                availableFrom: formData.availableFrom + ':00', // Append seconds
                availableTo: formData.availableTo + ':00', // Append seconds
                availabilityWindows: formData.availabilityWindows
            };
            
            console.log('Submitting resource data:', submitData);
            
            if (editingResource) {
                await resourceService.updateResource(editingResource.id, submitData);
            } else {
                await resourceService.addResource(submitData);
            }
            fetchResources();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving resource:', error);
            alert('Failed to save resource. Please try again.');
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

    const handleViewDetails = (resource) => {
        setSelectedResource(resource);
        setIsDetailsModalOpen(true);
    };

    const isMeetingRoom = formData.type === 'MEETING_ROOM';
    const types = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

    // Generate meeting room slots display
    const meetingRoomSlots = [
        { number: 1, time: '9:00 AM - 11:00 AM' },
        { number: 2, time: '11:00 AM - 1:00 PM' },
        { number: 3, time: '1:00 PM - 3:00 PM' },
        { number: 4, time: '3:00 PM - 5:00 PM' },
        { number: 5, time: '5:00 PM - 7:00 PM' }
    ];

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
                                    <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Availability</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/80">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                        </td>
                                    </tr>
                                ) : resources.length > 0 ? (
                                    resources.map((resource) => {
                                        console.log('Resource data:', resource);
                                        const isMeetingRoomType = resource.type === 'MEETING_ROOM';
                                        const fromTime = formatTimeForDisplay(resource.availableFrom);
                                        const toTime = formatTimeForDisplay(resource.availableTo);
                                        
                                        return (
                                            <tr key={resource.id} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                                            {resource.name?.charAt(0) || 'R'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 text-lg">{resource.name}</div>
                                                            <div className="text-slate-400 font-semibold text-xs tracking-wider uppercase">
                                                                {resource.type?.replace('_', ' ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-slate-600 font-medium">
                                                            <span className="text-slate-400 mr-2 text-sm font-bold opacity-50">LOCATION:</span>
                                                            {resource.location || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center text-slate-600 font-medium">
                                                            <span className="text-slate-400 mr-2 text-sm font-bold opacity-50">CAPACITY:</span>
                                                            {resource.capacity || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-start gap-2">
                                                        <Clock className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="font-semibold text-slate-800 text-sm">
                                                                {fromTime} - {toTime}
                                                            </div>
                                                            {isMeetingRoomType && (
                                                                <div className="mt-2 space-y-1">
                                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                                        5 Slots (2 Hours Each)
                                                                    </span>
                                                                    <div className="text-xs text-slate-500">
                                                                        {meetingRoomSlots.map(s => s.time).join(' | ')}
                                                                    </div>
                                                                </div>
                                                            )}
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
                                                            onClick={() => handleViewDetails(resource)}
                                                            className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(resource)}
                                                            className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all active:scale-90"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(resource.id)}
                                                            className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <p className="text-xl font-semibold text-slate-400">No resources found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Resource Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-3xl overflow-hidden border border-slate-100 transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
                        <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
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
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Resource Name *</label>
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
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Type *</label>
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
                                
                                {/* Time Configuration */}
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">
                                        Available From *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="time"
                                            name="availableFrom"
                                            value={formData.availableFrom}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold"
                                        />
                                    </div>
                                    {!isMeetingRoom && (
                                        <p className="text-xs text-slate-400 ml-1">Default: 8:00 AM</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">
                                        Available To *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="time"
                                            name="availableTo"
                                            value={formData.availableTo}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold"
                                        />
                                    </div>
                                    {!isMeetingRoom && (
                                        <p className="text-xs text-slate-400 ml-1">Default: 8:00 PM</p>
                                    )}
                                </div>
                                
                                {/* Meeting Room Info */}
                                {isMeetingRoom && (
                                    <div className="md:col-span-2 bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                                <Clock className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-indigo-900">Meeting Room Schedule</h4>
                                                <p className="text-xs text-indigo-600">Fixed 2-hour slots from 9:00 AM to 7:00 PM</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                            {meetingRoomSlots.map((slot) => (
                                                <div key={slot.number} className="bg-white rounded-xl p-3 text-center border border-indigo-100">
                                                    <p className="text-xs font-bold text-indigo-700">Slot {slot.number}</p>
                                                    <p className="text-xs text-slate-600 mt-1">{slot.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-black text-slate-900 ml-1 tracking-widest uppercase opacity-40">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-0 focus:border-indigo-600/50 outline-none transition-all font-semibold"
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

            {/* Resource Details Modal */}
            <ResourceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                resource={selectedResource}
                userRole="ADMIN"
            />
        </div>
    );
};

export default AdminResourceManagement;