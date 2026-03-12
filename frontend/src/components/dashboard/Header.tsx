'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Menu,
    Search,
    ChevronRight,
    LogOut,
    User as UserIcon,
    ChevronDown
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Simple breadcrumb logic
    const breadcrumbs = pathname
        .split('/')
        .filter(Boolean)
        .map((path, index, arr) => {
            const href = `/${arr.slice(0, index + 1).join('/')}`;
            const name = path.charAt(0).toUpperCase() + path.slice(1);
            return { name, href, isLast: index === arr.length - 1 };
        });

    return (
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-lg"
                >
                    <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumbs */}
                <nav className="hidden md:flex items-center text-sm font-medium">
                    <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 transition-colors">
                        Home
                    </Link>
                    {breadcrumbs.map((crumb) => (
                        <React.Fragment key={crumb.href}>
                            <ChevronRight className="w-4 h-4 text-slate-700 mx-2" />
                            <Link
                                href={crumb.href}
                                className={cn(
                                    "transition-colors",
                                    crumb.isLast ? "text-slate-200" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {crumb.name}
                            </Link>
                        </React.Fragment>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                {/* Search - Decorative for MVP */}
                <div className="hidden sm:flex relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        className="w-48 xl:w-64 bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-9 pr-4 text-sm text-slate-300 placeholder:text-slate-600 focus:border-indigo-500 transition-all outline-none"
                        placeholder="Search risk events..."
                    />
                </div>

                {/* User Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-2 p-1.5 bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl transition-all"
                    >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                            {user?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="hidden sm:block text-left mr-1">
                            <p className="text-xs font-semibold text-slate-200 leading-tight">
                                {user?.fullName || 'User'}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-tight">Admin Level</p>
                        </div>
                        <ChevronDown className={cn(
                            "w-3.5 h-3.5 text-slate-500 transition-transform",
                            isUserMenuOpen && "rotate-180"
                        )} />
                    </button>

                    {isUserMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsUserMenuOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in duration-200">
                                <div className="px-4 py-2 border-b border-slate-800 mb-1">
                                    <p className="text-xs font-medium text-slate-500">SIGNED IN AS</p>
                                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                                </div>
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    <UserIcon className="w-4 h-4" />
                                    My Profile
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                                    onClick={() => {
                                        logout();
                                        setIsUserMenuOpen(false);
                                    }}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Log Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
