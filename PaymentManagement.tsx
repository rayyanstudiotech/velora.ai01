import React, { useState, useMemo } from 'react';
import { mockPayments, AdminPayment } from '../../lib/mockAdminData';

type PaymentMethod = 'All' | 'Easypaisa' | 'Jazz Cash' | 'Payoneer' | 'PayPal';

export const PaymentManagement: React.FC = () => {
    const [payments, setPayments] = useState<AdminPayment[]>(mockPayments);
    const [filter, setFilter] = useState<PaymentMethod>('All');

    const filteredPayments = useMemo(() => {
        if (filter === 'All') return payments;
        return payments.filter(p => p.method === filter);
    }, [payments, filter]);

    const handleExportCsv = () => {
        const headers = "Transaction ID,User Email,Plan,Amount,Date,Method,Status";
        const rows = filteredPayments.map(p =>
            [p.id, p.userEmail, p.plan, `"${p.amount}"`, p.date, p.method, p.status].join(',')
        ).join('\n');

        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "payment_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const statusColors: Record<AdminPayment['status'], string> = {
        Completed: 'bg-green-500/20 text-green-300',
        Pending: 'bg-yellow-500/20 text-yellow-300',
        Failed: 'bg-red-500/20 text-red-300',
    };
    
    return (
        <div className="animate-fade-in bg-slate-800 rounded-xl shadow-lg">
            <div className="p-4 sm:p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-white">Payment History</h3>
                    <p className="text-sm text-slate-400">Total Transactions: {filteredPayments.length}</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={filter} onChange={e => setFilter(e.target.value as PaymentMethod)} className="bg-slate-700 border border-slate-600 rounded-md p-2 text-sm">
                        <option value="All">All Methods</option>
                        <option value="Easypaisa">Easypaisa</option>
                        <option value="Jazz Cash">Jazz Cash</option>
                        <option value="Payoneer">Payoneer</option>
                        <option value="PayPal">PayPal</option>
                    </select>
                    <button onClick={handleExportCsv} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-sm font-semibold text-white">Export CSV</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Transaction ID</th>
                            <th scope="col" className="px-6 py-3">User</th>
                            <th scope="col" className="px-6 py-3">Plan</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Method</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map(payment => (
                            <tr key={payment.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-mono text-slate-300">{payment.id}</td>
                                <td className="px-6 py-4 text-white">{payment.userEmail}</td>
                                <td className="px-6 py-4">{payment.plan}</td>
                                <td className="px-6 py-4 font-semibold">{payment.amount}</td>
                                <td className="px-6 py-4">{payment.date}</td>
                                <td className="px-6 py-4">{payment.method}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[payment.status]}`}>{payment.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
