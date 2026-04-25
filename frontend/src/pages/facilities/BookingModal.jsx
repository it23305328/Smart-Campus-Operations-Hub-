// BookingModal.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Phone, FileText, AlertCircle, Clock, Users, Calendar } from 'lucide-react';
import bookingService from '../../services/bookingService';
import ConfirmationModal from './ConfirmationModal';

const BookingModal = ({ isOpen, onClose, resource, onSuccess }) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Get today's date in Sri Lanka timezone
    const getTodayDate = () => {
        const now = new Date();
        const options = { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' };
        const sriLankaDate = new Intl.DateTimeFormat('en-CA', options).format(now);
        return sriLankaDate;
    };

    // Get current time in Sri Lanka in 24-hour format
    const getCurrentTimeInSL = () => {
        const now = new Date();
        const options = { timeZone: 'Asia/Colombo', hour: '2-digit', minute: '2-digit', hour12: false };
        const timeString = new Intl.DateTimeFormat('en-US', options).format(now);
        return timeString;
    };

    // Get phone number from localStorage if available
    const getPhoneFromStorage = () => {
        // Check for phone in various possible localStorage keys
        const phone = currentUser.phone || 
                     currentUser.contactNumber || 
                     currentUser.contact || 
                     currentUser.mobile ||
                     currentUser.phoneNumber || '';
        return String(phone);
    };

    const phoneFromStorage = getPhoneFromStorage();

    const [formData, setFormData] = useState({
        studentId: String(currentUser.id || ''),
        studentName: String(currentUser.name || ''),
        contactNumber: phoneFromStorage,
        purpose: '',
        reservationDate: getTodayDate(),
        startTime: '',
        endTime: '',
        slotNumber: null,
        additionalMembers: ['', '', '', '']
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    // Track if phone was auto-filled
    const [phoneAutoFilled, setPhoneAutoFilled] = useState(!!phoneFromStorage);
    
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
            const today = getTodayDate();
            const phone = getPhoneFromStorage();
            setSelectedDate(today);
            setPhoneAutoFilled(!!phone);
            setFormData({
                studentId: String(currentUser.id || ''),
                studentName: String(currentUser.name || ''),
                contactNumber: phone,
                purpose: '',
                reservationDate: today,
                startTime: '',
                endTime: '',
                slotNumber: null,
                additionalMembers: ['', '', '', '']
            });
            setErrors({});
            setSubmitError('');
            fetchBookedSlots(today);
        }
    }, [isOpen, resource]);

    const fetchBookedSlots = async (date) => {
        if (!resource || !resource.id) return;
        
        try {
            const slots = await bookingService.getBookedSlotsForDate(resource.id, date);
            setBookedSlots(slots || []);
        } catch (error) {
            console.error('Error fetching booked slots:', error);
            setBookedSlots([]);
        }
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setFormData(prev => ({
            ...prev,
            reservationDate: newDate,
            startTime: '',
            endTime: '',
            slotNumber: null
        }));
        fetchBookedSlots(newDate);
        if (errors.timeSlot) {
            setErrors(prev => ({ ...prev, timeSlot: '' }));
        }
    };

    const handleStartTimeChange = (e) => {
        const startTime = e.target.value;
        setFormData(prev => ({
            ...prev,
            startTime,
            endTime: ''
        }));
        if (errors.timeSlot || errors.startTime || errors.endTime) {
            setErrors(prev => ({ ...prev, timeSlot: '', startTime: '', endTime: '' }));
        }
    };

    const handleEndTimeChange = (e) => {
        const endTime = e.target.value;
        setFormData(prev => ({
            ...prev,
            endTime
        }));
        if (errors.timeSlot || errors.endTime) {
            setErrors(prev => ({ ...prev, timeSlot: '', endTime: '' }));
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
        
        if (!formData.reservationDate) {
            newErrors.date = 'Please select a date';
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
        } else {
            if (!formData.startTime) {
                newErrors.startTime = 'Please select start time';
            }
            if (!formData.endTime) {
                newErrors.endTime = 'Please select end time';
            }
            
            if (formData.startTime && formData.endTime) {
                const [startHour, startMin] = formData.startTime.split(':').map(Number);
                const [endHour, endMin] = formData.endTime.split(':').map(Number);
                
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                const diffMinutes = endMinutes - startMinutes;
                
                if (diffMinutes <= 0) {
                    newErrors.endTime = 'End time must be after start time';
                } else if (diffMinutes < 60) {
                    newErrors.endTime = 'Minimum booking duration is 1 hour';
                } else if (diffMinutes > 240) {
                    newErrors.endTime = 'Maximum booking duration is 4 hours';
                }
                
                // Check for conflicts with existing bookings
                if (diffMinutes >= 60 && diffMinutes <= 240 && !isMeetingRoom && !newErrors.endTime) {
                    const hasConflict = bookedSlots.some(slot => {
                        const slotStart = slot.startTime || '';
                        const slotEnd = slot.endTime || '';
                        return (formData.startTime < slotEnd && formData.endTime > slotStart);
                    });
                    
                    if (hasConflict) {
                        newErrors.timeSlot = 'The selected time period conflicts with an existing booking';
                    }
                }
                
                // Validate time is within resource availability
                if (!newErrors.endTime && !newErrors.startTime) {
                    const availableFrom = resource.availableFrom || '08:00';
                    const availableTo = resource.availableTo || '20:00';
                    
                    const [availFromH, availFromM] = availableFrom.split(':').map(Number);
                    const [availToH, availToM] = availableTo.split(':').map(Number);
                    const availFromMinutes = availFromH * 60 + availFromM;
                    const availToMinutes = availToH * 60 + availToM;
                    
                    if (startMinutes < availFromMinutes || endMinutes > availToMinutes) {
                        newErrors.timeSlot = `Booking time must be between ${formatTimeDisplay(availableFrom)} and ${formatTimeDisplay(availableTo)}`;
                    }
                }
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
        // Mark phone as not auto-filled if user modifies it
        if (name === 'contactNumber' && phoneAutoFilled && value !== phoneFromStorage) {
            setPhoneAutoFilled(false);
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleMemberChange = (index, value) => {
        const newMembers = [...formData.additionalMembers];
        newMembers[index] = value;
        setFormData(prev => ({
            ...prev,
            additionalMembers: newMembers
        }));
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
            
            // Ensure time is sent in HH:mm:ss format
            const formatTimeForApi = (time) => {
                if (!time) return null;
                if (time.split(':').length === 3) return time;
                return time + ':00';
            };
            
            const bookingData = {
                studentId: String(currentUser.id),
                studentName: String(currentUser.name),
                contactNumber: formData.contactNumber,
                resourceId: resource.id,
                purpose: formData.purpose || '',
                reservationDate: formData.reservationDate,
                startTime: formatTimeForApi(formData.startTime),
                endTime: formatTimeForApi(formData.endTime),
                slotNumber: isMeetingRoom ? formData.slotNumber : null,
                additionalMembers: isMeetingRoom ? formData.additionalMembers.filter(m => m && m.trim()) : null
            };
            
            console.log('Sending booking data:', bookingData);
            
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
        onClose();
    };

    const formatTimeDisplay = (time) => {
        if (!time) return '';
        const parts = time.split(':');
        if (parts.length >= 2) {
            const hours = parseInt(parts[0]);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
            return `${displayHours}:${parts[1]} ${ampm}`;
        }
        return time;
    };

    const formatTimeForValue = (time) => {
        if (!time) return '';
        const parts = time.split(':');
        if (parts.length >= 2) {
            return `${parts[0].padStart(2, '0')}:${parts[1]}`;
        }
        return time;
    };

    // Get available end times based on selected start time
    const getAvailableEndTimes = () => {
        if (!formData.startTime) return [];
        
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        
        const isMeetingRoom = resource && (resource.hasSlots === true || resource.type === 'MEETING_ROOM');
        const availableFrom = resource.availableFrom || (isMeetingRoom ? '09:00' : '08:00');
        const availableTo = resource.availableTo || (isMeetingRoom ? '19:00' : '20:00');
        
        const [availableToHour, availableToMin] = formatTimeForValue(availableTo).split(':').map(Number);
        const availableToMinutes = availableToHour * 60 + availableToMin;
        
        const options = [];
        
        const maxEndMinutes = Math.min(startMinutes + 240, availableToMinutes);
        
        for (let minutes = startMinutes + 60; minutes <= maxEndMinutes; minutes += 30) {
            const hour = Math.floor(minutes / 60);
            const min = minutes % 60;
            const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            
            const hasConflict = bookedSlots.some(slot => {
                const slotStart = formatTimeForValue(slot.startTime || '');
                const slotEnd = formatTimeForValue(slot.endTime || '');
                return (formData.startTime < slotEnd && timeStr > slotStart);
            });
            
            const durationMinutes = minutes - startMinutes;
            const durationHours = Math.floor(durationMinutes / 60);
            const durationRemainingMinutes = durationMinutes % 60;
            const durationLabel = durationRemainingMinutes > 0 
                ? `${durationHours}h ${durationRemainingMinutes}m` 
                : `${durationHours}h`;
            
            options.push({
                time: timeStr,
                display: formatTimeDisplay(timeStr),
                duration: durationLabel,
                conflict: hasConflict
            });
        }
        
        return options;
    };

    // Generate available start times
    const getAvailableStartTimes = () => {
        const isMeetingRoom = resource && (resource.hasSlots === true || resource.type === 'MEETING_ROOM');
        const availableFrom = resource.availableFrom || (isMeetingRoom ? '09:00' : '08:00');
        const availableTo = resource.availableTo || (isMeetingRoom ? '19:00' : '20:00');
        
        const [fromHour, fromMin] = formatTimeForValue(availableFrom).split(':').map(Number);
        const [toHour, toMin] = formatTimeForValue(availableTo).split(':').map(Number);
        
        const fromMinutes = fromHour * 60 + fromMin;
        const toMinutes = toHour * 60 + toMin;
        
        let minMinutes = fromMinutes;
        
        if (selectedDate === getTodayDate()) {
            const currentTime = getCurrentTimeInSL();
            const [currentHour, currentMin] = currentTime.split(':').map(Number);
            let roundedMin = Math.ceil(currentMin / 30) * 30;
            let roundedHour = currentHour;
            if (roundedMin >= 60) {
                roundedHour += 1;
                roundedMin = 0;
            }
            minMinutes = Math.max(fromMinutes, roundedHour * 60 + roundedMin);
        }
        
        const options = [];
        
        for (let minutes = minMinutes; minutes <= toMinutes - 60; minutes += 30) {
            const hour = Math.floor(minutes / 60);
            const min = minutes % 60;
            const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
            
            options.push({
                time: timeStr,
                display: formatTimeDisplay(timeStr)
            });
        }
        
        return options;
    };

    if (!isOpen || !resource) return null;

    const isMeetingRoom = resource && (resource.hasSlots === true || resource.type === 'MEETING_ROOM');
    const availableStartTimes = getAvailableStartTimes();
    const availableEndTimes = getAvailableEndTimes();

    // Meeting room slots
    const meetingRoomSlots = [
        { number: 1, start: '09:00', end: '11:00', label: '9:00 AM - 11:00 AM' },
        { number: 2, start: '11:00', end: '13:00', label: '11:00 AM - 1:00 PM' },
        { number: 3, start: '13:00', end: '15:00', label: '1:00 PM - 3:00 PM' },
        { number: 4, start: '15:00', end: '17:00', label: '3:00 PM - 5:00 PM' },
        { number: 5, start: '17:00', end: '19:00', label: '5:00 PM - 7:00 PM' }
    ];

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
                        <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-4 space-y-4">
                        {/* Student Info (Read Only) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Student ID</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" value={formData.studentId} readOnly className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg outline-none text-slate-600" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" value={formData.studentName} readOnly className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg outline-none text-slate-600" />
                                </div>
                            </div>
                        </div>
                        
                        {/* Contact Number - Auto-filled if available, editable if not */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Contact Number <span className="text-red-500">*</span>
                                {phoneAutoFilled && (
                                    <span className="text-green-600 font-normal ml-1">(Auto-filled from profile)</span>
                                )}
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
                                    readOnly={phoneAutoFilled && !!formData.contactNumber}
                                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${
                                        phoneAutoFilled && formData.contactNumber 
                                            ? 'bg-green-50 border-green-200 text-slate-700 cursor-default' 
                                            : errors.contactNumber 
                                                ? 'bg-slate-50 border-red-500' 
                                                : 'bg-slate-50 border-slate-200'
                                    }`}
                                />
                                {phoneAutoFilled && formData.contactNumber && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhoneAutoFilled(false);
                                            setFormData(prev => ({ ...prev, contactNumber: '' }));
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                            {errors.contactNumber && <p className="text-red-500 text-xs mt-0.5">{errors.contactNumber}</p>}
                            {!phoneAutoFilled && !formData.contactNumber && (
                                <p className="text-slate-400 text-xs mt-0.5">Enter your 10-digit contact number</p>
                            )}
                        </div>
                        
                        {/* Date Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Date <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    min={getTodayDate()}
                                    className={`w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${errors.date ? 'border-red-500' : 'border-slate-200'}`}
                                />
                            </div>
                            {errors.date && <p className="text-red-500 text-xs mt-0.5">{errors.date}</p>}
                        </div>
                        
                        {/* Time Selection */}
                        {isMeetingRoom ? (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Select Time Slot (2 Hours) <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                    {meetingRoomSlots.map((slot) => {
                                        const isBooked = bookedSlots.some(b => b.slotNumber === slot.number);
                                        const selected = formData.slotNumber === slot.number;
                                        
                                        return (
                                            <button
                                                key={slot.number}
                                                type="button"
                                                disabled={isBooked}
                                                onClick={() => !isBooked && handleSlotSelect(slot.number, slot.start, slot.end)}
                                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                                                    isBooked 
                                                        ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60'
                                                        : selected
                                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                                                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                        isBooked ? 'bg-red-100' : selected ? 'bg-blue-100' : 'bg-slate-100'
                                                    }`}>
                                                        <Clock className={`w-5 h-5 ${isBooked ? 'text-red-400' : selected ? 'text-blue-600' : 'text-slate-400'}`} />
                                                    </div>
                                                    <span className="font-semibold text-sm">{slot.label}</span>
                                                </div>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                                    isBooked ? 'bg-red-100 text-red-600' : selected ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                                }`}>
                                                    {isBooked ? 'BOOKED' : selected ? 'SELECTED' : 'AVAILABLE'}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Select Time Period <span className="text-red-500">*</span>
                                </label>
                                <p className="text-xs text-slate-400 mb-3">Minimum 1 hour, maximum 4 hours</p>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time <span className="text-red-500">*</span></label>
                                        <select
                                            value={formData.startTime}
                                            onChange={handleStartTimeChange}
                                            className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${errors.startTime ? 'border-red-500' : 'border-slate-200'}`}
                                        >
                                            <option value="">Select start time</option>
                                            {availableStartTimes.map((option) => (
                                                <option key={option.time} value={option.time}>{option.display}</option>
                                            ))}
                                        </select>
                                        {errors.startTime && <p className="text-red-500 text-xs mt-0.5">{errors.startTime}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 mb-1">End Time <span className="text-red-500">*</span></label>
                                        <select
                                            value={formData.endTime}
                                            onChange={handleEndTimeChange}
                                            disabled={!formData.startTime}
                                            className={`w-full px-3 py-2.5 text-sm bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${errors.endTime ? 'border-red-500' : 'border-slate-200'}`}
                                        >
                                            <option value="">Select end time</option>
                                            {availableEndTimes.map((option) => (
                                                <option key={option.time} value={option.time} disabled={option.conflict}>
                                                    {option.display} ({option.duration}) {option.conflict ? '- BOOKED' : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.endTime && <p className="text-red-500 text-xs mt-0.5">{errors.endTime}</p>}
                                    </div>
                                </div>
                                
                                {formData.startTime && formData.endTime && !errors.endTime && !errors.startTime && (
                                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-blue-700">Selected Period:</span>
                                            <span className="text-sm font-bold text-blue-800">
                                                {formatTimeDisplay(formData.startTime)} - {formatTimeDisplay(formData.endTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-sm font-semibold text-blue-700">Duration:</span>
                                            <span className="text-sm font-bold text-blue-800">
                                                {(() => {
                                                    const [startHour, startMin] = formData.startTime.split(':').map(Number);
                                                    const [endHour, endMin] = formData.endTime.split(':').map(Number);
                                                    const diffMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                                                    const hours = Math.floor(diffMin / 60);
                                                    const mins = diffMin % 60;
                                                    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {bookedSlots.length > 0 && (
                                    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
                                        <p className="text-xs font-semibold text-slate-600 mb-2">Already Booked Slots:</p>
                                        <div className="space-y-1">
                                            {bookedSlots.map((slot, index) => (
                                                <div key={index} className="flex items-center justify-between text-xs">
                                                    <span className="text-slate-500">
                                                        {formatTimeDisplay(formatTimeForValue(slot.startTime))} - {formatTimeDisplay(formatTimeForValue(slot.endTime))}
                                                    </span>
                                                    <span className="text-red-500 font-semibold">BOOKED</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
                            </div>
                        )}
                        
                        {/* Purpose */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Purpose (Optional)</label>
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
                        
                        {/* Additional Members for Meeting Room */}
                        {isMeetingRoom && (
                            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    <h3 className="text-sm font-bold text-indigo-900">Additional Members (4 required)</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {formData.additionalMembers.map((member, index) => (
                                        <div key={index}>
                                            <label className="block text-xs font-semibold text-indigo-700 mb-1">Member {index + 1} ID <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={member}
                                                onChange={(e) => handleMemberChange(index, e.target.value)}
                                                placeholder={`Student ID ${index + 1}`}
                                                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none ${errors[`member${index}`] ? 'border-red-500' : 'border-indigo-200'}`}
                                            />
                                            {errors[`member${index}`] && <p className="text-red-500 text-xs mt-0.5">{errors[`member${index}`]}</p>}
                                        </div>
                                    ))}
                                </div>
                                {errors.members && <p className="text-red-500 text-xs mt-2">{errors.members}</p>}
                            </div>
                        )}
                        
                        {/* Info Box */}
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                            <div className="flex items-start space-x-2">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-800">
                                    <p className="font-semibold mb-0.5">Booking Information:</p>
                                    <ul className="space-y-0.5 text-blue-700">
                                        <li>• Resource: {resource.name}</li>
                                        <li>• Date: {selectedDate}</li>
                                        <li>• Type: {resource.type?.replace('_', ' ')}</li>
                                        <li>• Available: {formatTimeDisplay(formatTimeForValue(resource.availableFrom || (isMeetingRoom ? '09:00' : '08:00')))} - {formatTimeDisplay(formatTimeForValue(resource.availableTo || (isMeetingRoom ? '19:00' : '20:00')))}</li>
                                        {!isMeetingRoom && <li>• Duration: Min 1 hour, Max 4 hours</li>}
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
                            <button type="button" onClick={handleClose} className="flex-1 px-3 py-2.5 text-sm border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 px-3 py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                {loading ? 'Booking...' : 'Confirm Booking'}
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