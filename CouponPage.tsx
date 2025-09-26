import React, { useState } from 'react';
import { GeneratorCard } from './GeneratorCard';
import { CouponIcon } from './Icons';
import { mockCoupons } from '../lib/mockAdminData';

interface CouponPageProps {
    onCouponSuccess: (code: string) => void;
}

export const CouponPage: React.FC<CouponPageProps> = ({ onCouponSuccess }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        const trimmedCode = code.trim().toUpperCase();

        setTimeout(() => {
            const coupon = mockCoupons.find(c => c.code.toUpperCase() === trimmedCode);

            if (!coupon) {
                setError('Invalid coupon code. Please check the code and try again.');
                setLoading(false);
                return;
            }

            if (coupon.status === 'Redeemed') {
                setError('Your Coupon Code Was already Redeemed.');
                setLoading(false);
                return;
            }

            if (coupon.status === 'Available') {
                onCouponSuccess(coupon.code);
            }
        }, 500);
    };

    return (
        <GeneratorCard title="Redeem Coupon Code">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="coupon-code" className="block text-md font-medium text-slate-300 mb-2">
                        Enter your coupon code
                    </label>
                    <div className="relative">
                        <input
                            id="coupon-code"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter your code"
                            className="w-full p-3 pl-10 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
                            required
                            disabled={loading}
                            aria-describedby="coupon-error"
                        />
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CouponIcon />
                        </div>
                    </div>
                </div>

                {error && (
                    <div id="coupon-error" className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm" role="alert">
                        {error}
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-sky-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200 disabled:bg-sky-500/50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {loading ? 'Redeeming...' : 'Redeem Code'}
                    </button>
                </div>
            </form>
        </GeneratorCard>
    );
};