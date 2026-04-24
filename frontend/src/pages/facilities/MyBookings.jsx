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
    Filter
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
    
    // Confirmation Modal States
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

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            const studentId = String(currentUser.id);
            const data = await bookingService.getUserBookings(studentId);
            
            // Sort bookings by date (newest first)
            const sortedBookings = (data || []).sort((a, b) => {
                return new Date(b.bookingDate) - new Date(a.bookingDate);
            });
            
            setBookings(sortedBookings);
            
            // Fetch resource details for each booking
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
        if (filter === 'ALL') return bookings;
        return bookings.filter(booking => booking.status === filter);
    };

    const filteredBookings = getFilteredBookings();

    const getStatusColor = (status) => {
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

    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        try {
            const date = new Date(dateTime);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            let dateStr;
            if (diffDays === 0) {
                dateStr = 'Today';
            } else if (diffDays === 1) {
                dateStr = 'Yesterday';
            } else if (diffDays < 7) {
                dateStr = `${diffDays} days ago`;
            } else {
                dateStr = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            }
            
            const timeStr = date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `${dateStr} at ${timeStr}`;
        } catch (e) {
            return dateTime;
        }
    };

    const handleCancelRequest = (booking) => {
        showConfirmation(
            'Cancel Booking Request',
            'Are you sure you want to cancel this booking request? This action cannot be undone.',
            'Yes, Cancel Request',
            'warning',
            async () => {
                try {
                    await bookingService.cancelBooking(booking.id, String(currentUser.id));
                    fetchUserBookings();
                    
                    showConfirmation(
                        'Request Cancelled',
                        'Your booking request has been successfully cancelled.',
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

    const handleCancelApprovedBooking = (booking) => {
        showConfirmation(
            'Cancel Booking',
            'Are you sure you want to cancel this confirmed booking? This will free up the slot for others.',
            'Yes, Cancel Booking',
            'danger',
            async () => {
                try {
                    await bookingService.cancelBooking(booking.id, String(currentUser.id));
                    fetchUserBookings();
                    
                    showConfirmation(
                        'Booking Cancelled',
                        'Your booking has been successfully cancelled.',
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

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };

    const handleNavigateToFacility = (resourceId) => {
        navigate(`/facilities`);
    };

    const getStatusCount = (status) => {
        return bookings.filter(b => b.status === status).length;
    };

    const ongoingBookings = bookings.filter(b => b.status === 'APPROVED');
    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    const pastBookings = bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED');

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Bookings</h1>
                            <p className="text-slate-500 mt-2 font-medium">
                                Manage and track your resource bookings
                            </p>
                        </div>
                        <button
                            onClick={fetchUserBookings}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                            <p className="text-3xl font-black text-slate-800 mt-1">{bookings.length}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100 shadow-sm">
                            <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Pending</p>
                            <p className="text-3xl font-black text-yellow-700 mt-1">{getStatusCount('PENDING')}</p>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-4 border border-green-100 shadow-sm">
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Approved</p>
                            <p className="text-3xl font-black text-green-700 mt-1">{getStatusCount('APPROVED')}</p>
                        </div>
                        <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Past</p>
                            <p className="text-3xl font-black text-slate-600 mt-1">{getStatusCount('REJECTED') + getStatusCount('CANCELLED')}</p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2 flex-wrap">
                    {[
                        { key: 'ALL', label: 'All Bookings' },
                        { key: 'APPROVED', label: 'Ongoing' },
                        { key: 'PENDING', label: 'Pending' },
                        { key: 'REJECTED', label: 'Rejected' },
                        { key: 'CANCELLED', label: 'Cancelled' }
                    ].map((tab) => {
                        const count = tab.key === 'ALL' ? bookings.length : getStatusCount(tab.key);
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-5 py-3 rounded-xl font-bold transition-all ${
                                    filter === tab.key
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                        filter === tab.key 
                                            ? 'bg-white text-indigo-600' 
                                            : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {count}
                                    </span>
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
                            const statusStyle = getStatusColor(booking.status);
                            const StatusIcon = statusStyle.icon;
                            const resource = resourceDetails[booking.resourceId];
                            
                            return (
                                <div 
                                    key={booking.id} 
                                    className={`bg-white rounded-3xl border ${statusStyle.border} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                                            {/* Resource Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                                                        {booking.resourceName?.charAt(0).toUpperCase() || 'R'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="text-xl font-bold text-slate-800">
                                                                {booking.resourceName}
                                                            </h3>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${statusStyle.badge}`}>
                                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                                {booking.status}
                                                            </span>
                                                            {booking.slotNumber && (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                                                                    Slot {booking.slotNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {booking.resourceLocation || 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                                            <Calendar className="w-3 h-3" />
                                                            Booked {formatDateTime(booking.bookingDate)}
                                                        </div>
                                                        
                                                        {booking.purpose && (
                                                            <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-lg p-2">
                                                                <span className="font-semibold">Purpose:</span> {booking.purpose}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-2 lg:flex-col lg:items-stretch">
                                                <button
                                                    onClick={() => handleViewDetails(booking)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all text-sm"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Details
                                                </button>
                                                
                                                {booking.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleCancelRequest(booking)}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-600 text-white font-semibold rounded-xl hover:bg-yellow-700 transition-all text-sm"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Revert Request
                                                    </button>
                                                )}
                                                
                                                {booking.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleCancelApprovedBooking(booking)}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all text-sm"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Cancel Booking
                                                    </button>
                                                )}
                                                
                                                {booking.status === 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleNavigateToFacility(booking.resourceId)}
                                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all text-sm"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                        Book Again
                                                    </button>
                                                )}
                                                
                                                <button
                                                    onClick={() => handleNavigateToFacility(booking.resourceId)}
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 border border-indigo-300 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all text-sm"
                                                >
                                                    View Resource
                                                    <ArrowRight className="w-4 h-4" />
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
                            {filter === 'ALL' 
                                ? "You haven't made any bookings yet. Start by browsing available resources."
                                : `You don't have any ${filter.toLowerCase()} bookings.`}
                        </p>
                        <button
                            onClick={() => navigate('/facilities')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
                        >
                            Browse Resources
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Ongoing & Upcoming Bookings Section */}
                {ongoingBookings.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            Ongoing Bookings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {ongoingBookings.map((booking) => (
                                <div 
                                    key={booking.id}
                                    className="bg-green-50 rounded-2xl p-5 border border-green-200 cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => handleViewDetails(booking)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                            ACTIVE
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-800">{booking.resourceName}</h3>
                                    <div className="flex items-center gap-1 text-sm text-green-700 mt-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                        <MapPin className="w-3 h-3" />
                                        {booking.resourceLocation || 'N/A'}
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
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-5">
                            {/* Status Banner */}
                            <div className={`${getStatusColor(selectedBooking.status).bg} rounded-2xl p-5 border ${getStatusColor(selectedBooking.status).border}`}>
                                <div className="flex items-center gap-3">
                                    {React.createElement(getStatusColor(selectedBooking.status).icon, { className: "w-8 h-8" })}
                                    <div>
                                        <p className={`text-lg font-black ${getStatusColor(selectedBooking.status).text}`}>
                                            {selectedBooking.status === 'APPROVED' && 'Booking Confirmed'}
                                            {selectedBooking.status === 'PENDING' && 'Awaiting Approval'}
                                            {selectedBooking.status === 'REJECTED' && 'Booking Rejected'}
                                            {selectedBooking.status === 'CANCELLED' && 'Booking Cancelled'}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {selectedBooking.status === 'APPROVED' && 'Your booking has been approved. The resource is reserved for you.'}
                                            {selectedBooking.status === 'PENDING' && 'Your booking request is being reviewed by an administrator.'}
                                            {selectedBooking.status === 'REJECTED' && 'Your booking request was not approved.'}
                                            {selectedBooking.status === 'CANCELLED' && 'This booking has been cancelled.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Resource & Time */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Booking Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">Resource</p>
                                        <p className="font-bold text-slate-800 text-lg">{selectedBooking.resourceName}</p>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {selectedBooking.resourceLocation || 'N/A'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">Time Slot</p>
                                        <p className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-indigo-600" />
                                            {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                                        </p>
                                        {selectedBooking.slotNumber && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mt-1">
                                                Meeting Room - Slot {selectedBooking.slotNumber}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">Booking Date</p>
                                        <p className="font-bold text-slate-800">{formatDateTime(selectedBooking.bookingDate)}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold">Contact</p>
                                        <p className="font-bold text-slate-800">{selectedBooking.contactNumber}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Purpose */}
                            {selectedBooking.purpose && (
                                <div className="bg-slate-50 rounded-2xl p-5">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Purpose</h3>
                                    <p className="text-slate-800">{selectedBooking.purpose}</p>
                                </div>
                            )}
                            
                            {/* Rejection Reason */}
                            {selectedBooking.rejectionReason && (
                                <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                                    <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-3">Rejection Reason</h3>
                                    <p className="text-red-700">{selectedBooking.rejectionReason}</p>
                                </div>
                            )}
                            
                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                {selectedBooking.status === 'APPROVED' && (
                                    <button
                                        onClick={() => {
                                            handleCancelApprovedBooking(selectedBooking);
                                            setIsDetailsModalOpen(false);
                                        }}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                                {selectedBooking.status === 'PENDING' && (
                                    <button
                                        onClick={() => {
                                            handleCancelRequest(selectedBooking);
                                            setIsDetailsModalOpen(false);
                                        }}
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                                    >
                                        Cancel Request
                                    </button>
                                )}
                                {selectedBooking.status === 'REJECTED' && (
                                    <button
                                        onClick={() => {
                                            handleNavigateToFacility(selectedBooking.resourceId);
                                            setIsDetailsModalOpen(false);
                                        }}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all"
                                    >
                                        Book Again
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all"
                                >
                                    Close
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

export default MyBookings;