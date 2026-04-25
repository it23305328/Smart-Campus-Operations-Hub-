// MyBookings.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import resourceService from '../../services/resourceService';
import { 
    Clock, 
    MapPin, 
    Calendar, 
    CheckCircle, 
    XCircle, 
    Eye, 
    ArrowRight,
    AlertCircle,
    RefreshCw,
    ChevronRight,
    CheckCheck,
    History
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [resourceDetails, setResourceDetails] = useState({});
    
    const { user: currentUser } = useAuth();
    
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'warning',
        onConfirm: () => {}
    });

    useEffect(() => {
        if (currentUser.id) {
            fetchUserBookings();
        }
    }, [currentUser.id]);

    // Helper function to check if a booking is in the past
    const isBookingCompleted = (booking) => {
        if (!booking.reservationDate || !booking.endTime) return false;
        try {
            const now = new Date();
            const [endHour, endMin] = booking.endTime.split(':').map(Number);
            const bookingEndDateTime = new Date(booking.reservationDate);
            bookingEndDateTime.setHours(endHour, endMin, 0, 0);
            return now > bookingEndDateTime;
        } catch (e) {
            return false;
        }
    };

    // Helper function to check if a booking is currently active
    const isBookingCurrentlyActive = (booking) => {
        if (!booking.reservationDate || !booking.startTime || !booking.endTime) return false;
        try {
            const now = new Date();
            const [startHour, startMin] = booking.startTime.split(':').map(Number);
            const [endHour, endMin] = booking.endTime.split(':').map(Number);
            const bookingStartDateTime = new Date(booking.reservationDate);
            bookingStartDateTime.setHours(startHour, startMin, 0, 0);
            const bookingEndDateTime = new Date(booking.reservationDate);
            bookingEndDateTime.setHours(endHour, endMin, 0, 0);
            return now >= bookingStartDateTime && now <= bookingEndDateTime;
        } catch (e) {
            return false;
        }
    };

    // Helper function to check if a booking is upcoming (future)
    const isBookingUpcoming = (booking) => {
        if (!booking.reservationDate || !booking.startTime) return false;
        try {
            const now = new Date();
            const [startHour, startMin] = booking.startTime.split(':').map(Number);
            const bookingStartDateTime = new Date(booking.reservationDate);
            bookingStartDateTime.setHours(startHour, startMin, 0, 0);
            return now < bookingStartDateTime;
        } catch (e) {
            return false;
        }
    };

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            const studentId = String(currentUser.id);
            const data = await bookingService.getUserBookings(studentId);
            
            const sortedBookings = (data || []).sort((a, b) => {
                if (a.reservationDate && b.reservationDate) {
                    const dateCompare = new Date(b.reservationDate) - new Date(a.reservationDate);
                    if (dateCompare !== 0) return dateCompare;
                }
                return new Date(b.bookingDate) - new Date(a.bookingDate);
            });
            
            setBookings(sortedBookings);
            
            const resourceIds = [...new Set(sortedBookings.map(b => b.resourceId))];
            const resourceMap = {};
            
            for (const resourceId of resourceIds) {
                try {
                    const resource = await resourceService.getResourceById(resourceId);
                    resourceMap[resourceId] = resource;
                } catch (error) {
                    console.error(`Error fetching resource ${resourceId}:`, error);
                }
            }
            
            setResourceDetails(resourceMap);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredBookings = () => {
        let filtered = bookings;
        
        if (filter === 'ONGOING') {
            // Currently active + upcoming approved bookings
            filtered = bookings.filter(b => 
                b.status === 'APPROVED' && !isBookingCompleted(b)
            );
        } else if (filter === 'COMPLETED') {
            // Past approved bookings
            filtered = bookings.filter(b => 
                b.status === 'APPROVED' && isBookingCompleted(b)
            );
        } else if (filter === 'PENDING') {
            filtered = bookings.filter(b => b.status === 'PENDING');
        } else if (filter === 'REJECTED') {
            filtered = bookings.filter(b => b.status === 'REJECTED');
        } else if (filter === 'CANCELLED') {
            filtered = bookings.filter(b => b.status === 'CANCELLED');
        }
        
        return filtered;
    };

    const filteredBookings = getFilteredBookings();

    const getStatusColor = (status, booking) => {
        // If booking is completed, show different color
        if (status === 'APPROVED' && isBookingCompleted(booking)) {
            return {
                bg: 'bg-blue-500/5',
                text: 'text-blue-400',
                border: 'border-blue-500/20',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                icon: CheckCheck
            };
        }
        // If booking is currently active
        if (status === 'APPROVED' && isBookingCurrentlyActive(booking)) {
            return {
                bg: 'bg-emerald-500/5',
                text: 'text-emerald-400',
                border: 'border-emerald-500/20',
                badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                icon: CheckCircle
            };
        }
        
        switch (status) {
            case 'PENDING':
                return {
                    bg: 'bg-amber-500/5',
                    text: 'text-amber-400',
                    border: 'border-amber-500/20',
                    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    icon: Clock
                };
            case 'APPROVED':
                return {
                    bg: 'bg-emerald-500/5',
                    text: 'text-emerald-400',
                    border: 'border-emerald-500/20',
                    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                    icon: CheckCircle
                };
            case 'REJECTED':
                return {
                    bg: 'bg-red-500/5',
                    text: 'text-red-400',
                    border: 'border-red-500/20',
                    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
                    icon: XCircle
                };
            case 'CANCELLED':
                return {
                    bg: 'bg-gray-500/5',
                    text: 'text-gray-400',
                    border: 'border-gray-500/20',
                    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                    icon: XCircle
                };
            default:
                return {
                    bg: 'bg-gray-500/5',
                    text: 'text-gray-400',
                    border: 'border-gray-500/20',
                    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                    icon: AlertCircle
                };
        }
    };

    const getBookingStateLabel = (booking) => {
        if (booking.status === 'APPROVED') {
            if (isBookingCurrentlyActive(booking)) return 'In Progress';
            if (isBookingUpcoming(booking)) return 'Upcoming';
            if (isBookingCompleted(booking)) return 'Completed';
        }
        return booking.status;
    };

    const getBookingStateBadge = (booking) => {
        const state = getBookingStateLabel(booking);
        switch (state) {
            case 'In Progress':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Upcoming':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Completed':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default:
                return '';
        }
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        try {
            if (typeof time === 'string') {
                const parts = time.split(':');
                if (parts.length >= 2) {
                    const hours = parseInt(parts[0]);
                    const minutes = parts[1];
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                    return `${displayHours}:${minutes} ${ampm}`;
                }
            }
            return time;
        } catch (e) {
            return time;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            const today = new Date();
            const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const diffTime = dateOnly.getTime() - todayOnly.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            let dateLabel;
            if (diffDays === 0) dateLabel = 'Today';
            else if (diffDays === 1) dateLabel = 'Tomorrow';
            else if (diffDays === -1) dateLabel = 'Yesterday';
            else if (diffDays > 1 && diffDays < 7) dateLabel = `In ${diffDays} days`;
            else if (diffDays < 0 && diffDays > -7) dateLabel = `${Math.abs(diffDays)} days ago`;
            else dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            return dateLabel;
        } catch (e) {
            return dateStr;
        }
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        try {
            const date = new Date(dateTime);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let dateStr;
            if (diffDays === 0) dateStr = 'Today';
            else if (diffDays === 1) dateStr = 'Yesterday';
            else if (diffDays < 7) dateStr = `${diffDays} days ago`;
            else dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            return `${dateStr} at ${timeStr}`;
        } catch (e) {
            return dateTime;
        }
    };

    const handleCancelRequest = (booking) => {
        showConfirmation(
            'Cancel Booking Request',
            'Are you sure you want to cancel this booking request?',
            'Yes, Cancel Request',
            'warning',
            async () => {
                try {
                    await bookingService.cancelBooking(booking.id, String(currentUser.id));
                    fetchUserBookings();
                    showConfirmation('Request Cancelled', 'Your booking request has been cancelled.', 'OK', 'info', () => {});
                } catch (error) {
                    showConfirmation('Error', 'Failed to cancel booking.', 'OK', 'danger', () => {});
                }
            }
        );
    };

    const handleCancelApprovedBooking = (booking) => {
        showConfirmation(
            'Cancel Booking',
            'Are you sure you want to cancel this confirmed booking?',
            'Yes, Cancel Booking',
            'danger',
            async () => {
                try {
                    await bookingService.cancelBooking(booking.id, String(currentUser.id));
                    fetchUserBookings();
                    showConfirmation('Booking Cancelled', 'Your booking has been cancelled.', 'OK', 'info', () => {});
                } catch (error) {
                    showConfirmation('Error', 'Failed to cancel booking.', 'OK', 'danger', () => {});
                }
            }
        );
    };

    const showConfirmation = (title, message, confirmText, type, onConfirm) => {
        setConfirmationModal({ isOpen: true, title, message, confirmText, type, onConfirm });
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };

    const handleNavigateToFacility = () => {
        navigate(`/facilities`);
    };

    const getStatusCount = (status) => {
        if (status === 'ONGOING') {
            return bookings.filter(b => b.status === 'APPROVED' && !isBookingCompleted(b)).length;
        }
        if (status === 'COMPLETED') {
            return bookings.filter(b => b.status === 'APPROVED' && isBookingCompleted(b)).length;
        }
        return bookings.filter(b => b.status === status).length;
    };

    // Categorized bookings
    const now = new Date();
    const activeBookings = bookings.filter(b => b.status === 'APPROVED' && isBookingCurrentlyActive(b));
    const upcomingBookings = bookings.filter(b => b.status === 'APPROVED' && isBookingUpcoming(b));
    const completedBookings = bookings.filter(b => b.status === 'APPROVED' && isBookingCompleted(b));
    const ongoingBookings = bookings.filter(b => b.status === 'APPROVED' && !isBookingCompleted(b));
    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const rejectedBookings = bookings.filter(b => b.status === 'REJECTED');
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

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
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight">
                                <span className="text-gradient">My Bookings</span>
                            </h1>
                            <p className="text-muted-foreground mt-2 font-medium">Manage and track your resource bookings</p>
                        </div>
                        <button onClick={fetchUserBookings} className="flex items-center gap-2 px-6 py-3 glass rounded-2xl border border-border text-foreground font-semibold hover:bg-white/10 transition-all">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>
                    
                    {/* Quick Stats */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6"
                    >
                        <motion.div variants={itemVariants} className="glass rounded-2xl p-4 border border-border">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total</p>
                            <p className="text-3xl font-black text-foreground mt-1">{bookings.length}</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-emerald-500/5 rounded-2xl p-4 border border-emerald-500/20">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active Now</p>
                            <p className="text-3xl font-black text-emerald-400 mt-1">{activeBookings.length}</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/20">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Upcoming</p>
                            <p className="text-3xl font-black text-blue-400 mt-1">{upcomingBookings.length}</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/20">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Completed</p>
                            <p className="text-3xl font-black text-blue-400 mt-1">{completedBookings.length}</p>
                        </motion.div>
                        <motion.div variants={itemVariants} className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/20">
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending</p>
                            <p className="text-3xl font-black text-amber-400 mt-1">{pendingBookings.length}</p>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass rounded-2xl p-2 mb-8 inline-flex gap-2 flex-wrap border border-border"
                >
                    {[
                        { key: 'ALL', label: 'All' },
                        { key: 'ONGOING', label: 'Ongoing' },
                        { key: 'COMPLETED', label: 'Completed' },
                        { key: 'PENDING', label: 'Pending' },
                        { key: 'REJECTED', label: 'Rejected' },
                        { key: 'CANCELLED', label: 'Cancelled' }
                    ].map((tab) => {
                        const count = tab.key === 'ALL' ? bookings.length : getStatusCount(tab.key);
                        return (
                            <button key={tab.key} onClick={() => setFilter(tab.key)}
                                className={`px-5 py-3 rounded-xl font-bold transition-all ${filter === tab.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:bg-white/10'}`}>
                                {tab.label}
                                {count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-white/10 text-muted-foreground'}`}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Bookings List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-4"
                    >
                        {filteredBookings.map((booking) => {
                            const statusStyle = getStatusColor(booking.status, booking);
                            const StatusIcon = statusStyle.icon;
                            const stateLabel = getBookingStateLabel(booking);
                            const stateBadge = getBookingStateBadge(booking);
                            const isCompleted = isBookingCompleted(booking);
                            const isActive = isBookingCurrentlyActive(booking);
                            
                            return (
                                <motion.div 
                                    variants={itemVariants}
                                    key={booking.id} 
                                    className={`glass border ${statusStyle.border} rounded-3xl hover:shadow-lg transition-all duration-300 overflow-hidden`}
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xl flex-shrink-0 border border-blue-500/20">
                                                        {booking.resourceName?.charAt(0).toUpperCase() || 'R'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-xl font-bold text-foreground">{booking.resourceName}</h3>
                                                            {/* State badge (In Progress / Upcoming / Completed) */}
                                                            {booking.status === 'APPROVED' && stateBadge && (
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${stateBadge}`}>
                                                                    {stateLabel}
                                                                </span>
                                                            )}
                                                            {/* Status badge for non-approved */}
                                                            {booking.status !== 'APPROVED' && (
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${statusStyle.badge}`}>
                                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                                    {booking.status}
                                                                </span>
                                                            )}
                                                            {booking.slotNumber && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Slot {booking.slotNumber}</span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Date and Time */}
                                                        <div className="mt-3 p-3 bg-white/5 rounded-xl border border-border">
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground font-medium">Date</p>
                                                                        <p className="text-sm font-bold text-foreground">{formatFullDate(booking.reservationDate)}</p>
                                                                        <p className="text-xs text-blue-400 font-semibold">{formatDate(booking.reservationDate)}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-px h-10 bg-border hidden sm:block"></div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                                        <Clock className="w-4 h-4 text-blue-400" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-muted-foreground font-medium">Time</p>
                                                                        <p className="text-sm font-bold text-foreground">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                                                        {booking.slotNumber && <p className="text-xs text-blue-400 font-semibold">Meeting Room - Slot {booking.slotNumber}</p>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                                            <MapPin className="w-3.5 h-3.5" /> {booking.resourceLocation || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                                            <Calendar className="w-3 h-3" /> Booked on {formatDateTime(booking.bookingDate)}
                                                        </div>
                                                        {booking.purpose && (
                                                            <p className="mt-2 text-sm text-muted-foreground bg-white/5 rounded-lg p-2"><span className="font-semibold">Purpose:</span> {booking.purpose}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                                                <button onClick={() => handleViewDetails(booking)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-foreground font-semibold rounded-xl hover:bg-white/20 transition-all text-sm border border-border">
                                                    <Eye className="w-4 h-4" /> Details
                                                </button>
                                                
                                                {booking.status === 'PENDING' && (
                                                    <button onClick={() => handleCancelRequest(booking)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-all text-sm border border-amber-500/20">
                                                        <XCircle className="w-4 h-4" /> Revert
                                                    </button>
                                                )}
                                                
                                                {booking.status === 'APPROVED' && !isCompleted && (
                                                    <button onClick={() => handleCancelApprovedBooking(booking)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm border border-red-500/20">
                                                        <XCircle className="w-4 h-4" /> Cancel
                                                    </button>
                                                )}
                                                
                                                <button onClick={handleNavigateToFacility} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-blue-500/20 text-blue-400 font-semibold rounded-xl hover:bg-blue-500/10 transition-all text-sm">
                                                    View Resources <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-glow rounded-3xl border border-border py-20 text-center"
                    >
                        <div className="w-24 h-24 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 border border-border">
                            <Calendar className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">No bookings found</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            {filter === 'ALL' ? "You haven't made any bookings yet." : `No ${filter.toLowerCase()} bookings.`}
                        </p>
                        <button onClick={() => navigate('/facilities')} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 border border-blue-500/20">
                            Browse Resources <ChevronRight className="w-5 h-5" />
                        </button>
                    </motion.div>
                )}

                {/* Currently Active Bookings */}
                {activeBookings.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12"
                    >
                        <h2 className="text-2xl font-bold font-space text-foreground mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                            Currently Active
                            <span className="text-sm font-normal text-muted-foreground ml-2">({activeBookings.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeBookings.map((booking) => (
                                <motion.div 
                                    key={booking.id} 
                                    className="bg-emerald-500/5 rounded-2xl p-5 border-2 border-emerald-500/30 cursor-pointer hover:shadow-lg transition-all animate-pulse"
                                    onClick={() => handleViewDetails(booking)}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">IN PROGRESS</span>
                                    </div>
                                    <h3 className="font-bold text-foreground">{booking.resourceName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-emerald-400 mt-2">
                                        <Calendar className="w-3.5 h-3.5" /> <span className="font-semibold">{formatDate(booking.reservationDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-emerald-400 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-emerald-400/70 mt-1">
                                        <MapPin className="w-3 h-3" /> {booking.resourceLocation || 'N/A'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Upcoming Bookings */}
                {upcomingBookings.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12"
                    >
                        <h2 className="text-2xl font-bold font-space text-foreground mb-6 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-blue-500" />
                            Upcoming Bookings
                            <span className="text-sm font-normal text-muted-foreground ml-2">({upcomingBookings.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingBookings.map((booking) => (
                                <motion.div 
                                    key={booking.id} 
                                    className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/20 cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => handleViewDetails(booking)}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <Clock className="w-6 h-6 text-blue-500" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">UPCOMING</span>
                                    </div>
                                    <h3 className="font-bold text-foreground">{booking.resourceName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-blue-400 mt-2">
                                        <Calendar className="w-3.5 h-3.5" /> <span className="font-semibold">{formatDate(booking.reservationDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-blue-400 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-blue-400/70 mt-1">
                                        <MapPin className="w-3 h-3" /> {booking.resourceLocation || 'N/A'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Completed Bookings */}
                {completedBookings.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12"
                    >
                        <h2 className="text-2xl font-bold font-space text-foreground mb-6 flex items-center gap-2">
                            <History className="w-6 h-6 text-blue-400" />
                            Completed Bookings
                            <span className="text-sm font-normal text-muted-foreground ml-2">({completedBookings.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedBookings.map((booking) => (
                                <motion.div 
                                    key={booking.id} 
                                    className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/20 cursor-pointer hover:shadow-lg transition-all opacity-75"
                                    onClick={() => handleViewDetails(booking)}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <CheckCheck className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">COMPLETED</span>
                                    </div>
                                    <h3 className="font-bold text-foreground">{booking.resourceName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-blue-400 mt-2">
                                        <Calendar className="w-3.5 h-3.5" /> <span className="font-semibold">{formatDate(booking.reservationDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-blue-400 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-blue-400/70 mt-1">
                                        <MapPin className="w-3 h-3" /> {booking.resourceLocation || 'N/A'}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Booking Details Modal */}
            {isDetailsModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-background rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-border glass">
                        <div className="px-8 py-6 bg-white/5 border-b border-border sticky top-0 backdrop-blur-xl z-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold font-space text-foreground tracking-tight">Booking Details</h2>
                                <p className="text-sm text-muted-foreground mt-1">Booking #{selectedBooking.id}</p>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <XCircle className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-5">
                            {/* Status Banner */}
                            <div className={`${getStatusColor(selectedBooking.status, selectedBooking).bg} rounded-2xl p-5 border ${getStatusColor(selectedBooking.status, selectedBooking).border}`}>
                                <div className="flex items-center gap-3">
                                    {React.createElement(getStatusColor(selectedBooking.status, selectedBooking).icon, { className: "w-8 h-8" })}
                                    <div>
                                        <p className={`text-lg font-bold ${getStatusColor(selectedBooking.status, selectedBooking).text}`}>
                                            {getBookingStateLabel(selectedBooking) === 'In Progress' && 'Currently Active'}
                                            {getBookingStateLabel(selectedBooking) === 'Upcoming' && 'Upcoming Booking'}
                                            {getBookingStateLabel(selectedBooking) === 'Completed' && 'Booking Completed'}
                                            {selectedBooking.status === 'PENDING' && 'Awaiting Approval'}
                                            {selectedBooking.status === 'REJECTED' && 'Booking Rejected'}
                                            {selectedBooking.status === 'CANCELLED' && 'Booking Cancelled'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Date & Time */}
                            <div className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Reservation Date & Time</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Calendar className="w-6 h-6 text-blue-500" /></div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase">Date</p>
                                                <p className="text-lg font-bold text-foreground">{formatDate(selectedBooking.reservationDate)}</p>
                                                <p className="text-sm text-blue-400 font-semibold">{formatFullDate(selectedBooking.reservationDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Clock className="w-6 h-6 text-blue-400" /></div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold uppercase">Time Slot</p>
                                                <p className="text-lg font-bold text-foreground">{formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
                                                {selectedBooking.slotNumber && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">Meeting Room - Slot {selectedBooking.slotNumber}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Resource Info */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-border">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Resource Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><p className="text-xs text-muted-foreground font-semibold">Resource</p><p className="font-bold text-foreground text-lg">{selectedBooking.resourceName}</p><p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedBooking.resourceLocation || 'N/A'}</p></div>
                                    <div><p className="text-xs text-muted-foreground font-semibold">Contact</p><p className="font-bold text-foreground">{selectedBooking.contactNumber}</p></div>
                                    <div><p className="text-xs text-muted-foreground font-semibold">Booked On</p><p className="font-bold text-foreground">{formatDateTime(selectedBooking.bookingDate)}</p></div>
                                </div>
                            </div>
                            
                            {selectedBooking.purpose && (
                                <div className="bg-white/5 rounded-2xl p-5 border border-border"><h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Purpose</h3><p className="text-foreground">{selectedBooking.purpose}</p></div>
                            )}
                            
                            {selectedBooking.rejectionReason && (
                                <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/20"><h3 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Rejection Reason</h3><p className="text-red-400">{selectedBooking.rejectionReason}</p></div>
                            )}
                            
                            <div className="flex gap-3 pt-4 border-t border-border">
                                {selectedBooking.status === 'PENDING' && (
                                    <button onClick={() => { handleCancelRequest(selectedBooking); setIsDetailsModalOpen(false); }} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-amber-500/20 active:scale-95 transition-all border border-amber-500/20">Cancel Request</button>
                                )}
                                {selectedBooking.status === 'APPROVED' && !isBookingCompleted(selectedBooking) && (
                                    <button onClick={() => { handleCancelApprovedBooking(selectedBooking); setIsDetailsModalOpen(false); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-red-500/20 active:scale-95 transition-all border border-red-500/20">Cancel Booking</button>
                                )}
                                <button onClick={() => setIsDetailsModalOpen(false)} className="flex-1 bg-white/10 hover:bg-white/20 text-foreground py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all border border-border">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => { confirmationModal.onConfirm(); setConfirmationModal(prev => ({ ...prev, isOpen: false })); }}
                title={confirmationModal.title}
                message={confirmationModal.message}
                confirmText={confirmationModal.confirmText}
                type={confirmationModal.type}
            />
        </div>
    );
};

export default MyBookings;