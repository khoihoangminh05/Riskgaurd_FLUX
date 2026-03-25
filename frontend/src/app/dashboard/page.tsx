'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api, { financeApi, DashboardData } from '@/lib/api';
import Link from 'next/link';
import { 
    TrendingUp, 
    Plus, 
    Activity, 
    TrendingDown, 
    DollarSign,
    LayoutDashboard,
    AlertTriangle,
    ShieldAlert
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Brush,
} from 'recharts';
import RiskAlertFeed from '@/components/dashboard/RiskAlertFeed';
import { cn } from '@/lib/utils';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';


export default function DashboardIndex() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const company = user?.company;
    const ticker = company?.ticker;

    const [chartData, setChartData] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [riskThreshold, setRiskThreshold] = useState<number>(70);
    const [scoreData, setScoreData] = useState<{ currentScore: number; baseScore: number; alertPenalty: number } | null>(null);

    useEffect(() => {
        if (!company?.id) {
            if (!authLoading) setIsLoading(false);
            return;
        }

        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch profile and metrics to maintain UI grid
                const profileRes = await api.getRiskProfile(company.id).catch(() => null);
                if (profileRes) setRiskThreshold(profileRes.riskThreshold ?? 70);

                const dashRes = await api.getDashboardMetrics(company.id).catch(() => null);
                if (dashRes) setData(dashRes);

                const [scoreRes, alertsRes, chartRes] = await Promise.all([
                    api.getDynamicRiskScore(company.id),
                    api.getAlerts(company.id),
                    api.getRiskChartHistory(company.id)
                ]);
                
                setScoreData(scoreRes);
                setAlerts(alertsRes.slice(0, 5)); // Only top 5 for widget
                
                // CRITICAL FIX FOR CHART SYNC: 
                // Force the LAST data point of the chart to exactly match the current dynamic risk score.
                if (chartRes && chartRes.length > 0) {
                    (chartRes[chartRes.length - 1] as any).score = scoreRes.currentScore;
                    chartRes[chartRes.length - 1].totalScore = scoreRes.currentScore.toString(); // For Recharts dataKey
                }
                setChartData(chartRes || []);
                
            } catch (error) {
                console.error("Failed to sync dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (!authLoading) {
            fetchDashboardData();
        }
    }, [authLoading, company?.id]);

    // Handle WebSocket Connections
    useEffect(() => {
        const companyId = data?.company?.id;
        if (!companyId) return;

        const socketURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const socket: Socket = io(socketURL);

        socket.on('connect', () => {
            console.log('Connected to real-time risk pipeline');
            socket.emit('join_company_room', { companyId });
        });

        socket.on('new_risk_update', (payload: any) => {
            console.log('Received dynamic risk update!', payload);
            toast.success("AI Alert: A new dynamic risk evaluation just arrived.");
            
            if (payload.newScore) {
                setChartData(prev => [...prev, payload.newScore]);
            }
            if (payload.newAlert) {
                setAlerts(prev => [payload.newAlert, ...prev]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [data?.company?.id]);

    if (authLoading || isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-slate-500 text-sm font-medium animate-pulse">Loading dashboard intelligence...</p>
                </div>
            </div>
        );
    }

    const metrics = data?.latest_score?.details?.metrics;
    
    // Map history to include a properly formatted timestamp
    const formattedHistory = chartData.map(item => {
        let displayDate = item.period;
        if (item.createdAt) {
            const date = new Date(item.createdAt);
            displayDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
        return {
            ...item,
            displayDate
        };
    });

    const currentScoreNum = scoreData?.currentScore ?? (data?.latest_score?.totalScore ? Number(data.latest_score.totalScore) : null);
    
    // Dynamic Color Logic
    const isCritical = currentScoreNum !== null && currentScoreNum >= riskThreshold;
    const scoreStatus = isCritical ? 'bad' : 'good';

    return (
        <div className="space-y-8 pb-12">
            {/* Top Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <LayoutDashboard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            {data?.company?.name || 'Company Dashboard'}
                            {ticker && <span className="text-slate-500 font-semibold text-lg bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                {ticker}
                            </span>}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">
                            Welcome back, {user?.fullName || 'User'}. Here's your risk overview.
                        </p>
                    </div>
                </div>
                
                <Link
                    href="/dashboard/ingest"
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-5 rounded-xl shadow-md transition-all hover:shadow-lg active:scale-[0.98] group"
                >
                    <Plus className="w-4 h-4" />
                    Update New Quarter Data
                </Link>
            </div>

            {/* Dashboard Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Metrics and Charts (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    {data ? (
                        <>
                            {/* Metrics Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <MetricCard
                                    title="Risk Score"
                                    value={currentScoreNum !== null ? currentScoreNum.toFixed(0) : '--'}
                                    subtext={`Threshold: ${riskThreshold}`}
                                    status={scoreStatus}
                                    icon={<ShieldAlert className={cn("w-4 h-4", scoreStatus === 'good' ? "text-emerald-500" : "text-rose-500")} />}
                                />
                                <MetricCard
                                    title="Current Ratio"
                                    value={metrics ? parseFloat(metrics.current_ratio).toFixed(2) : '--'}
                                    subtext="Liquidity status"
                                    status={metrics && parseFloat(metrics.current_ratio) >= 1.0 ? 'good' : 'warning'}
                                    icon={<Activity className="w-4 h-4 text-sky-500" />}
                                />
                                <MetricCard
                                    title="Debt/Equity"
                                    value={metrics ? parseFloat(metrics.debt_equity).toFixed(2) : '--'}
                                    subtext="Leverage health"
                                    status={metrics && parseFloat(metrics.debt_equity) <= 2.5 ? 'good' : 'warning'}
                                    icon={<TrendingDown className="w-4 h-4 text-purple-500" />}
                                />
                                <MetricCard
                                    title="ROE"
                                    value={metrics ? (parseFloat(metrics.roe) * 100).toFixed(1) + '%' : '--'}
                                    subtext="Profitability yield"
                                    status={metrics && parseFloat(metrics.roe) > 0 ? 'good' : 'bad'}
                                    icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                                />
                            </div>

                            {/* Financial Chart */}
                            <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    Risk Trajectory History
                                </h3>
                                {formattedHistory.length > 0 ? (
                                    <div className="h-[350px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={formattedHistory}>
                                                <defs>
                                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                                                <Tooltip
                                                    contentStyle={{ 
                                                        backgroundColor: '#ffffff', 
                                                        borderColor: '#e2e8f0', 
                                                        borderRadius: '12px',
                                                        color: '#0f172a',
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                                                    }}
                                                    itemStyle={{ color: '#0f172a', fontWeight: '500' }}
                                                />
                                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="totalScore" 
                                                    stroke="#4f46e5" 
                                                    strokeWidth={3}
                                                    fillOpacity={1} 
                                                    fill="url(#colorScore)" 
                                                    name="Overall Risk Score" 
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                                                />
                                                <Brush 
                                                    dataKey="displayDate" 
                                                    height={30} 
                                                    stroke="#94a3b8" 
                                                    fill="#f8fafc"
                                                    tickFormatter={(tick) => tick.split(',')[0]}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[350px] flex items-center justify-center text-slate-500 border border-dashed border-slate-200 bg-slate-50 rounded-2xl font-medium">
                                        No historical data available yet.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 shadow-sm rounded-3xl text-center">
                            <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-5 shadow-sm">
                                <Activity className="w-10 h-10 text-slate-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">No financial data yet</h2>
                            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">
                                Click the "Update New Quarter Data" button above to ingest your financial statements and generate your risk profile.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Side: Risk Alert Feed (1/3) */}
                <div className="lg:col-span-1">
                    <RiskAlertFeed 
                        alerts={alerts.slice(0, 5).map(a => ({
                            id: a.id,
                            severity: a.severity,
                            summary: a.message,
                            createdAt: a.createdAt
                        }))} 
                    />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, subtext, status, icon }: { 
    title: string, 
    value: string, 
    subtext: string, 
    status: 'good' | 'bad' | 'neutral' | 'warning', 
    icon: React.ReactNode 
}) {
    return (
        <div className={cn(
            "border shadow-sm p-5 rounded-2xl transition-all group flex flex-col justify-between",
            status === 'bad' ? "bg-rose-50 border-rose-200 hover:border-rose-300 shadow-rose-50" : 
            status === 'good' ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300 shadow-emerald-50" :
            "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
        )}>
            <div className="flex justify-between items-start mb-3">
                <span className={cn(
                    "text-[11px] font-bold uppercase tracking-wider",
                    status === 'bad' ? "text-rose-500" : status === 'good' ? "text-emerald-500" : "text-slate-500"
                )}>{title}</span>
                <div className={cn(
                    "p-2 rounded-xl border group-hover:scale-110 transition-transform shadow-sm",
                    status === 'good' ? "bg-white border-emerald-100" :
                    status === 'warning' ? "bg-amber-50 border-amber-100" :
                    status === 'bad' ? "bg-white border-rose-100" :
                    "bg-slate-50 border-slate-100"
                )}>
                    {icon}
                </div>
            </div>
            <div>
                <div className={cn(
                    "text-2xl font-black mb-0.5 tracking-tight",
                    status === 'good' ? 'text-emerald-600' : 
                    status === 'warning' ? 'text-amber-600' :
                    status === 'bad' ? 'text-rose-600' : 'text-slate-900'
                )}>
                    {value}
                </div>
                <div className={cn(
                    "text-[11px] font-medium",
                    status === 'bad' ? "text-rose-400" : status === 'good' ? "text-emerald-400" : "text-slate-400"
                )}>
                    {subtext}
                </div>
            </div>
        </div>
    );
}
