import React from 'react';
import { dashboardStats, mockPayments, mockUsers } from '../../lib/mockAdminData';

const ReportCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2">{title}</h3>
        {children}
    </div>
);

export const Reports: React.FC = () => {
    const topUsers = [...mockUsers]
        .sort((a, b) => (b.imageCreditsUsed + b.videoCreditsUsed) - (a.imageCreditsUsed + a.videoCreditsUsed))
        .slice(0, 5);

    const paymentLogs = [...mockPayments].reverse().slice(0, 5);

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <ReportCard title="Subscription Revenue">
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between items-center">
                            <span className="text-slate-300">Today</span>
                            <span className="font-mono font-semibold text-white">Rs.{dashboardStats.totalEarnings.today.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-slate-300">This Week</span>
                            <span className="font-mono font-semibold text-white">Rs.{dashboardStats.totalEarnings.weekly.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-slate-300">This Month</span>
                            <span className="font-mono font-semibold text-white">Rs.{dashboardStats.totalEarnings.monthly.toLocaleString()}</span>
                        </li>
                    </ul>
                </ReportCard>

                <ReportCard title="Top 5 Active Users">
                    <ul className="space-y-3 text-sm">
                        {topUsers.map((user, index) => (
                             <li key={user.id} className="flex justify-between items-center">
                                <div>
                                    <span className="font-semibold text-white">{index + 1}. {user.username}</span>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                </div>
                                <span className="font-mono bg-slate-700 px-2 py-0.5 rounded text-xs">{user.imageCreditsUsed + user.videoCreditsUsed} gens</span>
                            </li>
                        ))}
                    </ul>
                </ReportCard>
            </div>
            <div className="lg:col-span-2">
                <ReportCard title="Payment Success/Fail Logs">
                    <ul className="space-y-2 text-sm font-mono">
                        {paymentLogs.map(log => (
                            <li key={log.id} className="flex items-center gap-3 p-2 rounded-md bg-slate-900/50">
                                <span className={log.status === 'Completed' ? 'text-green-400' : 'text-red-400'}>
                                    [{log.status.toUpperCase()}]
                                </span>
                                <span className="text-slate-400">{log.date}</span>
                                <span className="text-slate-300 flex-1">
                                    User <span className="text-white">{log.userEmail}</span> tried to purchase <span className="text-white">{log.plan}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </ReportCard>
            </div>
        </div>
    );
};
