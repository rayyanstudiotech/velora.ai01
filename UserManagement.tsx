import React, { useState } from 'react';
import { mockUsers, getPlanByName, AdminManagedUser } from '../../lib/mockAdminData';
import { plans } from '../../lib/plans';
import { XIcon } from '../Icons';

const UserModal: React.FC<{
    user: Partial<AdminManagedUser> | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: AdminManagedUser) => void;
}> = ({ user, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<AdminManagedUser>>({});

    React.useEffect(() => {
        setFormData(user || { plan: 'Starter Plan', status: 'Active' });
    }, [user]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalUser: AdminManagedUser = {
            id: formData.id || `usr_${Date.now()}`,
            username: formData.username || 'New User',
            email: formData.email || '',
            plan: formData.plan || 'Starter Plan',
            imageCreditsUsed: Number(formData.imageCreditsUsed) || 0,
            videoCreditsUsed: Number(formData.videoCreditsUsed) || 0,
            status: formData.status || 'Active',
            joinedDate: formData.joinedDate || new Date().toISOString().split('T')[0],
        };
        onSave(finalUser);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold">{user?.id ? 'Edit User' : 'Add User'}</h3>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><XIcon /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300 block mb-1">Username</label>
                            <input type="text" name="username" value={formData.username || ''} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 block mb-1">Email</label>
                            <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1">Plan</label>
                                <select name="plan" value={formData.plan} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md">
                                    {plans.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md">
                                    <option value="Active">Active</option>
                                    <option value="Banned">Banned</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1">Image Credits Used</label>
                                <input type="number" name="imageCreditsUsed" value={formData.imageCreditsUsed || 0} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-1">Video Credits Used</label>
                                <input type="number" name="videoCreditsUsed" value={formData.videoCreditsUsed || 0} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-sm font-semibold text-white">Save User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AdminManagedUser[]>(mockUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminManagedUser | null>(null);

    const handleSaveUser = (user: AdminManagedUser) => {
        if (selectedUser) {
            setUsers(users.map(u => u.id === user.id ? user : u));
        } else {
            setUsers([...users, user]);
        }
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleEdit = (user: AdminManagedUser) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleToggleBan = (user: AdminManagedUser) => {
        const updatedUser = { ...user, status: user.status === 'Active' ? 'Banned' : 'Active' as 'Active' | 'Banned' };
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    };

    const handleDelete = (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            setUsers(users.filter(u => u.id !== userId));
        }
    };
    
    return (
        <div className="animate-fade-in bg-slate-800 rounded-xl shadow-lg">
            <UserModal isOpen={isModalOpen} user={selectedUser} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />
            <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">All Users ({users.length})</h3>
                <button onClick={handleAdd} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-sm font-semibold text-white">Add User</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Plan</th>
                            <th scope="col" className="px-6 py-3">Usage</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => {
                            const planDetails = getPlanByName(user.plan);
                            return (
                                <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{user.username}</div>
                                        <div className="text-slate-400">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{user.plan}</td>
                                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                                        <div>Img: {user.imageCreditsUsed}/{planDetails?.imageLimit ?? 'N/A'}</div>
                                        <div>Vid: {user.videoCreditsUsed}/{planDetails?.videoLimit ?? 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{user.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center space-x-2">
                                            <button onClick={() => handleEdit(user)} className="text-slate-400 hover:text-sky-400" aria-label={`Edit ${user.username}`}>Edit</button>
                                            <button onClick={() => handleToggleBan(user)} className="text-slate-400 hover:text-orange-400" aria-label={`${user.status === 'Active' ? 'Ban' : 'Unban'} ${user.username}`}>{user.status === 'Active' ? 'Ban' : 'Unban'}</button>
                                            <button onClick={() => handleDelete(user.id)} className="text-slate-400 hover:text-red-400" aria-label={`Delete ${user.username}`}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
