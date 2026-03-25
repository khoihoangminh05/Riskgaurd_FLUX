import React from 'react';
import { cn } from '@/lib/utils';
import { Newspaper, TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

export type Sentiment = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface NewsCardProps {
    source: string;
    headline: string;
    sentiment: Sentiment;
    summary: string;
    timestamp: string;
    threatLevel?: ThreatLevel;
    competitorName?: string;
}

export default function NewsCard({
    source,
    headline,
    sentiment,
    summary,
    timestamp,
    threatLevel,
    competitorName
}: NewsCardProps) {
    
    const getSentimentStyles = (s: Sentiment) => {
        switch (s) {
            case 'BULLISH':
                return {
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: <TrendingUp className="w-3.5 h-3.5 mr-1" />
                };
            case 'BEARISH':
                return {
                    badge: 'bg-rose-50 text-rose-700 border-rose-200',
                    icon: <TrendingDown className="w-3.5 h-3.5 mr-1" />
                };
            case 'NEUTRAL':
                return {
                    badge: 'bg-slate-50 text-slate-600 border-slate-200',
                    icon: <Minus className="w-3.5 h-3.5 mr-1" />
                };
        }
    };

    const getThreatStyles = (t: ThreatLevel) => {
        switch (t) {
            case 'HIGH':
                return {
                    badge: 'bg-red-50 text-red-700 border-red-200',
                    icon: <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                };
            case 'MEDIUM':
                return {
                    badge: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                };
            case 'LOW':
                return {
                    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                };
        }
    };

    const sentimentStyle = getSentimentStyles(sentiment);
    const threatStyle = threatLevel ? getThreatStyles(threatLevel) : null;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full hover:border-slate-300 group">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm group-hover:scale-105 transition-transform">
                        <Newspaper className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">{source}</span>
                        {competitorName && (
                            <div className="text-[10px] text-slate-400 font-medium">Topic: {competitorName}</div>
                        )}
                    </div>
                </div>
                <time className="text-xs text-slate-400 font-medium whitespace-nowrap">{timestamp}</time>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                {headline}
            </h3>
            
            <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-grow line-clamp-2">
                {summary}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                <div className={cn("inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border", sentimentStyle.badge)}>
                    {sentimentStyle.icon}
                    {sentiment}
                </div>
                {threatStyle && threatLevel && (
                    <div className={cn("inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border", threatStyle.badge)}>
                        {threatStyle.icon}
                        THREAT: {threatLevel}
                    </div>
                )}
            </div>
        </div>
    );
}
