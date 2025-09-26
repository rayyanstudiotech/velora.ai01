import React, { useState } from 'react';
import { mockCoupons } from '../../lib/mockAdminData';
import { AdminCoupon } from '../../types';

export const CouponManagement: React.FC = () => {
    // In a real app, this state would come from props or a global state manager
    // For this prototype, we directly manipulate the imported mockCoupons array
    // so that changes persist between the admin and user-facing pages.
    const [coupons, setCoupons] = useState<AdminCoupon[]>(mockCoupons);
    
    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part1 = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const part2 = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `VELORA-${part1}-${part2}`;
    };

    const handleGenerateCoupon = () => {
        const newCode = generateRandomCode();
        const newCoupon: AdminCoupon = {
            code: newCode,
            status: 'Available',
            generatedOn: new Date().toISOString(),
        };
        
        // Add to the shared mock data array and update local state
        mockCoupons.unshift(newCoupon);
        setCoupons([...mockCoupons]);
    };

    const statusColors: Record<AdminCoupon['status'], string> = {
        Available: 'bg-green-500/20 text-green-300',
        Redeemed: 'bg-orange-500/20 text-orange-300',
    };

    return (
        <div className="animate-fade-in bg-slate-800 rounded-xl shadow-lg">
            <div className="p-4 sm:p-6 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Manage Coupon Codes ({coupons.length})</h3>
                <button onClick={handleGenerateCoupon} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-sm font-semibold text-white">
                    Generate New Coupon
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50 text-xs uppercase text-slate-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Coupon Code</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Generated On</th>
                            <th scope="col" className="px-6 py-3">Redeemed By</th>
                            <th scope="col" className="px-6 py-3">Redeemed On</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.code} className="border-b border-slate-700 hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-mono text-white">{coupon.code}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[coupon.status]}`}>
                                        {coupon.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-400">{new Date(coupon.generatedOn).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-slate-300">{coupon.redeemedBy || 'N/A'}</td>
                                <td className="px-6 py-4 text-slate-400">
                                    {coupon.redeemedOn ? new Date(coupon.redeemedOn).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};