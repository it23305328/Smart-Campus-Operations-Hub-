// TimeSlotPicker.jsx
import React from 'react';
import { Clock } from 'lucide-react';

const TimeSlotPicker = ({ 
    availableFrom, 
    availableTo, 
    hasSlots, 
    slotDuration, 
    selectedStartTime, 
    selectedEndTime,
    selectedSlot,
    onTimeSelect,
    onSlotSelect,
    bookedSlots = [],
    error
}) => {
    // Generate meeting room slots (2-hour fixed slots)
    const meetingRoomSlots = [
        { number: 1, start: '09:00', end: '11:00', label: 'Slot 1 (9:00 AM - 11:00 AM)' },
        { number: 2, start: '11:00', end: '13:00', label: 'Slot 2 (11:00 AM - 1:00 PM)' },
        { number: 3, start: '13:00', end: '15:00', label: 'Slot 3 (1:00 PM - 3:00 PM)' },
        { number: 4, start: '15:00', end: '17:00', label: 'Slot 4 (3:00 PM - 5:00 PM)' },
        { number: 5, start: '17:00', end: '19:00', label: 'Slot 5 (5:00 PM - 7:00 PM)' }
    ];

    // Generate time options for regular resources (hourly slots)
    const generateTimeOptions = () => {
        const options = [];
        
        // Safely parse time strings
        const fromParts = (availableFrom || '08:00').split(':');
        const toParts = (availableTo || '20:00').split(':');
        
        const fromHour = parseInt(fromParts[0]) || 8;
        const toHour = parseInt(toParts[0]) || 20;
        
        for (let hour = fromHour; hour < toHour; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`;
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
            options.push({ start: startTime, end: endTime });
        }
        
        return options;
    };

    const timeSlots = generateTimeOptions();

    const isSlotBooked = (slot) => {
        if (!bookedSlots || !Array.isArray(bookedSlots)) return false;
        return bookedSlots.some(booked => 
            booked && booked.startTime === slot.start && booked.endTime === slot.end
        );
    };

    const isMeetingSlotBooked = (slotNumber) => {
        if (!bookedSlots || !Array.isArray(bookedSlots)) return false;
        return bookedSlots.some(booked => booked && booked.slotNumber === slotNumber);
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Time {hasSlots === true ? 'Slot (2 Hours)' : 'Period (1 Hour)'} <span className="text-red-500">*</span>
            </label>
            
            {hasSlots === true ? (
                // Meeting Room Slots - 2 hour slots
                <div className="grid grid-cols-1 gap-2">
                    {meetingRoomSlots.map((slot) => {
                        const booked = isMeetingSlotBooked(slot.number);
                        const selected = selectedSlot === slot.number;
                        
                        return (
                            <button
                                key={slot.number}
                                type="button"
                                disabled={booked}
                                onClick={() => {
                                    if (!booked) {
                                        onSlotSelect(slot.number, slot.start, slot.end);
                                    }
                                }}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                                    booked 
                                        ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60'
                                        : selected
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        booked ? 'bg-red-100' : selected ? 'bg-blue-100' : 'bg-slate-100'
                                    }`}>
                                        <Clock className={`w-5 h-5 ${
                                            booked ? 'text-red-400' : selected ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-sm block">{slot.label}</span>
                                        <span className="text-xs text-slate-500">2 hours duration</span>
                                    </div>
                                </div>
                                <div>
                                    {booked ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
                                            BOOKED
                                        </span>
                                    ) : selected ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600">
                                            SELECTED
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-600">
                                            AVAILABLE
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                // Regular Resource Time Slots - 1 hour slots
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {timeSlots.map((slot, index) => {
                        const booked = isSlotBooked(slot);
                        const selected = selectedStartTime === slot.start && selectedEndTime === slot.end;
                        
                        return (
                            <button
                                key={index}
                                type="button"
                                disabled={booked}
                                onClick={() => {
                                    if (!booked) {
                                        onTimeSelect(slot.start, slot.end);
                                    }
                                }}
                                className={`p-3 rounded-xl border-2 transition-all text-center ${
                                    booked 
                                        ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60'
                                        : selected
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:shadow-sm'
                                }`}
                            >
                                <div className="flex flex-col items-center space-y-1">
                                    <Clock className={`w-4 h-4 ${
                                        booked ? 'text-red-400' : selected ? 'text-blue-600' : 'text-slate-400'
                                    }`} />
                                    <span className="font-semibold text-xs">
                                        {slot.start} - {slot.end}
                                    </span>
                                    {booked ? (
                                        <span className="text-xs font-bold text-red-600">BOOKED</span>
                                    ) : selected ? (
                                        <span className="text-xs font-bold text-blue-600">SELECTED</span>
                                    ) : (
                                        <span className="text-xs font-bold text-green-600">FREE</span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
            
            {error && (
                <p className="text-red-500 text-xs mt-2 flex items-center">
                    <span className="mr-1">⚠</span> {error}
                </p>
            )}
        </div>
    );
};

export default TimeSlotPicker;