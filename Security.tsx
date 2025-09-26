import React from 'react';
import { mockActivityLogs } from '../../lib/mockAdminData';

export const Security: React.FC = () => {
    return (
        <div className="animate-fade-in bg-slate-800 rounded-xl shadow-lg">
            <div className="p-4 sm:p-6 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Admin Activity Logs</h3>
                <p className="text-sm text-slate-400">Showing the latest actions performed by admins.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Timestamp</th>
                            <th scope="col" className="px-6 py-3">Admin</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockActivityLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-mono text-slate-400">{log.timestamp}</td>
                                <td className="px-6 py-4 text-white">{log.adminEmail}</td>
                                <td className="px-6 py-4 text-slate-300">{log.action}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
