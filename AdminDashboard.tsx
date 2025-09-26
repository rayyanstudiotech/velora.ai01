import React from 'react';
import { dashboardStats } from '../../lib/mockAdminData';
// FIX: Import ImageIcon from ../Icons to resolve reference error on line 28.
import { UsersIcon, CurrencyDollarIcon, SparklesIcon, ImageIcon } from '../Icons';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; subtext?: string; }> = ({ title, value, icon, subtext }) => (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex items-start space-x-4">
        <div className="bg-slate-700 text-sky-400 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    const { totalUsers, totalEarnings, activeSubscriptions, generationsToday } = dashboardStats;
    const totalActiveSubs = activeSubscriptions.pro + activeSubscriptions.superPro + activeSubscriptions.megaPro;

    return (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={<UsersIcon />} />
                <StatCard title="Total Earnings" value={`Rs.${totalEarnings.allTime.toLocaleString()}`} icon={<CurrencyDollarIcon />} subtext="All Time" />
                <StatCard title="Active Subscriptions" value={totalActiveSubs.toLocaleString()} icon={<SparklesIcon />} subtext={`${activeSubscriptions.starter} on Starter`} />
                <StatCard title="Today's Generations" value={(generationsToday.images + generationsToday.videos).toLocaleString()} icon={<ImageIcon />} subtext={`${generationsToday.images} images, ${generationsToday.videos} videos`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Earnings Overview</h3>
                    <div className="space-y-4">
                        {/* Placeholder for a chart. Using bars for visual representation. */}
                        <div className="flex items-center">
                            <span className="w-20 text-sm text-slate-400">Today</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-6">
                                <div className="bg-sky-500 h-6 rounded-full text-xs text-white flex items-center px-2" style={{ width: `${(totalEarnings.today / totalEarnings.monthly) * 100}%` }}>
                                    Rs.{totalEarnings.today.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="w-20 text-sm text-slate-400">This Week</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-6">
                                <div className="bg-sky-500 h-6 rounded-full text-xs text-white flex items-center px-2" style={{ width: `${(totalEarnings.weekly / totalEarnings.monthly) * 100}%` }}>
                                    Rs.{totalEarnings.weekly.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="w-20 text-sm text-slate-400">This Month</span>
                             <div className="flex-1 bg-slate-700 rounded-full h-6">
                                <div className="bg-sky-500 h-6 rounded-full text-xs text-white flex items-center px-2" style={{ width: '100%' }}>
                                    Rs.{totalEarnings.monthly.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-white mb-4">Subscription Breakdown</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between items-center">
                            <span className="text-slate-300">Mega Pro Plan</span>
                            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{activeSubscriptions.megaPro}</span>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="text-slate-300">Super Pro Plan</span>
                            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{activeSubscriptions.superPro}</span>
                        </li>
                         <li className="flex justify-between items-center">
                            <span className="text-slate-300">Pro Plan</span>
                            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{activeSubscriptions.pro}</span>
                        </li>
                         <li className="flex justify-between items-center">
                            <span className="text-slate-300">Starter Plan</span>
                            <span className="font-mono bg-slate-700 px-2 py-0.5 rounded">{activeSubscriptions.starter}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};