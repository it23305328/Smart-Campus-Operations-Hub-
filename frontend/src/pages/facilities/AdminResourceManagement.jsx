// AdminResourceManagement.jsx
import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import { Plus, Edit2, Trash2, X, Eye, Clock, Search, Filter, AlertCircle } from 'lucide-react';
import ResourceDetailsModal from './ResourceDetailsModal';
import { motion } from 'framer-motion';

const AdminResourceManagement = () => {
    const [resources, setResources] = useState([]);
    const [filteredResources, setFilteredResources] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showFilters, setShowFilters] = useState(false);
    const [errors, setErrors] = useState({});
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

    useEffect(() => {
        filterResources();
    }, [resources, searchTerm, filterType, filterStatus]);

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

    const filterResources = () => {
        let filtered = [...resources];

        // Apply search filter
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(resource => 
                resource.name?.toLowerCase().includes(searchLower) ||
                resource.location?.toLowerCase().includes(searchLower) ||
                resource.type?.toLowerCase().includes(searchLower)
            );
        }

        // Apply type filter
        if (filterType !== 'ALL') {
            filtered = filtered.filter(resource => resource.type === filterType);
        }

        // Apply status filter
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(resource => resource.status === filterStatus);
        }

        setFilteredResources(filtered);
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        // Validate Resource Name - must contain only letters and spaces (no numbers or special characters)
        if (!formData.name.trim()) {
            newErrors.name = 'Resource name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
            newErrors.name = 'Resource name must contain only letters and spaces. Numbers and special characters are not allowed.';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Resource name must be at least 2 characters long';
        } else if (formData.name.trim().length > 100) {
            newErrors.name = 'Resource name must not exceed 100 characters';
        }

        // Validate Location - must contain at least one letter and only allowed characters
        if (!formData.location.trim()) {
            newErrors.location = 'Location is required';
        } else {
            const trimmedLocation = formData.location.trim();
            
            // Check if location contains only numbers
            if (/^\d+$/.test(trimmedLocation)) {
                newErrors.location = 'Location cannot consist of only numbers. Please include a descriptive location name.';
            }
            // Check if location contains only special characters
            else if (/^[^a-zA-Z0-9]+$/.test(trimmedLocation)) {
                newErrors.location = 'Location cannot consist of only special characters. Please include a descriptive location name.';
            }
            // Check if location contains at least one letter
            else if (!/[a-zA-Z]/.test(trimmedLocation)) {
                newErrors.location = 'Location must contain at least one letter.';
            }
            // Check allowed characters
            else if (!/^[a-zA-Z0-9\s,.\-/'()]+$/.test(trimmedLocation)) {
                newErrors.location = 'Location can only contain letters, numbers, spaces, commas, periods, hyphens, slashes, apostrophes, and parentheses.';
            }
            // Check minimum length
            else if (trimmedLocation.length < 2) {
                newErrors.location = 'Location must be at least 2 characters long';
            }
            // Check maximum length
            else if (trimmedLocation.length > 200) {
                newErrors.location = 'Location must not exceed 200 characters';
            }
        }

        // Validate Capacity based on resource type
        if (formData.capacity) {
            const capacityNum = parseInt(formData.capacity);
            
            if (isNaN(capacityNum) || capacityNum < 1) {
                newErrors.capacity = 'Capacity must be a positive number';
            } else if (formData.type === 'LECTURE_HALL' && capacityNum > 120) {
                newErrors.capacity = 'Lecture Hall capacity must not exceed 120';
            } else if (formData.type === 'MEETING_ROOM' && capacityNum > 50) {
                newErrors.capacity = 'Meeting Room capacity must not exceed 50';
            } else if (formData.type === 'LAB' && capacityNum > 80) {
                newErrors.capacity = 'Lab capacity must not exceed 80';
            } else if (capacityNum > 1000) {
                newErrors.capacity = 'Capacity must not exceed 1000';
            }
        }

        // Validate Available Time
        if (formData.availableFrom && formData.availableTo) {
            if (formData.availableFrom >= formData.availableTo) {
                newErrors.availableTo = 'End time must be after start time';
            }
        }

        // Validate Meeting Room specific rules
        if (formData.type === 'MEETING_ROOM') {
            if (formData.availableFrom < '09:00') {
                newErrors.availableFrom = 'Meeting rooms cannot be available before 9:00 AM';
            }
            if (formData.availableTo > '19:00') {
                newErrors.availableTo = 'Meeting rooms cannot be available after 7:00 PM';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

        // Clear error for the changed field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
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
        setErrors({});
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('ALL');
        setFilterStatus('ALL');
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
        setErrors({});
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
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }

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
    const statuses = ['ACTIVE', 'OUT_OF_SERVICE'];

    // Generate meeting room slots display
    const meetingRoomSlots = [
        { number: 1, time: '9:00 AM - 11:00 AM' },
        { number: 2, time: '11:00 AM - 1:00 PM' },
        { number: 3, time: '1:00 PM - 3:00 PM' },
        { number: 4, time: '3:00 PM - 5:00 PM' },
        { number: 5, time: '5:00 PM - 7:00 PM' }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const hasActiveFilters = searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL';

    // Get capacity placeholder based on resource type
    const getCapacityPlaceholder = () => {
        switch(formData.type) {
            case 'LECTURE_HALL':
                return 'Max 120';
            case 'MEETING_ROOM':
                return 'Max 50';
            case 'LAB':
                return 'Max 80';
            default:
                return 'Enter capacity';
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
                >
                    <div>
                        <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight">
                            <span className="text-gradient">Resource Management</span>
                        </h1>
                        <p className="text-muted-foreground mt-2 font-medium">Manage campus assets and update availability</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 border border-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Resource
                    </button>
                </motion.div>

                {/* Search and Filter Bar */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 glass-glow rounded-2xl border border-border p-6"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search resources by name, location, or type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-border rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border-2 ${
                                showFilters || hasActiveFilters
                                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                    : 'bg-white/5 border-border text-muted-foreground hover:border-blue-500/30'
                            }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            )}
                        </button>
                    </div>

                    {/* Expandable Filter Options */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-border"
                        >
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">Resource Type</label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border-2 border-border rounded-xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-foreground"
                                    >
                                        <option value="ALL">All Types</option>
                                        {types.map(type => (
                                            <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">Status</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border-2 border-border rounded-xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-foreground"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        {statuses.map(status => (
                                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Results Summary */}
                {!loading && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 text-muted-foreground font-medium"
                    >
                        Showing {filteredResources.length} of {resources.length} resources
                        {hasActiveFilters && ' (filtered)'}
                    </motion.div>
                )}

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-glow rounded-3xl border border-border overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 dark:bg-white/5">
                                    <th className="px-8 py-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">Resource</th>
                                    <th className="px-8 py-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">Details</th>
                                    <th className="px-8 py-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">Availability</th>
                                    <th className="px-8 py-6 text-sm font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                        </td>
                                    </tr>
                                ) : filteredResources.length > 0 ? (
                                    filteredResources.map((resource) => {
                                        console.log('Resource data:', resource);
                                        const isMeetingRoomType = resource.type === 'MEETING_ROOM';
                                        const fromTime = formatTimeForDisplay(resource.availableFrom);
                                        const toTime = formatTimeForDisplay(resource.availableTo);
                                        
                                        return (
                                            <motion.tr 
                                                variants={itemVariants}
                                                key={resource.id} 
                                                className="hover:bg-white/5 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold border border-blue-500/20">
                                                            {resource.name?.charAt(0) || 'R'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground text-lg group-hover:text-blue-400 transition-colors">{resource.name}</div>
                                                            <div className="text-muted-foreground font-semibold text-xs tracking-wider uppercase">
                                                                {resource.type?.replace('_', ' ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center text-muted-foreground font-medium">
                                                            <span className="text-muted-foreground mr-2 text-sm font-bold opacity-50">LOCATION:</span>
                                                            {resource.location || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center text-muted-foreground font-medium">
                                                            <span className="text-muted-foreground mr-2 text-sm font-bold opacity-50">CAPACITY:</span>
                                                            {resource.capacity || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-start gap-2">
                                                        <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <div className="font-semibold text-foreground text-sm">
                                                                {fromTime} - {toTime}
                                                            </div>
                                                            {isMeetingRoomType && (
                                                                <div className="mt-2 space-y-1">
                                                                    <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                                                        5 Slots (2 Hours Each)
                                                                    </span>
                                                                    <div className="text-xs text-muted-foreground">
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
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                    }`}>
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${resource.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                        {resource.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleViewDetails(resource)}
                                                            className="p-3 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-blue-500/20"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(resource)}
                                                            className="p-3 text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-blue-500/20"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(resource.id)}
                                                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-500/20"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <Search className="w-12 h-12 text-muted-foreground opacity-50" />
                                                <p className="text-xl font-semibold text-muted-foreground">No resources found</p>
                                                {hasActiveFilters && (
                                                    <button
                                                        onClick={clearFilters}
                                                        className="text-blue-500 hover:text-blue-400 font-semibold transition-colors"
                                                    >
                                                        Clear filters and try again
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* Add/Edit Resource Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-background rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-border transform transition-all scale-100 max-h-[90vh] overflow-y-auto glass">
                        <div className="px-10 py-8 bg-white/5 dark:bg-white/5 border-b border-border flex justify-between items-center sticky top-0 backdrop-blur-xl z-10">
                            <h2 className="text-2xl font-bold font-space text-foreground tracking-tight">
                                {editingResource ? 'Update Resource' : 'Add New Resource'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-full transition-colors hover:bg-white/10">
                                <X className="w-8 h-8" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">
                                        Resource Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-6 py-4 bg-white/5 border-2 rounded-2xl focus:ring-0 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground ${
                                            errors.name ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-blue-500'
                                        }`}
                                        placeholder="e.g. Main Auditorium (letters and spaces only)"
                                    />
                                    {errors.name && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-medium ml-1">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.name}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">Type *</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white/5 border-2 border-border rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-foreground"
                                    >
                                        {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">
                                        Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleInputChange}
                                        className={`w-full px-6 py-4 bg-white/5 border-2 rounded-2xl focus:ring-0 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground ${
                                            errors.capacity ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-blue-500'
                                        }`}
                                        placeholder={getCapacityPlaceholder()}
                                        min="1"
                                    />
                                    {formData.type === 'LECTURE_HALL' && !errors.capacity && (
                                        <p className="text-xs text-blue-500 ml-1">Maximum capacity for Lecture Hall: 120</p>
                                    )}
                                    {formData.type === 'MEETING_ROOM' && !errors.capacity && (
                                        <p className="text-xs text-blue-500 ml-1">Maximum capacity for Meeting Room: 50</p>
                                    )}
                                    {formData.type === 'LAB' && !errors.capacity && (
                                        <p className="text-xs text-blue-500 ml-1">Maximum capacity for Lab: 80</p>
                                    )}
                                    {errors.capacity && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-medium ml-1">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.capacity}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={`w-full px-6 py-4 bg-white/5 border-2 rounded-2xl focus:ring-0 outline-none transition-all font-semibold text-foreground placeholder:text-muted-foreground ${
                                            errors.location ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-blue-500'
                                        }`}
                                        placeholder="e.g. Ground Floor, Building A"
                                    />
                                    {errors.location && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-medium ml-1">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.location}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Time Configuration */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">
                                        Available From *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="time"
                                            name="availableFrom"
                                            value={formData.availableFrom}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full pl-12 pr-6 py-4 bg-white/5 border-2 rounded-2xl focus:ring-0 outline-none transition-all font-semibold text-foreground ${
                                                errors.availableFrom ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-blue-500'
                                            }`}
                                        />
                                    </div>
                                    {!isMeetingRoom && !errors.availableFrom && (
                                        <p className="text-xs text-muted-foreground ml-1">Default: 8:00 AM</p>
                                    )}
                                    {errors.availableFrom && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-medium ml-1">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.availableFrom}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">
                                        Available To *
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <input
                                            type="time"
                                            name="availableTo"
                                            value={formData.availableTo}
                                            onChange={handleInputChange}
                                            required
                                            className={`w-full pl-12 pr-6 py-4 bg-white/5 border-2 rounded-2xl focus:ring-0 outline-none transition-all font-semibold text-foreground ${
                                                errors.availableTo ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-blue-500'
                                            }`}
                                        />
                                    </div>
                                    {!isMeetingRoom && !errors.availableTo && (
                                        <p className="text-xs text-muted-foreground ml-1">Default: 8:00 PM</p>
                                    )}
                                    {errors.availableTo && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-medium ml-1">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            <span>{errors.availableTo}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Meeting Room Info */}
                                {isMeetingRoom && (
                                    <div className="md:col-span-2 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Clock className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground">Meeting Room Schedule</h4>
                                                <p className="text-xs text-muted-foreground">Fixed 2-hour slots from 9:00 AM to 7:00 PM</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                                            {meetingRoomSlots.map((slot) => (
                                                <div key={slot.number} className="bg-white/5 rounded-xl p-3 text-center border border-border">
                                                    <p className="text-xs font-bold text-blue-500">Slot {slot.number}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{slot.time}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground ml-1 tracking-widest uppercase">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white/5 border-2 border-border rounded-2xl focus:ring-0 focus:border-blue-500 outline-none transition-all font-semibold text-foreground"
                                    >
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Display all validation errors at the top of submit button if any */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>Please fix the following errors:</span>
                                    </div>
                                    <ul className="list-disc list-inside space-y-1">
                                        {Object.values(errors).map((error, index) => (
                                            <li key={index} className="text-red-500 text-sm ml-6">{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="pt-8 border-t border-border">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-bold text-lg shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all border border-blue-500/20"
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