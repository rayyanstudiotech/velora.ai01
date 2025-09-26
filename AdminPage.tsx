import React, { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { UserManagement } from './UserManagement';
import { PaymentManagement } from './PaymentManagement';
import { WithdrawalManagement } from './WithdrawalManagement';
import { CouponManagement } from './CouponManagement';
import { Settings } from './Settings';
import { DashboardIcon, UsersIcon, CurrencyDollarIcon, SettingsIcon, XIcon, BanknotesIcon, LogoutIcon, CouponIcon } from '../Icons';

type AdminSection = 'dashboard' | 'users' | 'payments' | 'withdrawals' | 'coupons' | 'settings';

interface AdminPageProps {
    onExitAdmin: () => void;
}

const AdminSidebar: React.FC<{
    activeSection: AdminSection;
    setActiveSection: (section: AdminSection) => void;
    setSidebarOpen: (isOpen: boolean) => void;
}> = ({ activeSection, setActiveSection, setSidebarOpen }) => {
    
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { id: 'users', label: 'User Management', icon: <UsersIcon /> },
        { id: 'payments', label: 'Payment Management', icon: <CurrencyDollarIcon /> },
        { id: 'withdrawals', label: 'Withdrawals', icon: <BanknotesIcon /> },
        { id: 'coupons', label: 'Coupon Management', icon: <CouponIcon /> },
        { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
    ];

    const NavLink: React.FC<{
        item: typeof navItems[0],
        isActive: boolean,
        onClick: (section: AdminSection) => void
    }> = ({ item, isActive, onClick }) => (
        <li>
            <button
                onClick={() => onClick(item.id as AdminSection)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                    isActive
                        ? 'bg-sky-500 text-white rounded-lg shadow-sm'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg'
                }`}
                aria-current={isActive ? 'page' : undefined}
            >
                {item.icon}
                <span className="ml-3">{item.label}</span>
            </button>
        </li>
    );

    return (
        <aside className="bg-slate-800 text-slate-200 w-64 flex flex-col shrink-0 h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <button 
                    onClick={() => setSidebarOpen(false)} 
                    className="text-slate-400 hover:text-white transition-colors md:hidden"
                    aria-label="Close sidebar"
                >
                    <XIcon />
                </button>
            </div>
            <nav className="flex-1 px-2 py-4">
                <ul className="space-y-2">
                    {navItems.map(item => (
                        <NavLink 
                            key={item.id} 
                            item={item} 
                            isActive={activeSection === item.id} 
                            onClick={(section) => {
                                setActiveSection(section);
                                setSidebarOpen(false);
                            }} 
                        />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
                <p>© 2025 Velora AI. Admin Console.</p>
            </div>
        </aside>
    );
};


export const AdminPage: React.FC<AdminPageProps> = ({ onExitAdmin }) => {
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard': return <AdminDashboard />;
            case 'users': return <UserManagement />;
            case 'payments': return <PaymentManagement />;
            case 'withdrawals': return <WithdrawalManagement />;
            case 'coupons': return <CouponManagement />;
            case 'settings': return <Settings />;
            default: return <AdminDashboard />;
        }
    };

    const sectionTitles: Record<AdminSection, string> = {
        dashboard: 'Dashboard',
        users: 'User Management',
        payments: 'Payment Management',
        withdrawals: 'Withdrawal Management',
        coupons: 'Coupon Management',
        settings: 'Settings',
    };

    return (
        <div className="flex h-screen bg-slate-900 font-sans text-slate-200">
            {/* Mobile overlay */}
            {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"></div>}
            
            {/* Sidebar */}
            <div className={`fixed z-30 h-full transition-transform duration-300 ease-in-out transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <AdminSidebar activeSection={activeSection} setActiveSection={setActiveSection} setSidebarOpen={setSidebarOpen} />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 shadow-sm">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white mr-4 md:hidden">
                            <span className="sr-only">Open sidebar</span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <h1 className="text-xl font-bold text-slate-200">{sectionTitles[activeSection]}</h1>
                    </div>
                    <button 
                        onClick={onExitAdmin}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-sm font-medium rounded-md transition-colors"
                        title="Exit Admin Panel"
                    >
                        <LogoutIcon />
                        <span className="hidden sm:inline">Exit Admin</span>
                    </button>
                </header>
                <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                    {renderSection()}
                </main>
            </div>
        </div>
    );
};