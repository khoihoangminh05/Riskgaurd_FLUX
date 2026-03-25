'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  
  // Quick hack to format pathname into a breadcrumb string
  const getBreadcrumbs = () => {
    if (!pathname || pathname === '/dashboard') return 'Overview';
    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-xl flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {getBreadcrumbs()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - Mock */}
        <div className="relative hidden md:flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-64 h-9 pl-9 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white"></span>
        </button>

        {/* User Profile - Mock */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-slate-900">Executive User</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
            EU
          </div>
        </div>
      </div>
    </header>
  );
}
