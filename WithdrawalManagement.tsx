

import React, { useState, useMemo, useEffect } from 'react';
import { mockPayments, mockWithdrawals as initialWithdrawals } from '../../lib/mockAdminData';
import { AdminWithdrawal } from '../../types';
import { XIcon, BanknotesIcon, CurrencyDollarIcon } from '../Icons';
import { auth } from '../../lib/firebase';
// FIX: Corrected Firebase import path for modular SDK to resolve 'has no exported member' errors.
import { onAuthStateChanged, User } from '@firebase/auth';

const ADMIN_EMAILS = ['rayyanzameer123@gmail.com', 'zameerahmedniazi@gmail.com'];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex items-start space-x-4">
        <div className="bg-slate-700 text-sky-400 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const WithdrawModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onWithdraw: (amount: number, easypaisaNumber: string, easypaisaName: string) => void;
    availableBalance: number;
}> = ({ isOpen, onClose, onWithdraw, availableBalance }) => {
    const [amount, setAmount] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setAccountNumber('');
            setAccountName('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        if (numAmount > availableBalance) {
            setError('Withdrawal amount cannot exceed the available balance.');
            return;
        }
        if (!/^\d{11}$/.test(accountNumber)) {
            setError('Please enter a valid 11-digit Easypaisa account number.');
            return;
        }
        if (accountName.trim().length < 3) {
            setError('Account holder name must be at least 3 characters long.');
            return;
        }

        onWithdraw(numAmount, accountNumber, accountName);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold">Request Withdrawal</h3>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white"><XIcon /></button>
                    </div>
                    <div className="p-6 space-y-4">
                        {error && <div className="p-3 bg-red-500/20 text-red-300 text-sm rounded-md">{error}</div>}
                        <div>
                            <label className="text-sm font-medium text-slate-300 block mb-1">Available to Withdraw</label>
                            <p className="text-lg font-bold text-sky-400">Rs. {availableBalance.toLocaleString()}</p>
                        </div>
                        <div>
                            <label htmlFor="amount" className="text-sm font-medium text-slate-300 block mb-1">Withdraw Amount (PKR)</label>
                            <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" placeholder="e.g. 5000" required />
                        </div>
                        <div>
                            <label htmlFor="accountNumber" className="text-sm font-medium text-slate-300 block mb-1">Easypaisa Account Number</label>
                            <input type="text" id="accountNumber" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" placeholder="03XXXXXXXXX" required />
                        </div>
                        <div>
                            <label htmlFor="accountName" className="text-sm font-medium text-slate-300 block mb-1">Easypaisa Account Holder Name</label>
                            <input type="text" id="accountName" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" placeholder="e.g. John Doe" required />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-sm font-semibold text-white">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export const WithdrawalManagement: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
    const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>(initialWithdrawals);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => setCurrentUser(user));
        return () => unsubscribe();
    }, []);

    const isSuperAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);

    const earnings = useMemo(() => {
        const completedPayments = mockPayments.filter(p => p.status === 'Completed');
        const parseAmount = (amount: string) => parseInt(amount.replace(/[^\d]/g, ''), 10) || 0;
        const now = new Date();

        const allTime = completedPayments.reduce((sum, p) => sum + parseAmount(p.amount), 0);
        const thisMonth = completedPayments.filter(p => new Date(p.date).getMonth() === now.getMonth() && new Date(p.date).getFullYear() === now.getFullYear()).reduce((sum, p) => sum + parseAmount(p.amount), 0);
        const thisWeek = completedPayments.filter(p => {
            const d = new Date(p.date);
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            return d >= startOfWeek;
        }).reduce((sum, p) => sum + parseAmount(p.amount), 0);
        const today = completedPayments.filter(p => new Date(p.date).toDateString() === now.toDateString()).reduce((sum, p) => sum + parseAmount(p.amount), 0);
        
        return { allTime, thisMonth, thisWeek, today };
    }, []);

    const { availableBalance, totalWithdrawn } = useMemo(() => {
        const totalWithdrawn = withdrawals
            .filter(w => w.status === 'Completed')
            .reduce((sum, w) => sum + w.amount, 0);
        const availableBalance = earnings.allTime - totalWithdrawn;
        return { availableBalance, totalWithdrawn };
    }, [withdrawals, earnings.allTime]);

    const handleWithdraw = (amount: number, easypaisaNumber: string, easypaisaName: string) => {
        const newWithdrawal: AdminWithdrawal = {
            id: `wd_${Date.now()}`,
            adminEmail: currentUser?.email || ADMIN_EMAILS[0],
            amount,
            easypaisaNumber,
            easypaisaName,
            status: 'Pending',
            timestamp: new Date().toISOString(),
        };
        setWithdrawals(prev => [newWithdrawal, ...prev]);
        setIsModalOpen(false);
    };

    const handleStatusChange = (id: string, newStatus: AdminWithdrawal['status']) => {
        setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    };
    
    const statusColors: Record<AdminWithdrawal['status'], string> = {
        Completed: 'bg-green-500/20 text-green-300',
        Pending: 'bg-yellow-500/20 text-yellow-300',
        Failed: 'bg-red-500/20 text-red-300',
    };

    return (
        <div className="animate-fade-in space-y-8">
            <WithdrawModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onWithdraw={handleWithdraw} availableBalance={availableBalance} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="All Time Earnings" value={`Rs.${earnings.allTime.toLocaleString()}`} icon={<CurrencyDollarIcon />} />
                <StatCard title="This Month" value={`Rs.${earnings.thisMonth.toLocaleString()}`} icon={<CurrencyDollarIcon />} />
                <StatCard title="This Week" value={`Rs.${earnings.thisWeek.toLocaleString()}`} icon={<CurrencyDollarIcon />} />
                <StatCard title="Today" value={`Rs.${earnings.today.toLocaleString()}`} icon={<CurrencyDollarIcon />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2 bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-2">Available Balance</h3>
                    <p className="text-4xl font-extrabold text-sky-400 mb-4">Rs. {availableBalance.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Total withdrawn: Rs. {totalWithdrawn.toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-white mb-3">Request a Withdrawal</h3>
                    <p className="text-sm text-slate-400 mb-4">Transfer your available balance to your Easypaisa account.</p>
                     {isSuperAdmin ? (
                        <button onClick={() => setIsModalOpen(true)} className="w-full bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200">
                            Withdraw Funds
                        </button>
                    ) : (
                        <p className="text-yellow-400 font-semibold">Withdrawal access is restricted to Super Admin.</p>
                    )}
                 </div>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg">
                <div className="p-4 sm:p-6 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white">Withdrawal History</h3>
                    <p className="text-sm text-slate-400">A log of all past withdrawal transactions.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Withdraw ID</th>
                                <th scope="col" className="px-6 py-3">Date & Time</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Easypaisa Details</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawals.map(w => (
                                <tr key={w.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-mono text-slate-300">{w.id}</td>
                                    <td className="px-6 py-4 text-slate-400">{new Date(w.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-semibold text-white">Rs. {w.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-300">{w.easypaisaName}</div>
                                        <div className="text-slate-400 font-mono text-xs">{w.easypaisaNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={w.status}
                                            onChange={e => handleStatusChange(w.id, e.target.value as AdminWithdrawal['status'])}
                                            className={`border-none text-xs font-semibold rounded-full py-1 pl-2 pr-7 appearance-none focus:ring-2 focus:ring-sky-400 ${statusColors[w.status]}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Failed">Failed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};