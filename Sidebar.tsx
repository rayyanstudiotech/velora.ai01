import React from 'react';
import { Page } from '../types';
import { DashboardIcon, ImageIcon, VideoIcon, FilmIcon, XIcon, SparklesIcon, HistoryIcon } from './Icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  page: Page;
  activePage: Page;
  onClick: (page: Page) => void;
}> = ({ icon, label, page, activePage, onClick }) => {
  const isActive = activePage === page;
  return (
    <li>
      <button
        onClick={() => onClick(page)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-sky-500 text-white rounded-lg shadow-sm'
            : 'text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg'
        }`}
      >
        {icon}
        <span className="ml-3">{label}</span>
      </button>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
  const navItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', page: Page.Dashboard },
    { icon: <ImageIcon />, label: 'Text to Image', page: Page.TextToImage },
    { icon: <VideoIcon />, label: 'Text to Video', page: Page.TextToVideo },
    { icon: <FilmIcon />, label: 'Image to Video', page: Page.ImageToVideo },
    { icon: <HistoryIcon />, label: 'History', page: Page.History },
    { icon: <SparklesIcon />, label: 'Subscription', page: Page.Subscription },
  ];

  return (
    <>
        <aside className={`fixed z-30 h-full w-64 bg-slate-800/90 backdrop-blur-md text-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">Velora AI</h1>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
                <XIcon />
            </button>
        </div>
        <nav className="flex-1 px-2 py-4">
            <ul className="space-y-2">
            {navItems.map((item) => (
                <NavLink
                key={item.page}
                icon={item.icon}
                label={item.label}
                page={item.page}
                activePage={activePage}
                onClick={setActivePage}
                />
            ))}
            </ul>
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
            <p>© 2025 Velora AI Media Studio.</p>
        </div>
        </aside>
        {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"></div>}
    </>
  );
};