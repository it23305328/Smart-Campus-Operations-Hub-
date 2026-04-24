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

    // Fetch the list of users from the backend on component mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/admin/users');
                setUsers(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Unauthorized or Server Error. Could not fetch users.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    /**
     * Permanent user deletion logic
     */
    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure? This user will be permanently removed from the system.")) return;
        try {
            await api.delete(`/api/admin/users/${id}`);
            // Remove deleted user from local state to update UI instantly
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            alert("Failed to delete user. Ensure you have administrative privileges.");
        }
    };

    /**
     * Updates a specific user's system role (e.g., USER to ADMIN)
     */
    const handleRoleChange = async (id, newRole) => {
        try {
            await api.put(`/api/admin/users/${id}/role`, { role: newRole });
            // Map through users and update only the modified user in the state
            setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
            setEditingUserId(null); // Exit edit mode
        } catch (err) {
            alert("Role update failed. Check server logs.");
        }
    };

    // Show loading spinner while fetching data
    if (loading) return <div className="text-center p-20 text-slate-500 font-bold animate-pulse">Initializing Management Console...</div>;

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Dashboard Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-800">User Management</h2>
                    <p className="text-slate-500 text-sm">Assign roles and manage system access levels.</p>
                </div>
                <div className="bg-indigo-600 text-white px-5 py-1.5 rounded-full text-xs font-black shadow-lg shadow-indigo-200 uppercase tracking-widest">
                    {users.length} Active Records
                </div>
            </div>

            {/* Error Notification */}
            {error && (
                <div className="m-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 text-sm font-medium">
                    ⚠️ {error}
                </div>
            )}

            {/* User Data Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User Identity</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Access Level</th>
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
                                    {editingUserId === user.id ? (
                                        /* Dropdown shown only during Edit Mode */
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
                                        /* Static Role Badge */
                                        <span className={`px-3 py-1 text-[10px] font-black rounded-full text-white shadow-sm
                                            ${user.role === 'ADMIN' ? 'bg-emerald-500' : user.role === 'TECHNICIAN' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                            {user.role}
                                        </span>
                                    )}
                                </td>
                                <td className="px-8 py-5 text-right space-x-4">
                                    {editingUserId === user.id ? (
                                        <>
                                            <button onClick={() => handleRoleChange(user.id, editRole)} className="text-indigo-600 font-black text-sm hover:text-indigo-800 transition-colors">SAVE</button>
                                            <button onClick={() => setEditingUserId(null)} className="text-slate-400 font-black text-sm hover:text-slate-600 transition-colors">CANCEL</button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setEditingUserId(user.id); setEditRole(user.role); }}
                                                className="text-indigo-600 font-black text-xs hover:underline decoration-2"
                                            >
                                                MODIFY ROLE
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-500 font-black text-xs hover:underline decoration-2"
                                            >
                                                DELETE
                                            </button>
                                        </>
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