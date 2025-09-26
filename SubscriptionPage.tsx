import React from 'react';
import { Plan, UserSubscription } from '../types';
import { plans } from '../lib/plans';

const CheckIcon = () => (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
    </svg>
);

interface PlanFeatureProps {
    text: string;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ text }) => (
    <li className="flex items-center space-x-3">
        <CheckIcon />
        <span className="text-slate-300">{text}</span>
    </li>
);

interface SubscriptionPageProps {
    onPlanChosen?: (plan: Plan) => void;
    userSubscription: UserSubscription | null;
    couponApplied?: boolean;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onPlanChosen, userSubscription, couponApplied }) => {
    return (
        <div className="animate-fade-in">
            <div className="text-center mb-10 sm:mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white">Choose Your Plan</h1>
                <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
                    Unlock more features and power up your creative workflow with one of our pro plans.
                </p>
                 {couponApplied && (
                    <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg max-w-2xl mx-auto">
                        Coupon applied successfully! Your Pro Plan is free for the first month.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
                {plans.map((plan) => {
                    const isCurrentPlan = userSubscription?.plan.name === plan.name;
                    const isProPlanWithCoupon = couponApplied && plan.name === 'Pro Plan';
                    
                    const displayPlan = isProPlanWithCoupon ? {
                        ...plan,
                        price: 'Rs.0',
                        priceDetails: '/ for 1 month',
                        highlight: true,
                        highlightText: 'FREE WITH COUPON',
                        borderColor: 'border-amber-400',
                        buttonColor: 'bg-amber-500 hover:bg-amber-600',
                    } : plan;

                    const isPopular = displayPlan.highlight && !isCurrentPlan;

                    return (
                        <div
                            key={displayPlan.name}
                            className={`relative rounded-xl shadow-lg p-8 flex flex-col ${displayPlan.bgColor} border-2 ${isCurrentPlan ? 'border-amber-500 ring-2 ring-amber-500/50' : displayPlan.borderColor} transition-all duration-300 ${isPopular ? 'scale-105 shadow-2xl shadow-sky-500/40' : ''} ${!isCurrentPlan ? 'hover:scale-105' : ''}`}
                        >
                            {isPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className={`text-white text-xs font-semibold px-4 py-1 rounded-full uppercase ${isProPlanWithCoupon ? 'bg-amber-500' : 'bg-sky-500'}`}>{displayPlan.highlightText}</span>
                                </div>
                            )}
                             {isCurrentPlan && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="bg-amber-500 text-white text-xs font-semibold px-4 py-1 rounded-full uppercase">Active Plan</span>
                                </div>
                            )}
                            <h3 className="text-2xl font-bold text-slate-100">{displayPlan.name}</h3>
                            <div className="my-6">
                                <span className="text-5xl font-extrabold text-white">{displayPlan.price}</span>
                                <span className="text-slate-400 ml-1">{displayPlan.priceDetails}</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                {displayPlan.features.map((feature, index) => (
                                    <PlanFeature key={index} text={feature} />
                                ))}
                            </ul>
                            <button
                                onClick={() => !isCurrentPlan && onPlanChosen?.(plan)}
                                disabled={isCurrentPlan}
                                className={`w-full font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 transition-colors duration-200 ${
                                    isCurrentPlan 
                                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                    : `${displayPlan.buttonColor} ${displayPlan.buttonTextColor} focus:ring-sky-300`
                                }`}
                            >
                                {isCurrentPlan ? 'Currently Active' : isProPlanWithCoupon ? 'Get Free Plan' : 'Choose Plan'}
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="text-center mt-16 text-slate-400">
                <p>Prices are in Pakistani Rupees (PKR). All plans are billed monthly. You can cancel anytime.</p>
            </div>
        </div>
    );
};