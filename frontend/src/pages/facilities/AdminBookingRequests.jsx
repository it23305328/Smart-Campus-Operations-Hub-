// AdminBookingRequests.jsx
import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import { CheckCircle, XCircle, Eye, Clock, User, Phone, Calendar, MapPin, Users } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { motion } from 'framer-motion';

const AdminBookingRequests = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [allBookings, setAllBookings] = useState([]);
    
    // Confirmation Modal States
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        type: 'warning',
        onConfirm: () => {}
    });
    
    // Rejection Modal States
    const [rejectionModal, setRejectionModal] = useState({
        isOpen: false,
        bookingId: null,
        reason: ''
    });

    useEffect(() => {
        fetchAllBookings();
    }, []);

    useEffect(() => {
        filterBookings();
    }, [filter, allBookings]);

    const fetchAllBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getAllBookings();
            setAllBookings(data || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setAllBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const filterBookings = () => {
        if (filter === 'ALL') {
            setBookings(allBookings);
        } else {
            const filtered = allBookings.filter(booking => booking.status === filter);
            setBookings(filtered);
        }
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

    const handleApprove = (bookingId) => {
        showConfirmation(
            'Approve Booking',
            'Are you sure you want to approve this booking request?',
            'Approve',
            'info',
            async () => {
                try {
                    await bookingService.updateBookingStatus(bookingId, 'APPROVED');
                    fetchAllBookings();
                    
                    showConfirmation(
                        'Booking Approved',
                        'The booking request has been approved successfully.',
                        'OK',
                        'info',
                        () => {}
                    );
                } catch (error) {
                    console.error('Error approving booking:', error);
                    showConfirmation(
                        'Error',
                        'Failed to approve booking. Please try again.',
                        'OK',
                        'danger',
                        () => {}
                    );
                }
            }
        );
    };

    const handleRejectClick = (bookingId) => {
        setRejectionModal({
            isOpen: true,
            bookingId,
            reason: ''
        });
    };

    const handleRejectConfirm = async () => {
        const { bookingId, reason } = rejectionModal;
        
        try {
            await bookingService.updateBookingStatus(bookingId, 'REJECTED', reason || null);
            fetchAllBookings();
            setRejectionModal({ isOpen: false, bookingId: null, reason: '' });
            
            showConfirmation(
                'Booking Rejected',
                'The booking request has been rejected.',
                'OK',
                'info',
                () => {}
            );
        } catch (error) {
            console.error('Error rejecting booking:', error);
            showConfirmation(
                'Error',
                'Failed to reject booking. Please try again.',
                'OK',
                'danger',
                () => {}
            );
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'APPROVED':
                return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'REJECTED':
                return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'CANCELLED':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
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
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            let relativeTime;
            if (diffMins < 1) relativeTime = 'Just now';
            else if (diffMins < 60) relativeTime = `${diffMins} min ago`;
            else if (diffHours < 24) relativeTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            else if (diffDays < 7) relativeTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            else relativeTime = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            const fullDateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            return { relativeTime, timeStr, fullDateStr };
        } catch (e) {
            return { relativeTime: dateTime, timeStr: '', fullDateStr: dateTime };
        }
    };

    const pendingCount = allBookings.filter(b => b.status === 'PENDING').length;

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
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-space font-bold tracking-tight">
                        <span className="text-gradient">Booking Requests</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage and process student booking requests</p>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass rounded-2xl p-2 mb-8 inline-flex gap-2 flex-wrap border border-border"
                >
                    {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ALL'].map((status) => {
                        const count = status === 'ALL' ? allBookings.length : allBookings.filter(b => b.status === status).length;
                        return (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                    filter === status
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-muted-foreground hover:bg-white/10'
                                }`}
                            >
                                {status}
                                {count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                        filter === status ? 'bg-white/20 text-white' : 'bg-white/10 text-muted-foreground'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </motion.div>

                {/* Bookings Table */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="glass-glow rounded-3xl border border-border overflow-hidden"
                >
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5">
                                        <th className="px-4 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Student</th>
                                        <th className="px-4 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Resource</th>
                                        <th className="px-4 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Date & Time</th>
                                        <th className="px-4 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Requested</th>
                                        <th className="px-4 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                        <th className="px-4 py-4 text-sm font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {bookings.map((booking) => {
                                        const bookingTime = formatDateTime(booking.bookingDate);
                                        return (
                                            <motion.tr 
                                                variants={itemVariants}
                                                key={booking.id} 
                                                className="hover:bg-white/5 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold flex-shrink-0 border border-blue-500/20">
                                                            {booking.studentName?.charAt(0).toUpperCase() || 'S'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-foreground text-sm group-hover:text-blue-400 transition-colors">{booking.studentName}</div>
                                                            <div className="text-muted-foreground text-xs">{booking.studentId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-bold text-foreground text-sm">{booking.resourceName}</div>
                                                    <div className="text-muted-foreground text-xs flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {booking.resourceLocation || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="space-y-1">
                                                        {/* Reservation Date */}
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                            <span className="text-sm font-semibold text-foreground">
                                                                {formatDate(booking.reservationDate)}
                                                            </span>
                                                        </div>
                                                        {/* Time Slot */}
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                            </span>
                                                        </div>
                                                        {booking.slotNumber && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                                                Slot {booking.slotNumber}
                                                            </span>
                                                        )}
                                                        {booking.additionalMembers && booking.additionalMembers.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <Users className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">+{booking.additionalMembers.length} members</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <div className="text-sm text-foreground font-medium">
                                                            {bookingTime.relativeTime}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {bookingTime.fullDateStr} at {bookingTime.timeStr}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${getStatusColor(booking.status)}`}>
                                                        {booking.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                                        {booking.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                        {booking.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => handleViewDetails(booking)}
                                                            className="p-2.5 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-blue-500/20"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        {booking.status === 'PENDING' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(booking.id)}
                                                                    className="p-2.5 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-emerald-500/20"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectClick(booking.id)}
                                                                    className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-500/20"
                                                                    title="Reject"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-border">
                                <Calendar className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No {filter.toLowerCase()} bookings</h3>
                            <p className="text-muted-foreground">There are no booking requests with {filter.toLowerCase()} status</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Booking Details Modal */}
            {isDetailsModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-background rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-border glass">
                        <div className="px-8 py-6 bg-white/5 border-b border-border sticky top-0 backdrop-blur-xl z-10">
                            <h2 className="text-2xl font-bold font-space text-foreground tracking-tight">Booking Details</h2>
                            <p className="text-sm text-muted-foreground mt-1">Booking ID: #{selectedBooking.id}</p>
                        </div>
                        
                        <div className="p-8 space-y-5">
                            {/* Student Information */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-border">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Student Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <User className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Name</p>
                                            <p className="font-bold text-foreground">{selectedBooking.studentName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                            <User className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Student ID</p>
                                            <p className="font-mono font-bold text-foreground">{selectedBooking.studentId}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                            <Phone className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Contact</p>
                                            <p className="font-bold text-foreground">{selectedBooking.contactNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Reservation Date & Time - Prominent Section */}
                            <div className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Reservation Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 rounded-xl p-4 border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Calendar className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold">Reservation Date</p>
                                                <p className="text-base font-bold text-foreground">{formatDate(selectedBooking.reservationDate)}</p>
                                                <p className="text-sm text-blue-500 font-semibold">{formatFullDate(selectedBooking.reservationDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/5 rounded-xl p-4 border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                <Clock className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-semibold">Time Slot</p>
                                                <p className="text-base font-bold text-foreground">
                                                    {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                                                </p>
                                                {selectedBooking.slotNumber && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 mt-1">
                                                        Slot {selectedBooking.slotNumber}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Timeline - Request & Status Dates */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-border">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Booking Timeline</h3>
                                <div className="space-y-3">
                                    {/* Request Created */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/20">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Request Submitted</p>
                                            <p className="text-xs text-muted-foreground">
                                                {(() => {
                                                    const t = formatDateTime(selectedBooking.bookingDate);
                                                    return `${t.fullDateStr} at ${t.timeStr} (${t.relativeTime})`;
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Status specific timelines */}
                                    {selectedBooking.status === 'APPROVED' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-500">Approved</p>
                                                <p className="text-xs text-muted-foreground">Booking was approved by administrator</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedBooking.status === 'REJECTED' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-red-500/20">
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-red-500">Rejected</p>
                                                <p className="text-xs text-muted-foreground">Booking was rejected by administrator</p>
                                                {selectedBooking.rejectionReason && (
                                                    <p className="text-xs text-red-500 mt-1 italic">"{selectedBooking.rejectionReason}"</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedBooking.status === 'CANCELLED' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-gray-500/20">
                                                <XCircle className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-400">Cancelled</p>
                                                <p className="text-xs text-muted-foreground">Booking was cancelled by student</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedBooking.status === 'PENDING' && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/20">
                                                <Clock className="w-4 h-4 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-amber-500">Awaiting Review</p>
                                                <p className="text-xs text-muted-foreground">Waiting for administrator approval</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Resource Info */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-border">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Resource Information</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">{selectedBooking.resourceName}</p>
                                        <p className="text-xs text-muted-foreground">{selectedBooking.resourceLocation || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Additional Members */}
                            {selectedBooking.additionalMembers && selectedBooking.additionalMembers.length > 0 && (
                                <div className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
                                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Additional Members ({selectedBooking.additionalMembers.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {selectedBooking.additionalMembers.map((memberId, index) => (
                                            <div key={index} className="bg-white/5 rounded-xl p-3 border border-border">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                                        <User className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Member {index + 1}</p>
                                                        <p className="font-bold text-foreground text-sm">{memberId}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-blue-500 mt-3">
                                        Total members: {selectedBooking.additionalMembers.length + 1} (including creator)
                                    </p>
                                </div>
                            )}
                            
                            {/* Purpose */}
                            <div className="bg-white/5 rounded-2xl p-5 border border-border">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Purpose</h3>
                                <p className="text-foreground bg-white/5 p-4 rounded-xl border border-border">
                                    {selectedBooking.purpose || 'No purpose specified'}
                                </p>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-5 border border-border">
                                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Current Status:</span>
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-black tracking-widest uppercase border ${getStatusColor(selectedBooking.status)}`}>
                                    {selectedBooking.status === 'PENDING' && <Clock className="w-4 h-4 mr-1.5" />}
                                    {selectedBooking.status === 'APPROVED' && <CheckCircle className="w-4 h-4 mr-1.5" />}
                                    {selectedBooking.status === 'REJECTED' && <XCircle className="w-4 h-4 mr-1.5" />}
                                    {selectedBooking.status}
                                </span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-border">
                                {selectedBooking.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedBooking.id);
                                                setIsDetailsModalOpen(false);
                                            }}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-500/20"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Booking
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleRejectClick(selectedBooking.id);
                                                setIsDetailsModalOpen(false);
                                            }}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-500/20"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Booking
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-foreground py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all border border-border"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Rejection Reason Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-background rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-border glass">
                        <div className="px-6 py-5 bg-white/5 border-b border-border">
                            <h2 className="text-xl font-bold font-space text-foreground tracking-tight">Rejection Reason</h2>
                            <p className="text-xs text-muted-foreground mt-1">Optional - Provide a reason for rejection</p>
                        </div>
                        
                        <div className="p-6">
                            <textarea
                                value={rejectionModal.reason}
                                onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="Enter reason for rejection (optional)..."
                                rows="4"
                                className="w-full px-4 py-3 bg-white/5 border border-border rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground"
                            />
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setRejectionModal({ isOpen: false, bookingId: null, reason: '' })}
                                    className="flex-1 px-4 py-2.5 border border-border text-foreground font-semibold rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectConfirm}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors border border-red-500/20"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Confirmation Modal */}
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

export default AdminBookingRequests;