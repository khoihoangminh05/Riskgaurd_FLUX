'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Bell,
    FileText,
    Settings,
    X,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn utility exists or I'll provide a simple one

import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

const navItems = [
    { name: 'Dashboard', href: '', icon: LayoutDashboard },
    { name: 'Risk Alerts', href: '/alerts', icon: Bell },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user } = useAuth();
    const params = useParams();

    const ticker = (params?.ticker as string) || user?.company?.ticker;

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
                        <Link href={ticker ? `/dashboard/${ticker}` : '/dashboard'} className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">RiskGuard</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        {navItems.map((item) => {
                            const fullHref = ticker ? `/dashboard/${ticker}${item.href}` : `/dashboard${item.href}`;
                            const isActive = pathname === fullHref || (item.href !== '' && pathname.startsWith(fullHref));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={fullHref}
                                    onClick={() => onClose()}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                        isActive
                                            ? "bg-indigo-600/10 text-indigo-400"
                                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                                    )} />
                                    {item.name}
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer/Pro Version */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-lg shadow-indigo-600/10 overflow-hidden relative group">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                            <p className="text-white text-xs font-bold uppercase tracking-wider mb-1">MVP Version</p>
                            <p className="text-white/80 text-xs mb-3">Upgrade for AI-powered risk projections.</p>
                            <button className="w-full py-1.5 bg-white text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                                Get Pro
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
