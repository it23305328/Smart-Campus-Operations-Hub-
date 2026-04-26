import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * AdminDashboard: User Management Interface
 * Allows Admins to fetch a list of all users, update their roles, or delete accounts.
 */
const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editRole, setEditRole] = useState("");

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This action is permanent.")) return;
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

    const handleStatusToggle = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVATED' : 'ACTIVE';
        if (!window.confirm(`Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} this user?`)) return;
        try {
            await api.put(`/api/admin/users/${id}/status`, { status: newStatus });
            setUsers(users.map(user => user.id === id ? { ...user, status: newStatus } : user));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to update status");
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/admin/users');
                setUsers(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch users. Ensure you have administrative privileges.');
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-bold">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            Initializing Management Console...
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Dashboard Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">User Management</h2>
                    <p className="text-slate-500 text-sm">Assign roles, manage status, and audit system access.</p>
                </div>
                <div className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-lg shadow-indigo-200 uppercase tracking-widest">
                    {users.length} Total Records
                </div>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="m-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* User Data Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User Identity</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Access & Status</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Security Audit</th>
                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="font-bold text-slate-800">{user.name}</div>
                                    <div className="text-xs text-slate-500 font-mono italic">ID: {user.id} — {user.email}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col gap-2">
                                        {editingUserId === user.id ? (
                                            <select
                                                value={editRole}
                                                onChange={(e) => setEditRole(e.target.value)}
                                                className="border-2 border-indigo-500 rounded-md px-2 py-1 text-sm outline-none bg-indigo-50 font-bold"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                                <option value="TECHNICIAN">TECHNICIAN</option>
                                            </select>
                                        ) : (
                                            <span className={`w-fit px-3 py-1 text-[10px] font-black rounded-full text-white shadow-sm
                                                ${user.role === 'ADMIN' ? 'bg-emerald-500' : user.role === 'TECHNICIAN' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                                {user.role}
                                            </span>
                                        )}
                                        <span className={`w-fit px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border
                                            ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {user.status || 'ACTIVE'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">IP: {user.ipAddress || 'Not recorded'}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">Last: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
                                </td>
                                <td className="px-8 py-5 text-right space-x-3">
                                    {editingUserId === user.id ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleRoleChange(user.id, editRole)} className="text-emerald-600 font-black text-xs hover:underline decoration-2">SAVE</button>
                                            <button onClick={() => setEditingUserId(null)} className="text-slate-400 font-black text-xs hover:underline decoration-2">CANCEL</button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-3 font-black text-[11px]">
                                            <button
                                                onClick={() => { setEditingUserId(user.id); setEditRole(user.role); }}
                                                className="text-indigo-600 hover:underline decoration-2"
                                            >
                                                ROLE
                                            </button>
                                            <button
                                                onClick={() => handleStatusToggle(user.id, user.status)}
                                                className={user.status === 'ACTIVE' ? 'text-amber-500 hover:underline decoration-2' : 'text-emerald-500 hover:underline decoration-2'}
                                            >
                                                {user.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-500 hover:underline decoration-2"
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;