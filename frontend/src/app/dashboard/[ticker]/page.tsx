'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { financeApi, DashboardData } from '@/lib/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    Legend,
} from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import RiskChatBot from '@/components/RiskChatBot';

export default function Dashboard() {
    const { ticker } = useParams<{ ticker: string }>();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (ticker) {
            financeApi.getDashboard(ticker)
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [ticker]);

    if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>;
    if (!data) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Company not found</div>;

    const { company, latest_score, history_charts, alerts } = data;
    const metrics = latest_score.details.metrics;

    const scoreColor = (score: number) => {
        if (score > 70) return '#10b981'; // Emerald 500
        if (score > 50) return '#eab308'; // Yellow 500
        return '#ef4444'; // Red 500
    };

    const totalScoreVal = parseFloat(latest_score.totalScore);

    const riskChartData = [
        { name: 'Risk Score', value: totalScoreVal, fill: scoreColor(totalScoreVal) },
        { name: 'Max', value: 100, fill: 'transparent' } // Placeholder for scaling
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            {/* Header */}
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{company.name} <span className="text-zinc-500 text-2xl">({company.ticker})</span></h1>
                    <p className="text-zinc-400">{company.industry} | {company.sector}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-zinc-400 mb-1">Risk Assessment Period: {latest_score.period}</div>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold border ${totalScoreVal > 50 ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-red-500/50 bg-red-500/10 text-red-400'}`}>
                        Risk Score: {totalScoreVal.toFixed(1)} / 100
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content Integration */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Liquidity (Current Ratio)"
                            value={parseFloat(metrics.current_ratio).toFixed(2)}
                            subtext="Target > 1.0"
                            status={parseFloat(metrics.current_ratio) >= 1.0 ? 'good' : 'bad'}
                            icon={<Activity className="w-5 h-5 text-blue-400" />}
                        />
                        <MetricCard
                            title="Leverage (Debt/Equity)"
                            value={parseFloat(metrics.debt_equity).toFixed(2)}
                            subtext="Target < 2.5"
                            status={parseFloat(metrics.debt_equity) <= 2.5 ? 'good' : 'bad'}
                            icon={<TrendingDown className="w-5 h-5 text-purple-400" />}
                        />
                        <MetricCard
                            title="Profitability (ROE)"
                            value={(parseFloat(metrics.roe) * 100).toFixed(1) + '%'}
                            subtext="Target > 0%"
                            status={parseFloat(metrics.roe) > 0 ? 'good' : 'bad'}
                            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                        />
                    </div>

                    {/* Chart: Revenue vs Net Income */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-zinc-400" />
                            Financial Performance History
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={history_charts}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="period" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                        itemStyle={{ color: '#e4e4e7' }}
                                    />
                                    <Legend />
                                    <Area type="monotone" dataKey="totalScore" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" name="Risk Score" />
                                    <Area type="monotone" dataKey="profitabilityScore" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" name="Profitability Score" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>


                </div>

                {/* Sidebar */}
                <div className="space-y-8">

                    {/* Chat Widget */}
                    <RiskChatBot companyId={company.id} companyName={company.name} />

                    {/* Radial Risk Chart */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold mb-4 w-full text-left">Current Risk Profile</h3>
                        <div className="h-[250px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="100%" barSize={20} data={riskChartData}>
                                    <RadialBar
                                        label={{ position: 'insideStart', fill: '#fff' }}
                                        background
                                        dataKey="value"
                                    />
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">{totalScoreVal.toFixed(0)}</div>
                                    <div className="text-xs text-zinc-500">Score</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Active Alerts
                        </h3>
                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <div className="text-zinc-500 text-sm">No active alerts.</div>
                            ) : (
                                alerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 rounded-lg border flex gap-3 ${alert.severity === 'HIGH' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200'}`}>
                                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-semibold text-sm">{alert.severity} SEVERITY</div>
                                            <div className="text-sm opacity-90">{alert.message}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
}

function MetricCard({ title, value, subtext, status, icon }: { title: string, value: string, subtext: string, status: 'good' | 'bad', icon: any }) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:bg-zinc-800/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-zinc-400 text-sm font-medium">{title}</span>
                {icon}
            </div>
            <div className={`text-2xl font-bold mb-1 ${status === 'good' ? 'text-zinc-100' : 'text-red-400'}`}>
                {value}
            </div>
            <div className="text-xs text-zinc-500">
                {subtext}
            </div>
        </div>
    );
}
