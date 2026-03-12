import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-bold text-xl">RG</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">RiskGuard</h1>
                    </div>
                </div>
                {children}
            </div>
            <p className="mt-8 text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} RiskGuard Enterprise. All rights reserved.
            </p>
        </div>
    );
}
