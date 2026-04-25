import api from './api';

const resourceService = {
    getAllResources: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.name) params.append('name', filters.name);
        if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
        if (filters.location) params.append('location', filters.location);
        if (filters.minCapacity) params.append('minCapacity', filters.minCapacity);

        const response = await api.get(`/api/resources?${params.toString()}`);
        return response.data;
    },

    getResourceById: async (id) => {
        const response = await api.get(`/api/resources/${id}`);
        return response.data;
    },

    addResource: async (resource) => {
        const response = await api.post('/api/resources', resource);
        return response.data;
    },

    updateResource: async (id, resource) => {
        const response = await api.put(`/api/resources/${id}`, resource);
        return response.data;
    },

    deleteResource: async (id) => {
        await api.delete(`/api/resources/${id}`);
    }
};

export default resourceService;
