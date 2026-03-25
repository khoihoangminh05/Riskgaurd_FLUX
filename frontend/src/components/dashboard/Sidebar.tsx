'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  AlertTriangle,
  UploadCloud,
  Shield,
  Globe, 
  Crosshair,
  LineChart,
  Settings, 
  LogOut,
  Activity,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Risk Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
  { name: 'Financial Health', href: '/dashboard/financials', icon: Calculator },
  { name: 'Data Ingestion', href: '/dashboard/ingest', icon: UploadCloud },
  { name: 'Risk Profile', href: '/dashboard/profile', icon: Shield },
  { name: 'Market Intel', href: '/dashboard/market', icon: Globe },
  { name: 'Competitor Radar', href: '/dashboard/competitors', icon: Crosshair },
  { name: 'Predictions', href: '/dashboard/predictions', icon: LineChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth(); 

  const handleLogout = async () => {
    if (logout) await logout();
    // Fallback clear just in case
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    router.push('/login'); 
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-slate-200 bg-white/70 backdrop-blur-xl z-20">
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tighter text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">
            Flux
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-50 text-indigo-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
              )} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex flex-row items-center w-full gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-rose-50 hover:text-rose-700 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-rose-600" />
          Logout
        </button>
      </div>
    </aside>
  );
}
