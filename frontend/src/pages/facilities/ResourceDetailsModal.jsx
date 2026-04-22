// ResourceDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { X, MapPin, Users, Calendar, User, Phone, Clock } from 'lucide-react';
import bookingService from '../../services/bookingService';

const ResourceDetailsModal = ({ isOpen, onClose, resource, userRole = 'USER' }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && resource) {
            if (userRole === 'ADMIN') {
                fetchBookings();
            } else {
                setLoading(false);
            }
        }
    }, [isOpen, resource, userRole]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getBookingsByResourceId(resource.id);
            // Filter to show only approved bookings for capacity tracking
            const approvedBookings = data.filter(b => b.status === 'APPROVED');
            setBookings(approvedBookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !resource) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Resource Details</h2>
                        <p className="text-sm text-slate-500 mt-1">{resource.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6 space-y-6">
                        {/* Resource Information */}
                        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Resource Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Location</p>
                                        <p className="text-sm font-bold text-slate-800">{resource.location || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Capacity</p>
                                        <p className="text-sm font-bold text-slate-800">
                                            {resource.capacity || 'N/A'}
                                            {resource.capacity && userRole === 'ADMIN' && (
                                                <span className="text-xs text-slate-500 ml-1">
                                                    ({bookings.length} booked)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Type</p>
                                        <p className="text-sm font-bold text-slate-800">{resource.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <div className={`w-3 h-3 rounded-full ${resource.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Status</p>
                                        <p className={`text-sm font-bold ${resource.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {resource.status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Booked Students List - Only visible to Admin */}
                        {userRole === 'ADMIN' && (
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                                    <h3 className="text-lg font-bold text-slate-800">Booked Students</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Students who have successfully booked this resource
                                        {resource.capacity && (
                                            <span className="ml-1">
                                                ({bookings.length} of {resource.capacity} capacity used)
                                            </span>
                                        )}
                                    </p>
                                </div>
                                
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="divide-y divide-slate-100">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                            {booking.studentName?.charAt(0).toUpperCase() || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{booking.studentName}</p>
                                                            <div className="flex items-center space-x-4 mt-1">
                                                                <div className="flex items-center text-xs text-slate-500">
                                                                    <User className="w-3 h-3 mr-1" />
                                                                    <span className="font-mono">{booking.studentId}</span>
                                                                </div>
                                                                <div className="flex items-center text-xs text-slate-500">
                                                                    <Phone className="w-3 h-3 mr-1" />
                                                                    <span>{booking.contactNumber}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center justify-end mt-2 text-xs text-slate-400">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {booking.purpose && (
                                                    <div className="mt-3 ml-16">
                                                        <p className="text-xs text-slate-500">
                                                            <span className="font-semibold">Purpose:</span> {booking.purpose}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                            <Users className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 font-medium">No students have booked this resource yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Approved bookings will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* User Message - Only visible to regular users */}
                        {userRole === 'USER' && (
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <div className="text-center">
                                    <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                                    <h4 className="text-lg font-bold text-slate-800 mb-2">Ready to Book?</h4>
                                    <p className="text-sm text-slate-600">
                                        This resource is available for booking. Click the "Book Now" button on the resource card to make a reservation.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailsModal;