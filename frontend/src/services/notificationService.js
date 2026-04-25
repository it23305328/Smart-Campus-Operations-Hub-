import api from './api';

const notificationService = {
    // GET /api/notifications - identifying user via backend session/token
    getNotifications: async () => {
        try {
            const response = await api.get('/api/notifications');
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // PUT /api/notifications/{id}/read
    markAsRead: async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    // DELETE /api/notifications/{id}
    deleteNotification: async (id) => {
        try {
            await api.delete(`/api/notifications/${id}`);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    },

    // GET /api/notifications/preferences
    getPreferences: async () => {
        try {
            const response = await api.get('/api/notifications/preferences');
            return response.data;
        } catch (error) {
            console.error('Error fetching notification preferences:', error);
            throw error;
        }
    },

    // PUT /api/users/profile/notifications
    updatePreferences: async (preferences) => {
        try {
            const response = await api.put('/api/users/profile/notifications', preferences);
            return response.data;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            throw error;
        }
    }
};

export default notificationService;
