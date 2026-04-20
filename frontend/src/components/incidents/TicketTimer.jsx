import React, { useState, useEffect } from 'react';
import { Clock, Timer, CheckCircle } from 'lucide-react';

const TicketTimer = ({ createdAt, resolvedAt }) => {
    const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0 });
    const isResolved = !!resolvedAt;

    useEffect(() => {
        const calculateDuration = () => {
            const start = new Date(createdAt);
            const end = resolvedAt ? new Date(resolvedAt) : new Date();
            const diffInMs = end - start;

            const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

            setDuration({ days, hours, minutes });
        };

        calculateDuration();

        let interval;
        if (!isResolved) {
            interval = setInterval(calculateDuration, 60000); // Update every minute
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [createdAt, resolvedAt, isResolved]);

    const totalHours = duration.days * 24 + duration.hours;
    
    // Color coding: Green (< 24h), Orange (24-48h), Red (> 48h)
    const getTimerColor = () => {
        if (isResolved) return 'text-emerald-600 bg-emerald-50';
        if (totalHours < 24) return 'text-blue-600 bg-blue-50';
        if (totalHours < 48) return 'text-amber-600 bg-amber-50';
        return 'text-rose-600 bg-rose-50 animate-pulse';
    };

    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs tracking-wider uppercase border border-white shadow-sm ${getTimerColor()}`}>
            {isResolved ? (
                <>
                    <CheckCircle className="w-4 h-4" />
                    Resolved in {duration.days > 0 ? `${duration.days}d ` : ''}{duration.hours}h {duration.minutes}m
                </>
            ) : (
                <>
                    <Timer className="w-4 h-4" />
                    Pending: {duration.days > 0 ? `${duration.days}d ` : ''}{duration.hours}h {duration.minutes}m
                </>
            )}
        </div>
    );
};

export default TicketTimer;
