// ResourceCatalogue.jsx
import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import bookingService from '../../services/bookingService';
import { Search, MapPin, Users, Info, CheckCircle, Eye, XCircle, Clock, X } from 'lucide-react';
import BookingModal from './BookingModal';
import ResourceDetailsModal from './ResourceDetailsModal';
import ConfirmationModal from './ConfirmationModal';
import { motion } from 'framer-motion';

const ResourceCatalogue = ({ userRole = 'USER' }) => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        type: 'ALL',
        location: '',
        minCapacity: ''
    });
    const [selectedResource, setSelectedResource] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [userBookings, setUserBookings] = useState({});
    const [rejectedMessages, setRejectedMessages] = useState({});
    const [approvedBookingsCount, setApprovedBookingsCount] = useState({});
    
    // Confirmation Modal States
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'warning',
        onConfirm: () => {}
    });

    const isAdmin = userRole === 'ADMIN';
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchResources();
        if (!isAdmin && currentUser.id) {
            fetchUserBookings();
        }
        fetchAllApprovedBookings();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources(filters);
            const processedData = data.map(resource => ({
                ...resource,
                hasSlots: resource.type === 'MEETING_ROOM' ? true : (resource.hasSlots || false)
            }));
            setResources(processedData);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserBookings = async () => {
        if (isAdmin || !currentUser.id) return;
        
        try {
            const studentId = String(currentUser.id);
            const bookings = await bookingService.getUserBookings(studentId);
            
            const bookingMap = {};
            bookings.forEach(booking => {
                const resourceId = booking.resourceId;
                if (resourceId) {
                    const existingBooking = bookingMap[resourceId];
                    if (!existingBooking || 
                        existingBooking.status === 'CANCELLED' || 
                        existingBooking.status === 'REJECTED') {
                        bookingMap[resourceId] = booking;
                    }
                    if (booking.status === 'PENDING' || booking.status === 'APPROVED') {
                        bookingMap[resourceId] = booking;
                    }
                }
            });
            setUserBookings(bookingMap);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
        }
    };

    const fetchAllApprovedBookings = async () => {
        try {
            const allBookings = await bookingService.getAllBookings();
            const approvedCounts = {};
            
            allBookings.forEach(booking => {
                if (booking.status === 'APPROVED') {
                    approvedCounts[booking.resourceId] = (approvedCounts[booking.resourceId] || 0) + 1;
                }
            });
            
            setApprovedBookingsCount(approvedCounts);
        } catch (error) {
            console.error('Error fetching approved bookings:', error);
        }
    };

    const getAvailableCapacity = (resourceId) => {
        const resource = resources.find(r => r.id === resourceId);
        if (!resource || !resource.capacity) return null;
        
        const totalCapacity = resource.capacity;
        const bookedCount = approvedBookingsCount[resourceId] || 0;
        return totalCapacity - bookedCount;
    };

    const isResourceFullyBooked = (resourceId) => {
        const resource = resources.find(r => r.id === resourceId);
        if (!resource || !resource.capacity) return false;
        
        const availableCapacity = getAvailableCapacity(resourceId);
        return availableCapacity <= 0;
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    const showConfirmation = (title, message, confirmText, type, onConfirm) => {
        setConfirmationModal({
            isOpen: true,
            title,
            message,
            confirmText,
            type,
            onConfirm
        });
    };

    const handleBookNow = async (resource) => {
        if (isAdmin) return;
        
        if (isResourceFullyBooked(resource.id)) {
            showConfirmation(
                'Resource Fully Booked',
                'This resource has reached its maximum capacity and cannot be booked at this time.',
                'OK',
                'info',
                () => {}
            );
            return;
        }
        
        const existingBooking = userBookings[resource.id];
        
        if (existingBooking) {
            if (existingBooking.status === 'APPROVED') {
                showConfirmation(
                    'Already Booked',
                    'You have already successfully booked this resource!',
                    'OK',
                    'info',
                    () => {}
                );
                return;
            } else if (existingBooking.status === 'PENDING') {
                showConfirmation(
                    'Pending Approval',
                    'Your booking request is pending approval. You can cancel it using the "Revert Request" button.',
                    'OK',
                    'info',
                    () => {}
                );
                return;
            }
        }
        
        setSelectedResource(resource);
        setIsBookingModalOpen(true);
    };

    const handleBookingSuccess = (booking) => {
        setUserBookings(prev => ({
            ...prev,
            [booking.resourceId]: booking
        }));
        
        fetchAllApprovedBookings();
        fetchResources();
        
        showConfirmation(
            'Booking Successful',
            'Your booking request has been submitted and is pending approval.',
            'OK',
            'info',
            () => {}
        );
    };

    const handleCancelRequest = (resourceId) => {
        const booking = userBookings[resourceId];
        if (!booking) return;

        showConfirmation(
            'Revert Booking Request',
            'Are you sure you want to revert this booking request? This action cannot be undone.',
            'Revert Request',
            'warning',
            async () => {
                try {
                    await bookingService.cancelBooking(booking.id, String(currentUser.id));
                    setUserBookings(prev => {
                        const newBookings = { ...prev };
                        delete newBookings[resourceId];
                        return newBookings;
                    });
                    fetchAllApprovedBookings();
                    fetchResources();
                    
                    showConfirmation(
                        'Request Reverted',
                        'Your booking request has been successfully reverted.',
                        'OK',
                        'info',
                        () => {}
                    );
                } catch (error) {
                    console.error('Error reverting booking:', error);
                    showConfirmation(
                        'Error',
                        'Failed to revert booking request. Please try again.',
                        'OK',
                        'danger',
                        () => {}
                    );
                }
            }
        );
    };

    const handleCancelBooking = (resourceId) => {
        const booking = userBookings[resourceId];
        if (!booking || booking.status !== 'APPROVED') return;

        showConfirmation(
            'Cancel Booking',
            'Are you sure you want to cancel this booking? This will free up capacity for others and cannot be undone.',
            'Cancel Booking',
            'danger',
            async () => {
                try {
                    await bookingService.cancelBooking(booking.id, String(currentUser.id));
                    setUserBookings(prev => {
                        const newBookings = { ...prev };
                        delete newBookings[resourceId];
                        return newBookings;
                    });
                    fetchAllApprovedBookings();
                    fetchResources();
                    
                    showConfirmation(
                        'Booking Cancelled',
                        'Your booking has been successfully cancelled. You can book this resource again if needed.',
                        'OK',
                        'info',
                        () => {}
                    );
                } catch (error) {
                    console.error('Error cancelling booking:', error);
                    showConfirmation(
                        'Error',
                        'Failed to cancel booking. Please try again.',
                        'OK',
                        'danger',
                        () => {}
                    );
                }
            }
        );
    };

    const handleShowDetails = (resource) => {
        setSelectedResource(resource);
        setIsDetailsModalOpen(true);
    };

    const dismissRejectedMessage = (resourceId) => {
        setRejectedMessages(prev => {
            const newMessages = { ...prev };
            delete newMessages[resourceId];
            return newMessages;
        });
    };

    const getBookingStatus = (resourceId) => {
        const booking = userBookings[resourceId];
        if (!booking) return null;
        return booking.status;
    };

    const hasActiveBooking = (resourceId) => {
        const booking = userBookings[resourceId];
        return booking && (booking.status === 'APPROVED' || booking.status === 'PENDING');
    };

    const isResourceBookedByCurrentUser = (resourceId) => {
        const booking = userBookings[resourceId];
        return booking && booking.status === 'APPROVED';
    };

    const isResourcePendingForCurrentUser = (resourceId) => {
        const booking = userBookings[resourceId];
        return booking && booking.status === 'PENDING';
    };

    const isResourceRejectedForCurrentUser = (resourceId) => {
        const booking = userBookings[resourceId];
        return booking && booking.status === 'REJECTED';
    };

    const isResourceCancelledByCurrentUser = (resourceId) => {
        const booking = userBookings[resourceId];
        return booking && booking.status === 'CANCELLED';
    };

    const types = ['ALL', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

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

    return (
        <div className="min-h-screen pt-4 pb-20">
            {/* Mesh Background (Shared) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[60%] w-[25%] h-[25%] bg-blue-400/5 dark:bg-blue-400/10 blur-[100px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.header 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10 text-center md:text-left"
                >
                    <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight">
                        <span className="text-gradient">
                            {isAdmin ? 'Resource Management Dashboard' : 'Facilities Catalogue'}
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        {isAdmin ? 'View and manage campus resources and bookings' : 'Explore and find available resources on campus'}
                    </p>
                    {!isAdmin && currentUser.name && (
                        <p className="text-muted-foreground mt-1 text-sm">
                            Welcome, <span className="font-semibold text-foreground">{currentUser.name}</span> ({currentUser.email})
                        </p>
                    )}
                </motion.header>

                {/* Filters Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-6 mb-10 border border-border"
                >
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground ml-1">Search Name</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    type="text"
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                    placeholder="Enter resource name..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground ml-1">Resource Type</label>
                            <select
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2.5 bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-foreground"
                            >
                                {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <input
                                    type="text"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. Block A"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 border border-blue-500/20"
                        >
                            Filter Results
                        </button>
                    </form>
                </motion.div>

                {/* Grid Section */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {resources.length > 0 ? (
                            resources.map((resource) => {
                                const isBookedByUser = isResourceBookedByCurrentUser(resource.id);
                                const isPendingForUser = isResourcePendingForCurrentUser(resource.id);
                                const isRejectedForUser = isResourceRejectedForCurrentUser(resource.id);
                                const isCancelledByUser = isResourceCancelledByCurrentUser(resource.id);
                                const userHasActiveBooking = hasActiveBooking(resource.id);
                                const availableCapacity = getAvailableCapacity(resource.id);
                                const bookedCount = approvedBookingsCount[resource.id] || 0;
                                const isFullyBooked = isResourceFullyBooked(resource.id);
                                const hasCapacity = resource.capacity && resource.capacity > 0;
                                const isMeetingRoom = resource.type === 'MEETING_ROOM';
                                
                                const canBook = !isAdmin && !userHasActiveBooking && resource.status === 'ACTIVE';
                                const canBookAgain = !isAdmin && (isCancelledByUser || isRejectedForUser) && resource.status === 'ACTIVE';
                                
                                return (
                                    <motion.div 
                                        variants={itemVariants}
                                        key={resource.id} 
                                        className="group glass-glow rounded-3xl overflow-hidden border border-border transition-all duration-300"
                                    >
                                        <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
                                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                            <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-bold text-blue-400 uppercase tracking-wider">
                                                {resource.type.replace('_', ' ')}
                                            </div>
                                            <div className="absolute bottom-4 left-6 text-white">
                                                <h3 className="text-2xl font-bold font-space leading-tight">{resource.name}</h3>
                                                {isMeetingRoom && (
                                                    <p className="text-xs text-blue-200 mt-1">2-Hour Slots • 5 Members</p>
                                                )}
                                            </div>
                                            {!isAdmin && isBookedByUser && (
                                                <div className="absolute top-4 left-4 bg-emerald-500 rounded-full p-1">
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                            {!isAdmin && isPendingForUser && (
                                                <div className="absolute top-4 left-4 bg-amber-500 rounded-full p-1">
                                                    <Clock className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                            {!isAdmin && (isRejectedForUser || isCancelledByUser) && (
                                                <div className="absolute top-4 left-4 bg-gray-500 rounded-full p-1">
                                                    <XCircle className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="p-6 space-y-4">
                                            {/* Capacity Information */}
                                            {hasCapacity && !isMeetingRoom && (
                                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <Users className="w-5 h-5 text-blue-500" />
                                                            <span className="text-sm font-semibold text-blue-400">Capacity Status</span>
                                                        </div>
                                                        <span className={`text-sm font-bold ${isFullyBooked ? 'text-red-500' : 'text-emerald-500'}`}>
                                                            {bookedCount} / {resource.capacity} Booked
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 w-full bg-white/5 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full transition-all ${isFullyBooked ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${Math.min((bookedCount / resource.capacity) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {isFullyBooked 
                                                            ? 'This resource is fully booked' 
                                                            : `${availableCapacity} spot${availableCapacity !== 1 ? 's' : ''} available`}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Meeting Room Info */}
                                            {isMeetingRoom && (
                                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-5 h-5 text-blue-400" />
                                                        <span className="text-sm font-semibold text-blue-400">Meeting Room</span>
                                                    </div>
                                                    <p className="text-xs text-blue-400 mt-1">
                                                        5 slots available (2 hours each)
                                                    </p>
                                                    <p className="text-xs text-blue-400">
                                                        Requires 5 members per booking
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Status Banners */}
                                            {!isAdmin && isPendingForUser && (
                                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-5 h-5 text-amber-500" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-amber-400">Pending Approval</p>
                                                            <p className="text-xs text-amber-400/70">Your booking request is awaiting admin approval</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {!isAdmin && isBookedByUser && (
                                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2">
                                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-emerald-400">Booking Confirmed</p>
                                                            <p className="text-xs text-emerald-400/70">You have successfully booked this resource</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {!isAdmin && isCancelledByUser && (
                                                <div className="bg-gray-500/5 border border-gray-500/20 rounded-lg p-3">
                                                    <div className="flex items-center space-x-2">
                                                        <XCircle className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-400">Booking Cancelled</p>
                                                            <p className="text-xs text-gray-400/70">Your previous booking was cancelled. You can book again.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center text-muted-foreground">
                                                <MapPin className="w-5 h-5 mr-3 text-muted-foreground" />
                                                <span className="font-medium">{resource.location || 'N/A'}</span>
                                            </div>
                                            
                                            {!isMeetingRoom && (
                                                <div className="flex items-center text-muted-foreground">
                                                    <Users className="w-5 h-5 mr-3 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        Capacity: {resource.capacity || 'Unlimited'}
                                                        {hasCapacity && !isAdmin && (
                                                            <span className="text-xs text-muted-foreground ml-1">
                                                                ({availableCapacity} available)
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center text-muted-foreground">
                                                <Clock className="w-5 h-5 mr-3 text-muted-foreground" />
                                                <span className="font-medium text-sm">
                                                    {resource.availableFrom || '08:00'} - {resource.availableTo || '20:00'}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    resource.status === 'ACTIVE' 
                                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                    {resource.status}
                                                </div>
                                                {isMeetingRoom && (
                                                    <span className="ml-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                        2HR SLOTS
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="pt-4 border-t border-border flex gap-2">
                                                {isAdmin ? (
                                                    <button 
                                                        onClick={() => handleShowDetails(resource)}
                                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 border border-blue-500/20"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                        View Details
                                                    </button>
                                                ) : (
                                                    <>
                                                        {!userHasActiveBooking && !isRejectedForUser && !isCancelledByUser && (
                                                            <button 
                                                                onClick={() => handleBookNow(resource)}
                                                                disabled={resource.status !== 'ACTIVE'}
                                                                className={`flex-1 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                                                                    resource.status === 'ACTIVE'
                                                                        ? 'bg-foreground hover:bg-foreground/90 text-background'
                                                                        : 'bg-white/5 text-muted-foreground cursor-not-allowed'
                                                                }`}
                                                            >
                                                                Book Now
                                                            </button>
                                                        )}
                                                        
                                                        {(isCancelledByUser || isRejectedForUser) && (
                                                            <button 
                                                                onClick={() => handleBookNow(resource)}
                                                                disabled={resource.status !== 'ACTIVE'}
                                                                className={`flex-1 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
                                                                    resource.status === 'ACTIVE'
                                                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                        : 'bg-white/5 text-muted-foreground cursor-not-allowed'
                                                                }`}
                                                            >
                                                                Book Again
                                                            </button>
                                                        )}
                                                        
                                                        {isPendingForUser && (
                                                            <button 
                                                                onClick={() => handleCancelRequest(resource.id)}
                                                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 border border-amber-500/20"
                                                            >
                                                                Revert Request
                                                            </button>
                                                        )}
                                                        
                                                        {isBookedByUser && (
                                                            <button 
                                                                onClick={() => handleCancelBooking(resource.id)}
                                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95 border border-red-500/20"
                                                            >
                                                                Cancel Booking
                                                            </button>
                                                        )}
                                                        
                                                        <button 
                                                            onClick={() => handleShowDetails(resource)}
                                                            className="p-3 bg-white/10 text-muted-foreground rounded-2xl hover:bg-white/20 transition-all active:scale-95 border border-border"
                                                        >
                                                            <Info className="w-6 h-6" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-2xl font-semibold text-muted-foreground">No resources found matching your criteria</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
            
            {!isAdmin && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    resource={selectedResource}
                    onSuccess={handleBookingSuccess}
                />
            )}
            
            <ResourceDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                resource={selectedResource}
                userRole={userRole}
            />
            
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                    confirmationModal.onConfirm();
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
                }}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText={confirmationModal.confirmText}
                type={confirmationModal.type}
            />
        </div>
    );
};

export default ResourceCatalogue;