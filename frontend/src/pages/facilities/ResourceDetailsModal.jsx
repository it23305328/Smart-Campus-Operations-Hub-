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
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <div className="relative bg-background rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden transform transition-all border border-border glass">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-white/5 sticky top-0 backdrop-blur-xl z-10">
                    <div>
                        <h2 className="text-2xl font-bold font-space text-foreground">Resource Details</h2>
                        <p className="text-sm text-muted-foreground mt-1">{resource.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
                
                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6 space-y-6">
                        {/* Resource Information */}
                        <div className="bg-white/5 rounded-xl p-5 border border-border">
                            <h3 className="text-lg font-bold text-foreground mb-4">Resource Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <MapPin className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Location</p>
                                        <p className="text-sm font-bold text-foreground">{resource.location || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        <Users className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Capacity</p>
                                        <p className="text-sm font-bold text-foreground">
                                            {resource.capacity || 'N/A'}
                                            {resource.capacity && userRole === 'ADMIN' && (
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    ({bookings.length} booked)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Type</p>
                                        <p className="text-sm font-bold text-foreground">{resource.type.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                        <div className={`w-3 h-3 rounded-full ${resource.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</p>
                                        <p className={`text-sm font-bold ${resource.status === 'ACTIVE' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {resource.status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Booked Students List - Only visible to Admin */}
                        {userRole === 'ADMIN' && (
                            <div className="bg-white/5 rounded-xl border border-border overflow-hidden">
                                <div className="px-5 py-4 bg-white/5 border-b border-border">
                                    <h3 className="text-lg font-bold text-foreground">Booked Students</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
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
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="divide-y divide-border">
                                        {bookings.map((booking) => (
                                            <div key={booking.id} className="px-5 py-4 hover:bg-white/5 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-lg border border-blue-500/20">
                                                            {booking.studentName?.charAt(0).toUpperCase() || 'S'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-foreground">{booking.studentName}</p>
                                                            <div className="flex items-center space-x-4 mt-1">
                                                                <div className="flex items-center text-xs text-muted-foreground">
                                                                    <User className="w-3 h-3 mr-1" />
                                                                    <span className="font-mono">{booking.studentId}</span>
                                                                </div>
                                                                <div className="flex items-center text-xs text-muted-foreground">
                                                                    <Phone className="w-3 h-3 mr-1" />
                                                                    <span>{booking.contactNumber}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
                                                            <Clock className="w-3 h-3 mr-1" />
                                                            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {booking.purpose && (
                                                    <div className="mt-3 ml-16">
                                                        <p className="text-xs text-muted-foreground">
                                                            <span className="font-semibold">Purpose:</span> {booking.purpose}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center">
                                        <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-3 border border-border">
                                            <Users className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground font-medium">No students have booked this resource yet</p>
                                        <p className="text-xs text-muted-foreground mt-1">Approved bookings will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* User Message - Only visible to regular users */}
                        {userRole === 'USER' && (
                            <div className="bg-blue-500/5 rounded-xl p-6 border border-blue-500/20">
                                <div className="text-center">
                                    <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                                    <h4 className="text-lg font-bold text-foreground mb-2">Ready to Book?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        This resource is available for booking. Click the "Book Now" button on the resource card to make a reservation.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="px-6 py-4 bg-white/5 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors border border-blue-500/20"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResourceDetailsModal;