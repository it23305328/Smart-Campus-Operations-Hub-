import api from './api';

const analyticsService = {
    getTopResources: async () => {
        const response = await api.get('/api/analytics/top-resources');
        return response.data;
    },
    getSummaryMetrics: async () => {
        const response = await api.get('/api/analytics/summary');
        return response.data;
    }
};

export default analyticsService;
