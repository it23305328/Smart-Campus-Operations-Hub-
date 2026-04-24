// bookingService.js
import api from './api';

const bookingService = {
    createBooking: async (bookingData) => {
        try {
            const response = await api.post('/api/bookings', bookingData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getBookingsByStudentId: async (studentId) => {
        const response = await api.get(`/api/bookings/student/${studentId}`);
        return response.data;
    },

    getUserBookings: async (userId) => {
        const response = await api.get(`/api/bookings/student/${userId}`);
        return response.data;
    },

    getBookingsByResourceId: async (resourceId) => {
        const response = await api.get(`/api/bookings/resource/${resourceId}`);
        return response.data;
    },

    getAvailableSlots: async (resourceId) => {
        const response = await api.get(`/api/bookings/resource/${resourceId}/availability`);
        return response.data;
    },

    checkBookingExists: async (resourceId, studentId) => {
        const response = await api.get('/api/bookings/check', {
            params: { resourceId, studentId }
        });
        return response.data;
    },

    cancelBooking: async (bookingId, studentId) => {
        const response = await api.put(`/api/bookings/${bookingId}/cancel`, null, {
            params: { studentId }
        });
        return response.data;
    },

    updateBookingStatus: async (bookingId, status, rejectionReason = null) => {
        const params = { status };
        if (rejectionReason) {
            params.rejectionReason = rejectionReason;
        }
        const response = await api.put(`/api/bookings/${bookingId}/status`, null, { params });
        return response.data;
    },

    getAllBookings: async () => {
        const response = await api.get('/api/bookings');
        return response.data;
    },

    getBookingsByStatus: async (status) => {
        const response = await api.get('/api/bookings/status', {
            params: { status }
        });
        return response.data;
    }
};

export default bookingService;