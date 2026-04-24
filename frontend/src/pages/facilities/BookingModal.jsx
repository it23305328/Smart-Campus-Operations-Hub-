// BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Phone, FileText, AlertCircle, Clock, Users } from 'lucide-react';
import bookingService from '../../services/bookingService';
import ConfirmationModal from './ConfirmationModal';
import TimeSlotPicker from './TimeSlotPicker';

const BookingModal = ({ isOpen, onClose, resource, onSuccess }) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    const [formData, setFormData] = useState({
        studentId: String(currentUser.id || ''),
        studentName: String(currentUser.name || ''),
        contactNumber: '',
        purpose: '',
        startTime: '',
        endTime: '',
        slotNumber: null,
        additionalMembers: ['', '', '', '']
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    
    const [confirmationModal, setConfirmationModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'OK',
        type: 'info',
        onConfirm: () => {}
    });

    useEffect(() => {
        if (isOpen && resource) {
            fetchBookedSlots();
            setFormData({
                studentId: String(currentUser.id || ''),
                studentName: String(currentUser.name || ''),
                contactNumber: '',
                purpose: '',
                startTime: '',
                endTime: '',
                slotNumber: null,
                additionalMembers: ['', '', '', '']
            });
            setErrors({});
            setSubmitError('');
        }
    }, [isOpen, resource]);

    const fetchBookedSlots = async () => {
        if (!resource || !resource.id) return;
        
        try {
            const bookings = await bookingService.getBookingsByResourceId(resource.id);
            const approvedAndPending = (bookings || []).filter(b => 
                b && (b.status === 'APPROVED' || b.status === 'PENDING')
            );
            
            const slots = approvedAndPending.map(b => ({
                startTime: b.startTime || '',
                endTime: b.endTime || '',
                slotNumber: b.slotNumber || null
            }));
            
            setBookedSlots(slots);
        } catch (error) {
            console.error('Error fetching booked slots:', error);
            setBookedSlots([]);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        const studentId = String(formData.studentId || '');
        const studentName = String(formData.studentName || '');
        const contactNumber = String(formData.contactNumber || '');
        
        if (!studentId.trim()) {
            newErrors.studentId = 'Student ID is required';
        }
        
        if (!studentName.trim()) {
            newErrors.studentName = 'Student name is required';
        }
        
        if (!contactNumber.trim()) {
            newErrors.contactNumber = 'Contact number is required';
        } else if (!/^[0-9]{10}$/.test(contactNumber)) {
            newErrors.contactNumber = 'Contact number must be 10 digits';
        }
        
        const isMeetingRoom = resource && (resource.hasSlots === true || resource.type === 'MEETING_ROOM');
        
        if (isMeetingRoom) {
            if (!formData.slotNumber) {
                newErrors.timeSlot = 'Please select a time slot';
            }
            
            formData.additionalMembers.forEach((member, index) => {
                if (!member || !member.trim()) {
                    newErrors[`member${index}`] = `Member ${index + 1} ID is required`;
                } else if (member.trim() === studentId.trim()) {
                    newErrors[`member${index}`] = 'Cannot add yourself as additional member';
                }
            });
            
            const memberIds = formData.additionalMembers.filter(m => m && m.trim());
            const uniqueIds = new Set(memberIds);
            if (memberIds.length !== uniqueIds.size) {
                newErrors.members = 'Duplicate member IDs are not allowed';
            }
            
            if (memberIds.includes(studentId.trim())) {
                newErrors.members = 'Cannot include yourself in additional members';
            }
        } else {
            if (!formData.startTime || !formData.endTime) {
                newErrors.timeSlot = 'Please select a time period';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleMemberChange = (index, value) => {
        const newMembers = [...formData.additionalMembers];
        newMembers[index] = value;
        setFormData(prev => ({
            ...prev,
            additionalMembers: newMembers
        }));
        if (errors[`member${index}`]) {
            setErrors(prev => ({
                ...prev,
                [`member${index}`]: ''
            }));
        }
        if (errors.members) {
            setErrors(prev => ({
                ...prev,
                members: ''
            }));
        }
    };

    const handleTimeSelect = (startTime, endTime) => {
        setFormData(prev => ({
            ...prev,
            startTime,
            endTime,
            slotNumber: null
        }));
        if (errors.timeSlot) {
            setErrors(prev => ({ ...prev, timeSlot: '' }));
        }
    };

    const handleSlotSelect = (slotNumber, startTime, endTime) => {
        setFormData(prev => ({
            ...prev,
            slotNumber,
            startTime,
            endTime
        }));
        if (errors.timeSlot) {
            setErrors(prev => ({ ...prev, timeSlot: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const isMeetingRoom = resource && (resource.hasSlots === true || resource.type === 'MEETING_ROOM');
            
            const bookingData = {
                studentId: String(currentUser.id),
                studentName: String(currentUser.name),
                contactNumber: formData.contactNumber,
                resourceId: resource.id,
                purpose: formData.purpose || '',
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotNumber: isMeetingRoom ? formData.slotNumber : null,
                additionalMembers: isMeetingRoom ? formData.additionalMembers.filter(m => m && m.trim()) : null
            };
            
            const response = await bookingService.createBooking(bookingData);
            
            if (onSuccess) {
                onSuccess(response);
            }
            
            handleClose();
        } catch (error) {
            console.error('Booking error:', error);
            let errorMessage = 'Failed to book resource. Please try again.';
            
            if (error && error.message) {
                errorMessage = error.message;
            } else if (error && error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            }
            
            setSubmitError(errorMessage);
            
            setConfirmationModal({
                isOpen: true,
                title: 'Booking Failed',
                message: errorMessage,
                confirmText: 'OK',
                type: 'danger',
                onConfirm: () => {}
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            studentId: String(currentUser.id || ''),
            studentName: String(currentUser.name || ''),
            contactNumber: '',
            purpose: '',
            startTime: '',
            endTime: '',
            slotNumber: null,
            additionalMembers: ['', '', '', '']
        });
        setErrors({});
        setSubmitError('');
        onClose();
    };

    if (!isOpen || !resource) return null;

    const isMeetingRoom = resource && (resource.hasSlots === true || resource.type === 'MEETING_ROOM');
    const availableFrom = resource.availableFrom || (isMeetingRoom ? '09:00' : '08:00');
    const availableTo = resource.availableTo || (isMeetingRoom ? '19:00' : '20:00');

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                />
                
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Book Resource</h2>
                            <p className="text-xs text-slate-500 mt-0.5">{resource.name}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Student ID <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        readOnly
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg outline-none text-slate-600"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="studentName"
                                        value={formData.studentName}
                                        readOnly
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg outline-none text-slate-600"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                    className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                                        errors.contactNumber ? 'border-red-500' : 'border-slate-200'
                                    }`}
                                />
                            </div>
                            {errors.contactNumber && (
                                <p className="text-red-500 text-xs mt-0.5">{errors.contactNumber}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Purpose (Optional)
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <textarea
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleChange}
                                    placeholder="Describe the purpose of booking..."
                                    rows="2"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                        
                        {/* Time Slot Picker */}
                        <TimeSlotPicker
                            availableFrom={availableFrom}
                            availableTo={availableTo}
                            hasSlots={isMeetingRoom}
                            slotDuration={isMeetingRoom ? 120 : 60}
                            selectedStartTime={formData.startTime}
                            selectedEndTime={formData.endTime}
                            selectedSlot={formData.slotNumber}
                            onTimeSelect={handleTimeSelect}
                            onSlotSelect={handleSlotSelect}
                            bookedSlots={bookedSlots}
                            error={errors.timeSlot}
                        />
                        
                        {/* Additional Members for Meeting Room */}
                        {isMeetingRoom && (
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    <h3 className="text-sm font-bold text-indigo-900">
                                        Additional Members (4 required)
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {formData.additionalMembers.map((member, index) => (
                                        <div key={index}>
                                            <label className="block text-xs font-semibold text-indigo-700 mb-1">
                                                Member {index + 1} ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={member}
                                                onChange={(e) => handleMemberChange(index, e.target.value)}
                                                placeholder={`Enter student ID ${index + 1}`}
                                                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all ${
                                                    errors[`member${index}`] ? 'border-red-500' : 'border-indigo-200'
                                                }`}
                                            />
                                            {errors[`member${index}`] && (
                                                <p className="text-red-500 text-xs mt-0.5">{errors[`member${index}`]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {errors.members && (
                                    <p className="text-red-500 text-xs mt-2">{errors.members}</p>
                                )}
                                <p className="text-xs text-indigo-600 mt-3">
                                    Note: Including the creator, the meeting room will have 5 members total.
                                </p>
                            </div>
                        )}
                        
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-semibold mb-0.5">Booking Information:</p>
                                    <ul className="space-y-0.5 text-blue-700">
                                        <li>• Resource: {resource.name}</li>
                                        <li>• Type: {resource.type?.replace('_', ' ')}</li>
                                        <li>• Location: {resource.location || 'N/A'}</li>
                                        <li>• Available: {availableFrom} - {availableTo}</li>
                                        {isMeetingRoom && (
                                            <li>• Slot Duration: 2 hours</li>
                                        )}
                                        <li>• Status: Pending approval</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                                <p className="text-red-700 text-xs">{submitError}</p>
                            </div>
                        )}
                        
                        <div className="flex space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-3 py-2.5 text-sm border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-3 py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                                        Booking...
                                    </div>
                                ) : (
                                    'Confirm Booking'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
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
        </>
    );
};

export default BookingModal;