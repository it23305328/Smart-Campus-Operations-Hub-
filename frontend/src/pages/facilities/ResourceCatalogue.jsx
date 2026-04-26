import React, { useState, useEffect } from 'react';
import resourceService from '../../services/resourceService';
import { Search, MapPin, Users, Info } from 'lucide-react';

const ResourceCatalogue = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        name: '',
        type: 'ALL',
        location: '',
        minCapacity: ''
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const data = await resourceService.getAllResources(filters);
            setResources(data);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchResources();
    };

    const types = ['ALL', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Facilities Catalogue</h1>
                    <p className="text-slate-500 mt-2 text-lg">Explore and find available resources on campus</p>
                </header>

                {/* Filters Section */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-10 border border-slate-100">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Search Name</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                    placeholder="Enter resource name..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Resource Type</label>
                            <select
                                name="type"
                                value={filters.type}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            >
                                {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    name="location"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. Block A"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            Filter Results
                        </button>
                    </form>
                </div>

                {/* Grid Section */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resources.length > 0 ? (
                            resources.map((resource) => (
                                <div key={resource.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider shadow-sm">
                                            {resource.type.replace('_', ' ')}
                                        </div>
                                        <div className="absolute bottom-4 left-6 text-white">
                                            <h3 className="text-2xl font-bold leading-tight">{resource.name}</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center text-slate-600">
                                            <MapPin className="w-5 h-5 mr-3 text-slate-400" />
                                            <span className="font-medium">{resource.location || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-slate-600">
                                            <Users className="w-5 h-5 mr-3 text-slate-400" />
                                            <span className="font-medium">Capacity: {resource.capacity || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${resource.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {resource.status}
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-slate-50 flex gap-2">
                                            <button className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95">
                                                Book Now
                                            </button>
                                            <button className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95">
                                                <Info className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-2xl font-semibold text-slate-400">No resources found matching your criteria</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceCatalogue;
