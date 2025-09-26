import { plans } from './plans';
import type { AdminWithdrawal, AdminCoupon } from '../types';

// ------------------ Interfaces ------------------

export interface AdminManagedUser {
  id: string;
  username: string;
  email: string;
  plan: string;
  imageCreditsUsed: number;
  videoCreditsUsed: number;
  status: 'Active' | 'Banned';
  joinedDate: string;
}

export interface AdminPayment {
  id: string;
  userEmail: string;
  plan: string;
  amount: string;
  date: string;
  method: 'Easypaisa' | 'Jazz Cash' | 'Payoneer' | 'PayPal';
  status: 'Completed' | 'Pending' | 'Failed';
}

export interface AdminActivityLog {
  id: number;
  adminEmail: string;
  action: string;
  timestamp: string;
}

// ------------------ Mock Data ------------------

export const mockUsers: AdminManagedUser[] = [
  { id: 'usr_001', username: 'Alice', email: 'alice@example.com', plan: 'Pro Plan', imageCreditsUsed: 15, videoCreditsUsed: 5, status: 'Active', joinedDate: '2024-05-01' },
  { id: 'usr_002', username: 'Bob', email: 'bob@example.com', plan: 'Starter Plan', imageCreditsUsed: 8, videoCreditsUsed: 2, status: 'Active', joinedDate: '2024-05-03' },
  { id: 'usr_003', username: 'Charlie', email: 'charlie@example.com', plan: 'Mega Pro Plan', imageCreditsUsed: 75, videoCreditsUsed: 18, status: 'Active', joinedDate: '2024-04-20' },
  { id: 'usr_004', username: 'Diana', email: 'diana@example.com', plan: 'Starter Plan', imageCreditsUsed: 10, videoCreditsUsed: 3, status: 'Banned', joinedDate: '2024-03-15' },
  { id: 'usr_005', username: 'Ethan', email: 'ethan@example.com', plan: 'Pro Plan', imageCreditsUsed: 2, videoCreditsUsed: 1, status: 'Active', joinedDate: '2024-05-10' },
];

export const mockPayments: AdminPayment[] = [
  { id: 'txn_101', userEmail: 'alice@example.com', plan: 'Pro Plan', amount: 'Rs.999', date: '2024-05-01', method: 'Easypaisa', status: 'Completed' },
  { id: 'txn_102', userEmail: 'charlie@example.com', plan: 'Mega Pro Plan', amount: 'Rs.4,999', date: '2024-04-20', method: 'Payoneer', status: 'Completed' },
  { id: 'txn_103', userEmail: 'frank@example.com', plan: 'Pro Plan', amount: 'Rs.999', date: '2024-05-08', method: 'Jazz Cash', status: 'Failed' },
  { id: 'txn_104', userEmail: 'grace@example.com', plan: 'Super Pro Plan', amount: 'Rs.2,999', date: '2024-05-09', method: 'Easypaisa', status: 'Pending' },
  { id: 'txn_105', userEmail: 'ethan@example.com', plan: 'Pro Plan', amount: 'Rs.999', date: '2024-05-10', method: 'Jazz Cash', status: 'Completed' },
];

export const mockWithdrawals: AdminWithdrawal[] = [
  { id: 'wd_001', adminEmail: 'rayyanzameer03@gmail.com', amount: 5000, easypaisaNumber: '03001234567', easypaisaName: 'Rayyan Zameer', status: 'Completed', timestamp: '2024-05-05 10:00:00' },
  { id: 'wd_002', adminEmail: 'rayyanzameer03@gmail.com', amount: 2500, easypaisaNumber: '03001234567', easypaisaName: 'Rayyan Zameer', status: 'Pending', timestamp: '2024-05-10 16:30:00' },
];

export const mockActivityLogs: AdminActivityLog[] = [
  { id: 1, adminEmail: 'rayyanzameer03@gmail.com', action: 'Banned user diana@example.com', timestamp: '2024-05-09 14:30:15' },
  { id: 2, adminEmail: 'rayyanzameer03@gmail.com', action: "Updated user alice@example.com's plan to Pro", timestamp: '2024-05-09 11:20:05' },
  { id: 3, adminEmail: 'rayyanzameer03@gmail.com', action: 'Manually approved payment txn_102', timestamp: '2024-05-08 18:05:45' },
  { id: 4, adminEmail: 'rayyanzameer03@gmail.com', action: 'Logged in to Admin Panel', timestamp: '2024-05-08 18:00:00' },
];

export const mockCoupons: AdminCoupon[] = [
    { code: 'RAYYAN99110', status: 'Available', generatedOn: new Date('2024-01-01').toISOString() },
    { code: 'VELORA-USED-123', status: 'Redeemed', generatedOn: new Date('2024-05-01').toISOString(), redeemedOn: new Date('2024-05-02').toISOString(), redeemedBy: 'used@example.com' }
];

export const getPlanByName = (name: string) => plans.find(p => p.name === name);

// ------------------ Utility Functions ------------------

const parseAmount = (amount: string): number =>
  parseInt(amount.replace(/[^\d]/g, ''), 10) || 0;

const now = new Date();
const isSameDay = (d: Date) => d.toDateString() === now.toDateString();

const isSameWeek = (d: Date) => {
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
};

const isSameMonth = (d: Date) =>
  d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

// ------------------ Dashboard Stats Calculation ------------------

const completedPayments = mockPayments.filter(p => p.status === 'Completed');

const totalEarningsAllTime = completedPayments.reduce(
  (sum, p) => sum + parseAmount(p.amount), 0
);

const totalEarningsToday = completedPayments
  .filter(p => isSameDay(new Date(p.date)))
  .reduce((sum, p) => sum + parseAmount(p.amount), 0);

const totalEarningsWeek = completedPayments
  .filter(p => isSameWeek(new Date(p.date)))
  .reduce((sum, p) => sum + parseAmount(p.amount), 0);

const totalEarningsMonth = completedPayments
  .filter(p => isSameMonth(new Date(p.date)))
  .reduce((sum, p) => sum + parseAmount(p.amount), 0);

const activeUsers = mockUsers.filter(u => u.status === 'Active');

const subscriptionCounts = activeUsers.reduce((acc, u) => {
  acc[u.plan] = (acc[u.plan] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const totalImagesToday = activeUsers.reduce((sum, u) => sum + u.imageCreditsUsed, 0);
const totalVideosToday = activeUsers.reduce((sum, u) => sum + u.videoCreditsUsed, 0);

// ------------------ Export Dashboard ------------------

export const dashboardStats = {
  totalUsers: mockUsers.length,
  totalEarnings: {
    allTime: totalEarningsAllTime,
    monthly: totalEarningsMonth,
    weekly: totalEarningsWeek,
    today: totalEarningsToday,
  },
  activeSubscriptions: {
    starter: subscriptionCounts['Starter Plan'] || 0,
    pro: subscriptionCounts['Pro Plan'] || 0,
    superPro: subscriptionCounts['Super Pro Plan'] || 0,
    megaPro: subscriptionCounts['Mega Pro Plan'] || 0,
  },
  generationsToday: {
    images: totalImagesToday,
    videos: totalVideosToday,
  },
};