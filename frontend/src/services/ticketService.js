import api from './api';

const ticketService = {
    getAllTickets: async () => {
        const response = await api.get('/api/tickets');
        return response.data;
    },
    getTicketById: async (id) => {
        const response = await api.get(`/api/tickets/${id}`);
        return response.data;
    },
    createTicket: async (ticket) => {
        const response = await api.post('/api/tickets', ticket);
        return response.data;
    },
    assignTechnician: async (ticketId, technicianId) => {
        const response = await api.put(`/api/tickets/${ticketId}/assign`, { technicianId });
        return response.data;
    },
    updateStatus: async (ticketId, status, notes) => {
        const response = await api.put(`/api/tickets/${ticketId}/status`, { status, notes });
        return response.data;
    },
    addComment: async (ticketId, text) => {
        const response = await api.post(`/api/tickets/${ticketId}/comments`, { text });
        return response.data;
    },
    deleteComment: async (commentId) => {
        await api.delete(`/api/tickets/comments/${commentId}`);
    }
};

export default ticketService;
