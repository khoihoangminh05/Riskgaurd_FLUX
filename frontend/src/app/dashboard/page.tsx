'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardIndex() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user?.company?.ticker) {
                router.replace(`/dashboard/${user.company.ticker}`);
            } else {
                router.replace('/ingest');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm animate-pulse">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}
