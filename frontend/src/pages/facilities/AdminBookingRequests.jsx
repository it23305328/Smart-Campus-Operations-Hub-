// AdminBookingRequests.jsx
import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import { CheckCircle, XCircle, Eye, Clock, User, Phone, Calendar, MapPin, Users } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

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
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'APPROVED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'CANCELLED':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        try {
            // Handle different time formats
            if (typeof time === 'string') {
                // If time is like "11:00:00", format to "11:00 AM"
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
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (e) {
            return dateTime;
        }
    };

    const pendingCount = allBookings.filter(b => b.status === 'PENDING').length;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Booking Requests</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and process student booking requests</p>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 inline-flex gap-2 flex-wrap">
                    {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ALL'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                filter === status
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {status}
                            {status === 'PENDING' && pendingCount > 0 && (
                                <span className="ml-2 bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50">
                                        <th className="px-6 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                        <th className="px-6 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Resource</th>
                                        <th className="px-6 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Time Slot</th>
                                        <th className="px-6 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Date & Purpose</th>
                                        <th className="px-6 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-6 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50/80">
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                        {booking.studentName?.charAt(0).toUpperCase() || 'S'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">{booking.studentName}</div>
                                                        <div className="text-slate-400 text-xs">{booking.studentId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-slate-800 text-sm">{booking.resourceName}</div>
                                                <div className="text-slate-400 text-xs flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {booking.resourceLocation || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                        <Clock className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800 text-sm">
                                                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                        </div>
                                                        {booking.slotNumber && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mt-0.5">
                                                                Slot {booking.slotNumber}
                                                            </span>
                                                        )}
                                                        {booking.additionalMembers && booking.additionalMembers.length > 0 && (
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <Users className="w-3 h-3 text-slate-400" />
                                                                <span className="text-xs text-slate-500">
                                                                    +{booking.additionalMembers.length} members
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-slate-800 text-sm flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {formatDateTime(booking.bookingDate)}
                                                </div>
                                                <div className="text-slate-500 text-xs mt-1 max-w-[200px] truncate">
                                                    {booking.purpose || 'No purpose specified'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${getStatusColor(booking.status)}`}>
                                                    {booking.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                                    {booking.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                    {booking.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleViewDetails(booking)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {booking.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(booking.id)}
                                                                className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all active:scale-90"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleRejectClick(booking.id)}
                                                                className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                                                title="Reject"
                                                            >
                                                                <XCircle className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Calendar className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-700 mb-2">No {filter.toLowerCase()} bookings</h3>
                            <p className="text-slate-500">There are no booking requests with {filter.toLowerCase()} status</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Details Modal */}
            {isDetailsModalOpen && selectedBooking && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100 sticky top-0 z-10">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Details</h2>
                            <p className="text-sm text-slate-500 mt-1">Booking ID: #{selectedBooking.id}</p>
                        </div>
                        
                        <div className="p-8 space-y-5">
                            {/* Student Information */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Student Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Name</p>
                                            <p className="font-bold text-slate-800">{selectedBooking.studentName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Student ID</p>
                                            <p className="font-mono font-bold text-slate-800">{selectedBooking.studentId}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Contact</p>
                                            <p className="font-bold text-slate-800">{selectedBooking.contactNumber}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Resource & Time Information */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Booking Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Resource</p>
                                            <p className="font-bold text-slate-800">{selectedBooking.resourceName}</p>
                                            <p className="text-xs text-slate-500">{selectedBooking.resourceLocation || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Booking Date</p>
                                            <p className="font-bold text-slate-800">{formatDateTime(selectedBooking.bookingDate)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 md:col-span-2">
                                        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Time Slot</p>
                                            <p className="font-bold text-slate-800 text-lg">
                                                {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                                            </p>
                                            {selectedBooking.slotNumber && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 mt-1">
                                                    Meeting Room - Slot {selectedBooking.slotNumber}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Additional Members (for Meeting Rooms) */}
                            {selectedBooking.additionalMembers && selectedBooking.additionalMembers.length > 0 && (
                                <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Additional Members ({selectedBooking.additionalMembers.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {selectedBooking.additionalMembers.map((memberId, index) => (
                                            <div key={index} className="bg-white rounded-xl p-3 border border-indigo-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Member {index + 1}</p>
                                                        <p className="font-bold text-slate-800 text-sm">{memberId}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-indigo-600 mt-3">
                                        Total members: {selectedBooking.additionalMembers.length + 1} (including creator)
                                    </p>
                                </div>
                            )}
                            
                            {/* Purpose */}
                            <div className="bg-slate-50 rounded-2xl p-5">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Purpose</h3>
                                <p className="text-slate-800 bg-white p-4 rounded-xl border border-slate-100">
                                    {selectedBooking.purpose || 'No purpose specified'}
                                </p>
                            </div>
                            
                            {/* Status */}
                            <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-5">
                                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Status:</span>
                                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-black tracking-widest uppercase border ${getStatusColor(selectedBooking.status)}`}>
                                    {selectedBooking.status === 'PENDING' && <Clock className="w-4 h-4 mr-1.5" />}
                                    {selectedBooking.status === 'APPROVED' && <CheckCircle className="w-4 h-4 mr-1.5" />}
                                    {selectedBooking.status === 'REJECTED' && <XCircle className="w-4 h-4 mr-1.5" />}
                                    {selectedBooking.status}
                                </span>
                            </div>
                            
                            {/* Rejection Reason */}
                            {selectedBooking.rejectionReason && (
                                <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                                    <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-3">Rejection Reason</h3>
                                    <p className="text-red-700">{selectedBooking.rejectionReason}</p>
                                </div>
                            )}
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                {selectedBooking.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedBooking.id);
                                                setIsDetailsModalOpen(false);
                                            }}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Booking
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleRejectClick(selectedBooking.id);
                                                setIsDetailsModalOpen(false);
                                            }}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Booking
                                        </button>
                                    </>
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
            
            {/* Rejection Reason Modal */}
            {rejectionModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-3xl overflow-hidden">
                        <div className="px-6 py-5 bg-gradient-to-r from-red-50 to-rose-50 border-b border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Rejection Reason</h2>
                            <p className="text-xs text-slate-500 mt-1">Optional - Provide a reason for rejection</p>
                        </div>
                        
                        <div className="p-6">
                            <textarea
                                value={rejectionModal.reason}
                                onChange={(e) => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="Enter reason for rejection (optional)..."
                                rows="4"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none"
                            />
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setRejectionModal({ isOpen: false, bookingId: null, reason: '' })}
                                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRejectConfirm}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
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