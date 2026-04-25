import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

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
                setError(err.response?.data?.message || 'Failed to fetch users.');
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div className="text-center p-12 text-muted-foreground">Loading users...</div>;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-glow rounded-3xl border border-border overflow-hidden"
        >
            <div className="p-6 border-b border-border bg-white/5">
                <h2 className="text-xl font-bold font-space text-foreground">User Management</h2>
                <p className="text-sm text-muted-foreground mt-1">View and manage all registered campus users, their roles, and access status.</p>
            </div>
            
            {error && (
                <div className="p-4 bg-red-500/5 border-b border-red-500/20 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name & Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role & Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Audit</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.length === 0 && !error ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No users found in the system.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">#{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-foreground">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            {editingUserId === user.id ? (
                                                <select 
                                                    value={editRole} 
                                                    onChange={(e) => setEditRole(e.target.value)}
                                                    className="border border-border rounded px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/5 text-foreground"
                                                >
                                                    <option value="USER">USER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                    <option value="TECHNICIAN">TECHNICIAN</option>
                                                </select>
                                            ) : (
                                                <span className={`w-fit px-2 inline-flex text-[10px] leading-5 font-black uppercase tracking-wider rounded-full border
                                                    ${user.role === 'ADMIN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                      user.role === 'TECHNICIAN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                                                      'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                            <span className={`w-fit px-2 inline-flex text-[10px] leading-5 font-black uppercase tracking-wider rounded-full border ${user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                {user.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase">IP: {user.ipAddress || 'None'}</div>
                                        <div className="text-[10px] text-muted-foreground">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never logged in'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-3 font-bold">
                                            {editingUserId === user.id ? (
                                                <>
                                                    <button onClick={() => handleRoleChange(user.id, editRole)} className="text-emerald-500 hover:text-emerald-400 transition-colors">Save</button>
                                                    <button onClick={() => setEditingUserId(null)} className="text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => { setEditingUserId(user.id); setEditRole(user.role); }} className="text-blue-500 hover:text-blue-400 transition-colors">Role</button>
                                                    <button onClick={() => handleStatusToggle(user.id, user.status)} className={`${user.status === 'ACTIVE' ? 'text-amber-500 hover:text-amber-400' : 'text-emerald-500 hover:text-emerald-400'} transition-colors`}>
                                                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-400 transition-colors">Delete</button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;