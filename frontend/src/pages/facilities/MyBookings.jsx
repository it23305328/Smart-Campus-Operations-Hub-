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

const MyBookings = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [resourceDetails, setResourceDetails] = useState({});
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
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
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: CheckCheck
            };
        }
        // If booking is currently active
        if (status === 'APPROVED' && isBookingCurrentlyActive(booking)) {
            return {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                icon: CheckCircle
            };
        }
        
        switch (status) {
            case 'PENDING':
                return {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-700',
                    border: 'border-yellow-200',
                    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    icon: Clock
                };
            case 'APPROVED':
                return {
                    bg: 'bg-green-50',
                    text: 'text-green-700',
                    border: 'border-green-200',
                    badge: 'bg-green-100 text-green-700 border-green-200',
                    icon: CheckCircle
                };
            case 'REJECTED':
                return {
                    bg: 'bg-red-50',
                    text: 'text-red-700',
                    border: 'border-red-200',
                    badge: 'bg-red-100 text-red-700 border-red-200',
                    icon: XCircle
                };
            case 'CANCELLED':
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    badge: 'bg-gray-100 text-gray-700 border-gray-200',
                    icon: XCircle
                };
            default:
                return {
                    bg: 'bg-gray-50',
                    text: 'text-gray-700',
                    border: 'border-gray-200',
                    badge: 'bg-gray-100 text-gray-700 border-gray-200',
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
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Upcoming':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Completed':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
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

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Bookings</h1>
                            <p className="text-slate-500 mt-2 font-medium">Manage and track your resource bookings</p>
                        </div>
                        <button onClick={fetchUserBookings} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
                        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{bookings.length}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Now</p>
                            <p className="text-3xl font-black text-emerald-700 mt-1">{activeBookings.length}</p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 shadow-sm">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Upcoming</p>
                            <p className="text-3xl font-black text-blue-700 mt-1">{upcomingBookings.length}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Completed</p>
                            <p className="text-3xl font-black text-indigo-700 mt-1">{completedBookings.length}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 shadow-sm">
                            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Pending</p>
                            <p className="text-3xl font-black text-yellow-700 mt-1">{pendingBookings.length}</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2 flex-wrap">
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
                                className={`px-5 py-3 rounded-xl font-bold transition-all ${filter === tab.key ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                                {tab.label}
                                {count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.key ? 'bg-white text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>{count}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                            const statusStyle = getStatusColor(booking.status, booking);
                            const StatusIcon = statusStyle.icon;
                            const stateLabel = getBookingStateLabel(booking);
                            const stateBadge = getBookingStateBadge(booking);
                            const isCompleted = isBookingCompleted(booking);
                            const isActive = isBookingCurrentlyActive(booking);
                            
                            return (
                                <div key={booking.id} className={`bg-white rounded-3xl border ${statusStyle.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}>
                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                                        {booking.resourceName?.charAt(0).toUpperCase() || 'R'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-xl font-bold text-slate-800">{booking.resourceName}</h3>
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
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">Slot {booking.slotNumber}</span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Date and Time */}
                                                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                        <Calendar className="w-4 h-4 text-blue-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-slate-500 font-medium">Date</p>
                                                                        <p className="text-sm font-bold text-slate-800">{formatFullDate(booking.reservationDate)}</p>
                                                                        <p className="text-xs text-blue-600 font-semibold">{formatDate(booking.reservationDate)}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                                        <Clock className="w-4 h-4 text-indigo-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs text-slate-500 font-medium">Time</p>
                                                                        <p className="text-sm font-bold text-slate-800">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                                                        {booking.slotNumber && <p className="text-xs text-indigo-600 font-semibold">Meeting Room - Slot {booking.slotNumber}</p>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                                                            <MapPin className="w-3.5 h-3.5" /> {booking.resourceLocation || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                                                            <Calendar className="w-3 h-3" /> Booked on {formatDateTime(booking.bookingDate)}
                                                        </div>
                                                        {booking.purpose && (
                                                            <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-2"><span className="font-semibold">Purpose:</span> {booking.purpose}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                                                <button onClick={() => handleViewDetails(booking)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all text-sm">
                                                    <Eye className="w-4 h-4" /> Details
                                                </button>
                                                
                                                {booking.status === 'PENDING' && (
                                                    <button onClick={() => handleCancelRequest(booking)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 text-white font-semibold rounded-xl hover:bg-yellow-700 transition-all text-sm">
                                                        <XCircle className="w-4 h-4" /> Revert
                                                    </button>
                                                )}
                                                
                                                {booking.status === 'APPROVED' && !isCompleted && (
                                                    <button onClick={() => handleCancelApprovedBooking(booking)} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm">
                                                        <XCircle className="w-4 h-4" /> Cancel
                                                    </button>
                                                )}
                                                
                                                <button onClick={handleNavigateToFacility} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-indigo-300 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all text-sm">
                                                    View Resources <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 py-20 text-center">
                        <div className="w-24 h-24 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Calendar className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">No bookings found</h3>
                        <p className="text-slate-500 mb-6 max-w-md mx-auto">
                            {filter === 'ALL' ? "You haven't made any bookings yet." : `No ${filter.toLowerCase()} bookings.`}
                        </p>
                        <button onClick={() => navigate('/facilities')} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg">
                            Browse Resources <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Currently Active Bookings */}
                {activeBookings.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                            Currently Active
                            <span className="text-sm font-normal text-slate-500 ml-2">({activeBookings.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeBookings.map((booking) => (
                                <div key={booking.id} className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-300 cursor-pointer hover:shadow-lg transition-all animate-pulse" onClick={() => handleViewDetails(booking)}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-200 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-emerald-700" />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full">IN PROGRESS</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800">{booking.resourceName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-emerald-700 mt-2">
                                        <Calendar className="w-3.5 h-3.5" /> <span className="font-semibold">{formatDate(booking.reservationDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-emerald-700 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                                        <MapPin className="w-3 h-3" /> {booking.resourceLocation || 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Upcoming Bookings */}
                {upcomingBookings.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-blue-600" />
                            Upcoming Bookings
                            <span className="text-sm font-normal text-slate-500 ml-2">({upcomingBookings.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {upcomingBookings.map((booking) => (
                                <div key={booking.id} className="bg-blue-50 rounded-2xl p-5 border border-blue-200 cursor-pointer hover:shadow-lg transition-all" onClick={() => handleViewDetails(booking)}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">UPCOMING</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800">{booking.resourceName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-blue-700 mt-2">
                                        <Calendar className="w-3.5 h-3.5" /> <span className="font-semibold">{formatDate(booking.reservationDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-blue-700 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                        <MapPin className="w-3 h-3" /> {booking.resourceLocation || 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Bookings */}
                {completedBookings.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <History className="w-6 h-6 text-indigo-600" />
                            Completed Bookings
                            <span className="text-sm font-normal text-slate-500 ml-2">({completedBookings.length})</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedBookings.map((booking) => (
                                <div key={booking.id} className="bg-indigo-50 rounded-2xl p-5 border border-indigo-200 cursor-pointer hover:shadow-lg transition-all opacity-75" onClick={() => handleViewDetails(booking)}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <CheckCheck className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">COMPLETED</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800">{booking.resourceName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-indigo-700 mt-2">
                                        <Calendar className="w-3.5 h-3.5" /> <span className="font-semibold">{formatDate(booking.reservationDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-indigo-700 mt-1">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-indigo-600 mt-1">
                                        <MapPin className="w-3 h-3" /> {booking.resourceLocation || 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {isDetailsModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100 sticky top-0 z-10 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details</h2>
                                <p className="text-sm text-slate-500 mt-1">Booking #{selectedBooking.id}</p>
                            </div>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-5">
                            {/* Status Banner */}
                            <div className={`${getStatusColor(selectedBooking.status, selectedBooking).bg} rounded-2xl p-5 border ${getStatusColor(selectedBooking.status, selectedBooking).border}`}>
                                <div className="flex items-center gap-3">
                                    {React.createElement(getStatusColor(selectedBooking.status, selectedBooking).icon, { className: "w-8 h-8" })}
                                    <div>
                                        <p className={`text-lg font-black ${getStatusColor(selectedBooking.status, selectedBooking).text}`}>
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
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-4">Reservation Date & Time</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-600" /></div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold uppercase">Date</p>
                                                <p className="text-lg font-black text-slate-800">{formatDate(selectedBooking.reservationDate)}</p>
                                                <p className="text-sm text-blue-600 font-semibold">{formatFullDate(selectedBooking.reservationDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center"><Clock className="w-6 h-6 text-indigo-600" /></div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-semibold uppercase">Time Slot</p>
                                                <p className="text-lg font-black text-slate-800">{formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
                                                {selectedBooking.slotNumber && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mt-1">Meeting Room - Slot {selectedBooking.slotNumber}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Resource Info */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Resource Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><p className="text-xs text-slate-500 font-semibold">Resource</p><p className="font-bold text-slate-800 text-lg">{selectedBooking.resourceName}</p><p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedBooking.resourceLocation || 'N/A'}</p></div>
                                    <div><p className="text-xs text-slate-500 font-semibold">Contact</p><p className="font-bold text-slate-800">{selectedBooking.contactNumber}</p></div>
                                    <div><p className="text-xs text-slate-500 font-semibold">Booked On</p><p className="font-bold text-slate-800">{formatDateTime(selectedBooking.bookingDate)}</p></div>
                                </div>
                            </div>
                            
                            {selectedBooking.purpose && (
                                <div className="bg-slate-50 rounded-2xl p-5"><h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Purpose</h3><p className="text-slate-800">{selectedBooking.purpose}</p></div>
                            )}
                            
                            {selectedBooking.rejectionReason && (
                                <div className="bg-red-50 rounded-2xl p-5 border border-red-200"><h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-3">Rejection Reason</h3><p className="text-red-700">{selectedBooking.rejectionReason}</p></div>
                            )}
                            
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                {selectedBooking.status === 'PENDING' && (
                                    <button onClick={() => { handleCancelRequest(selectedBooking); setIsDetailsModalOpen(false); }} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all">Cancel Request</button>
                                )}
                                {selectedBooking.status === 'APPROVED' && !isBookingCompleted(selectedBooking) && (
                                    <button onClick={() => { handleCancelApprovedBooking(selectedBooking); setIsDetailsModalOpen(false); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all">Cancel Booking</button>
                                )}
                                <button onClick={() => setIsDetailsModalOpen(false)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all">Close</button>
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