import React, { useState } from 'react';
import { Plan } from '../types';
import { PayoneerIcon, EasypaisaIcon, JazzcashIcon } from './Icons';

interface PaymentPageProps {
    plan: Plan;
    onPaymentSuccess: () => void;
}

const paymentOptions = [
    { name: 'Easypaisa', icon: <EasypaisaIcon className="w-6 h-6" /> },
    { name: 'Jazz Cash', icon: <JazzcashIcon className="w-6 h-6" /> },
    { name: 'Payoneer', icon: <PayoneerIcon className="w-6 h-6" /> },
];

export const PaymentPage: React.FC<PaymentPageProps> = ({ plan, onPaymentSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState<string>(paymentOptions[0].name);
    const [accountNumber, setAccountNumber] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [paymentMessage, setPaymentMessage] = useState<string>('');

    const handlePayment = () => {
        if (!selectedMethod) return;
        
        if ((selectedMethod === 'Easypaisa' || selectedMethod === 'Jazz Cash') && !accountNumber.trim()) {
            // A simple validation
            alert('Please enter your account number.');
            return;
        }

        setIsProcessing(true);
        setPaymentMessage(`Processing payment with ${selectedMethod}...`);

        setTimeout(() => {
            setPaymentMessage('Payment successful! Redirecting to your dashboard...');
            setTimeout(() => {
                onPaymentSuccess();
            }, 2000);
        }, 3000);
    };

    const renderPaymentDetails = () => {
        const commonButton = (
            <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full mt-6 bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-transform transform hover:scale-105 duration-200 disabled:bg-orange-500/50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {isProcessing ? 'Processing...' : 'Pay Now'}
            </button>
        );

        switch (selectedMethod) {
            case 'Easypaisa':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-slate-100">Pay with Easypaisa</h4>
                        <p className="text-sm text-slate-400">
                            Experience easy payments – save your Easypaisa account as default method to pay!
                            Please ensure your Easypaisa account is Active and has sufficient balance.
                        </p>
                        <p className="text-sm text-slate-400 font-medium">To confirm your payment after providing OTP:</p>
                        <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
                            <li>USSD prompt for Telenor Customers Only.</li>
                            <li>Unlock your phone and enter 5 digit PIN in the prompt to pay.</li>
                            <li>Approve Payment in your Easypaisa App (Telenor and Other Networks).</li>
                        </ul>
                        <div>
                             <label htmlFor="easypaisa-account" className="block text-sm font-medium text-slate-300 mb-2">
                                Easypaisa Account Number
                            </label>
                            <input
                                id="easypaisa-account"
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="e.g. 03XXXXXXXXX"
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
                                disabled={isProcessing}
                            />
                        </div>
                        {commonButton}
                    </div>
                );
            case 'Jazz Cash':
                return (
                     <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-slate-100">Pay with Jazz Cash</h4>
                        <div>
                            <p className="text-sm text-slate-300 font-bold">FOR JAZZ/WARID</p>
                            <p className="text-sm text-slate-400">Unlock your phone and you will receive a MPIN Input Prompt.</p>
                        </div>
                         <div>
                            <p className="text-sm text-slate-300 font-bold">FOR OTHER NETWORKS</p>
                            <p className="text-sm text-slate-400">Log-in to your JazzCash App and enter your MPIN.</p>
                        </div>
                        <p className="text-xs text-slate-500 pt-2">Note: Ensure your JazzCash account is Active and has sufficient balance.</p>
                        <div>
                             <label htmlFor="jazzcash-account" className="block text-sm font-medium text-slate-300 mb-2">
                                JazzCash Account Number
                            </label>
                            <input
                                id="jazzcash-account"
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="e.g. 03XXXXXXXXX"
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out placeholder:text-slate-400"
                                disabled={isProcessing}
                            />
                        </div>
                        {commonButton}
                    </div>
                );
            case 'Payoneer':
                return (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-lg text-slate-100">Pay with Payoneer</h4>
                        <p className="text-sm text-slate-400">You have requested a payment. Please review the details below and proceed.</p>
                        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Payment Request ID</span>
                                <span className="text-slate-200 font-mono">748110</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Description</span>
                                <span className="text-slate-200">{plan.name} Subscription</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Amount</span>
                                <span className="text-slate-200 font-bold">{plan.price}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400 font-medium">Due By</span>
                                <span className="text-slate-200">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                        {commonButton}
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="bg-slate-800 rounded-xl shadow-lg">
                    <div className="flex border-b border-slate-700">
                        {paymentOptions.map(option => (
                            <button
                                key={option.name}
                                onClick={() => {
                                    setSelectedMethod(option.name);
                                    setAccountNumber(''); // Reset account number on tab change
                                }}
                                disabled={isProcessing}
                                className={`flex-1 p-4 flex items-center justify-center gap-3 font-semibold transition-colors duration-200 disabled:opacity-50 ${
                                    selectedMethod === option.name 
                                        ? 'bg-slate-700/50 text-sky-400 border-b-2 border-sky-400' 
                                        : 'text-slate-400 hover:bg-slate-700/30'
                                }`}
                                aria-pressed={selectedMethod === option.name}
                            >
                                {option.icon}
                                <span>{option.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="p-6 sm:p-8">
                        {renderPaymentDetails()}
                    </div>
                </div>
            </div>
            <div className="md:col-span-1">
                 <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-slate-100 border-b border-slate-700 pb-4 mb-4">Order Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <p className="text-slate-300">{plan.name}</p>
                            <p className="font-semibold text-white">{plan.price}</p>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <p className="text-slate-400">Taxes & Fees</p>
                            <p className="font-semibold text-slate-300">Calculated at checkout</p>
                        </div>
                    </div>
                    <div className="border-t border-slate-700 mt-4 pt-4">
                        <div className="flex justify-between items-center font-bold">
                            <p className="text-lg text-slate-200">Total Amount</p>
                            <p className="text-xl text-sky-400">{plan.price}</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{plan.priceDetails}</p>
                    </div>
                    {paymentMessage && (
                        <p className="text-center text-green-400 mt-6 animate-pulse font-semibold">{paymentMessage}</p>
                    )}
                 </div>
            </div>
        </div>
    );
};