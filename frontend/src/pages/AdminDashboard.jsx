import React, { useEffect, useState } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editRole, setEditRole] = useState("");

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await api.put(`/api/admin/users/${id}/role`, { role: newRole });
            setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
            setEditingUserId(null);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update role");
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/admin/users');
                setUsers(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users. Note: Backend endpoint may not be fully implemented yet.');
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="text-center p-12 text-slate-500">Loading users...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                <p className="text-sm text-slate-500 mt-1">View and manage all registered campus users and their system roles.</p>
            </div>
            
            {error && (
                <div className="p-4 bg-red-50 border-b border-red-100 text-red-600 text-sm">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {users.length === 0 && !error ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">
                                    No users found in the system.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">#{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUserId === user.id ? (
                                            <select 
                                                value={editRole} 
                                                onChange={(e) => setEditRole(e.target.value)}
                                                className="border border-slate-300 rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="TECHNICIAN">TECHNICIAN</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${user.role === 'ADMIN' ? 'bg-emerald-100 text-emerald-800' : 
                                                  user.role === 'TECHNICIAN' ? 'bg-amber-100 text-amber-800' : 
                                                  'bg-blue-100 text-blue-800'}`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingUserId === user.id ? (
                                            <>
                                                <button onClick={() => handleRoleChange(user.id, editRole)} className="text-emerald-600 hover:text-emerald-900 mr-4">Save</button>
                                                <button onClick={() => setEditingUserId(null)} className="text-slate-600 hover:text-slate-900">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => { setEditingUserId(user.id); setEditRole(user.role); }} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit Role</button>
                                                <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
