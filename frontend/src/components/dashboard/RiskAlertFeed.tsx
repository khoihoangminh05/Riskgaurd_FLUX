'use client';

import React from 'react';
import { Bell, Info, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskAlert {
    id: string;
    severity: Severity;
    summary: string;
    createdAt: string | Date;
}

interface RiskAlertFeedProps {
    alerts: RiskAlert[];
}

const formatRelativeTime = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date);
};

const getSeverityStyles = (severity: Severity) => {
    switch (severity) {
        case 'HIGH':
            return {
                border: 'border-l-red-500',
                bg: 'bg-red-50',
                text: 'text-red-600',
                icon: <AlertCircle className="w-4 h-4" />,
                label: 'High Risk'
            };
        case 'MEDIUM':
            return {
                border: 'border-l-amber-500',
                bg: 'bg-amber-50',
                text: 'text-amber-600',
                icon: <AlertTriangle className="w-4 h-4" />,
                label: 'Medium Risk'
            };
        case 'LOW':
            return {
                border: 'border-l-slate-400',
                bg: 'bg-slate-50',
                text: 'text-slate-500',
                icon: <Info className="w-4 h-4" />,
                label: 'Low Risk'
            };
        default:
            return {
                border: 'border-l-slate-300',
                bg: 'bg-slate-50',
                text: 'text-slate-500',
                icon: <Info className="w-4 h-4" />,
                label: 'Notice'
            };
    }
};

export default function RiskAlertFeed({ alerts }: RiskAlertFeedProps) {
    return (
        <aside className="w-full lg:w-80 flex flex-col bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden h-fit max-h-[80vh]">
            <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-xl">
                        <Bell className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900 tracking-tight">Recent Alerts</h2>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {alerts.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="bg-emerald-50 p-4 rounded-full mb-4">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        <h3 className="text-slate-900 font-semibold mb-1">System Safe</h3>
                        <p className="text-slate-500 text-xs leading-relaxed">
                            No active risks detected. Your system is safe.
                        </p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const styles = getSeverityStyles(alert.severity);
                        return (
                            <div 
                                key={alert.id}
                                className={`group relative p-4 bg-slate-50 border border-slate-100 border-l-4 ${styles.border} rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all duration-200 cursor-pointer shadow-sm`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
                                        {styles.icon}
                                        {styles.label}
                                    </div>
                                    <time className="text-[10px] text-slate-400 font-medium">
                                        {formatRelativeTime(alert.createdAt)}
                                    </time>
                                </div>
                                <p className="text-sm text-slate-700 leading-snug line-clamp-2 group-hover:text-slate-900 transition-colors">
                                    {alert.summary}
                                </p>
                            </div>
                        );
                    })
                )}
            </div>

            {alerts.length > 0 && (
                <div className="p-3 border-t border-slate-100 bg-slate-50">
                    <button className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-none hover:shadow-sm">
                        View all historical alerts
                    </button>
                </div>
            )}
        </aside>
    );
}
